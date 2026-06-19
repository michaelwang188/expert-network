import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ExpertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const expert = await prisma.expert.findUnique({ where: { id } })
  if (!expert) return <div style={{padding:40,color:"#888"}}>专家不存在</div>

  const tagList = expert.tags?.split(",").map(t => t.trim()).filter(Boolean) || []
  const formList = expert.forms?.split(",").map(f => f.trim()).filter(Boolean) || []

  return (
    <div style={{ maxWidth: 640 }}>
      <Link href="/experts" style={{ fontSize:13, color:"#185FA5", textDecoration:"none", display:"inline-block", marginBottom:16 }}>← 返回专家库</Link>

      <div style={{ background:"#fff", border:"0.5px solid #e0dfd8", borderRadius:10, padding:20, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"#E6F1FB", color:"#185FA5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:500, flexShrink:0 }}>
            {expert.title?.[0] || "专"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:500}}>{expert.title}</div>
            <div style={{fontSize:13, color:"#888"}}>{expert.org} · {expert.region}</div>
            <div style={{fontSize:12, color:"#BA7517", fontWeight:500, marginTop:2}}>{expert.ratePoints || expert.rateHour} 积分/小时</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12, color:"#888"}}>⭐ {expert.rating || "-"} · {expert.completedOrders}单</div>
            <span style={{background:"#EAF3DE", color:"#3B6D11", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:500, display:"inline-block", marginTop:4}}>在库可接单</span>
          </div>
        </div>

        {/* 三级标签体系 */}
        <div style={{fontSize:13, fontWeight:500, color:"#888", marginBottom:8}}>专业标签（三级体系）</div>
        <div style={{marginBottom:12}}>
          {/* 一级：行业 */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:"#888",minWidth:48}}>一级·行业</span>
            <span style={{background:"#534AB7",color:"#fff",padding:"1px 8px",borderRadius:4,fontSize:11,fontWeight:500}}>{expert.industry1}</span>
            {expert.industry2 && <span style={{fontSize:11,color:"#888"}}>→</span>}
            {expert.industry2 && <span style={{background:"#7B6FE8",color:"#fff",padding:"1px 8px",borderRadius:4,fontSize:11,fontWeight:500}}>二级·{expert.industry2}</span>}
          </div>
          {/* 三级：岗位属性 */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:"#888",minWidth:48}}>三级·岗位</span>
            <span style={{background:"#E1F5EE",color:"#0F6E56",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500}}>{expert.roleType}</span>
            <span style={{background:"#F1EFE8",color:"#5F5E5A",padding:"2px 8px",borderRadius:4,fontSize:11}}>从业{expert.years}年</span>
          </div>
          {/* 技能标签 */}
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <span style={{fontSize:11,color:"#888",minWidth:48,flexShrink:0}}>技能标签</span>
            <div style={{flex:1}}>
              {tagList.map(t => <span key={t} style={{background:"#E6F1FB",color:"#185FA5",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:500,marginRight:4,display:"inline-block",marginBottom:4}}>{t}</span>)}
            </div>
          </div>
        </div>

        <div style={{fontSize:13, fontWeight:500, color:"#888", marginBottom:6}}>擅长话题</div>
        <div style={{fontSize:13, color:"#2c2c2a", marginBottom:12, lineHeight:1.7}}>{expert.topics}</div>

        <div style={{fontSize:13, fontWeight:500, color:"#888", marginBottom:6}}>访谈形式</div>
        <div style={{marginBottom:12}}>
          {formList.map(f => <span key={f} style={{background:"#E1F5EE", color:"#0F6E56", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:500, marginRight:4, display:"inline-block", marginBottom:4}}>{f}</span>)}
        </div>

        <div style={{background:"#EAF3DE", border:"0.5px solid #97C459", borderRadius:8, padding:10, fontSize:12, color:"#3B6D11", marginBottom:12}}>
          ✓ 已签署内幕信息禁止承诺函 · 竞业限制承诺书 · 调研内容合规协议
        </div>

        {/* 反私下交易警告 */}
        <div style={{background:"#FFF8E7", border:"0.5px solid #E6B422", borderRadius:8, padding:10, fontSize:12, color:"#7A5E00", marginBottom:12, lineHeight:1.6}}>
          ⚠️ <strong>合规提醒</strong>：平台禁止私下交易。专家联系方式仅在订单确认后通过平台提供，私自交换联系方式将被永久拉黑并冻结结算。<br/>
          🔒 联系方式：<strong>已加密 | 订单确认后可见</strong>
        </div>

        {(session.user as any).role === "RESEARCHER" && (
          <Link href={`/request?expertId=${expert.id}`} style={{
            display:"inline-block", background:"#185FA5", color:"#fff", textDecoration:"none",
            padding:"10px 20px", borderRadius:8, fontSize:14, fontWeight:500,
          }}>预约此专家 →</Link>
        )}
      </div>
    </div>
  )
}
