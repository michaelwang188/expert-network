"use client"

import { useState } from "react"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "待审核", color: "#BA7517" },
  COMPLIANCE_OK: { label: "合规通过", color: "#0F6E56" },
  MATCHING: { label: "匹配中", color: "#185FA5" },
  CONFIRMED: { label: "已确认", color: "#3B6D11" },
  COMPLETED: { label: "已完成", color: "#534AB7" },
  CANCELLED: { label: "已取消", color: "#A32D2D" },
}

export default function ReviewClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/requests")
      if (res.ok) setRequests(await res.json())
    } catch {}
    setLoading(false)
  }

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, status }),
    })
    if (res.ok) { showToast(STATUS_MAP[status]?.label || "操作成功"); fetchRequests() }
    else showToast("操作失败，请重试")
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>提纲审核</h2>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>共 {requests.length} 条需求</div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#3B6D11", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, zIndex: 100 }}>{toast}</div>}
      {loading && <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {requests.map(r => (
          <div key={r.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 500, flex: 1 }}>{r.title}</span>
              <span style={{ background: (STATUS_MAP[r.status]?.color || "#888") + "18", color: STATUS_MAP[r.status]?.color || "#888", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500 }}>{STATUS_MAP[r.status]?.label || r.status}</span>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
              {r.orderNo} · {r.industry} {r.subField} · {r.duration} · {r.form} · 预算 {r.budget}
            </div>
            {r.outline && <div style={{ fontSize: 12, color: "#5F5E5A", background: "#f8f7f4", padding: 10, borderRadius: 6, whiteSpace: "pre-wrap", marginBottom: 8 }}>{r.outline}</div>}
            {r.forbidden && <div style={{ fontSize: 12, color: "#A32D2D", marginBottom: 8 }}>🚫 禁止方向：{r.forbidden}</div>}
            <div style={{ display: "flex", gap: 6 }}>
              {r.status === "SUBMITTED" && (
                <button onClick={() => handleStatus(r.id, "COMPLIANCE_OK")} style={{ padding: "4px 12px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>合规通过</button>
              )}
              {(r.status === "SUBMITTED" || r.status === "COMPLIANCE_OK") && (
                <button onClick={() => handleStatus(r.id, "MATCHING")} style={{ padding: "4px 12px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>进入匹配</button>
              )}
              {r.status !== "CANCELLED" && (
                <button onClick={() => handleStatus(r.id, "CANCELLED")} style={{ padding: "4px 12px", background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #f4b8b8", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>驳回/取消</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
