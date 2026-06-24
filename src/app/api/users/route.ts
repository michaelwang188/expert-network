import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isSuperAdmin } from "@/lib/roles"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isSuperAdmin((session.user as any).role)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, orgName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ users })
}
