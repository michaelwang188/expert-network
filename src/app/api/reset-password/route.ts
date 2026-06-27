import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import { validatePassword } from "@/lib/password-policy"

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

    if (!token || !password) {
      return NextResponse.json({ error: "请提供密码" }, { status: 400 })
    }
    const pwCheck = validatePassword(password)
    if (!pwCheck.ok) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 })
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

    // 用 NextAuth 自己的 encode 函数生成 session token（与 JWT callback 完全兼容）
    const secret = process.env.NEXTAUTH_SECRET || "dev-secret-do-not-use-in-prod"
    const maxAge = 7 * 24 * 60 * 60
    const sessionToken = await encode({
      secret,
      maxAge,
      token: {
        sub: user.id,
        name: user.name || "",
        email: user.email,
        picture: null,
        role: user.role,
        needsPasswordChange: false,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + maxAge,
      },
    })

    const response = NextResponse.json({ ok: true, autoLogin: true, message: "密码已重置" })
    // 同时设置 __Secure- 和 无前缀 两个版本，兼容 HTTPS 和 HTTP 环境
    response.cookies.set("next-auth.session-token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
      secure: false,
    })
    return response
  } catch (e: any) {
    return NextResponse.json({ error: "重置失败，请重试" }, { status: 500 })
  }
}
