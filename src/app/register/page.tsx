"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [orgName, setOrgName] = useState("")
  const [role, setRole] = useState("RESEARCHER")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (password !== confirmPassword) {
      setError("两次密码不一致")
      setLoading(false)
      return
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, orgName, role }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "注册失败")
      setLoading(false)
    } else {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        router.push("/login?registered=1")
      }
    }
  }

  const inputStyle = { width: "100%" as const, padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14 }

  return (
    <div style={{ maxWidth: 440, margin: "60px auto", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: "#185FA5", marginBottom: 4 }}>注册账号</h1>
        <p style={{ fontSize: 13, color: "#888" }}>加入产研通 ProLink</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>姓名 *</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>邮箱 *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>密码 *（至少6位）</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>确认密码 *</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>机构名称</label>
          <input value={orgName} onChange={e => setOrgName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>身份 *</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
            <option value="RESEARCHER">研究员（公募/私募/券商/PEVC）</option>
            <option value="EXPERT">专家（产业从业者）</option>
            <option value="INVESTOR">投资人/投资机构</option>
          </select>
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>管理员账号由平台分配，如需开通请联系客服</div>
        </div>
        {error && <div style={{ color: "#A32D2D", fontSize: 13, background: "#FCEBEB", padding: 8, borderRadius: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          background: "#185FA5", color: "#fff", border: "none", borderRadius: 8,
          padding: 11, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4,
        }}>{loading ? "注册中..." : "注册"}</button>
      </form>
      <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 16 }}>
        已有账号？<Link href="/login" style={{ color: "#185FA5" }}>去登录</Link>
      </p>
    </div>
  )
}
