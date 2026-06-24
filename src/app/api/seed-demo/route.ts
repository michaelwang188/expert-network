import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const existing = await prisma.expert.count()
    if (existing > 3) {
      return NextResponse.json({ message: `已有 ${existing} 位专家，跳过` })
    }
    const pw = await bcrypt.hash("123456", 10)

    // 5位研究员
    const rData = [
      { email: "wangzhiyuan@demo.com", name: "王志远", org: "东北证券", title: "电子分析师" },
      { email: "zhangyan@demo.com", name: "张岩", org: "广发证券", title: "新能源研究员" },
      { email: "liwei@demo.com", name: "李薇", org: "中信建投", title: "半导体研究员" },
      { email: "chenhao@demo.com", name: "陈浩", org: "天风证券", title: "策略研究员" },
      { email: "liuna@demo.com", name: "刘娜", org: "国泰海通", title: "消费电子研究员" },
    ]
    for (const r of rData) {
      await prisma.user.upsert({
        where: { email: r.email },
        update: {},
        create: { email: r.email, name: r.name, password: pw, role: "RESEARCHER", points: 25000, orgName: r.org, title: r.title },
      })
    }

    // 8位专家
    const eData = [
      { name: "赵建国", title: "前产品线总监", org: "华为技术", yrs: 18, reg: "深圳", i1: "半导体", i2: "AI芯片", rol: "研发/技术", tag: "昇腾,AI服务器,芯片设计", top: "AI芯片架构,国产算力", rate: 3000, ord: 12, rat: 4.5 },
      { name: "陈敏", title: "供应链副总", org: "宁德时代", yrs: 14, reg: "福建", i1: "新能源", i2: "锂电池", rol: "供应链", tag: "锂电池,储能,动力电池", top: "电池供应链", rate: 2500, ord: 8, rat: 4.2 },
      { name: "李明辉", title: "研发总监", org: "中芯国际", yrs: 20, reg: "上海", i1: "半导体", i2: "晶圆代工", rol: "研发/技术", tag: "晶圆代工,成熟制程", top: "晶圆产能", rate: 4000, ord: 6, rat: 4.8 },
      { name: "刘洋", title: "研究院副院长", org: "比亚迪", yrs: 15, reg: "深圳", i1: "新能源", i2: "汽车电子", rol: "研发/技术", tag: "新能源车,功率半导体", top: "新能源车出海", rate: 3500, ord: 10, rat: 4.3 },
      { name: "周杰", title: "合伙人", org: "高榕资本", yrs: 12, reg: "上海", i1: "人工智能", i2: "大模型", rol: "投资", tag: "大模型,AIGC,AI应用", top: "AI商业化", rate: 4500, ord: 15, rat: 4.6 },
      { name: "孙丽", title: "VP of Sales", org: "英伟达", yrs: 15, reg: "上海", i1: "人工智能", i2: "算力", rol: "销售/市场", tag: "GPU,算力租赁,数据中心", top: "算力需求趋势", rate: 5500, ord: 5, rat: 4.7 },
      { name: "黄涛", title: "创始人兼CEO", org: "云从科技", yrs: 16, reg: "广州", i1: "人工智能", i2: "视觉", rol: "管理", tag: "AI视觉,智慧城市", top: "AI视觉商业化", rate: 4000, ord: 7, rat: 4.1 },
      { name: "杨帆", title: "创始人", org: "星际荣耀", yrs: 18, reg: "北京", i1: "军工与航天", i2: "商业航天", rol: "管理", tag: "商业航天,火箭", top: "商业航天进展", rate: 3500, ord: 3, rat: 4.4 },
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

    // 5个需求 + 3笔订单
    const reqs = [
      { title: "MLCC行业供需格局与涨价趋势", ind: "半导体", outline: "1. 供需格局？\n2. 涨价幅度？\n3. 下半年预期？" },
      { title: "钠离子电池量产进度与成本调研", ind: "新能源", outline: "1. 量产进度？\n2. 成本对比？\n3. 产能规划？" },
      { title: "国产AI芯片生态发展现状", ind: "半导体", outline: "1. 产品力差距？\n2. 软件生态？\n3. 采购意愿？" },
      { title: "商业航天发射市场调研", ind: "军工与航天", outline: "1. 发射频次？\n2. 可回收火箭？\n3. 卫星互联网？" },
      { title: "AI算力租赁市场供需调研", ind: "人工智能", outline: "1. 价格趋势？\n2. 主要玩家？\n3. 供应瓶颈？" },
    ]
    const rs = await prisma.user.findMany({ where: { role: "RESEARCHER" }, take: 5 })
    for (let i = 0; i < reqs.length; i++) {
      const d = reqs[i]
      const oNo = `ORD-2026-${5000 + i}`
      const created = new Date(Date.now() - (5 - i) * 86400000)
      const req = await prisma.request.create({
        data: { orderNo: oNo, title: d.title, industry: d.ind, subField: "", duration: "60分钟", form: "线上视频", budget: "6000-12000", outline: d.outline, forbidden: "", status: i < 3 ? "MATCHING" : "SUBMITTED", researcherId: rs[i % rs.length].id, createdAt: created },
      })
      if (i < 3) {
        const e = experts[i * 2]
        const amt = [5000, 8000, 15000][i]
        const st: any = ["ACTIVE", "DONE", "PAID"][i]
        const cf = new Date(created.getTime() + 3600000)
        const cp = new Date(created.getTime() + 7200000)
        await prisma.order.create({
          data: { orderNo: oNo, requestId: req.id, researcherId: rs[i % rs.length].id, expertId: e.id, amount: amt, expertFee: Math.round(amt * 0.8), platformFee: Math.round(amt * 0.2), status: st, confirmedAt: st !== "ACTIVE" ? cf : null, completedAt: st !== "ACTIVE" ? cp : null, paidAt: st === "PAID" ? new Date(created.getTime() + 7 * 86400000) : null },
        })
      }
    }

    return NextResponse.json({ message: "演示数据填充完成", researchers: 5, experts: 8, requests: 5, orders: 3 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
