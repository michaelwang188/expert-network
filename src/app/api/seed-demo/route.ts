import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// 演示数据邮箱列表（用来识别哪些是可清理的seed数据）
const SEED_EMAILS = [
  "wangzhiyuan@demo.com", "zhangyan@demo.com", "liwei@demo.com", "chenhao@demo.com", "liuna@demo.com",
  "expert_赵建国@demo.com", "expert_陈敏@demo.com", "expert_李明辉@demo.com", "expert_刘洋@demo.com",
  "expert_周杰@demo.com", "expert_孙丽@demo.com", "expert_黄涛@demo.com", "expert_杨帆@demo.com",
  "expert_吴芳@demo.com", "expert_徐明@demo.com",
]

export async function POST() {
  try {
    const pw = await bcrypt.hash("123456", 10)

    // 清理旧seed数据
    for (const email of SEED_EMAILS) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        await prisma.order.deleteMany({ where: { researcherId: user.id } })
        await prisma.request.deleteMany({ where: { researcherId: user.id } })
        await prisma.expert.deleteMany({ where: { userId: user.id } })
        await prisma.notification.deleteMany({ where: { userId: user.id } })
        await prisma.pointsTransaction.deleteMany({ where: { userId: user.id } })
        await prisma.user.delete({ where: { id: user.id } })
      }
    }

    // 5位研究员
    const rData = [
      { email: "wangzhiyuan@demo.com", name: "王志远", org: "东北证券", title: "电子分析师" },
      { email: "zhangyan@demo.com", name: "张岩", org: "广发证券", title: "新能源研究员" },
      { email: "liwei@demo.com", name: "李薇", org: "中信建投", title: "半导体研究员" },
      { email: "chenhao@demo.com", name: "陈浩", org: "天风证券", title: "策略研究员" },
      { email: "liuna@demo.com", name: "刘娜", org: "国泰海通", title: "消费电子研究员" },
    ]
    const rUsers = []
    for (const r of rData) {
      const u = await prisma.user.create({
        data: { email: r.email, name: r.name, password: pw, role: "RESEARCHER", points: 25000, orgName: r.org, title: r.title },
      })
      rUsers.push(u)
    }

    // 10位专家
    const eData = [
      { name: "赵建国", title: "前产品线总监", org: "华为技术", yrs: 18, reg: "深圳", i1: "半导体", i2: "AI芯片", rol: "研发/技术", tag: "昇腾,AI服务器,芯片设计", top: "AI芯片架构,国产算力", rate: 3000, ord: 12, rat: 4.5 },
      { name: "陈敏", title: "供应链副总", org: "宁德时代", yrs: 14, reg: "福建", i1: "新能源", i2: "锂电池", rol: "供应链", tag: "锂电池,储能,动力电池", top: "电池供应链,储能市场", rate: 2500, ord: 8, rat: 4.2 },
      { name: "李明辉", title: "研发总监", org: "中芯国际", yrs: 20, reg: "上海", i1: "半导体", i2: "晶圆代工", rol: "研发/技术", tag: "晶圆代工,成熟制程", top: "晶圆产能,国产替代", rate: 4000, ord: 6, rat: 4.8 },
      { name: "刘洋", title: "研究院副院长", org: "比亚迪", yrs: 15, reg: "深圳", i1: "新能源", i2: "汽车电子", rol: "研发/技术", tag: "新能源车,功率半导体", top: "新能源车出海,智能驾驶", rate: 3500, ord: 10, rat: 4.3 },
      { name: "周杰", title: "合伙人", org: "高榕资本", yrs: 12, reg: "上海", i1: "人工智能", i2: "大模型", rol: "投资", tag: "大模型,AIGC,AI应用", top: "AI商业化,大模型竞争", rate: 4500, ord: 15, rat: 4.6 },
      { name: "孙丽", title: "VP of Sales", org: "英伟达", yrs: 15, reg: "上海", i1: "人工智能", i2: "算力", rol: "销售/市场", tag: "GPU,算力租赁,数据中心", top: "算力需求趋势,GPU市场", rate: 5500, ord: 5, rat: 4.7 },
      { name: "黄涛", title: "创始人兼CEO", org: "云从科技", yrs: 16, reg: "广州", i1: "人工智能", i2: "视觉", rol: "管理", tag: "AI视觉,智慧城市", top: "AI视觉商业化", rate: 4000, ord: 7, rat: 4.1 },
      { name: "杨帆", title: "创始人", org: "星际荣耀", yrs: 18, reg: "北京", i1: "军工与航天", i2: "商业航天", rol: "管理", tag: "商业航天,火箭", top: "商业航天进展", rate: 3500, ord: 3, rat: 4.4 },
      { name: "吴芳", title: "技术VP", org: "华大半导体", yrs: 17, reg: "深圳", i1: "半导体", i2: "模拟芯片", rol: "研发/技术", tag: "MCU,模拟芯片,车规级", top: "国产替代进展,MCU市场", rate: 3200, ord: 9, rat: 4.3 },
      { name: "徐明", title: "运营副总", org: "隆基绿能", yrs: 13, reg: "西安", i1: "新能源", i2: "光伏", rol: "运营/管理", tag: "光伏,硅片,钙钛矿", top: "光伏产能,全球光伏市场", rate: 2800, ord: 11, rat: 4.0 },
    ]
    const experts = []
    for (const e of eData) {
      const u = await prisma.user.create({
        data: { email: `expert_${e.name}@demo.com`, name: e.name, password: pw, role: "EXPERT", points: e.rate * 2, orgName: e.org, title: e.title },
      })
      const ex = await prisma.expert.create({
        data: { userId: u.id, realName: e.name, title: e.title, org: e.org, years: e.yrs, region: e.reg, industry1: e.i1, industry2: e.i2, roleType: e.rol, tags: e.tag, topics: e.top, forms: "电话访谈,视频会议,线下走访", ratePoints: e.rate, rateHour: e.rate, status: "ACTIVE", reviewStatus: "APPROVED", complianceSig: true, completedOrders: e.ord, rating: e.rat },
      })
      experts.push(ex)
    }

    // 5个需求
    const reqs = [
      { title: "MLCC行业供需格局与涨价趋势", ind: "半导体", sub: "MLCC", outline: "1. 供需格局？\n2. 涨价幅度？\n3. 下半年预期？" },
      { title: "钠离子电池量产进度与成本调研", ind: "新能源", sub: "钠离子电池", outline: "1. 量产进度？\n2. 成本对比？\n3. 产能规划？" },
      { title: "国产AI芯片生态发展现状", ind: "半导体", sub: "AI芯片", outline: "1. 产品力差距？\n2. 软件生态？\n3. 采购意愿？" },
      { title: "光伏产业链出海壁垒调研", ind: "新能源", sub: "光伏", outline: "1. 出海壁垒？\n2. 市场需求？\n3. 产能选择？" },
      { title: "大模型在金融行业应用进展", ind: "人工智能", sub: "大模型", outline: "1. 落地案例？\n2. 投研/风控方向？\n3. AI服务商冲击？" },
    ]
    for (let i = 0; i < reqs.length; i++) {
      const d = reqs[i]
      const oNo = `ORD-2026-${7000 + i}`
      const created = new Date(Date.now() - (reqs.length - i) * 86400000)
      await prisma.request.create({
        data: { orderNo: oNo, title: d.title, industry: d.ind, subField: d.sub, duration: "60分钟", form: "线上视频", budget: "6000-12000", outline: d.outline, forbidden: "", status: "MATCHING", researcherId: rUsers[i % rUsers.length].id, createdAt: created },
      })
      if (i < 3) {
        const e = experts[i * 2]
        const amt = [5000, 8000, 15000][i]
        const stArr: any = ["ACTIVE", "DONE", "PAID"]
        const st = stArr[i]
        const cf = new Date(created.getTime() + 3600000)
        const cp = new Date(created.getTime() + 7200000)
        await prisma.order.create({
          data: { orderNo: oNo, requestId: req.id, researcherId: rUsers[i % rUsers.length].id, expertId: e!.id, amount: amt, expertFee: Math.round(amt * 0.8), platformFee: Math.round(amt * 0.2), status: st, confirmedAt: st !== "ACTIVE" ? cf : null, completedAt: st !== "ACTIVE" ? cp : null, paidAt: st === "PAID" ? new Date(created.getTime() + 7 * 86400000) : null },
        })
      }
    }

    return NextResponse.json({ message: "演示数据填充完成", researchers: 5, experts: 10, requests: 5, orders: 3 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
