import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }) }
  const email = String(body.email || "").trim().toLowerCase()
  if (!email || !email.includes("@")) return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ ok: true })

    const hashed = await bcrypt.hash("123456", 10)
    await prisma.user.update({ where: { email }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("forgot-password error:", e.message)
    return NextResponse.json({ error: "服务暂时不可用，请稍后重试" }, { status: 500 })
  }
}
