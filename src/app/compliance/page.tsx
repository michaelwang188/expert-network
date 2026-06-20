"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

// 敏感词库 v2.0 — 与后端 requests/route.ts 对齐（74词）
const SENSITIVE = ["并购","内幕","未公告","股价","收购价格","控股计划","涉密","并购标的","未公开业绩","重大资产重组","财务造假","内幕交易","未披露","核心机密","未公开财务","重组方案","操纵市场","虚假陈述","大股东减持","做空","老鼠仓","高送转","分红方案","增持计划","杠杆收购","敌意收购","毒丸计划","白衣骑士","金色降落伞","反收购","一致行动人","权益变动","举牌","要约收购","协议收购","间接收购","司法拍卖","破产重整","债转股","利益输送","关联交易","资金占用","业绩预告","违规担保","财务异常","审计失败","监管函","立案调查","行政处罚","市场禁入","短线交易","抢帽子","虚假申报","尾市拉抬","盘中打压","跨期套利","期现联动","不良资产","风险预警","信用评级下调","债务违约","流动性危机","资金链断裂","掏空上市公司","违规信披","财报虚假记载","营收造假","存货造假","应收账款造假","研发支出资本化","商誉减值","存货跌价","坏账准备","财务洗澡","调节利润"]

export default function CompliancePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  if (role !== "ADMIN") return <div style={{padding:40,color:"#888"}}>仅管理员可访问合规中心</div>

  const [outline, setOutline] = useState("")
  const [result, setResult] = useState<{ ok: boolean; found: string[]; lines: string[] } | null>(null)

  const check = () => {
    const lines = outline.split("\n").filter(l => l.trim())
    const found = SENSITIVE.filter(w => outline.includes(w))
    const flaggedLines = lines.filter(l => SENSITIVE.some(w => l.includes(w)))
    setResult({ ok: found.length === 0, found, lines: flaggedLines })
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>合规中心</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* 提纲检测 */}
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>提纲合规检测</div>
          <textarea value={outline} onChange={e => setOutline(e.target.value)} rows={8}
            placeholder="粘贴访谈提纲，系统自动检测敏感词…"
            style={{ width: "100%", padding: 10, border: "0.5px solid #e0dfd8", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", marginBottom: 12 }} />
          <button onClick={check} style={{
            background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>一键合规检测</button>
          {result && (
            <div style={{ marginTop: 12 }}>
              {result.ok ? (
                <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: 10, borderRadius: 8, fontSize: 13 }}>✅ 未检测到敏感词，提纲合规</div>
              ) : (
                <div>
                  <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
                    ⚠️ 检测到 {result.found.length} 个敏感词：{result.found.join("、")}
                  </div>
                  {result.lines.map((l, i) => (
                    <div key={i} style={{ background: "#fdf2f2", borderLeft: "2px solid #A32D2D", padding: 6, fontSize: 12, marginBottom: 4, borderRadius: "0 4px 4px 0" }}>{l}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 合规文件管理 */}
        <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>合规文件管理</div>
          {[
            { name: "内幕信息禁止承诺函", ver: "v1.0", desc: "专家签署后生效", file: "insider-trading-undertaking" },
            { name: "竞业限制承诺书", ver: "v1.0", desc: "专家签署后生效", file: "non-compete-undertaking" },
            { name: "调研内容合规协议", ver: "v1.0", desc: "三方签署后生效", file: "research-compliance-agreement" },
            { name: "平台服务协议", ver: "v1.0", desc: "全体用户注册时同意", file: "platform-terms" },
            { name: "隐私政策", ver: "v1.0", desc: "全体用户注册时同意", file: "privacy-policy" },
          ].map(doc => (
            <div key={doc.file} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "0.5px solid #f1efe8" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{doc.ver} · {doc.desc}</div>
              </div>
              <a href={`https://raw.githubusercontent.com/michaelwang188/expert-network/main/docs/legal/${doc.file}.md`} target="_blank" rel="noopener noreferrer"
                style={{ padding: "4px 10px", border: "0.5px solid #e0dfd8", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer", textDecoration: "none", color: "#185FA5" }}>预览</a>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#BA7517", marginBottom: 4 }}>合规红线</div>
            <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 2 }}>
              ✗ 上市公司董监高参与<br/>
              ✗ 传递未公开财报数据<br/>
              ✗ 承诺投资收益/荐股<br/>
              ✗ 涉密并购/定增信息<br/>
              ✓ 已签合规协议方可接单<br/>
              ✓ 全程平台内通话/录音<br/>
              ✓ 禁止私下互换联系方式
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
