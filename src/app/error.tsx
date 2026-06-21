"use client"
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>⚙️</div>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: "#2c2c2a", margin: "0 0 8px" }}>服务器开小差了</h1>
      <p style={{ fontSize: 15, color: "#888", margin: "0 0 8px", lineHeight: 1.7, maxWidth: 400 }}>我们的技术团队已收到异常通知，正在紧急排查中。</p>
      <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 32px" }}>请稍后重试，或联系客服获取帮助。</p>
      <button onClick={reset} style={{ padding: "10px 24px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, border: "none", cursor: "pointer", fontWeight: 500 }}>重试页面</button>
    </div>
  )
}
