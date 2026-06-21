import Link from "next/link"
export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: "#2c2c2a", margin: "0 0 8px" }}>页面不见了</h1>
      <p style={{ fontSize: 15, color: "#888", margin: "0 0 32px", lineHeight: 1.7, maxWidth: 400 }}>您访问的页面可能已被移动、删除或从未存在。试试返回首页，或联系我们的支持团队。</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/dashboard" style={{ padding: "10px 24px", borderRadius: 8, background: "#185FA5", color: "#fff", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>返回首页</Link>
        <Link href="/login" style={{ padding: "10px 24px", borderRadius: 8, border: "0.5px solid #d0cec6", color: "#5F5E5A", fontSize: 14, textDecoration: "none" }}>登录账户</Link>
      </div>
    </div>
  )
}
