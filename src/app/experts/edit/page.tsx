"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/AuthGuard"

const INDUSTRIES = ["", "AI算力", "新能源", "半导体", "MLCC", "创新药", "消费电子", "机器人", "新材料", "医药"]
const ROLE_TYPES = ["", "企业技术专家", "供应链", "渠道/销售", "研发/工艺", "管理/战略", "政策/监管", "高校/院所"]
const FORM_OPTIONS = ["线上语音", "线上视频", "线下走访"]

function ExpertEditContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    realName: "",
    title: "",
    org: "",
    years: 0,
    region: "",
    industry1: "",
    industry2: "",
    roleType: "",
    tags: "",
    topics: "",
    rateHour: 0,
    forms: [] as string[],
    availableTime: "",
  })

  useEffect(() => {
    fetch("/api/experts/me")
      .then(r => r.json())
      .then(data => {
        if (data.expert) {
          const e = data.expert
          setForm({
            realName: e.realName || "",
            title: e.title || "",
            org: e.org || "",
            years: e.years || 0,
            region: e.region || "",
            industry1: e.industry1 || "",
            industry2: e.industry2 || "",
            roleType: e.roleType || "",
            tags: e.tags || "",
            topics: e.topics || "",
            rateHour: e.rateHour || 0,
            forms: e.forms ? e.forms.split(",").map((s: string) => s.trim()) : [],
            availableTime: e.availableTime || "",
          })
        } else if (data.user) {
          setForm(f => ({
            ...f,
            realName: data.user.name || "",
            title: data.user.title || "",
            org: data.user.orgName || "",
          }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleForm = (f: string) => {
    setForm(prev => ({
      ...prev,
      forms: prev.forms.includes(f)
        ? prev.forms.filter(x => x !== f)
        : [...prev.forms, f],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/experts/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, forms: form.forms.join(",") }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.ok) {
      setMessage("✅ 保存成功！新档案提交后需平台审核通过方可接单")
    } else {
      setMessage("❌ 保存失败：" + (data.error || "未知错误"))
    }
  }

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div>

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>我的专家资料</h2>

      {message && (
        <div style={{
          padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16,
          background: message.startsWith("✅") ? "#E1F5EE" : "#FCEBEB",
          color: message.startsWith("✅") ? "#0F6E56" : "#A32D2D",
        }}>{message}</div>
      )}

      <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 基本信息 */}
        <SectionTitle title="基本信息" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="真实姓名" value={form.realName} onChange={v => update("realName", v)} />
          <Field label="职务/头衔" value={form.title} onChange={v => update("title", v)} placeholder="例：首席技术官" />
        </div>
        <Field label="单位/机构" value={form.org} onChange={v => update("org", v)} placeholder="例：华为技术有限公司" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="从业年限" value={form.years.toString()} onChange={v => update("years", parseInt(v) || 0)} type="number" />
          <Field label="所在地区" value={form.region} onChange={v => update("region", v)} placeholder="例：深圳" />
        </div>

        {/* 专业信息 */}
        <SectionTitle title="专业标签（三级体系）" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>一级：行业大类</label>
            <select value={form.industry1} onChange={e => update("industry1", e.target.value)}
              style={inputStyle}>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i || "请选择"}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>二级：细分环节</label>
            <input value={form.industry2} onChange={e => update("industry2", e.target.value)}
              placeholder="例：光伏硅料/MCU设计"
              style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>三级：岗位属性</label>
          <select value={form.roleType} onChange={e => update("roleType", e.target.value)}
            style={inputStyle}>
            {ROLE_TYPES.map(r => <option key={r} value={r}>{r || "请选择"}</option>)}
          </select>
        </div>
        <Field label="技术标签（逗号分隔）" value={form.tags} onChange={v => update("tags", v)} placeholder="例：MLCC,功率半导体,AI芯片" />
        <div>
          <label style={labelStyle}>擅长话题</label>
          <textarea value={form.topics} onChange={e => update("topics", e.target.value)}
            rows={3} placeholder="例：MLCC元器件技术趋势,功率半导体应用场景,AI芯片市场分析"
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {/* 报价与档期 */}
        <SectionTitle title="报价与档期" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="时薪报价（元/小时）" value={form.rateHour.toString()} onChange={v => update("rateHour", parseInt(v) || 0)} type="number" />
          <Field label="可接待时段" value={form.availableTime} onChange={v => update("availableTime", v)} placeholder="例：工作日14:00-18:00" />
        </div>
        <div>
          <label style={labelStyle}>可访谈形式（可多选）</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FORM_OPTIONS.map(f => (
              <button key={f} onClick={() => toggleForm(f)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                border: form.forms.includes(f) ? "1px solid #185FA5" : "0.5px solid #e0dfd8",
                background: form.forms.includes(f) ? "#E6F1FB" : "#fff",
                color: form.forms.includes(f) ? "#185FA5" : "#5F5E5A",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* 合规提醒 */}
        <SectionTitle title="合规自查" />
        <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
          ✅ 本人非上市公司董监高或内幕知情人<br/>
          ✅ 不讨论未公开财务数据、并购计划、定增涉密信息<br/>
          ✅ 调研内容仅限公开产业信息和个人专业见解<br/>
          ✅ 如有竞业限制，已确认本次交流不违反相关协议
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={() => router.back()} style={{
            padding: "10px 20px", border: "0.5px solid #e0dfd8", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14,
          }}>取消</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "10px 24px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500,
            background: "#185FA5", color: "#fff", opacity: saving ? 0.6 : 1,
          }}>{saving ? "保存中..." : "保存并提交审核 →"}</button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 500, color: "#2c2c2a",
      borderBottom: "0.5px solid #f1efe8", paddingBottom: 6, marginTop: 4,
    }}>{title}</div>
  )
}

function Field({
  label, value, onChange, type = "text", placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "#888", display: "block", marginBottom: 4,
}
const inputStyle: React.CSSProperties = {
  width: "100%", padding: 9, border: "0.5px solid #e0dfd8", borderRadius: 8,
  fontSize: 14, outline: "none", boxSizing: "border-box",
}

export default function ExpertEditPage() {
  return (
    <AuthGuard roles={["EXPERT"]}>
      <ExpertEditContent />
    </AuthGuard>
  )
}
