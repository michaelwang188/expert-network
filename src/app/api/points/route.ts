import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET — 积分余额 + 排行榜（排行榜公开，余额需登录）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  // 排行榜公开——无需登录
  if (type === "leaderboard") {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true, orgName: true, points: true },
      where: { points: { gt: 0 } },
      orderBy: { points: "desc" },
      take: 50,
    })
    return NextResponse.json({ leaderboard: users })
  }

  // 以下需要登录
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const userId = (session.user as any).id

  if (type === "transactions") {
    // 管理员可以查任意用户的交易记录
    const targetUserId = searchParams.get("userId")
    const role = (session.user as any).role
    const queryUserId = (role === "ADMIN" && targetUserId) ? targetUserId : userId
    const txs = await prisma.pointsTransaction.findMany({
      where: { userId: queryUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ transactions: txs })
  }

  // default: my balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, points: true, name: true, role: true },
  })

  const [totalEarned, totalSpent] = await Promise.all([
    prisma.pointsTransaction.aggregate({
      where: { userId, amount: { gt: 0 } },
      _sum: { amount: true },
    }),
    prisma.pointsTransaction.aggregate({
      where: { userId, amount: { lt: 0 } },
      _sum: { amount: true },
    }),
  ])

  return NextResponse.json({
    user,
    totalEarned: totalEarned._sum.amount || 0,
    totalSpent: Math.abs(totalSpent._sum.amount || 0),
  })
}
