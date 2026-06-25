// P1: RSC + Streaming — 专家库首帧直接有数据
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import ExpertFilters from "./ExpertFilters"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "专家库",
}

export default async function ExpertsPage(props: any) {
  const searchParams = props.searchParams || {}
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const { industry, roleType, form, search, page } = searchParams
  const currentPage = parseInt(page || "1")
  const where: any = { status: "ACTIVE" }
  if (industry) where.industry1 = industry
  if (roleType) where.roleType = roleType
  if (form) where.forms = { contains: form }
  if (search) where.OR = [
    { title: { contains: search } }, { org: { contains: search } },
    { tags: { contains: search } }, { topics: { contains: search } },
  ]

  let experts: any[] = []
  let total = 0
  try {
    const result = await Promise.all([
      prisma.expert.findMany({ where, skip: (currentPage - 1) * 20, take: 20, orderBy: { completedOrders: "desc" } }),
      prisma.expert.count({ where }),
    ])
    experts = result[0]
    total = result[1]
  } catch (e) {
    console.error("专家库查询失败:", (e as Error).message)
  }

  const INDUSTRIES = ["AI算力", "新能源", "半导体", "MLCC", "创新药", "消费电子"]
  const ROLE_TYPES = ["研发", "供应链", "渠道", "管理", "政策"]
  const FORMS = ["线上语音", "线上视频", "线下走访"]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>专家库</h2>
        <div style={{ fontSize: 13, color: "#888" }}>共 {total} 位专家</div>
      </div>
      <ExpertFilters industries={INDUSTRIES} roleTypes={ROLE_TYPES} forms={FORMS}
        currentIndustry={industry || ""} currentRoleType={roleType || ""} currentForm={form || ""} currentSearch={search || ""} />
      {experts.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#888" }}>暂无符合条件的专家</div> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {experts.map((e: any) => (
            <Link key={e.id} href={`/experts/${e.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "#fff", border: "0.5px solid #e0dfd8", borderRadius: 10, padding: 16, cursor: "pointer", transition: "border-color .15s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, background: "#E6F1FB", color: "#185FA5", flexShrink: 0 }}>{(e.title || "专")[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.org} · {e.region}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#BA7517", fontWeight: 500, whiteSpace: "nowrap" }}>{(e.ratePoints || 500).toLocaleString()} 积分/h</div>
                </div>
                <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(e.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
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
        </div>}
    </div>
  )
}
