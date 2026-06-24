// RSC: 管理后台订单列表
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/roles"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待确认", color: "#BA7517" }, ACTIVE: { label: "进行中", color: "#185FA5" },
  DONE: { label: "已完成", color: "#3B6D11" }, PAID: { label: "已结算", color: "#0F6E56" }, CANCELLED: { label: "已取消", color: "#A32D2D" },
}

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session || !isAdmin((session.user as any).role)) redirect("/dashboard")
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }, include: { researcher: { select: { name: true } }, expert: { select: { title: true, org: true } } },
  })
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>全部订单 · {orders.length} 笔</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {orders.map(o => {
          const s = STATUS_MAP[o.status] || { label: o.status, color: "#888" }
          return (
            <div key={o.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, fontSize: 13, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#888", width: 90 }}>{o.orderNo?.slice(0,10) || o.id}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{o.orderNo}</span>
              <span style={{ fontSize: 12, color: "#888", width: 80 }}>{o.researcher?.name || "-"}</span>
              <span style={{ fontSize: 12, color: "#888", width: 100 }}>{o.expert?.title || "待指派"} · {o.expert?.org || ""}</span>
              <span style={{ fontWeight: 500, width: 70 }}>{o.amount}积分</span>
              <span style={{ background: s.color + "18", color: s.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 12, color: "#aaa", width: 80 }}>{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
