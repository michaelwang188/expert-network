import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/migrate/email-verified — 一次性迁移：标记所有旧用户为已验证
// 需要 x-deploy-key 授权（与 /api/deploy 相同）
export async function POST(req: Request) {
  const deployKey = req.headers.get("x-deploy-key")
  if (deployKey !== "prolink-deploy-2026") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const result = await prisma.user.updateMany({
    where: { emailVerified: null },
    data: { emailVerified: new Date() },
  })

  return NextResponse.json({
    ok: true,
    message: `已标记 ${result.count} 个旧用户为已验证`,
    count: result.count,
  })
}

// GET — 查看有多少旧用户需要迁移
export async function GET(req: Request) {
  const deployKey = req.headers.get("x-deploy-key")
  if (deployKey !== "prolink-deploy-2026") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const count = await prisma.user.count({
    where: { emailVerified: null },
  })

  return NextResponse.json({ unverifiedCount: count })
}
