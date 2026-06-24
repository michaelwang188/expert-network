import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/roles"

// POST /api/settle — 自动结算已到期的T+7订单（可被cron调用）
// 规则：DONE 状态且 completedAt + 7天 ≤ now() 的订单自动变PAID
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || !isAdmin((session.user as any).role)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const dueOrders = await prisma.order.findMany({
    where: {
      status: "DONE",
      completedAt: { lte: sevenDaysAgo },
    },
    include: { expert: { include: { user: true } }, request: true },
  })

  let settled = 0
  let errors = 0

  for (const order of dueOrders) {
    try {
      const amount = order.amount
      const expertFee = order.expertFee
      const researcherId = order.researcherId
      const expertUserId = order.expert?.user?.id
      const orderNo = order.request?.orderNo || order.id

      if (!expertUserId || expertFee <= 0 || amount <= 0) {
        errors++; continue
      }

      await prisma.$transaction(async (tx) => {
        const debitResult = await tx.user.updateMany({
          where: { id: researcherId, points: { gte: amount } },
          data: { points: { decrement: amount } },
        })
        if (debitResult.count === 0) { errors++; return }

        await tx.order.updateMany({
          where: { id: order.id, status: "DONE" },
          data: { status: "PAID", paidAt: now },
        })

        await tx.user.update({
          where: { id: expertUserId },
          data: { points: { increment: expertFee } },
        })

        const [rNew, eNew] = await Promise.all([
          tx.user.findUnique({ where: { id: researcherId }, select: { points: true } }),
          tx.user.findUnique({ where: { id: expertUserId }, select: { points: true } }),
        ])

        await tx.pointsTransaction.create({
          data: { userId: researcherId, amount: -amount, type: "SPEND_ORDER", description: `T+7自动结算：${orderNo}`, refId: order.id, balance: rNew?.points ?? 0 },
        })
        await tx.pointsTransaction.create({
          data: { userId: expertUserId, amount: expertFee, type: "EARN_LABOR", description: `T+7自动结算：${orderNo}`, refId: order.id, balance: eNew?.points ?? 0 },
        })
      })
      settled++
    } catch { errors++ }
  }

  return NextResponse.json({ settled, errors, total: dueOrders.length })
}
