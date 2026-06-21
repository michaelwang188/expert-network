import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { matchExperts } from "@/lib/matching"

// GET /api/match?requestId=xxx — 获取某需求的专家推荐（仅研究员+管理员）
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const role = (session.user as any).role
  if (role !== "RESEARCHER" && role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const requestId = searchParams.get("requestId")
  if (!requestId) return NextResponse.json({ error: "缺少requestId" }, { status: 400 })

  const matches = await matchExperts(requestId, 3)
  return NextResponse.json({ matches })
}
