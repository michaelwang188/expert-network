// P2: ISR — revalidate=60，零客户端JS
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "积分排行榜",
}

export const revalidate = 60

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  RESEARCHER: { label: "研究员", color: "#185FA5" }, EXPERT: { label: "专家", color: "#0F6E56" }, ADMIN: { label: "管理员", color: "#A32D2D" }, SUPER_ADMIN: { label: "超级管理员", color: "#8B0000" },
}
const MEDALS = ["🥇", "🥈", "🥉"]

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const userId = (session.user as any).id
  const [users, me] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, role: true, orgName: true, points: true }, where: { points: { gt: 0 } }, orderBy: { points: "desc" }, take: 50 }),
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
  ])
  const maxPoints = users.length > 0 ? users[0].points : 1
  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>公益积分排行榜</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>积分获取：专家贡献劳动时间 · 研究员现金兑换<br />我的积分余额：<strong style={{ color: "#185FA5", fontSize: 18 }}>{(me?.points ?? 0).toLocaleString()}</strong></p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {users.map((u, i) => (
          <div key={u.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
            <div style={{ width: 28, textAlign: "center", fontSize: 14 }}>{i < 3 ? MEDALS[i] : <span style={{ color: "#888" }}>{i + 1}</span>}</div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#185FA5", flexShrink: 0 }}>{(u.name || "U")[0]}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{u.name || "未设置姓名"}</div><div style={{ fontSize: 12, color: "#888" }}>{u.orgName || ""}</div></div>
            <span style={{ background: (ROLE_LABELS[u.role]?.color || "#888") + "18", color: ROLE_LABELS[u.role]?.color || "#888", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{ROLE_LABELS[u.role]?.label || u.role}</span>
            <div style={{ minWidth: 80, textAlign: "right" }}><div style={{ fontWeight: 500, fontSize: 15 }}>{u.points.toLocaleString()}</div><div style={{ fontSize: 10, color: "#888" }}>积分</div></div>
            <div style={{ width: 60, height: 6, background: "#f1efe8", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}><div style={{ width: `${(u.points / maxPoints) * 100}%`, height: "100%", borderRadius: 3, background: i < 3 ? ["#F5A623","#8B9EB0","#C47B3B"][i] : "#378ADD" }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
