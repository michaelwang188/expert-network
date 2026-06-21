"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const registered = params.get("registered")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email, password, redirect: false,
    })
    if (res?.error) {
      setError("邮箱或密码错误")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: "#185FA5", marginBottom: 4 }}>产研通 ProLink</h1>
        <p style={{ fontSize: 13, color: "#888" }}>产业专家对接平台 · 登录</p>
        {registered && (
          <div style={{ marginTop: 12, padding: 10, background: "#EAF3DE", borderRadius: 8, color: "#3B6D11", fontSize: 13, fontWeight: 500 }}>
            ✅ 注册成功，请登录
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>邮箱</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>密码</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
        </div>
        {error && <div style={{ color: "#A32D2D", fontSize: 13, background: "#FCEBEB", padding: 8, borderRadius: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          background: "#185FA5", color: "#fff", border: "none", borderRadius: 8,
          padding: 11, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        }}>{loading ? "登录中..." : "登录"}</button>
      </form>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginTop: 12 }}>
        <span><Link href="/forgot-password" style={{ color: "#185FA5" }}>忘记密码？</Link></span>
        <span>还没有账号？<Link href="/register" style={{ color: "#185FA5" }}>立即注册</Link></span>
      </div>
      <div style={{ marginTop: 24, padding: 12, background: "#f8f7f4", borderRadius: 8, fontSize: 12, color: "#888" }}>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>演示账号（已内置，可直接登录）：</p>
        <p>研究员：researcher@demo.com / 123456</p>
        <p>专家：expert@demo.com / 123456</p>
        <p>管理员：admin@demo.com / 123456</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
