"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ExpertRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "", title: "", org: "", years: "", region: "",
    phone: "", email: "", password: "",
    industry1: "", industry2: "", roleType: "",
    tags: "", topics: "", ratePoints: "500",
    forms: "线上视频", availableTime: "",
  })
  const [files, setFiles] = useState<{ idCard?: File; badge?: File; proof?: File }>({})
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState("")

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append("file", file)
    const r = await fetch("/api/upload", { method: "POST", body: fd })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error)
    return d.url
  }

  const submit = async () => {
    setSubmitting(true); setError("")
    try {
      let idCardUrl = "", badgeUrl = "", proofUrl = ""
      if (files.idCard) idCardUrl = await uploadFile(files.idCard)
      if (files.badge) badgeUrl = await uploadFile(files.badge)
      if (files.proof) proofUrl = await uploadFile(files.proof)

      const r = await fetch("/api/register/expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idCardUrl, badgeUrl, employmentProofUrl: proofUrl, complianceSigned: agree }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "提交失败")
      router.push("/login?registered=expert")
    } catch (e: any) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  const input = (k: string, label: string, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>{label}</label>
      <input type={type} value={(form as any)[k]} onChange={e => update(k, e.target.value)}
        placeholder={placeholder} style={inputStyle} required />
    </div>
  )

  const sel = (k: string, label: string, opts: string[]) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>{label}</label>
      <select value={(form as any)[k]} onChange={e => update(k, e.target.value)} style={inputStyle} required>
        <option value="">请选择</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const fileInput = (k: "idCard" | "badge" | "proof", label: string) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>{label}</label>
      <input type="file" accept="image/*,.pdf" onChange={e => setFiles(f => ({ ...f, [k]: e.target.files?.[0] }))}
        style={{ fontSize: 13 }} required />
    </div>
  )

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 22, color: "#1A3C5E", marginBottom: 4 }}>专家入驻申请</h1>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>填写资料并通过三级合规审核后，即可开始接收调研访谈</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["基本信息", "资质文件", "合规确认"].map((s, i) => (
          <div key={s} style={{
            flex: 1, padding: "8px 12px", borderRadius: 6,
            background: step >= i + 1 ? "#1A3C5E" : "#f0f0f0",
            color: step >= i + 1 ? "#fff" : "#999", fontSize: 12, textAlign: "center"
          }}>{s}</div>
        ))}
      </div>

      {error && <div style={{ background: "#FFF0F0", color: "#D32F2F", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {step === 1 && (
        <>
          <h2 style={{ fontSize: 16, color: "#333", marginBottom: 16 }}>基本信息</h2>
          {input("name", "真实姓名")}
          {input("phone", "手机号", "tel")}
          {input("email", "邮箱", "email")}
          {input("password", "登录密码", "password", "至少6位")}
          {input("title", "职位")}
          {input("org", "任职单位")}
          {input("years", "从业年限", "number")}
          {input("region", "所在地区", "text", "例如：深圳")}
          {sel("industry1", "一级行业", ["半导体", "新能源", "医药", "消费电子", "人工智能", "汽车", "金融", "消费", "材料", "其他"])}
          {input("industry2", "二级细分领域（可选）")}
          {sel("roleType", "岗位属性", ["研发/技术", "生产/制造", "供应链/采购", "销售/市场", "管理", "战略/投资", "咨询/研究", "其他"])}
          {input("tags", "标签（用逗号分隔）", "text", "例如：锂电,光伏,钠离子")}
          {input("topics", "擅长话题（用逗号分隔）")}
          {input("ratePoints", "费率（积分/小时）", "number")}
          {sel("forms", "可接受形式", ["线上视频", "线上语音", "线下走访", "均可"])}
          {input("availableTime", "可接受时段")}
          <button onClick={() => setStep(2)} style={btnStyle}>下一步</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 16, color: "#333", marginBottom: 16 }}>资质文件上传</h2>
          <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>请上传清晰可辨的证件照片或扫描件</p>
          {fileInput("idCard", "身份证照片（正面）")}
          {fileInput("badge", "工牌/名片照片")}
          {fileInput("proof", "任职证明（可选）")}
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(1)} style={{ ...btnStyle, background: "#f0f0f0", color: "#333" }}>上一步</button>
            <button onClick={() => setStep(3)} style={btnStyle}>下一步</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 style={{ fontSize: 16, color: "#333", marginBottom: 16 }}>合规确认</h2>
          <div style={{ background: "#FFF8E1", padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 13, lineHeight: 1.6, color: "#333" }}>
            <p><strong>合规声明：</strong></p>
            <ol style={{ paddingLeft: 20 }}>
              <li>本人承诺不泄露任何内幕信息或未公开重大信息</li>
              <li>本人与所涉上市公司不存在可能影响客观公正的关系</li>
              <li>本人已了解并遵守竞业限制相关义务</li>
              <li>本人提供的所有信息真实、准确、完整</li>
            </ol>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 24 }}>
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            我已阅读并同意以上合规声明
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(2)} style={{ ...btnStyle, background: "#f0f0f0", color: "#333" }}>上一步</button>
            <button onClick={submit} disabled={!agree || submitting} style={{
              ...btnStyle, opacity: (!agree || submitting) ? 0.5 : 1,
              background: (!agree || submitting) ? "#999" : "#1A3C5E"
            }}>
              {submitting ? "提交中..." : "提交申请"}
            </button>
          </div>
        </>
      )}
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #D0CEC6",
  borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box"
}

const btnStyle: React.CSSProperties = {
  padding: "10px 28px", borderRadius: 6, border: "none",
  background: "#1A3C5E", color: "#fff", fontSize: 14, cursor: "pointer"
}
