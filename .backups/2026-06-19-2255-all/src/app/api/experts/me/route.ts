import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET — 获取当前专家的个人资料
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "EXPERT") {
    return NextResponse.json({ error: "仅专家可访问" }, { status: 403 })
  }

  const userId = (session.user as any).id
  let expert = await prisma.expert.findUnique({ where: { userId } })

  // 如果专家档案还不存在，返回用户基本信息作为预填
  if (!expert) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return NextResponse.json({
      expert: null,
      user: user ? { name: user.name, email: user.email, title: user.title, orgName: user.orgName } : null,
    })
  }

  return NextResponse.json({ expert, user: null })
}

// PATCH — 更新专家个人资料
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "EXPERT") {
    return NextResponse.json({ error: "仅专家可访问" }, { status: 403 })
  }

  const userId = (session.user as any).id
  const body = await req.json()

  // 允许编辑的字段白名单
  const allowed = [
    "realName", "title", "org", "years", "region",
    "industry1", "industry2", "roleType", "tags", "topics",
    "rateHour", "ratePoints", "forms", "availableTime",
  ]
  const data: any = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const expert = await prisma.expert.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      realName: body.realName || session.user?.name || "",
      title: body.title || "",
      org: body.org || "",
      years: body.years || 0,
      region: body.region || "",
      industry1: body.industry1 || "",
      industry2: body.industry2 || null,
      roleType: body.roleType || "",
      tags: body.tags || "",
      topics: body.topics || "",
      rateHour: body.rateHour || 0,
      forms: body.forms || "",
      availableTime: body.availableTime || null,
      status: "PENDING", // 新建档案需审核
    },
  })

  return NextResponse.json({ ok: true, expert })
}
