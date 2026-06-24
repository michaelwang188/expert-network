import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isSuperAdmin } from "@/lib/roles"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !isSuperAdmin((session.user as any).role)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }
  const { email, role } = await req.json()
  if (!email || !["RESEARCHER", "EXPERT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 })
  }
  try {
    const user = await prisma.user.update({ where: { email }, data: { role } })
    return NextResponse.json({ ok: true, email: user.email, role: user.role })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
