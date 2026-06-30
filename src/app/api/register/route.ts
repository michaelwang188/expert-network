import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { validatePassword } from "@/lib/password-policy"
import { sendVerificationEmail } from "@/lib/email"

// 简单内存限速：同IP 10秒内最多3次注册
const rateLimit = new Map<string, { count: number; reset: number }>()

// 定期清理过期条目，防止内存泄漏
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimit) {
    if (now >= entry.reset) rateLimit.delete(ip)
  }
}, 60000)

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const now = Date.now()
  const limit = rateLimit.get(ip)
  if (limit && now < limit.reset) {
    if (limit.count >= 3) return NextResponse.json({ error: "操作过于频繁，请稍后再试" }, { status: 429 })
    limit.count++
  } else {
    rateLimit.set(ip, { count: 1, reset: now + 10000 })
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }) }
  const email = String(body.email || "").trim()
  const password = String(body.password || "")
  // XSS过滤：去除HTML标签防止存储型XSS
  const name = String(body.name || "").replace(/<[^>]*>/g, "").slice(0, 100)
  const orgName = String(body.orgName || "").replace(/<[^>]*>/g, "").slice(0, 200)
  const role = body.role

  if (!email || !password || !name) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
  }
  if (name.length > 100 || orgName.length > 200) {
    return NextResponse.json({ error: "姓名或机构名称过长" }, { status: 400 })
  }
  const pwCheck = validatePassword(password)
  if (!pwCheck.ok) {
    return NextResponse.json({ error: pwCheck.message }, { status: 400 })
  }
  if (!/^[^\s@<>\"'&]+@[^\s@<>\"'&]+\.[^\s@<>\"'&]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
  }
  if (email.length > 200) {
    return NextResponse.json({ error: "邮箱地址过长" }, { status: 400 })
  }

  // 安全限制：只允许注册 RESEARCHER、EXPERT、INVESTOR，禁止注册 ADMIN
  const ALLOWED_ROLES = ["EXPERT", "INVESTOR"]
  const safeRole = ALLOWED_ROLES.includes(role) ? role : "RESEARCHER"

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "邮箱已被注册" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const verificationToken = crypto.randomBytes(32).toString("hex")
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      orgName,
      role: safeRole,
      verificationToken,
    },
  })

  // 发送邮箱验证邮件
  const siteUrl = process.env.NEXTAUTH_URL || "https://516380.com"
  const verifyUrl = `${siteUrl}/api/verify-email?token=${verificationToken}`
  const emailSent = await sendVerificationEmail(email, verifyUrl)

  // 注册欢迎积分：所有新用户统一赠送 200 公益积分
  const WELCOME_POINTS = 200
  await prisma.$transaction(async (tx) => {
    const after = await tx.user.update({
      where: { id: user.id },
      data: { points: { increment: WELCOME_POINTS } },
      select: { points: true },
    })
    await tx.pointsTransaction.create({
      data: {
        userId: user.id,
        amount: WELCOME_POINTS,
        type: "WELCOME_BONUS",
        description: "注册欢迎积分",
        refId: user.id,
        balance: after.points,
      },
    })
  })
  // 发送验证通知
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "WELCOME_BONUS",
      title: "请验证您的邮箱",
      message: `已向 ${email} 发送了验证邮件，请查收并点击链接完成验证。验证后即可登录并激活 ${WELCOME_POINTS} 公益积分。`,
      refId: user.id,
    },
  })

  // 如果注册的是专家，自动创建待审核档案 + 通知所有管理员
  if (safeRole === "EXPERT") {
    await prisma.expert.create({
      data: {
        userId: user.id,
        realName: name,
        title: name,
        org: orgName || "待填写",
        years: 0,
        region: "待填写",
        industry1: "待填写",
        roleType: "待填写",
        tags: "",
        topics: "",
        ratePoints: 500,
        rateHour: 500,
        forms: "线上视频",
        status: "PENDING",
      }
    })
    // 通知所有管理员：有新专家待审核
    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } })
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "EXPERT_PENDING",
          title: "新专家待审核",
          message: `${name}（${orgName || "未填机构"}）已注册为专家，待审核`,
          refId: user.id,
        }
      })
    }
    // 通知专家本人：申请已进入审核队列
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "EXPERT_REGISTERED",
        title: "专家申请已提交",
        message: "您的专家申请已成功提交，请先验证邮箱。验证后管理员将在1-2个工作日内审核您的资料，审核通过后即可接收访谈订单。",
        refId: user.id,
      }
    })
  }

  return NextResponse.json({
    ok: true,
    userId: user.id,
    emailSent,
    message: safeRole === "EXPERT"
      ? `专家申请已提交。验证邮件已发送至 ${email}，请查收并验证邮箱，验证后管理员将审核您的资料。`
      : `注册成功！验证邮件已发送至 ${email}，请查收并点击链接完成验证。`,
  })
}
