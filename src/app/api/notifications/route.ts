import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET — 获取当前用户的通知列表
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(notifications)
}

// PATCH — 标记通知为已读
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const body = await req.json()
  const { id, all } = body

  try {
    if (all) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      })
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      })
    } else {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
