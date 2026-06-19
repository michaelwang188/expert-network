"use client"

import { useState, useEffect } from "react"

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/compliance")
      const data = await res.json()
      setLogs(Array.isArray(data.logs || data) ? (data.logs || data) : [])
    } catch { setLogs([]) }
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [])

  const handleHandled = async (id: string) => {
    await fetch("/api/compliance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handled: true }),
    })
    fetchLogs()
  }

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>合规日志</h2>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>共 {logs.length} 条记录</div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        logs.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>暂无合规事件</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {logs.map(log => (
            <div key={log.id} style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <span style={{
                background: log.handled ? "#EAF3DE" : "#FCEBEB",
                color: log.handled ? "#3B6D11" : "#A32D2D",
                padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
              }}>{log.handled ? "已处理" : log.eventType}</span>
              <div style={{ flex: 1 }}>
                <span style={{ color: "#5F5E5A" }}>{log.description || `${log.targetType} ${log.targetId}`}</span>
              </div>
              <span style={{ fontSize: 12, color: "#888" }}>{new Date(log.createdAt).toLocaleString()}</span>
              {!log.handled && (
                <button onClick={() => handleHandled(log.id)} style={{ padding: "3px 10px", background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #b8d4f4", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>标记已处理</button>
              )}
            </div>
          ))}
        </div>
      }
    </div>
  )
}
