// RSC: 管理员用户列表
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/roles"

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  RESEARCHER: { label: "研究员", color: "#185FA5" }, EXPERT: { label: "专家", color: "#0F6E56" }, INVESTOR: { label: "投资人", color: "#7B3FA5" }, ADMIN: { label: "管理员", color: "#A32D2D" }, SUPER_ADMIN: { label: "超级管理员", color: "#8B0000" },
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || !isSuperAdmin((session.user as any).role)) redirect("/dashboard")
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, orgName: true, points: true, createdAt: true } })
  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>用户管理 · {users.length} 人</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {users.map(u => (
          <div key={u.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 500, flex: 1 }}>{u.name || "未设置"}</span>
            <span style={{ fontSize: 12, color: "#888", width: 180 }}>{u.email}</span>
            <span style={{ fontSize: 12, color: "#888", width: 120 }}>{u.orgName || "-"}</span>
            <span style={{ background: (ROLE_LABELS[u.role]?.color || "#888") + "18", color: ROLE_LABELS[u.role]?.color || "#888", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{ROLE_LABELS[u.role]?.label || u.role}</span>
            <span style={{ fontWeight: 500, width: 60 }}>{u.points}积分</span>
            <span style={{ fontSize: 12, color: "#aaa", width: 80 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
