import { PrismaClient, Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const SENSITIVE_WORDS = ["定增","并购","内幕","未公告","股价","收购价格","控股计划","涉密"]

function randomOrderNo() {
  return "ORD-2026-" + String(Math.floor(1000 + Math.random() * 9000))
}

async function main() {
  console.log("🌱 开始 seed...")

  // 清库
  await prisma.complianceLog.deleteMany()
  await prisma.order.deleteMany()
  await prisma.request.deleteMany()
  await prisma.expert.deleteMany()
  await prisma.user.deleteMany()

  const mkPwd = (p: string) => bcrypt.hashSync(p, 10)

  // ===== 用户 =====
  const admin = await prisma.user.create({
    data: { email: "admin@demo.com", password: mkPwd("123456"), name: "管理员", role: "ADMIN", orgName: "产研通平台" }
  })
  const researcher = await prisma.user.create({
    data: { email: "researcher@demo.com", password: mkPwd("123456"), name: "王研究员", role: "RESEARCHER", orgName: "深圳某私募基金的", title: "高级研究员" }
  })
  const expertUsers = await Promise.all([
    { email: "expert1@demo.com", name: "陈工", org: "某头部粉体材料厂", title: "前技术总监" },
    { email: "expert2@demo.com", name: "王总", org: "某深圳元器件渠道龙头", title: "供应链总监" },
    { email: "expert3@demo.com", name: "李博士", org: "某IGBT设计院", title: "研发专家" },
    { email: "expert4@demo.com", name: "张经理", org: "某宁夏头部电池厂", title: "产线主管" },
    { email: "expert5@demo.com", name: "赵主任", org: "某头部云厂商", title: "AI服务器采购总监" },
  ].map(u => prisma.user.create({ data: { email: u.email, password: mkPwd("123456"), name: u.name, role: "EXPERT", orgName: u.org, title: u.title } })))

  console.log("✅ 用户创建完成")

  // ===== 专家档案 =====
  const experts = await Promise.all([
    {
      userId: expertUsers[0].id, realName: "陈**", title: "前国瓷材料技术总监", org: "某头部粉体材料厂",
      years: 18, region: "广东", industry1: "MLCC", industry2: "粉体材料", roleType: "研发",
      tags: "MLCC粉体,钛酸钡,浆料配方,材料工艺", topics: "MLCC介质粉体配方、国产化替代、良率提升路径",
      rateHour: 12000, forms: "线上视频,线下走访", status: "ACTIVE",
      idVerified: true, empVerified: true, complianceSig: true, completedOrders: 34, rating: 4.9,
    },
    {
      userId: expertUsers[1].id, realName: "王**", title: "供应链总监", org: "某深圳元器件渠道龙头",
      years: 15, region: "深圳", industry1: "MLCC", industry2: "渠道分销", roleType: "渠道",
      tags: "渠道分销,供应链,日系货源,涨价传导", topics: "MLCC渠道价格走势、日系断供影响、备货策略",
      rateHour: 8000, forms: "线上语音,线上视频", status: "ACTIVE",
      idVerified: true, empVerified: true, complianceSig: true, completedOrders: 52, rating: 4.8,
    },
    {
      userId: expertUsers[2].id, realName: "李**", title: "功率半导体研发专家", org: "某IGBT设计院",
      years: 12, region: "北京", industry1: "半导体", industry2: "IGBT", roleType: "研发",
      tags: "IGBT,功率器件,封装工艺,国产替代", topics: "IGBT国产化现状、车规级认证周期、ST涨价影响",
      rateHour: 10000, forms: "线上视频,线下走访", status: "ACTIVE",
      idVerified: true, empVerified: true, complianceSig: true, completedOrders: 28, rating: 4.7,
    },
    {
      userId: expertUsers[3].id, realName: "张**", title: "储能电芯产线主管", org: "某宁夏头部电池厂",
      years: 9, region: "宁夏", industry1: "新能源", industry2: "储能电池", roleType: "管理",
      tags: "储能电池,磷酸铁锂,产能规划,成本下降", topics: "储能电芯排产计划、铁锂价格趋势、客户结构变化",
      rateHour: 6000, forms: "线上语音,线下走访", status: "ACTIVE",
      idVerified: true, empVerified: true, complianceSig: true, completedOrders: 19, rating: 4.6,
    },
    {
      userId: expertUsers[4].id, realName: "赵**", title: "AI服务器采购总监", org: "某头部云厂商",
      years: 11, region: "北京", industry1: "AI算力", industry2: "GPU采购", roleType: "供应链",
      tags: "AI算力,GPU采购,H100,数据中心规划", topics: "算力采购节奏、国产GPU替代进展、Infiniband vs RoCE选型",
      rateHour: 15000, forms: "线上视频", status: "ACTIVE",
      idVerified: true, empVerified: true, complianceSig: true, completedOrders: 41, rating: 4.9,
    },
  ].map(d => prisma.expert.create({ data: d as any })))

  // 再加3位待审核专家
  await prisma.expert.create({
    data: {
      userId: (await prisma.user.create({
        data: { email: "expert6@demo.com", password: mkPwd("123456"), name: "刘顾问", role: "EXPERT", orgName: "某咨询公司", title: "资深顾问" }
      })).id,
      realName: "刘**", title: "生物医药政策顾问", org: "某大宗能源咨询公司",
      years: 20, region: "北京", industry1: "创新药", industry2: "政策监管", roleType: "政策",
      tags: "新药审批,医保谈判,集采政策,出海监管", topics: "创新药NDA审评时间预期、医保续约策略",
      rateHour: 18000, forms: "线上视频,线下走访", status: "PENDING",
      idVerified: false, empVerified: false, complianceSig: false,
    }
  })

  console.log("✅ 专家档案创建完成，共", experts.length + 1, "位")

  // ===== 调研需求 & 订单 =====
  const statuses: Array<[string, string]> = [
    ["SUBMITTED", "PENDING"],
    ["CONFIRMED", "ACTIVE"],
    ["COMPLETED", "DONE"],
    ["COMPLETED", "PAID"],
    ["CANCELLED", "CANCELLED"],
  ]
  const topics = [
    { title: "MLCC渠道Q3涨价传导调研", industry: "MLCC", expertIdx: 1 },
    { title: "IGBT车规级认证周期深访", industry: "半导体", expertIdx: 2 },
    { title: "AI算力采购节奏判断", industry: "AI算力", expertIdx: 4 },
    { title: "储能电芯排产与成本走势", industry: "新能源", expertIdx: 3 },
    { title: "光伏硅料价格底部判断", industry: "新能源", expertIdx: 3 },
  ]

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i]
    const [reqStatus, ordStatus] = statuses[i]
    const expert = experts[t.expertIdx] || experts[0]
    const orderNo = randomOrderNo()
    const amount = expert.rateHour * 100 * 2 // 2小时，单位分

    const req = await prisma.request.create({
      data: {
        orderNo, title: t.title, industry: t.industry, duration: "60分钟",
        form: "线上视频", budget: `¥${(expert.rateHour * 2).toLocaleString()}`,
        outline: `1. 当前${t.industry}市场供需情况\n2. 主要厂商近期涨价幅度及原因\n3. 下半年预期变化`,
        status: reqStatus as any,
        researcherId: researcher.id,
        expertId: expert.id,
      }
    })

    if (ordStatus !== "CANCELLED") {
      await prisma.order.create({
        data: {
          orderNo, requestId: req.id,
          researcherId: researcher.id, expertId: expert.id,
          interviewTime: new Date(Date.now() + (i - 2) * 86400000),
          amount, expertFee: Math.round(amount * 0.8), platformFee: Math.round(amount * 0.2),
          status: ordStatus as any,
          confirmedAt: ordStatus !== "PENDING" ? new Date() : null,
          completedAt: ordStatus === "DONE" || ordStatus === "PAID" ? new Date() : null,
          paidAt: ordStatus === "PAID" ? new Date() : null,
        }
      })
    }
  }

  console.log("✅ 调研需求和订单创建完成")

  // ===== 合规日志 =====
  await prisma.complianceLog.createMany({
    data: [
      { targetType: "REQUEST", targetId: "demo-1", eventType: "提纲敏感词", description: "检测到「定增计划」敏感词，已剔除" },
      { targetType: "ORDER", targetId: "demo-2", eventType: "绕平台交易警告", description: "疑似私下加微信，已拦截" },
      { targetType: "EXPERT", targetId: "demo-3", eventType: "资质到期", description: "专家在职证明距上次更新超180天" },
    ].map(l => ({ ...l, handled: false }))
  })

  console.log("✅ 合规日志创建完成")
  console.log("🎉 Seed 完成！")
  console.log("演示账号：")
  console.log("  管理员：admin@demo.com / 123456")
  console.log("  研究员：researcher@demo.com / 123456")
  console.log("  专家：expert1@demo.com / 123456")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
