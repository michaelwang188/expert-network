import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { validatePassword } from "@/lib/password-policy"

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET || "dev-secret-do-not-use-in-prod"
}

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

    // 重置成功后直接生成 session JWT，让浏览器设置 cookie，无需再登录
    const { SignJWT } = await import("jose")
    const secret = new TextEncoder().encode(getSecret())
    const now = Math.floor(Date.now() / 1000)
    const sessionToken = await new SignJWT({
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: null,
      role: user.role,
      needsPasswordChange: false, // 已设置强密码，不需要变更
      iat: now,
      exp: now + 7 * 24 * 60 * 60,  // 7天
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret)

    const response = NextResponse.json({ ok: true, autoLogin: true, message: "密码已重置" })
    response.cookies.set("__Secure-next-auth.session-token", sessionToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    // 也设置非 secure 版本的 cookie（兼容开发环境）
    response.cookies.set("next-auth.session-token", sessionToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    return response
  } catch (e: any) {
    return NextResponse.json({ error: "重置失败，请重试" }, { status: 500 })
  }
}
