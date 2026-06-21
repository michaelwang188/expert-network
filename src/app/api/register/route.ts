import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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
  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少6位" }, { status: 400 })
  }
  if (!/^[^\s@<>\"'&]+@[^\s@<>\"'&]+\.[^\s@<>\"'&]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
  }
  if (email.length > 200) {
    return NextResponse.json({ error: "邮箱地址过长" }, { status: 400 })
  }

  // 安全限制：只允许注册 RESEARCHER 或 EXPERT，禁止注册 ADMIN
  const safeRole = role === "EXPERT" ? "EXPERT" : "RESEARCHER"

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "邮箱已被注册" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      orgName,
      role: safeRole,
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
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } })
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
        message: "您的专家申请已成功提交，管理员将在1-2个工作日内审核。审核通过后即可接收访谈订单。请先完善您的专家资料以便快速通过审核。",
        refId: user.id,
      }
    })
  }

  const isExpert = safeRole === "EXPERT"
  return NextResponse.json({
    ok: true,
    userId: user.id,
    message: isExpert
      ? "专家申请已提交。我们会在1-2个工作日内审核您的资料，审核通过后即可接单。现在您可以先去完善专家资料。"
      : "注册成功，请登录",
  })
}
