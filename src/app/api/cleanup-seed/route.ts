import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST — 清理所有演示数据（source="seed"），保留真实用户
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const seedUsers = await prisma.user.findMany({ where: { source: "seed" }, select: { id: true } })
    const seedIds = seedUsers.map(u => u.id)

    if (seedIds.length === 0) {
      return NextResponse.json({ message: "没有需要清理的演示数据" })
    }

    // 按依赖顺序清理
    await prisma.pointsTransaction.deleteMany({ where: { userId: { in: seedIds } } })
    await prisma.notification.deleteMany({ where: { userId: { in: seedIds } } })
    // 清理seed用户的订单
    const seedOrders = await prisma.order.findMany({ where: { researcherId: { in: seedIds } }, select: { id: true } })
    const seedOrderIds = seedOrders.map(o => o.id)
    await prisma.order.deleteMany({ where: { id: { in: seedOrderIds } } })
    // 清理seed用户的需求
    await prisma.request.deleteMany({ where: { researcherId: { in: seedIds } } })
    // 清理seed用户的专家档案
    await prisma.expert.deleteMany({ where: { userId: { in: seedIds } } })
    // 清理seed用户
    await prisma.user.deleteMany({ where: { id: { in: seedIds } } })

    return NextResponse.json({ message: `已清理 ${seedIds.length} 条演示数据` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// GET — 查看演示数据统计
export async function GET() {
  const count = await prisma.user.count({ where: { source: "seed" } })
  return NextResponse.json({ seedUsers: count })
}
