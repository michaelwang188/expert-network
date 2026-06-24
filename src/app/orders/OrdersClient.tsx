"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { isAdmin } from "@/lib/roles"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "待确认", color: "#BA7517" },
  ACTIVE:    { label: "进行中", color: "#185FA5" },
  DONE:      { label: "已完成", color: "#3B6D11" },
  PAID:      { label: "已结算", color: "#0F6E56" },
  CANCELLED: { label: "已取消", color: "#A32D2D" },
}

export default function OrdersClient({ initialOrders, role }: { initialOrders: any[]; role: string }) {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

  const fetchOrders = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/orders")
      if (!res.ok) {
        if (res.status === 401) { setError("请重新登录"); return }
        if (res.status === 429) { setError("操作过于频繁，请稍后再试"); return }
        setError("加载失败，请稍后重试")
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
      else if (data.error) setError(data.error)
    } catch {
      setError("网络连接失败，请检查网络后重试")
    } finally {
      setLoading(false)
    }
  }

  const actionLabels: Record<string, string> = {
    ACTIVE: "已接单", DONE: "标记完成", PAID: "已结算", CANCELLED: "已取消",
  }
  const handleAction = async (orderId: string, status: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    })
    if (res.ok) {
      showToast(actionLabels[status] || "操作成功")
      fetchOrders()
    } else {
      const d = await res.json().catch(() => ({}))
      if (res.status === 402) setError("积分不足，请充值")
      else if (res.status === 409) setError("该订单已终结，不可变更")
      else setError(d.error || "操作失败")
    }
  }

  const filtered = filter ? orders.filter((o: any) => o.status === filter) : orders

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>订单管理</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">全部状态</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#888", marginLeft: "auto" }}>共 {filtered.length} 笔订单</span>
      </div>

      {error && <div style={{ padding: 12, background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error} <span onClick={() => setError("")} style={{ cursor: "pointer" }}>✕</span></div>}
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#3B6D11", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 100 }}>{toast}</div>}

      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: 10, fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.6 }}>
        💰 <strong>费用结构</strong>：总积分 = 专家费 + 平台服务费。平台不参与调研结论，仅提供撮合与合规保障。
        ⚠️ 禁止私下联系专家绕开平台交易，一经发现永久封号。
      </div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        filtered.length === 0 ?
        <EmptyState role={role} error={!!error} /> :
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
              {filtered.map((o: any) => (
                <tr key={o.id} style={{ borderTop: "0.5px solid #f1efe8" }}>
                  <td style={{ padding: 10, fontFamily: "monospace", fontSize: 12, color: "#888" }}>{o.orderNo || o.id}</td>
                  <td style={{ padding: 10, fontWeight: 500 }}>{o.request?.title || o.orderNo || o.id}</td>
                  <td style={{ padding: 10, fontSize: 12, color: "#888" }}>{o.expert?.title || "-"}</td>
                  <td style={{ padding: 10, fontWeight: 500 }}>{(o.amount || 0).toLocaleString()} 积分</td>
                  <td style={{ padding: 10, fontSize: 11, color: "#888" }}>
                    专家 {(o.expertFee || 0).toLocaleString()} 积分<br />平台 {(o.platformFee || 0).toLocaleString()} 积分
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
                    {o.status === "DONE" && isAdmin(role) && (
                      <button onClick={() => handleAction(o.id, "PAID")} style={{ padding: "4px 10px", background: "#BA7517", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>确认结算</button>
                    )}
                    {["PENDING", "ACTIVE"].includes(o.status) && (
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

function EmptyState({ role, error }: { role: string; error: boolean }) {
  if (error) {
    return <div style={{ padding: 40, textAlign: "center", background: "#FCEBEB", borderRadius: 10, color: "#A32D2D", fontSize: 14 }}>加载失败，请刷新页面重试</div>
  }
  const msg: Record<string, { emoji: string; title: string; desc: string; action?: { label: string; href: string } }> = {
    RESEARCHER: {
      emoji: "🔬", title: "暂无订单", desc: "提交调研需求后，管理员会为您匹配合适的行业专家，订单将显示在这里。",
      action: { label: "提交调研需求", href: "/request" },
    },
    EXPERT: {
      emoji: "🧠", title: "暂无订单", desc: "管理员匹配到合适的需求后会将订单分配给您。届时您可以在此页面确认接单并查看订单详情。",
    },
    ADMIN: {
      emoji: "📋", title: "暂无订单", desc: "尚无研究员提交调研需求。当有新需求时，您可以在管理后台进行派单操作。",
      action: { label: "前往管理后台", href: "/admin" },
    },
  }
  const m = msg[role] || msg.RESEARCHER
  return (
    <div style={{ textAlign: "center", padding: 48, background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 12 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{m.emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#2c2c2a", marginBottom: 8 }}>{m.title}</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 20px" }}>{m.desc}</div>
      {m.action && (
        <a href={m.action.href} style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          {m.action.label}
        </a>
      )}
    </div>
  )
}
