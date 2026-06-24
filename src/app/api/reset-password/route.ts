import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET — 验证令牌是否有效
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const record = await prisma.resetToken.findUnique({ where: { token } })
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } })
  return NextResponse.json({ valid: true, email: record.email, name: user?.name || "" })
}

// POST — 使用令牌重置密码
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = body

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 })
    }

    const record = await prisma.resetToken.findUnique({ where: { token } })
    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "重置链接已失效，请重新申请" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: record.email } })
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { email: record.email }, data: { password: hashed } })
    await prisma.resetToken.update({ where: { id: record.id }, data: { used: true } })

    return NextResponse.json({ ok: true, message: "密码已重置成功" })
  } catch (e: any) {
    return NextResponse.json({ error: "重置失败，请重试" }, { status: 500 })
  }
}
