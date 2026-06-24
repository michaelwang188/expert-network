import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAdmin } from "@/lib/roles"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const industry = searchParams.get("industry")
  const roleType = searchParams.get("roleType")
  const form = searchParams.get("form")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const skip = (page - 1) * limit

  const where: any = { status: "ACTIVE" }
  if (industry) where.industry1 = industry
  if (roleType) where.roleType = roleType
  if (form) where.forms = { contains: form }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { org: { contains: search } },
      { tags: { contains: search } },
      { topics: { contains: search } },
    ]
  }

  const [experts, total] = await Promise.all([
    prisma.expert.findMany({ where, skip, take: limit, orderBy: { completedOrders: "desc" } }),
    prisma.expert.count({ where }),
  ])

  return NextResponse.json({ experts, total, page, limit })
}

// PATCH — 管理员更新专家状态（需登录+管理员权限）
// Mavis #160修复: 审批通过时自动创建通知+积分+流水
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !isAdmin((session.user as any).role)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }
  const { id, status } = await req.json()
  const expert = await prisma.expert.findUnique({ where: { id }, select: { userId: true, status: true } })
  if (!expert) return NextResponse.json({ error: "专家不存在" }, { status: 404 })

  const data: any = { status }
  if (status === "ACTIVE") {
    data.idVerified = true
    data.empVerified = true
    data.complianceSig = true

    // 原子事务: 状态更新+通知+积分+流水
    const updated = await prisma.$transaction(async (tx) => {
      const e = await tx.expert.update({ where: { id }, data })
      // 通知专家
      await tx.notification.create({
        data: {
          userId: e.userId, type: "EXPERT_APPROVED", title: "审核已通过",
          message: "您的专家申请已通过审核！现在可以接收访谈订单了。已为您添加500积分作为首单福利。", refId: id,
        }
      })
      // 如果之前不是ACTIVE，给首单福利积分
      if (expert.status !== "ACTIVE") {
        const after = await tx.user.update({ where: { id: e.userId }, data: { points: { increment: 500 } }, select: { points: true } })
        await tx.pointsTransaction.create({
          data: { userId: e.userId, amount: 500, type: "ADMIN_ADJUST", description: "专家审核通过·首单福利积分", refId: id, balance: after.points }
        })
      }
      return e
    })
    return NextResponse.json({ ok: true, expert: updated })
  }

  if (status === "FROZEN" && expert.status === "ACTIVE") {
    const updated = await prisma.$transaction(async (tx) => {
      const e = await tx.expert.update({ where: { id }, data })
      await tx.notification.create({
        data: {
          userId: e.userId, type: "EXPERT_FROZEN", title: "账户已冻结",
          message: "您的专家账户已被冻结。如有疑问请联系平台管理员。", refId: id,
        }
      })
      return e
    })
    return NextResponse.json({ ok: true, expert: updated })
  }

  const updated = await prisma.expert.update({ where: { id }, data })
  return NextResponse.json({ ok: true, expert: updated })
}
