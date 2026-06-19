"use client"

import { useState, useEffect } from "react"

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  RESEARCHER: { label: "研究员", color: "#185FA5" },
  EXPERT: { label: "专家", color: "#0F6E56" },
  ADMIN: { label: "管理员", color: "#A32D2D" },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => { setUsers(data.users || data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter ? users.filter(u => u.role === filter) : users

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>用户管理</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, background: "#fff" }}>
          <option value="">全部角色</option>
          {Object.entries(ROLE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#888", marginLeft: "auto" }}>共 {filtered.length} 人</span>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(u => (
            <div key={u.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{u.name || "未设置姓名"}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{u.email} · {u.orgName || "无机构"}</div>
              </div>
              <span style={{
                background: (ROLE_MAP[u.role]?.color || "#888") + "18",
                color: ROLE_MAP[u.role]?.color || "#888",
                padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500,
              }}>{ROLE_MAP[u.role]?.label || u.role}</span>
              <span style={{ fontSize: 12, color: "#888" }}>{new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      }
    </div>
  )
}
