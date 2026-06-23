"use client"
import { useState } from "react"

interface ProfileData {
  name: string | null
  orgName: string | null
  title: string | null
}

export default function ProfileEditor({ user }: { user: ProfileData }) {
  const [editing, setEditing] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [form, setForm] = useState({ name: user.name || "", orgName: user.orgName || "", title: user.title || "" })
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" })
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const saveProfile = async () => {
    setMsg(""); setError("")
    try {
      const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg("资料已更新")
      setEditing(false)
    } catch (e: any) { setError(e.message) }
  }

  const changePassword = async () => {
    setMsg(""); setError("")
    if (pwForm.newPassword.length < 6) { setError("新密码至少6位"); return }
    if (pwForm.newPassword !== pwForm.confirm) { setError("两次密码不一致"); return }
    try {
      const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg("密码已修改")
      setChangingPw(false)
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" })
    } catch (e: any) { setError(e.message) }
  }

  return (
    <div style={{ marginTop: 16 }}>
      {msg && <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{msg}</div>}
      {error && <div style={{ background: "#FEE2E2", color: "#D32F2F", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {!editing ? (
        <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>✏️ 修改资料</button>
      ) : (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 20, marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>修改资料</h3>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 2 }}>姓名</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={inp} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 2 }}>机构</label>
            <input value={form.orgName} onChange={e => setForm(f => ({...f, orgName: e.target.value}))} style={inp} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 2 }}>职务</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} style={inp} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveProfile} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>保存</button>
            <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>取消</button>
          </div>
        </div>
      )}

      {!changingPw ? (
        <button onClick={() => setChangingPw(true)} style={{ padding: "8px 16px", background: "#fff", color: "#185FA5", border: "0.5px solid #185FA5", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>🔑 修改密码</button>
      ) : (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 20, marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>修改密码</h3>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 2 }}>旧密码</label>
            <input type="password" value={pwForm.oldPassword} onChange={e => setPwForm(f => ({...f, oldPassword: e.target.value}))} style={inp} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 2 }}>新密码</label>
            <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} style={inp} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 2 }}>确认新密码</label>
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} style={inp} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={changePassword} style={{ padding: "8px 16px", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>修改密码</button>
            <button onClick={() => setChangingPw(false)} style={{ padding: "8px 16px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "0.5px solid #d0cec6",
  borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box"
}
