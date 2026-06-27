import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { validatePassword } from "@/lib/password-policy"

// 修改密码限速：同用户30秒内最多3次尝试
const rateLimit = new Map<string, { count: number; reset: number }>()
setInterval(() => { const now = Date.now(); for (const [ip, e] of rateLimit) { if (now >= e.reset) rateLimit.delete(ip) } }, 60000)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const userId = (session.user as any).id
  if (!userId) {
    return NextResponse.json({ error: "用户信息缺失" }, { status: 401 })
  }

  // 修改密码限速检查：同用户30秒内最多3次
  const now = Date.now()
  const limitKey = `pwchange:${userId}`
  const lim = rateLimit.get(limitKey)
  if (lim && now < lim.reset && lim.count >= 3) {
    return NextResponse.json({ error: "操作过于频繁，请稍后再试" }, { status: 429 })
  }
  if (!lim || now >= lim.reset) {
    rateLimit.set(limitKey, { count: 1, reset: now + 30000 })
  } else {
    lim.count++
  }

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "请提供当前密码和新密码" }, { status: 400 })
    }

    // 验证当前密码
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "当前密码错误" }, { status: 403 })
    }

    // 验证新密码强度
    const pwCheck = validatePassword(newPassword)
    if (!pwCheck.ok) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 })
    }

    // 新旧密码不能相同
    const same = await bcrypt.compare(newPassword, user.password)
    if (same) {
      return NextResponse.json({ error: "新旧密码不能相同" }, { status: 400 })
    }

    // 更新密码
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return NextResponse.json({ ok: true, message: "密码修改成功" })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
