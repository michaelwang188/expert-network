"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { PasswordInput } from "@/components/PasswordInput"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [status, setStatus] = useState<"loading" | "invalid" | "valid" | "resetting">("loading")
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
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("密码至少8位，需包含大小写字母和数字"); return
    }
    if (password !== confirm) { setError("两次密码输入不一致"); return }
    setError("")
    setStatus("resetting")

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok && data.autoLogin) {
        // 重置成功 + session cookie 已通过 API 响应设置
        // 直接跳转 dashboard
        window.location.href = "/dashboard"
        return
      }
      if (!res.ok) { setError(data.error || "重置失败"); setStatus("valid"); return }

      // 兜底：没有 autoLogin 标志，引导用户去登录
      setError("密码已重置，请尝试登录")
      setStatus("valid")
    } catch {
      setError("网络错误，请重试")
      setStatus("valid")
    }
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

  if (status === "resetting") return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #f1efe8", borderTopColor: "#185FA5", margin: "0 auto 12px", animation: "spin 0.6s linear infinite" }}></div>
      <div style={{ fontSize: 15, color: "#888" }}>密码已重置，正在自动登录...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
        <button type="submit" style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>确认重置并登录</button>
        <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "#888" }}>← 返回登录</Link>
      </form>
    </div>
  )
}
