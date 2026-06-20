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
const SENSITIVE = ["定增","并购","内幕","未公告","股价","收购价格","控股计划","涉密","定增价格","并购标的","未公开业绩","重大资产重组","财务造假","内幕交易","未披露","核心机密","未公开财务","重组方案","借壳","壳资源","业绩预告","高送转","分红方案","大股东减持","增持计划","质押","平仓","对赌","回拨","做空","老鼠仓","配资","代持","抽屉协议","禁售期","解禁","做市商","大宗交易","盘后交易","操纵市场","虚假陈述","内幕信息","内幕消息","操控股价","庄家","坐庄","利益输送","关联交易","资金占用","违规担保","财务异常","审计失败","监管函","立案调查","行政处罚","市场禁入","短线交易","抢帽子","蛊惑交易","虚假申报","尾市拉抬","盘中打压","信息型操纵","交易型操纵","跨期套利","期现联动","杠杆收购","敌意收购","毒丸计划","白衣骑士","金色降落伞","反收购","一致行动人","权益变动","举牌","要约收购","协议收购","间接收购","司法拍卖","破产重整","债转股","不良资产","风险预警","信用评级下调","债务违约","流动性危机","资金链断裂","掏空上市公司","违规信披","财报虚假记载","营收造假","存货造假","应收账款造假","研发支出资本化","商誉减值","存货跌价","坏账准备","财务洗澡","调节利润"]

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "RESEARCHER") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }

  const { title, industry, subField, duration, form, budget, timeReq, outline, forbidden } = await req.json()

  // 防重复提交：同一研究员 2 分钟内相同标题的请求视为重复
  const recentDup = await prisma.request.findFirst({
    where: {
      researcherId: (session.user as any).id,
      title,
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
  })
  if (recentDup) {
    return NextResponse.json({ error: "2分钟内已提交过相同标题的调研，请勿重复提交" }, { status: 409 })
  }

  // 服务端长度校验
  if ((outline || "").length > 5000 || (title || "").length > 200) {
    return NextResponse.json({ error: "标题或提纲内容过长" }, { status: 400 })
  }

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

// PATCH — 管理员修改需求状态（需登录+管理员权限）
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 })
  }
  const { requestId, status } = await req.json()
  await prisma.request.update({ where: { id: requestId }, data: { status } })
  return NextResponse.json({ ok: true })
}
