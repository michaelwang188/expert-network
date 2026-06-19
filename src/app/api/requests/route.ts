import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET — 管理员查看所有需求
export async function GET() {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { researcher: { select: { name: true, email: true } } },
    take: 50,
  })
  return NextResponse.json(requests)
}

// POST — 研究员创建需求
const SENSITIVE = ["定增","并购","内幕","未公告","股价","收购价格","控股计划","涉密","定增价格","并购标的","未公开业绩","重大资产重组","财务造假","内幕交易","未披露","核心机密","未公开财务","重组方案","借壳","壳资源","业绩预告","高送转","分红方案","大股东减持","增持计划","质押","平仓","对赌","回拨","做空","老鼠仓","配资","代持","抽屉协议","禁售期","解禁","做市商","大宗交易","盘后交易","操纵市场","虚假陈述"]

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RESEARCHER") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const { title, industry, subField, duration, form, budget, timeReq, outline, forbidden } = await req.json()

  // 服务端合规检测：发现敏感词 → 阻断提交
  const found = SENSITIVE.filter(w => (outline || "").includes(w) || (title || "").includes(w))
  if (found.length > 0) {
    return NextResponse.json({
      error: "提纲含敏感词，请修改后重新提交",
      sensitiveWords: found,
      suggestion: "请删除或替换以下敏感内容：" + found.join("、"),
    }, { status: 400 })
  }

  const orderNo = "ORD-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000))

  // 解析预算范围，取中间值作为预估金额（单位：分）
  let estimatedAmount = 800 // 默认 800 积分
  if (budget) {
    const match = budget.match(/(\d+)/g)
    if (match && match.length >= 2) {
      const low = parseInt(match[0])
      const high = parseInt(match[1])
      estimatedAmount = Math.round((low + high) / 2)
    }
  }

  const request = await prisma.request.create({
    data: {
      orderNo, title, industry, subField, duration, form, budget, timeReq, outline, forbidden,
      status: "COMPLIANCE_OK", // 已通过服务端拦截，不含敏感词
      researcherId: (session.user as any).id,
    }
  })

  // 自动创建订单（待管理员派单）
  const order = await prisma.order.create({
    data: {
      orderNo,
      requestId: request.id,
      researcherId: (session.user as any).id,
      amount: estimatedAmount,
      expertFee: Math.round(estimatedAmount * 0.8),   // 积分：80% 给专家
      platformFee: Math.round(estimatedAmount * 0.2),  // 积分：20% 平台服务费
      status: "PENDING",
    }
  })

  return NextResponse.json({ ok: true, requestId: request.id, orderId: order.id, orderNo: order.orderNo })
}

// PATCH — 管理员修改需求状态
export async function PATCH(req: Request) {
  const { requestId, status } = await req.json()
  await prisma.request.update({ where: { id: requestId }, data: { status } })
  return NextResponse.json({ ok: true })
}
