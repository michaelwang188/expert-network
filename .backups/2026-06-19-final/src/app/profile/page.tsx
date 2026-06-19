import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const userId = (session.user as any).id
  const role = (session.user as any).role

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, orgName: true, title: true, createdAt: true, points: true },
  })

  // 各自角色的统计数据
  let stats: any = {}
  if (role === "RESEARCHER") {
    const [totalOrders, completedOrders] = await Promise.all([
      prisma.order.count({ where: { researcherId: userId } }),
      prisma.order.count({ where: { researcherId: userId, status: "DONE" } }),
    ])
    stats = { totalOrders, completedOrders }
  } else if (role === "EXPERT") {
    const expert = await prisma.expert.findUnique({ where: { userId } })
    if (expert) {
      const [totalOrders, completedOrders] = await Promise.all([
        prisma.order.count({ where: { expertId: expert.id } }),
        prisma.order.count({ where: { expertId: expert.id, status: "DONE" } }),
      ])
      stats = { totalOrders, completedOrders, rating: expert.rating, ratePoints: expert.ratePoints }
    }
  }

  const ROLE_LABELS: Record<string, string> = { RESEARCHER: "研究员", EXPERT: "专家", ADMIN: "管理员" }

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>个人中心</h2>

      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 500, color: "#185FA5" }}>
            {(user?.name || "U")[0]}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{user?.name || "未设置姓名"}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{user?.email}</div>
          </div>
          <span style={{ marginLeft: "auto", background: "#E6F1FB", color: "#185FA5", padding: "2px 10px", borderRadius: 10, fontSize: 12, fontWeight: 500 }}>
            {ROLE_LABELS[role] || role}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
          <div><span style={{ color: "#888" }}>机构：</span>{user?.orgName || "未填写"}</div>
          <div><span style={{ color: "#888" }}>职务：</span>{user?.title || "未填写"}</div>
          <div><span style={{ color: "#888" }}>公益积分：</span><strong style={{ color: "#185FA5", fontSize: 16 }}>{user?.points?.toLocaleString() || 0}</strong></div>
          <div><span style={{ color: "#888" }}>注册时间：</span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
        </div>

        {role === "RESEARCHER" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 20, paddingTop: 20, borderTop: "0.5px solid #f1efe8" }}>
            <StatBox label="总订单" value={stats.totalOrders || 0} />
            <StatBox label="已完成" value={stats.completedOrders || 0} />
            <StatBox label="完成率" value={(stats.totalOrders > 0 ? Math.round(stats.completedOrders / stats.totalOrders * 100) : 0) + "%"} />
          </div>
        )}

        {role === "EXPERT" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20, paddingTop: 20, borderTop: "0.5px solid #f1efe8" }}>
            <StatBox label="总订单" value={stats.totalOrders || 0} />
            <StatBox label="已完成" value={stats.completedOrders || 0} />
            <StatBox label="评分" value={stats.rating || "-"} />
            <StatBox label="费率" value={stats.ratePoints?.toLocaleString() + " 积分/h"} />
          </div>
        )}
      </div>

      {/* 最近订单 */}
      <RecentOrders userId={userId} role={role} />
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "#f8f7f4", borderRadius: 8, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 500, color: "#2c2c2a" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
    </div>
  )
}

async function RecentOrders({ userId, role }: { userId: string; role: string }) {
  const where: any = {}
  if (role === "RESEARCHER") where.researcherId = userId
  if (role === "EXPERT") {
    const expert = await prisma.expert.findUnique({ where: { userId } })
    if (expert) where.expertId = expert.id
    else return null
  }
  if (role === "ADMIN") return null

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { researcher: true, expert: true, request: true },
  })

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "待确认", color: "#BA7517" },
    ACTIVE: { label: "进行中", color: "#185FA5" },
    DONE: { label: "已完成", color: "#3B6D11" },
    PAID: { label: "已结算", color: "#0F6E56" },
    CANCELLED: { label: "已取消", color: "#A32D2D" },
  }

  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>最近订单</div>
      {orders.length === 0 ? <div style={{ fontSize: 13, color: "#888" }}>暂无订单</div> :
        orders.map(o => (
          <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "0.5px solid #f1efe8", fontSize: 13 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{o.request?.title || o.orderNo}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{o.orderNo} · {role === "RESEARCHER" ? `专家：${o.expert?.title || "未指派"}` : `研究员：${o.researcher?.name || o.researcher?.email}`}</div>
            </div>
            <div style={{ fontWeight: 500 }}>{(o.amount || 0).toLocaleString()} 积分</div>
            <span style={{ background: (STATUS_MAP[o.status]?.color || "#888") + "18", color: STATUS_MAP[o.status]?.color || "#888", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
              {STATUS_MAP[o.status]?.label || o.status}
            </span>
          </div>
        ))}
    </div>
  )
}
