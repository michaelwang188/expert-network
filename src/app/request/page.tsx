"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/AuthGuard"

const STEPS = ["填写需求", "提纲审核", "匹配专家", "预约确认", "访谈结算"]
const SENSITIVE = ["定增","并购","内幕","未公告","股价","收购价格","控股计划","涉密","定增价格","并购标的","未公开业绩"]

function RequestContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sensitiveFound, setSensitiveFound] = useState<string[]>([])
  const [orderNo, setOrderNo] = useState("")
  const [form, setForm] = useState({
    title: "", industry: "MLCC", subField: "", duration: "60分钟", form: "线上视频",
    budget: "6000-12000", timeReq: "", outline: "", forbidden: "",
  })

  const checkSensitive = (text: string) => SENSITIVE.filter(w => text.includes(w))

  const handleSubmit = async () => {
    setLoading(true)
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (data.orderNo) setOrderNo(data.orderNo)
    if (data.sensitiveWords?.length > 0) {
      setSensitiveFound(data.sensitiveWords)
    }
    setStep(1)
  }

  const role = (session?.user as any)?.role
  if (role && role !== "RESEARCHER") return <div style={{padding:40,color:"#888"}}>仅研究员可发起调研需求</div>

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>发起调研需求</h2>

      {/* 进度条 */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center", position: "relative" }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", margin: "0 auto 4px",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500,
              background: i < step ? "#0F6E56" : i === step ? "#185FA5" : "#f1efe8",
              color: i <= step ? "#fff" : "#888",
            }}>{i < step ? "✓" : i + 1}</div>
            <div style={{ fontSize: 11, color: i <= step ? "#185FA5" : "#888" }}>{s}</div>
            {i < STEPS.length - 1 && <div style={{
              position: "absolute", top: 12, left: "50%", width: "100%", height: 0.5,
              background: i < step ? "#0F6E56" : "#e0dfd8",
            }} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>调研主题 *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
              placeholder="例：MLCC国内头部厂商Q3排产计划及涨价意愿调研"
              style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>行业</label>
              <select value={form.industry} onChange={e => setForm(f => ({...f, industry: e.target.value}))}
                style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                <option>MLCC</option><option>半导体</option><option>新能源</option><option>AI算力</option><option>创新药</option><option>消费电子</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>细分环节</label>
              <input value={form.subField} onChange={e => setForm(f => ({...f, subField: e.target.value}))}
                placeholder="例：渠道分销/粉体材料"
                style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>预算范围（元）</label>
              <select value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))}
                style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                <option>3000-6000</option><option>6000-12000</option><option>12000-24000</option><option>24000+</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>预期时长</label>
              <select value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))}
                style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                <option>30分钟</option><option>60分钟</option><option>90分钟</option><option>120分钟</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>访谈提纲（每行一个问题）</label>
            <textarea value={form.outline} onChange={e => setForm(f => ({...f, outline: e.target.value}))} rows={6}
              placeholder={"1. 当前市场供需情况如何？\n2. 主要厂商近期涨价幅度及原因？\n3. 下半年预期变化？"}
              style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical" }} />
          </div>
          {form.outline && checkSensitive(form.outline).length > 0 && (
            <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: 10, borderRadius: 8, fontSize: 13 }}>
              ⚠️ 检测到敏感词：{checkSensitive(form.outline).join("、")} — 提交后需人工复审
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setStep(1)} disabled={!form.title || !form.outline} style={{
              background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>提交并进入合规审核 →</button>
          </div>
        </div>
      )}

      {step >= 1 && (
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: sensitiveFound.length > 0 ? "#A32D2D" : "#0F6E56" }}>
            {sensitiveFound.length > 0 ? "⚠️ 提纲合规检测：发现敏感词" : "✅ 提纲合规检测通过"}
          </div>
          {sensitiveFound.length > 0 && (
            <div style={{ background: "#FCEBEB", padding: 10, borderRadius: 8, fontSize: 13, color: "#7a2020", marginBottom: 12 }}>
              涉及敏感词：{sensitiveFound.map(w => <span key={w} style={{ background: "#f4b8b8", padding: "1px 6px", borderRadius: 4, marginRight: 4 }}>{w}</span>)}
              <br/>这些问题将在人工复审后被剔除或要求修改。
            </div>
          )}
          <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 16 }}>调研需求已提交，订单号：<strong>{orderNo || "生成中..."}</strong></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(0)} style={{ padding: "8px 16px", border: "0.5px solid #e0dfd8", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>返回修改</button>
            <button onClick={() => router.push("/orders")} style={{ padding: "8px 16px", background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>查看我的订单 →</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RequestPage() {
  return (
    <AuthGuard roles={["RESEARCHER"]}>
      <RequestContent />
    </AuthGuard>
  )
}
