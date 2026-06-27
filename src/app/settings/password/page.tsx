"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ChangePasswordPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // 如果未登录，跳转到登录页
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  if (status === "loading") {
    return <LoadingView />
  }
  if (!session) return null

  const needsChange = (session.user as any)?.needsPasswordChange

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: "err", text: "两次输入的新密码不一致" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "ok", text: data.message || "密码修改成功" })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setMessage({ type: "err", text: data.error || "修改失败" })
      }
    } catch {
      setMessage({ type: "err", text: "网络错误，请重试" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: "0 20px" }}>
      {needsChange && (
        <div style={{ background: "#FFF3E0", border: "0.5px solid #FFB74D", borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 14, color: "#E65100", lineHeight: 1.6 }}>
          ⚠️ 当前密码强度较低，请立即修改为更安全的密码（至少8位，包含大小写字母和数字）。
        </div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#2c2c2a", marginBottom: 8 }}>修改密码</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>
        密码需至少8位，包含大写字母、小写字母和数字。
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>当前密码 *</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            style={inputStyle}
            autoFocus={!needsChange}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>新密码 *</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
            autoFocus={needsChange}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>确认新密码 *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </div>

        {message && (
          <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 16, fontSize: 13, background: message.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: message.type === "ok" ? "#2E7D32" : "#C62828" }}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "10px 0", borderRadius: 8, background: loading ? "#999" : "#185FA5", color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "修改中..." : "修改密码"}
        </button>
      </form>

      {message?.type === "ok" && needsChange && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#2E7D32", marginBottom: 12 }}>✅ 密码已升级，建议重新登录以刷新状态。</p>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid #d0cec6", color: "#5F5E5A", fontSize: 13, background: "#fff", cursor: "pointer" }}>
            重新登录
          </button>
        </div>
      )}
    </div>
  )
}

function LoadingView() {
  return (
    <div style={{ padding: 48, textAlign: "center", fontSize: 14, color: "#888" }}>加载中...</div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", fontSize: 14, border: "0.5px solid #d0cec6", borderRadius: 6, outline: "none", boxSizing: "border-box",
}
