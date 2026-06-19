import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const logs = await prisma.complianceLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json({ logs })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const { id, handled } = await req.json()
  await prisma.complianceLog.update({ where: { id }, data: { handled } })

  return NextResponse.json({ ok: true })
}
