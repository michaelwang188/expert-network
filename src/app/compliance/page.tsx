"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

const SENSITIVE = ["定增","并购","内幕","未公告","股价","收购价格","控股计划","涉密","定增价格","并购标的","未公开业绩","核心技术参数","涉密产能","定价区间"]

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
            { name: "内幕信息禁止承诺函", ver: "v2.3", desc: "签署后生效" },
            { name: "竞业限制承诺书", ver: "v1.8", desc: "签署后生效" },
            { name: "调研内容合规协议", ver: "v3.1", desc: "签署后生效" },
          ].map(doc => (
            <div key={doc.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "0.5px solid #f1efe8" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{doc.ver} · {doc.desc}</div>
              </div>
              <button style={{ padding: "4px 10px", border: "0.5px solid #e0dfd8", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>预览</button>
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
