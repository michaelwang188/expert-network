"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const STEPS = ["填写需求", "提纲审核", "匹配专家", "预约确认", "访谈结算"]
const SENSITIVE = ["并购","内幕","未公告","股价","收购价格","控股计划","涉密","并购标的","未公开业绩","重大资产重组","财务造假","内幕交易","未披露","核心机密","未公开财务","重组方案","操纵市场","虚假陈述","大股东减持","做空","老鼠仓","杠杆收购","敌意收购","一致行动人","权益变动","举牌","要约收购","协议收购","司法拍卖","破产重整","债转股","利益输送","关联交易","资金占用","业绩预告","违规担保","监管函","立案调查","行政处罚","短线交易","信用评级下调","债务违约","违规信披","财报虚假记载","营收造假","调节利润"]

interface MatchExpert {
  id: string; score: number; reasons: string[]
  realName: string; title: string; org: string
  industry1: string; industry2: string | null
  tags: string; ratePoints: number
  completedOrders: number; rating: number
}

export default function RequestClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sensitiveFound, setSensitiveFound] = useState<string[]>([])
  const [orderNo, setOrderNo] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [recommended, setRecommended] = useState<MatchExpert[]>([])
  const [matching, setMatching] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "", industry: "", subField: "", duration: "60分钟", form: "线上视频",
    budget: "6000-12000 积分", timeReq: "", outline: "", forbidden: "",
  })

  const checkSensitive = (text: string) => SENSITIVE.filter(w => text.includes(w))

  const handleSubmit = async () => {
    if (submitted || loading) return
    const found = checkSensitive(form.outline + " " + form.title)
    if (found.length > 0) { setSensitiveFound(found); return }
    setSubmitted(true); setLoading(true)
    try {
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setSensitiveFound(data.sensitiveWords || []); setSubmitted(false); return }
      setOrderNo(data.orderNo || "")
      setStep(1); setMatching(true)
      // 请求专家推荐
      const matchRes = await fetch(`/api/match?requestId=${data.requestId || data.orderNo || ""}`)
      if (matchRes.ok) {
        const matchData = await matchRes.json()
        setRecommended(matchData.matches || [])
      }
    } catch { setSubmitted(false) }
    setLoading(false); setMatching(false)
  }

  const handleSelect = async (expertId: string) => {
    setSelectedId(expertId)
    // 选后跳到订单页让管理员确认
    setTimeout(() => router.push("/orders"), 500)
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>发起调研需求</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center", position: "relative" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, background: i < step ? "#0F6E56" : i === step ? "#185FA5" : "#f1efe8", color: i <= step ? "#fff" : "#888" }}>{i < step ? "✓" : i + 1}</div>
            <div style={{ fontSize: 11, color: i <= step ? "#185FA5" : "#888" }}>{s}</div>
            {i < STEPS.length - 1 && <div style={{ position: "absolute", top: 12, left: "50%", width: "100%", height: 0.5, background: i < step ? "#0F6E56" : "#e0dfd8" }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ background: "#EAF3DE", border: "0.5px solid #97C459", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#3B6D11" }}>需求已提交 · {orderNo}</div>
          </div>

          {matching && <div style={{ textAlign: "center", padding: 20, color: "#888", fontSize: 13 }}>🔍 正在为您智能匹配专家...</div>}

          {!matching && recommended.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: "#333", marginBottom: 12 }}>推荐专家</h3>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>系统根据您的需求行业和标签，自动匹配以下专家。点击"选择"后，管理员将为您确认派单。</p>
              {recommended.map(e => (
                <div key={e.id} style={{
                  border: selectedId === e.id ? "1.5px solid #185FA5" : "0.5px solid #e0dfd8",
                  borderRadius: 10, padding: 14, marginBottom: 10,
                  background: selectedId === e.id ? "#F0F5FF" : "#fff",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{e.realName}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{e.title} @ {e.org}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{e.industry1}{e.industry2 ? " / " + e.industry2 : ""}</div>
                      <div style={{ fontSize: 11, color: "#185FA5", marginTop: 4 }}>
                        {e.tags.split(",").slice(0, 3).map(t => t.trim()).filter(Boolean).map(t => (
                          <span key={t} style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "#E8F0FE", marginRight: 4, marginBottom: 2 }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                        {e.completedOrders > 0 ? `${e.completedOrders}单 · ` : ""}
                        {e.rating > 0 ? `评分${e.rating.toFixed(1)} · ` : ""}
                        {e.ratePoints}积分/小时
                      </div>
                      {e.reasons.length > 0 && (
                        <div style={{ fontSize: 11, color: "#0F6E56", marginTop: 2 }}>
                          匹配理由：{e.reasons.slice(0, 3).join(" · ")}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleSelect(e.id)} disabled={selectedId !== null}
                      style={{
                        padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer", whiteSpace: "nowrap", marginLeft: 8,
                        background: selectedId === e.id ? "#0F6E56" : "#185FA5", color: "#fff", fontSize: 12,
                      }}>{selectedId === e.id ? "已选择 ✓" : "选择此专家"}</button>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <a href="/orders" style={{ fontSize: 13, color: "#185FA5" }}>或前往订单页查看 →</a>
              </div>
            </div>
          )}

          {!matching && recommended.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#888", fontSize: 13 }}>
              暂未匹配到专家，管理员将为您人工匹配
              <br /><a href="/orders" style={{ color: "#185FA5" }}>前往订单页</a>
            </div>
          )}
        </div>
      )}

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
                <option value="" disabled>-- 选择行业 --</option>
                <option>信息技术</option><option>人工智能</option><option>半导体</option>
                <option>医疗健康</option><option>新能源</option><option>金融</option>
                <option>消费品</option><option>工业</option><option>汽车</option>
                <option>通信与传媒</option><option>能源与新材料</option><option>房地产</option>
                <option>公用事业</option><option>教育</option><option>物流与供应链</option>
                <option>农业与食品</option><option>环保与双碳</option><option>军工与航天</option>
                <option>文娱与体育</option><option>跨行业综合</option>
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
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>预算（积分）</label>
              <select value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))}
                style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                <option>3000-6000</option><option>6000-12000</option><option>12000-24000</option><option>24000+</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>时长</label>
              <select value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))}
                style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                <option>30分钟</option><option>60分钟</option><option>90分钟</option><option>120分钟</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>访谈提纲</label>
            <textarea value={form.outline} onChange={e => setForm(f => ({...f, outline: e.target.value}))} rows={6} maxLength={5000}
              placeholder={"1. 当前市场供需情况？\n2. 主要厂商涨价幅度？\n3. 下半年预期？"}
              style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical" }} />
          </div>
          {sensitiveFound.length > 0 && (
            <div style={{ background: "#FEE2E2", border: "1px solid #dc2626", color: "#991b1b", padding: 12, borderRadius: 8, fontSize: 13 }}>
              🚫 检测到敏感词：{sensitiveFound.join("、")}。请删除后重新提交。
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={handleSubmit} disabled={!form.title || !form.outline || checkSensitive(form.outline+" "+form.title).length>0 || loading || submitted} style={{
              background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer",
            }}>{loading ? "提交中..." : "提交并匹配专家 →"}</button>
          </div>
        </div>
      )}
    </div>
  )
}
