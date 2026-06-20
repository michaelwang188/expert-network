"use client"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 12 }}>⚠️</div>
      <h1 style={{ fontSize: 20, fontWeight: 500, color: "#A32D2D", marginBottom: 8 }}>页面加载出错</h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>{error.message || "发生未知错误"}</p>
      <button onClick={reset} style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>
        重试
      </button>
    </div>
  )
}
