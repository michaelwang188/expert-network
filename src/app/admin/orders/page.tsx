"use client"

import { useState, useEffect } from "react"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待确认", color: "#BA7517" },
  ACTIVE: { label: "进行中", color: "#185FA5" },
  DONE: { label: "已完成", color: "#3B6D11" },
  PAID: { label: "已结算", color: "#0F6E56" },
  CANCELLED: { label: "已取消", color: "#A32D2D" },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch { setOrders([]) }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status }),
    })
    fetchOrders()
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>订单管理</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, background: "#fff" }}>
          <option value="">全部状态</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#888", marginLeft: "auto" }}>共 {filtered.length} 笔</span>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(o => (
            <div key={o.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{o.request?.title || o.orderNo}</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {o.orderNo} · 研究员：{o.researcher?.name || o.researcher?.email} · 专家：{o.expert?.title || "未指派"}
                </div>
              </div>
              <div style={{ fontWeight: 500 }}>{(o.amount || 0).toLocaleString()} 积分</div>
              <span style={{
                background: (STATUS_MAP[o.status]?.color || "#888") + "18",
                color: STATUS_MAP[o.status]?.color || "#888",
                padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500,
              }}>{STATUS_MAP[o.status]?.label || o.status}</span>
              {o.status === "PENDING" && o.expertId && (
                <button onClick={() => handleStatus(o.id, "ACTIVE")} style={{ padding: "4px 10px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>确认开始</button>
              )}
              {o.status === "ACTIVE" && (
                <button onClick={() => handleStatus(o.id, "DONE")} style={{ padding: "4px 10px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>标记完成</button>
              )}
              {o.status === "DONE" && (
                <button onClick={() => handleStatus(o.id, "PAID")} style={{ padding: "4px 10px", background: "#BA7517", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>确认结算</button>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  )
}
