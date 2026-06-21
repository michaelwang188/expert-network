import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }) }
  const email = String(body.email || "").trim().toLowerCase()
  if (!email || !email.includes("@")) return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ ok: true }) // 不泄露用户是否存在

  const hashed = await bcrypt.hash("123456", 10)
  await prisma.user.update({ where: { email }, data: { password: hashed } })
  return NextResponse.json({ ok: true })
}
