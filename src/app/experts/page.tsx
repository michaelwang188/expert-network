"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AuthGuard from "@/components/AuthGuard"

const INDUSTRIES = ["", "AI算力", "新能源", "半导体", "MLCC", "创新药", "消费电子"]
const ROLE_TYPES = ["", "研发", "供应链", "渠道", "管理", "政策"]
const FORMS = ["", "线上语音", "线上视频", "线下走访"]

type Expert = {
  id: string; title: string; org: string; years: number; region: string;
  industry1: string; roleType: string; tags: string; rateHour: number;
  forms: string; completedOrders: number; rating: number; status: string;
}

function ExpertsContent() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [industry, setIndustry] = useState("")
  const [roleType, setRoleType] = useState("")
  const [form, setForm] = useState("")

  const fetchExperts = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (industry) params.set("industry", industry)
    if (roleType) params.set("roleType", roleType)
    if (form) params.set("form", form)
    if (search) params.set("search", search)
    const res = await fetch(`/api/experts?${params}`)
    const data = await res.json()
    setExperts(data.experts)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { fetchExperts() }, [industry, roleType, form])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(() => fetchExperts(), 400); return () => clearTimeout(t) }, [search])

  const initials = (title: string) => title?.[0] || "专"
  const tagList = (tags: string) => tags?.split(",").map(t => t.trim()).filter(Boolean) || []

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>专家库</h2>
        <div style={{ fontSize: 13, color: "#888" }}>共 {total} 位专家</div>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="搜索专家姓名、单位、擅长领域..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none" }}
        />
        <select value={industry} onChange={e => setIndustry(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">全部行业</option>
          {INDUSTRIES.filter(Boolean).map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={roleType} onChange={e => setRoleType(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">全部属性</option>
          {ROLE_TYPES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={form} onChange={e => setForm(e.target.value)}
          style={{ padding: 8, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">访谈形式</option>
          {FORMS.filter(Boolean).map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>加载中...</div> :
        experts.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>暂无符合条件的专家，请调整筛选条件或去<Link href="/admin" style={{ color: "#185FA5" }}>管理员页面</Link>添加</div> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {experts.map(e => (
            <Link key={e.id} href={`/experts/${e.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16,
                cursor: "pointer", transition: "border-color .15s",
              }} onMouseEnter={ev => (ev.currentTarget.style.borderColor = "#378ADD")}
                 onMouseLeave={ev => (ev.currentTarget.style.borderColor = "#e0dfd8")}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 500, background: "#E6F1FB", color: "#185FA5", flexShrink: 0,
                  }}>{initials(e.title)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.org}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#BA7517", fontWeight: 500, whiteSpace: "nowrap", marginLeft: "auto" }}>¥{e.rateHour.toLocaleString()}/h</div>
                </div>
                <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {tagList(e.tags).map(t => (
                    <span key={t} style={{ background: "#E6F1FB", color: "#185FA5", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{t}</span>
                  ))}
                  <span style={{ background: "#F1EFE8", color: "#5F5E5A", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{e.roleType}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#888" }}>
                  <span>从业{e.years}年</span><span>{e.region}</span><span style={{ marginLeft: "auto" }}>⭐ {e.rating || "-"} · {e.completedOrders}单</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      }
    </div>
  )
}

export default function ExpertsPage() {
  return (
    <AuthGuard>
      <ExpertsContent />
    </AuthGuard>
  )
}
