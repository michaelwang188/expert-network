import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 12 }}>🔍</div>
      <h1 style={{ fontSize: 24, fontWeight: 500, color: "#2c2c2a", marginBottom: 8 }}>404 — 页面未找到</h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>你访问的页面不存在或已被移动</p>
      <Link href="/dashboard" style={{ display: "inline-block", padding: "10px 28px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
        返回首页
      </Link>
    </div>
  )
}
