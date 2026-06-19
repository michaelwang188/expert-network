"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import AuthGuard from "@/components/AuthGuard"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "待确认", color: "#BA7517" },
  ACTIVE:    { label: "进行中", color: "#185FA5" },
  DONE:      { label: "已完成", color: "#3B6D11" },
  PAID:      { label: "已结算", color: "#0F6E56" },
  CANCELLED: { label: "已取消", color: "#A32D2D" },
}

function OrdersContent() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchOrders = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      } else if (data.error) {
        setError(data.error)
        setOrders([])
      } else {
        setOrders([])
      }
    } catch {
      setError("加载失败，请刷新重试")
      setOrders([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAction = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    })
    fetchOrders()
  }

  const filtered = Array.isArray(orders) && filter
    ? orders.filter(o => o.status === filter)
    : orders

  const role = (session?.user as any)?.role

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>订单管理</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">全部状态</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#888", marginLeft: "auto" }}>共 {filtered.length} 笔订单</span>
      </div>

      {error && <div style={{ padding: 12, background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {/* 费用说明 */}
      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: 10, fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.6 }}>
        💰 <strong>费用结构</strong>：总价 = 专家酬劳（80%）+ 平台服务费（20%）。平台不参与调研结论，仅提供撮合与合规保障。
        ⚠️ 禁止私下联系专家绕开平台交易，一经发现永久封号。
      </div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        filtered.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>{error ? "请刷新重试" : "暂无订单"}</div> :
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f7f4" }}>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>订单号</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>调研主题</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>专家</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>金额</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>明细</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>状态</th>
                <th style={{ padding: 10, textAlign: "left", fontSize: 12, color: "#888", fontWeight: 500 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderTop: "0.5px solid #f1efe8" }}>
                  <td style={{ padding: 10, fontFamily: "monospace", fontSize: 12, color: "#888" }}>{o.orderNo || o.id}</td>
                  <td style={{ padding: 10, fontWeight: 500 }}>{o.request?.title || o.orderNo || o.id}</td>
                  <td style={{ padding: 10, fontSize: 12, color: "#888" }}>{o.expert?.title || "-"}</td>
                  <td style={{ padding: 10, fontWeight: 500 }}>¥{((o.amount || 0) / 100).toLocaleString()}</td>
                  <td style={{ padding: 10, fontSize: 11, color: "#888" }}>
                    专家 ¥{((o.expertFee || 0) / 100).toLocaleString()}<br/>平台 ¥{((o.platformFee || 0) / 100).toLocaleString()}
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      background: (STATUS_MAP[o.status]?.color || "#888") + "18",
                      color: STATUS_MAP[o.status]?.color || "#888",
                      padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500,
                    }}>{STATUS_MAP[o.status]?.label || o.status}</span>
                  </td>
                  <td style={{ padding: 10 }}>
                    {o.status === "PENDING" && role === "EXPERT" && (
                      <button onClick={() => handleAction(o.id, "ACTIVE")} style={{ padding: "4px 10px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>确认接单</button>
                    )}
                    {o.status === "ACTIVE" && (
                      <button onClick={() => handleAction(o.id, "DONE")} style={{ padding: "4px 10px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>标记完成</button>
                    )}
                    {o.status === "DONE" && role === "ADMIN" && (
                      <button onClick={() => handleAction(o.id, "PAID")} style={{ padding: "4px 10px", background: "#BA7517", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>确认结算</button>
                    )}
                    {["PENDING","ACTIVE"].includes(o.status) && (
                      <button onClick={() => handleAction(o.id, "CANCELLED")} style={{ padding: "4px 10px", background: "#FCEBEB", color: "#A32D2D", border: "0.5px solid #f4b8b8", borderRadius: 6, fontSize: 12, cursor: "pointer", marginLeft: 4 }}>取消</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  )
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  )
}
