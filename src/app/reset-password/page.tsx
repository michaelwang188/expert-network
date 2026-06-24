"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [status, setStatus] = useState<"loading" | "invalid" | "valid" | "done">("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")

  // 验证令牌
  const checkToken = useCallback(async () => {
    if (!token) { setStatus("invalid"); return }
    try {
      const res = await fetch(`/api/reset-password?token=${token}`)
      const data = await res.json()
      if (data.valid) { setEmail(data.email); setStatus("valid") }
      else { setStatus("invalid") }
    } catch { setStatus("invalid") }
  }, [token])

  useEffect(() => { checkToken() }, [checkToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError("密码至少6位"); return }
    if (password !== confirm) { setError("两次密码输入不一致"); return }
    setError("")
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) { setStatus("done") }
      else { setError(data.error || "重置失败") }
    } catch { setError("网络错误，请重试") }
  }

  if (status === "loading") return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, textAlign: "center", color: "#888" }}>验证中...</div>
  )

  if (status === "invalid") return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>链接已失效</h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>密码重置链接已过期或无效，请重新申请。</p>
      <Link href="/forgot-password" style={{ padding: "8px 24px", background: "#185FA5", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>重新申请</Link>
    </div>
  )

  if (status === "done") return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>密码已重置</h1>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>请使用新密码登录</p>
      <Link href="/login" style={{ padding: "8px 24px", background: "#185FA5", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14 }}>去登录</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12, textAlign: "center" }}>设置新密码</h1>
      <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20 }}>账号：{email}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>新密码</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="至少6位"
            style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>确认新密码</label>
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="再次输入新密码"
            style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
        </div>
        {error && <div style={{ color: "#A32D2D", fontSize: 13, background: "#FCEBEB", padding: 8, borderRadius: 8 }}>{error}</div>}
        <button type="submit" style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>确认重置</button>
        <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "#888" }}>← 返回登录</Link>
      </form>
    </div>
  )
}
