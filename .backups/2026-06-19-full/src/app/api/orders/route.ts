import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
  }
  // ADMIN sees all

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { researcher: true, expert: true, request: true },
  })

  return NextResponse.json(orders)
}

// 更新订单状态（权限校验：只能操作自己的订单）
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { orderId, status } = await req.json()
  const role = (session.user as any).role
  const userId = (session.user as any).id

  // 先查订单，判断权限
  const existing = await prisma.order.findUnique({ where: { id: orderId } })
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
  } else if (role === "RESEARCHER") {
    if (existing.researcherId !== userId) {
      return NextResponse.json({ error: "无权限操作此订单" }, { status: 403 })
    }
    // 研究员只能取消订单，不能改其他状态
    if (status !== "CANCELLED") {
      return NextResponse.json({ error: "无权限执行此操作" }, { status: 403 })
    }
  }
  // ADMIN 不受限制

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      confirmedAt: status === "ACTIVE" ? new Date() : undefined,
      completedAt: status === "DONE" ? new Date() : undefined,
      paidAt: status === "PAID" ? new Date() : undefined,
    },
  })
  return NextResponse.json(order)
}
