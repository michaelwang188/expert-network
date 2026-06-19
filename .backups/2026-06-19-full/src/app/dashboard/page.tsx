import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

// 热门赛道统计
const TRACK_LABELS = ["AI算力","新能源","半导体","MLCC","创新药","消费电子"]

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  // 并行查数据
  const [expertCount, pendingExperts, monthOrders, recentOrders, complianceLogs] = await Promise.all([
    prisma.expert.count({ where: { status: "ACTIVE" } }),
    prisma.expert.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      include: { researcher: true, expert: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { researcher: true, expert: true },
    }),
    prisma.complianceLog.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" }, take: 10 }),
  ])

  const monthGMV = monthOrders.reduce((s, o) => s + o.amount, 0) / 100  // 分→元，再÷100? wait: amount is in 分, so /100 = 元
  const monthOrderCount = monthOrders.length

  // 赛道分布（简化统计 —— 实际应从 Request.industry 关联，这里用 Order 近似）
  const trackCounts: Record<string, number> = {}
  TRACK_LABELS.forEach(l => trackCounts[l] = 0)
  // 用 mock 数据展示，真实场景从 Request 表统计
  trackCounts["AI算力"] = 247; trackCounts["新能源"] = 204; trackCounts["半导体"] = 183
  trackCounts["MLCC"] = 136; trackCounts["创新药"] = 115; trackCounts["消费电子"] = 88
  const maxTrack = Math.max(...Object.values(trackCounts))

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "待确认", color: "#BA7517" },
    ACTIVE: { label: "进行中", color: "#185FA5" },
    DONE: { label: "已完成", color: "#3B6D11" },
    PAID: { label: "已结算", color: "#0F6E56" },
    CANCELLED: { label: "已取消", color: "#A32D2D" },
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>数据看板</h2>

      {/* 指标卡 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="在库活跃专家" value={expertCount.toLocaleString()} sub="可接单状态" />
        <StatCard label="本月订单" value={monthOrderCount.toString()} sub="笔" up />
        <StatCard label="本月 GMV（元）" value={monthGMV.toLocaleString()} sub="平台总收入" up />
        <StatCard label="待处理事项" value={pendingExperts.toString()} sub="专家审核 + 合规" warn={pendingExperts > 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* 热门赛道 */}
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>热门赛道分布</div>
          {TRACK_LABELS.map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <div style={{ width: 72, fontSize: 12, color: "#888", textAlign: "right", flexShrink: 0 }}>{t}</div>
              <div style={{ flex: 1, height: 16, background: "#f1efe8", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${maxTrack ? trackCounts[t] / maxTrack * 100 : 0}%`, height: "100%", borderRadius: 4, background: t === "AI算力" ? "#378ADD" : t === "新能源" ? "#1D9E75" : t === "半导体" ? "#534AB7" : t === "MLCC" ? "#BA7517" : t === "创新药" ? "#D4537E" : "#888780" }} />
              </div>
              <div style={{ width: 36, fontSize: 12, color: "#888", flexShrink: 0 }}>{trackCounts[t]}</div>
            </div>
          ))}
        </div>

        {/* 近期订单 */}
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>近期订单</div>
          {recentOrders.length === 0 && <div style={{ fontSize: 13, color: "#888" }}>暂无订单，<Link href="/request" style={{ color: "#185FA5" }}>去发起调研</Link></div>}
          {recentOrders.map(o => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "0.5px solid #f1efe8", fontSize: 13 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.id}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{o.researcher.name || o.researcher.email} → {o.expert?.title || "待指派专家"}</div>
              </div>
              <div style={{ fontWeight: 500, color: "#2c2c2a", whiteSpace: "nowrap" }}>¥{(o.amount / 100).toLocaleString()}</div>
              <div style={{
                background: statusMap[o.status] ? statusMap[o.status].color + "18" : "#f1efe8",
                color: statusMap[o.status]?.color || "#888",
                padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
              }}>
                {statusMap[o.status]?.label || o.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 合规预警 */}
      {complianceLogs.length > 0 && (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: "#A32D2D" }}>合规预警（{complianceLogs.length} 项待处理）</div>
          {complianceLogs.map(log => (
            <div key={log.id} style={{ padding: "8px 0", borderBottom: "0.5px solid #f1efe8", fontSize: 13, display: "flex", gap: 8 }}>
              <span style={{ background: "#FCEBEB", color: "#A32D2D", padding: "1px 6px", borderRadius: 4, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>{log.eventType}</span>
              <span style={{ color: "#5F5E5A" }}>{log.description || log.targetType + " " + log.targetId}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>{new Date(log.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, up, warn }: { label: string; value: string; sub: string; up?: boolean; warn?: boolean }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: warn ? "#A32D2D" : up ? "#0F6E56" : "#2c2c2a" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{sub}</div>
    </div>
  )
}
