// 🔐 测试环境专用：获取重置链接
// 仅限 seed 邮箱（@demo.com, @prolink.com）
// 每个IP每30秒最多1次请求
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isEmailConfigured } from "@/lib/email"

const rateLimit = new Map<string, number>()

export async function GET(req: Request) {
  if (isEmailConfigured()) {
    return NextResponse.json({ error: "生产模式下不可用" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const email = String(searchParams.get("email") || "").trim().toLowerCase()

  // 仅允许 seed 测试邮箱
  if (!email.endsWith("@demo.com") && !email.endsWith("@prolink.com")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  // IP限速：30秒1次
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const last = rateLimit.get(ip)
  const now = Date.now()
  if (last && now - last < 30000) {
    return NextResponse.json({ error: "操作过于频繁，请30秒后重试" }, { status: 429 })
  }
  rateLimit.set(ip, now)

  // 查找最新未使用的令牌
  const token = await prisma.resetToken.findFirst({
    where: { email, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  })

  if (!token) {
    return NextResponse.json({ error: "没有有效的重置令牌，请先访问忘记密码页面" }, { status: 404 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host") || "516380.com"}`
  const resetLink = `${baseUrl}/reset-password?token=${token.token}`

  return NextResponse.json({ resetLink, expiresAt: token.expiresAt })
}
