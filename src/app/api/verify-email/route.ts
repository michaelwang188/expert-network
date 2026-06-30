import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/verify-email?token=xxx — 邮箱验证
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return new NextResponse(verificationPage(false, "缺少验证令牌"), {
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
      select: { id: true, email: true, emailVerified: true, name: true },
    })

    if (!user) {
      return new NextResponse(verificationPage(false, "验证链接无效或已过期"), {
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    }

    if (user.emailVerified) {
      return new NextResponse(verificationPage(true, "邮箱已经验证过了，可直接登录", user.name), {
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    }

    // 标记为已验证，清除令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    })

    return new NextResponse(verificationPage(true, "邮箱验证成功！您现在可以登录平台了", user.name), {
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  } catch (e) {
    console.error("verify email error:", e)
    return new NextResponse(verificationPage(false, "验证失败，请稍后重试"), {
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  }
}

// 验证结果页面
function verificationPage(success: boolean, message: string, name?: string | null) {
  const siteUrl = "https://516380.com"
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮箱验证 - 产研通ProLink</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #f8f7f4; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 12px; padding: 40px; max-width: 420px; width: 90%; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; color: ${success ? "#185FA5" : "#A32D2D"}; margin: 0 0 12px; }
    p { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; background: #185FA5; color: #fff; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <h1>${success ? "邮箱验证成功" : "验证失败"}</h1>
    <p>${message}${name ? `，${name}` : ""}</p>
    ${success ? `<a href="${siteUrl}/login" class="btn">前往登录</a>` : `<a href="${siteUrl}" class="btn">返回首页</a>`}
  </div>
</body>
</html>`
}
