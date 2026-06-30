import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, title, org, years, region, phone, email, password,
      industry1, industry2, roleType, tags, topics, ratePoints,
      forms, availableTime, idCardUrl, badgeUrl, employmentProofUrl, complianceSigned } = body

    if (!name || !phone || !email || !password || !industry1 || !title || !org) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 })
    }

    const pts = parseInt(ratePoints) || 500
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const user = await prisma.user.create({
      data: {
        email, name, password: hashedPassword, role: "EXPERT",
        verificationToken,
        expertProfile: {
          create: {
            realName: name, title, org,
            years: parseInt(years) || 0, region: region || "",
            industry1, industry2: industry2 || "",
            roleType, tags: tags || "", topics: topics || "",
            ratePoints: pts, rateHour: pts,
            forms: forms || "线上视频", availableTime: availableTime || "",
            idCardUrl: idCardUrl || "", badgeUrl: badgeUrl || "",
            employmentProofUrl: employmentProofUrl || "",
            complianceSig: complianceSigned || false,
            reviewStatus: "PENDING_REVIEW", status: "PENDING",
          },
        },
      },
    })

    const expert = await prisma.expert.findUnique({ where: { userId: user.id } })
    if (!expert) return NextResponse.json({ error: "创建失败" }, { status: 500 })

    // 发送邮箱验证邮件
    const siteUrl = process.env.NEXTAUTH_URL || "https://516380.com"
    const verifyUrl = `${siteUrl}/api/verify-email?token=${verificationToken}`
    const emailSent = await sendVerificationEmail(email, verifyUrl, "EXPERT")

    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } })
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id, type: "EXPERT_REVIEW",
          title: "新专家入驻申请",
          message: `${name}（${title}@${org}）提交了专家入驻申请，请审核`,
          refId: expert.id,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      expertId: expert.id,
      emailSent,
      message: `入驻申请已提交。验证邮件已发送至 ${email}，请查收并验证邮箱。验证后管理员将审核您的资料。`,
    })
  } catch (e: any) {
    console.error("expert register error:", e)
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 })
  }
}
