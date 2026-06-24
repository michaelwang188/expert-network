"use client"
import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [devLink, setDevLink] = useState("")
  const [devLoading, setDevLoading] = useState(false)
  const [devError, setDevError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDevLink("")
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || "操作失败")
      }
    } catch { setError("网络错误，请重试") }
    setLoading(false)
  }

  const fetchDevLink = async () => {
    setDevLoading(true)
    setDevError("")
    try {
      const res = await fetch(`/api/forgot-password/dev-link?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok) {
        setDevLink(data.resetLink)
      } else {
        setDevError(data.error || "获取失败")
      }
    } catch { setDevError("网络错误") }
    setDevLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20, textAlign: "center" }}>找回密码</h1>
      {sent ? (
        <div style={{ background: "#EAF3DE", border: "0.5px solid #97C459", borderRadius: 10, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📧</div>
          <p style={{ fontSize: 14, color: "#3B6D11", marginBottom: 16 }}>
            密码重置链接已发送到您的邮箱，请查收后按照指引重置密码。
          </p>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            如未收到邮件，请检查垃圾邮件箱。
          </p>
          {/* 测试环境调试工具 — 仅限seed邮箱可点击 */}
          <details style={{ marginTop: 12, textAlign: "left", fontSize: 12, color: "#888" }}>
            <summary style={{ cursor: "pointer", color: "#aaa", fontSize: 11 }}>测试环境调试</summary>
            <div style={{ marginTop: 8, padding: 10, background: "#fff", borderRadius: 8 }}>
              <p style={{ color: "#888", marginBottom: 6 }}>点击按钮获取重置链接（仅限测试账号）：</p>
              <button
                onClick={fetchDevLink}
                disabled={devLoading}
                style={{
                  padding: "6px 14px", background: devLoading ? "#ccc" : "#185FA5", color: "#fff",
                  border: "none", borderRadius: 6, fontSize: 12, cursor: devLoading ? "not-allowed" : "pointer",
                }}
              >{devLoading ? "获取中..." : "获取测试重置链接"}</button>
              {devLink && (
                <div style={{ marginTop: 8 }}>
                  <a href={devLink} style={{ color: "#185FA5", wordBreak: "break-all", fontSize: 11 }}>{devLink}</a>
                </div>
              )}
              {devError && <p style={{ color: "#A32D2D", marginTop: 6, fontSize: 11 }}>{devError}</p>}
            </div>
          </details>
          <div style={{ marginTop: 16 }}>
            <Link href="/login" style={{ padding: "8px 24px", background: "#185FA5", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14, display: "inline-block" }}>返回登录</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>注册邮箱</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="请输入注册时使用的邮箱"
              style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
          </div>
          {error && <div style={{ color: "#A32D2D", fontSize: 13, background: "#FCEBEB", padding: 8, borderRadius: 8 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            background: "#185FA5", color: "#fff", border: "none", borderRadius: 8,
            padding: 11, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
          }}>{loading ? "发送中..." : "发送重置链接"}</button>
          <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "#888" }}>← 返回登录</Link>
        </form>
      )}
    </div>
  )
}
