import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
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
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }
  const { id, status } = await req.json()
  const data: any = { status }
  if (status === "ACTIVE") {
    data.idVerified = true
    data.empVerified = true
    data.complianceSig = true
  }
  const expert = await prisma.expert.update({ where: { id }, data })
  return NextResponse.json({ ok: true, expert })
}
