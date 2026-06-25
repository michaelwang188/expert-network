import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/roles"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const role = (session.user as any).role
  const userId = (session.user as any).id

  const where: any = {}
  if (role === "RESEARCHER") where.researcherId = userId
  if (role === "EXPERT") {
    const expert = await prisma.expert.findUnique({ where: { userId } })
    if (expert) where.expertId = expert.id
    else where.expertId = "__no_match__" // Codex #247 fix: 防止null泄露全部订单
  }
  if (role === "INVESTOR") where.researcherId = userId
  // ADMIN sees all

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { researcher: true, expert: true, request: true },
  })

  return NextResponse.json(orders)
}

// 更新订单状态（权限校验 + 速率限制 + PAID 时自动创建 PointsTransaction）
// 简单内存限速: 同IP 10秒内最多5次 PATCH
const patchRateLimit = new Map<string, { count: number; reset: number }>()
setInterval(() => { const now = Date.now(); for (const [ip, e] of patchRateLimit) { if (now >= e.reset) patchRateLimit.delete(ip) } }, 60000)

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  // 限速
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const now = Date.now()
  const limit = patchRateLimit.get(ip)
  if (limit && now < limit.reset) {
    if (limit.count >= 5) return NextResponse.json({ error: "操作过于频繁" }, { status: 429 })
    limit.count++
  } else {
    patchRateLimit.set(ip, { count: 1, reset: now + 10000 })
  }

  const { orderId, status } = await req.json()
  const role = (session.user as any).role
  const userId = (session.user as any).id

  // 查订单 + 关联的专家用户（结算需要 expert.userId）
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      expert: { include: { user: true } },
    },
  })
  if (!existing) return NextResponse.json({ error: "订单不存在" }, { status: 404 })

  // 权限规则：
  // - EXPERT 只能操作自己关联的订单（确认接单、标记完成）
  // - RESEARCHER 只能取消自己的订单
  // - ADMIN 可以操作所有订单
  if (role === "EXPERT") {
    const expert = await prisma.expert.findUnique({ where: { userId } })
    if (!expert || existing.expertId !== expert.id) {
      return NextResponse.json({ error: "无权限操作此订单" }, { status: 403 })
    }
    // 🆕 FROZEN 专家不可操作订单
    if (expert.status === "FROZEN") {
      return NextResponse.json({ error: "账户已冻结，无法操作" }, { status: 403 })
    }
  } else if (role === "RESEARCHER") {
    if (existing.researcherId !== userId) {
      return NextResponse.json({ error: "无权限操作此订单" }, { status: 403 })
    }
    // 研究员只能取消订单，不能改其他状态
    if (status !== "CANCELLED") {
      return NextResponse.json({ error: "无权限执行此操作" }, { status: 403 })
    }
  }
  // 管理员不受角色限制，但需遵守状态机
  if (!isAdmin(role)) {
    // 非管理员：状态机保护
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["ACTIVE", "CANCELLED"],
      ACTIVE: ["DONE", "CANCELLED"],
      DONE: [],
      PAID: [],
      CANCELLED: [],
    }
    const allowed = allowedTransitions[existing.status] || []
    if (!allowed.includes(status)) {
      return NextResponse.json({
        error: `不允许从 ${existing.status} 直接变更为 ${status}`
      }, { status: 400 })
    }
  }

  // 管理员状态机：防止非法跳转
  if (isAdmin(role)) {
    const terminalStates = ["PAID", "CANCELLED"]
    if (terminalStates.includes(existing.status)) {
      return NextResponse.json({ error: "已终结订单不可变更" }, { status: 409 })
    }
    // PAID 只能从 DONE 来
    if (status === "PAID" && existing.status !== "DONE") {
      return NextResponse.json({ error: "仅已完成订单可结算" }, { status: 400 })
    }
  }

  // 🔴 PAID 结算：原子操作 — 更新订单 + 积分变动 + 流水记录
  if (status === "PAID") {
    // 双重防重复：已 PAID 不重复结算
    if (existing.status === "PAID") {
      return NextResponse.json({ error: "订单已结算，不可重复操作" }, { status: 409 })
    }

    const researcherId = existing.researcherId
    const expertUserId = existing.expert?.user?.id
    const amount = existing.amount  // 总金额（积分）
    const expertFee = existing.expertFee  // 专家费（积分）
    const orderNo = (await prisma.request.findUnique({
      where: { id: existing.requestId },
      select: { orderNo: true },
    }))?.orderNo || existing.requestId

    if (!expertUserId) {
      return NextResponse.json({ error: "订单未指派专家，无法结算" }, { status: 400 })
    }
    if (expertFee <= 0 || amount <= 0) {
      return NextResponse.json({ error: "金额不能为零或负数" }, { status: 400 })
    }

    const now = new Date()

    // 原子事务：订单→PAID + 研究员扣分(并发安全) + 专家加分 + 双流水
    const order = await prisma.$transaction(async (tx) => {
      // 0. 并发安全：用 updateMany where points >= amount 原子扣分
      const debitResult = await tx.user.updateMany({
        where: { id: researcherId, points: { gte: amount } },
        data: { points: { decrement: amount } },
      })
      if (debitResult.count === 0) return "INSUFFICIENT"

      // 1. 更新订单状态
      const orderResult = await tx.order.updateMany({ where: { id: orderId, status: "DONE" }, data: { status: "PAID", paidAt: now } });
      if (orderResult.count === 0) return "CONCURRENT";
      const updatedOrder = await tx.order.findUnique({ where: { id: orderId } });

      // 2. 专家增加积分
      await tx.user.update({
        where: { id: expertUserId },
        data: { points: { increment: expertFee } },
      })

      // 3. 读最新积分余额用于流水记录
      const [researcherNew, expertNew] = await Promise.all([
        tx.user.findUnique({ where: { id: researcherId }, select: { points: true } }),
        tx.user.findUnique({ where: { id: expertUserId }, select: { points: true } }),
      ])

      // 4. 流水：研究员支出
      await tx.pointsTransaction.create({
        data: {
          userId: researcherId,
          amount: -amount,
          type: "SPEND_ORDER",
          description: `支付专家访谈费用：${orderNo}`,
          refId: orderId,
          balance: researcherNew?.points ?? 0,
        },
      })

      // 5. 流水：专家获得劳动积分
      await tx.pointsTransaction.create({
        data: {
          userId: expertUserId,
          amount: expertFee,
          type: "EARN_LABOR",
          description: `完成专家访谈：${orderNo}`,
          refId: orderId,
          balance: expertNew?.points ?? 0,
        },
      })

      return updatedOrder
    })

    if (order === "INSUFFICIENT") {
      return NextResponse.json({ error: "研究员积分余额不足" }, { status: 402 })
    }
    return NextResponse.json(order as any)
  }

  // 非 PAID 的普通状态变更
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      confirmedAt: status === "ACTIVE" ? new Date() : undefined,
      completedAt: status === "DONE" ? new Date() : undefined,
    },
  })

  // 🔔 通知：状态变更时给相关人员发站内通知
  try {
    const notificationType = status === "ACTIVE" ? "ORDER_ASSIGNED"
      : status === "DONE" ? "ORDER_COMPLETED"
      : status === "CANCELLED" ? "ORDER_CANCELLED"
      : null

    if (notificationType) {
      // 通知接收方：ACTIVE通知专家，DONE/CANCELLED通知研究员
      const notifyUserId = status === "ACTIVE" ? existing.expert?.user?.id
        : existing.researcherId

      if (notifyUserId) {
        const titleMap: Record<string, string> = {
          ORDER_ASSIGNED: "新订单指派",
          ORDER_COMPLETED: "订单已完成",
          ORDER_CANCELLED: "订单已取消",
        }
        const msgMap: Record<string, string> = {
          ORDER_ASSIGNED: `您有一个新订单 (#${orderId.slice(-6)}) 已指派给您，请确认接单`,
          ORDER_COMPLETED: `订单 (#${orderId.slice(-6)}) 已完成，请等待管理员结算确认`,
          ORDER_CANCELLED: `订单 (#${orderId.slice(-6)}) 已被取消`,
        }

        await prisma.notification.create({
          data: {
            userId: notifyUserId,
            type: notificationType,
            title: titleMap[notificationType],
            message: msgMap[notificationType],
            refId: orderId,
          },
        })
      }
    }
  } catch (e) {
    // 通知创建失败不影响订单状态变更
    console.error("通知创建失败:", (e as Error).message)
  }

  return NextResponse.json(order)
}
