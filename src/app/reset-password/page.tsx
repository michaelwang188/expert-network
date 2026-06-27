"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { PasswordInput } from "@/components/PasswordInput"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [status, setStatus] = useState<"loading" | "invalid" | "valid" | "done">("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")

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
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("密码至少8位，需包含大小写字母和数字"); return
    }
    if (password !== confirm) { setError("两次密码输入不一致"); return }
    setError("")
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("done")
        // 尝试自动关闭当前页面（QQ邮箱内置浏览器打开的情况）
        try { setTimeout(() => window.close(), 2000) } catch {}
      } else {
        setError(data.error || "重置失败")
      }
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
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#2c2c2a", marginBottom: 8 }}>密码已重置成功</h1>
      <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, marginBottom: 20 }}>
        请使用新密码在<strong>外部浏览器</strong>中登录
      </p>
      <a href="https://516380.com/login" target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-block", padding: "12px 32px", background: "#185FA5", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
        前往 Safari/Chrome 登录 →
      </a>
      <p style={{ fontSize: 12, color: "#aaa", marginTop: 20 }}>
        此页面可以安全关闭
      </p>
    </div>
  )

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12, textAlign: "center" }}>设置新密码</h1>
      <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20 }}>账号：{email}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <PasswordInput value={password} onChange={setPassword} label="新密码" minLength={8} placeholder="至少8位，含大小写字母和数字" />
        <PasswordInput value={confirm} onChange={setConfirm} label="确认新密码" minLength={8} placeholder="再次输入新密码" />
        {error && <div style={{ color: "#A32D2D", fontSize: 13, background: "#FCEBEB", padding: 8, borderRadius: 8 }}>{error}</div>}
        <button type="submit" style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>确认重置</button>
        <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "#888" }}>← 返回登录</Link>
      </form>
    </div>
  )
}
