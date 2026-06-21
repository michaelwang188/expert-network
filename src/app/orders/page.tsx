// P3: RSC 首帧数据 + 客户端交互
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import OrdersClient from "./OrdersClient"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const role = (session.user as any).role; const userId = (session.user as any).id
  const where: any = {}
  if (role === "RESEARCHER") where.researcherId = userId
  if (role === "EXPERT") { const expert = await prisma.expert.findUnique({ where: { userId } }); if (expert) where.expertId = expert.id }
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { researcher: true, expert: true, request: true } })
  const serialized = orders.map((o: any) => ({
    ...o, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString(),
    confirmedAt: o.confirmedAt?.toISOString() ?? null, completedAt: o.completedAt?.toISOString() ?? null,
    paidAt: o.paidAt?.toISOString() ?? null, interviewTime: o.interviewTime?.toISOString() ?? null,
    request: o.request ? { ...o.request, createdAt: o.request.createdAt.toISOString(), updatedAt: o.request.updatedAt.toISOString() } : null,
  }))
  return <OrdersClient initialOrders={serialized} role={role} />
}
