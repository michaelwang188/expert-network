import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { email, password, name, orgName, role } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少6位" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
  }

  // 安全限制：只允许注册 RESEARCHER 或 EXPERT，禁止注册 ADMIN
  const safeRole = role === "EXPERT" ? "EXPERT" : "RESEARCHER"

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: "邮箱已被注册" }, { status: 400 })
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

  // 如果注册的是专家，自动创建一条待审核的专家档案
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
        ratePoints: 500, // 默认500积分/小时
        rateHour: 500,   // 兼容
        forms: "线上视频",
        status: "PENDING",
      }
    })
  }

  return NextResponse.json({ ok: true, userId: user.id })
}
