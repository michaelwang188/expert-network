"use client"

import { useState, useEffect } from "react"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待审核", color: "#BA7517" },
  ACTIVE: { label: "活跃", color: "#0F6E56" },
  FROZEN: { label: "已冻结", color: "#A32D2D" },
  INACTIVE: { label: "已驳回", color: "#888" },
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")

  const fetchExperts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: "100" })
    const res = await fetch(`/api/experts?${params}`)
    const data = await res.json()
    setExperts(data.experts || [])
    setLoading(false)
  }

  useEffect(() => { fetchExperts() }, [])

  const handleStatus = async (id: string, status: string) => {
    await fetch("/api/experts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchExperts()
  }

  const filtered = experts.filter(e => {
    if (filter && e.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (e.title + e.org + e.tags + e.industry1).toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>专家管理</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input placeholder="搜索姓名/单位/标签..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none" }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, background: "#fff" }}>
          <option value="">全部状态</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>共 {filtered.length} 位专家</div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(e => (
            <div key={e.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{e.org} · {e.region} · {e.years}年 · {e.industry1} · {e.roleType}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>标签：{e.tags || "无"} · {e.ratePoints || e.rateHour} 积分/h · {e.forms}</div>
              </div>
              <span style={{
                background: (STATUS_MAP[e.status]?.color || "#888") + "18",
                color: STATUS_MAP[e.status]?.color || "#888",
                padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500,
              }}>{STATUS_MAP[e.status]?.label || e.status}</span>
              {e.status === "PENDING" && (
                <>
                  <button onClick={() => handleStatus(e.id, "ACTIVE")} style={{ padding: "4px 10px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>通过</button>
                  <button onClick={() => handleStatus(e.id, "INACTIVE")} style={{ padding: "4px 10px", background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #f4b8b8", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>驳回</button>
                </>
              )}
              {e.status === "ACTIVE" && (
                <button onClick={() => handleStatus(e.id, "FROZEN")} style={{ padding: "4px 10px", background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #f4b8b8", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>冻结</button>
              )}
              {e.status === "FROZEN" && (
                <button onClick={() => handleStatus(e.id, "ACTIVE")} style={{ padding: "4px 10px", background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #b8d4f4", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>解冻</button>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  )
}
