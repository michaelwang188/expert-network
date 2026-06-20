/**
 * 专家匹配算法 MVP
 * 基于 1号AI C4设计方案实现
 */
import { prisma } from "@/lib/prisma"

export interface MatchResult {
  id: string
  score: number
  reasons: string[]
  realName: string
  title: string
  org: string
  industry1: string
  industry2: string | null
  roleType: string
  tags: string
  ratePoints: number
  completedOrders: number
  rating: number
}

export async function matchExperts(requestId: string, topN = 3): Promise<MatchResult[]> {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { industry: true, subField: true, title: true, outline: true },
  })
  if (!request) return []

  const { industry, subField, title, outline } = request
  const searchText = `${title} ${outline || ""} ${subField || ""}`.toLowerCase()

  // 一级过滤：同行业 + ACTIVE
  const experts = await prisma.expert.findMany({
    where: { industry1: industry, status: "ACTIVE" },
    select: {
      id: true, realName: true, title: true, org: true,
      industry1: true, industry2: true, roleType: true,
      tags: true, ratePoints: true, completedOrders: true, rating: true,
    },
  })

  // 二级打分
  const avgRate = experts.length > 0
    ? experts.reduce((s, e) => s + e.ratePoints, 0) / experts.length
    : 1000

  const scored: MatchResult[] = experts.map(e => {
    let score = 0
    const reasons: string[] = []

    // 行业匹配基础分
    score += 20
    reasons.push(`行业:${e.industry1}`)

    // 子领域/二级行业匹配
    if (subField) {
      const sub = subField.toLowerCase()
      if ((e.industry2 || "").toLowerCase().includes(sub)) { score += 30; reasons.push("子领域匹配") }
      if ((e.tags || "").toLowerCase().includes(sub)) { score += 20; reasons.push("标签匹配") }
    }

    // 关键词在tags中命中
    for (const tag of (e.tags || "").split(",")) {
      if (tag.trim().toLowerCase() && searchText.includes(tag.trim().toLowerCase())) {
        score += 10
        reasons.push(`标签:${tag.trim()}`)
      }
    }

    // 历史完成加分
    if (e.completedOrders > 0) { score += 15; reasons.push(`完成${e.completedOrders}单`) }

    // 评分加分
    if (e.rating >= 4.0) { score += 10; reasons.push("高评分") }

    // 性价比加分
    if (e.ratePoints < avgRate) { score += 5; reasons.push("性价比优") }

    return { ...e, score, reasons }
  })

  // 按分数降序取前N
  return scored.sort((a, b) => b.score - a.score).slice(0, topN)
}
