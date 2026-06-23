import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: "admin@demo.com" } })
    if (existing) {
      return NextResponse.json({ message: "数据库已有数据", users: await prisma.user.count() })
    }
    const pw = await bcrypt.hash("123456", 10)
    await prisma.user.create({ data: { email: "admin@demo.com", name: "管理员", password: pw, role: "ADMIN", points: 99999 } })
    const r = await prisma.user.create({ data: { email: "researcher@demo.com", name: "张研究员", password: pw, role: "RESEARCHER", points: 10000 } })
    await prisma.user.create({ data: { email: "expert@demo.com", name: "李专家", password: pw, role: "EXPERT", expertProfile: { create: { realName: "李专家", title: "CTO", org: "华为", years: 15, region: "深圳", industry1: "半导体", roleType: "研发", tags: "MLCC,AI芯片", topics: "MLCC技术", forms: "线上视频", ratePoints: 500, rateHour: 500, status: "ACTIVE", complianceSig: true } } } )
    await prisma.user.update({ where: { id: r.id }, data: { points: 10000 } })
    return NextResponse.json({ message: "种子数据创建成功", users: await prisma.user.count() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
