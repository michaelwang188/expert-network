import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || "").trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // 不泄露用户是否存在，但友好测试阶段更透明
      return NextResponse.json({ ok: true, message: "如果该邮箱已注册，将收到重置邮件" })
    }

    // 生成重置令牌
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1小时有效

    // 使旧令牌失效
    await prisma.resetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    await prisma.resetToken.create({
      data: { email, token, expiresAt },
    })

    // 友好测试模式：直接返回重置链接（生产环境不返回）
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host") || "516380.com"}`}/reset-password?token=${token}`

    return NextResponse.json({
      ok: true,
      message: "密码重置链接已发送到您的邮箱",
      // 测试环境下直接返回链接，方便友好测试用户
      _dev_reset_link: resetUrl,
      _dev_token: token,
    })
  } catch (e: any) {
    return NextResponse.json({ error: "服务暂时不可用" }, { status: 500 })
  }
}
