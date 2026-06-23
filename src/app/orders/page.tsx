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
  try {
    if (role === "RESEARCHER") where.researcherId = userId
    if (role === "EXPERT") { const expert = await prisma.expert.findUnique({ where: { userId } }); if (expert) where.expertId = expert.id }
  } catch {}
  let orders: any[] = []
  try {
    orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { researcher: true, expert: true, request: true } })
  } catch { orders = [] }
  const serialized = orders.map((o: any) => ({
    ...o, createdAt: o.createdAt?.toISOString() ?? null, updatedAt: o.updatedAt?.toISOString() ?? null,
    confirmedAt: o.confirmedAt?.toISOString() ?? null, completedAt: o.completedAt?.toISOString() ?? null,
    paidAt: o.paidAt?.toISOString() ?? null, interviewTime: o.interviewTime?.toISOString() ?? null,
    request: o.request ? { ...o.request, createdAt: o.request.createdAt?.toISOString() ?? null, updatedAt: o.request.updatedAt?.toISOString() ?? null } : null,
  }))
  return <OrdersClient initialOrders={serialized} role={role} />
}
