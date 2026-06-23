import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

// PUT — 修改个人资料
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { name, orgName, title, phone, region } = body

  try {
    const data: any = {}
    if (name !== undefined) data.name = name
    if (orgName !== undefined) data.orgName = orgName
    if (title !== undefined) data.title = title
    if (phone !== undefined) data.phone = phone
    if (region !== undefined) data.region = region

    await prisma.user.update({ where: { id: userId }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — 修改密码
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { oldPassword, newPassword } = body

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "新密码至少6位" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 })

    // 验证旧密码（如果设置了密码）
    if (user.password && oldPassword) {
      const valid = await bcrypt.compare(oldPassword, user.password)
      if (!valid) return NextResponse.json({ error: "旧密码错误" }, { status: 403 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
