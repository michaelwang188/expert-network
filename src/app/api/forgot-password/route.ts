import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendResetEmail, isEmailConfigured } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || "").trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 })
    }

    // 不泄露用户是否存在（无论是否注册，统一返回成功信息）
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // 关键安全措施：不返回任何区别信息
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host") || "516380.com"}`
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // 发送邮件（无SMTP时日志输出）
    await sendResetEmail(email, resetUrl)

    const configured = isEmailConfigured()

    return NextResponse.json({
      ok: true,
      message: configured
        ? "密码重置链接已发送到您的邮箱，请查收"
        : "密码重置链接已发送到您的邮箱，请查收",
      // ⚠️ 永不返回token或reset链接给客户端！
    })
  } catch (e: any) {
    console.error("[forgot-password]", e.message)
    return NextResponse.json({ error: "服务暂时不可用，请稍后重试" }, { status: 500 })
  }
}
