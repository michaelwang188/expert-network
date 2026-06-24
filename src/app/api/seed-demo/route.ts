import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const pw = await bcrypt.hash("123456", 10)

    // 清除旧的seed数据（不会影响真实用户）
    await prisma.order.deleteMany({ where: { request: { researcher: { source: "seed" } } } })
    await prisma.request.deleteMany({ where: { researcher: { source: "seed" } } })
    await prisma.expert.deleteMany({ where: { user: { source: "seed" } } })
    await prisma.user.deleteMany({ where: { source: "seed" } })
    await prisma.notification.deleteMany({ where: { user: { source: "seed" } } })
    await prisma.pointsTransaction.deleteMany({ where: { user: { source: "seed" } } })

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
        data: { email: r.email, name: r.name, password: pw, role: "RESEARCHER", points: 25000, orgName: r.org, title: r.title, source: "seed" },
      })
      rUsers.push(u)
    }

    // 20位专家
    const eData = [
      { name: "赵建国", title: "前产品线总监", org: "华为技术", yrs: 18, reg: "深圳", i1: "半导体", i2: "AI芯片", rol: "研发/技术", tag: "昇腾,AI服务器,芯片设计", top: "AI芯片架构,国产算力", rate: 3000, ord: 12, rat: 4.5 },
      { name: "陈敏", title: "供应链副总", org: "宁德时代", yrs: 14, reg: "福建", i1: "新能源", i2: "锂电池", rol: "供应链", tag: "锂电池,储能,动力电池", top: "电池供应链,储能市场", rate: 2500, ord: 8, rat: 4.2 },
      { name: "李明辉", title: "研发总监", org: "中芯国际", yrs: 20, reg: "上海", i1: "半导体", i2: "晶圆代工", rol: "研发/技术", tag: "晶圆代工,成熟制程", top: "晶圆产能,国产替代", rate: 4000, ord: 6, rat: 4.8 },
      { name: "刘洋", title: "研究院副院长", org: "比亚迪", yrs: 15, reg: "深圳", i1: "新能源", i2: "汽车电子", rol: "研发/技术", tag: "新能源车,功率半导体", top: "新能源车出海,智能驾驶", rate: 3500, ord: 10, rat: 4.3 },
      { name: "周杰", title: "合伙人", org: "高榕资本", yrs: 12, reg: "上海", i1: "人工智能", i2: "大模型", rol: "投资", tag: "大模型,AIGC,AI应用", top: "AI商业化,大模型竞争格局", rate: 4500, ord: 15, rat: 4.6 },
      { name: "孙丽", title: "VP of Sales", org: "英伟达", yrs: 15, reg: "上海", i1: "人工智能", i2: "算力", rol: "销售/市场", tag: "GPU,算力租赁,数据中心", top: "算力需求趋势,GPU市场", rate: 5500, ord: 5, rat: 4.7 },
      { name: "黄涛", title: "创始人兼CEO", org: "云从科技", yrs: 16, reg: "广州", i1: "人工智能", i2: "视觉", rol: "管理", tag: "AI视觉,智慧城市", top: "AI视觉商业化,智慧城市项目", rate: 4000, ord: 7, rat: 4.1 },
      { name: "杨帆", title: "创始人", org: "星际荣耀", yrs: 18, reg: "北京", i1: "军工与航天", i2: "商业航天", rol: "管理", tag: "商业航天,火箭", top: "商业航天进展,卫星互联网", rate: 3500, ord: 3, rat: 4.4 },
      { name: "吴芳", title: "技术VP", org: "华大半导体", yrs: 17, reg: "深圳", i1: "半导体", i2: "模拟芯片", rol: "研发/技术", tag: "MCU,模拟芯片,车规级", top: "国产替代进展,MCU市场", rate: 3200, ord: 9, rat: 4.3 },
      { name: "徐明", title: "运营副总", org: "隆基绿能", yrs: 13, reg: "西安", i1: "新能源", i2: "光伏", rol: "运营/管理", tag: "光伏,硅片,钙钛矿", top: "光伏产能,全球光伏市场", rate: 2800, ord: 11, rat: 4.0 },
      { name: "林晓", title: "董事总经理", org: "启明创投", yrs: 10, reg: "北京", i1: "医疗健康", i2: "创新药", rol: "投资", tag: "创新药,生物科技,医疗器械", top: "创新药出海,BD交易", rate: 3500, ord: 4, rat: 4.2 },
      { name: "何强", title: "总监", org: "字节跳动", yrs: 11, reg: "北京", i1: "人工智能", i2: "推荐系统", rol: "研发/技术", tag: "推荐系统,大模型应用,AI infra", top: "大模型应用落地,AI infra", rate: 3800, ord: 6, rat: 4.5 },
      { name: "郑浩", title: "前首席分析师", org: "某券商研究所", yrs: 20, reg: "上海", i1: "金融", i2: "量化投资", rol: "研究", tag: "量化策略,AI投资,因子模型", top: "量化投资趋势,AI+投资", rate: 3000, ord: 13, rat: 4.1 },
      { name: "王芳", title: "市场部总经理", org: "京东方", yrs: 16, reg: "北京", i1: "消费电子", i2: "面板", rol: "销售/市场", tag: "OLED,面板周期,车载显示", top: "面板供需,OLED渗透率", rate: 2200, ord: 7, rat: 4.0 },
      { name: "张伟", title: "CTO", org: "瀚博半导体", yrs: 22, reg: "上海", i1: "半导体", i2: "GPU", rol: "研发/技术", tag: "GPU,AI推理,边缘计算", top: "国产GPU,AI推理芯片", rate: 5000, ord: 5, rat: 4.9 },
    ]
    const experts = []
    for (const e of eData) {
      const u = await prisma.user.create({
        data: { email: `expert_${e.name}@demo.com`, name: e.name, password: pw, role: "EXPERT", points: e.rate * 2, orgName: e.org, title: e.title, source: "seed" },
      })
      const ex = await prisma.expert.create({
        data: { userId: u.id, realName: e.name, title: e.title, org: e.org, years: e.yrs, region: e.reg, industry1: e.i1, industry2: e.i2, roleType: e.rol, tags: e.tag, topics: e.top, forms: "电话访谈,视频会议,线下走访", ratePoints: e.rate, rateHour: e.rate, status: "ACTIVE", reviewStatus: "APPROVED", complianceSig: true, completedOrders: e.ord, rating: e.rat },
      })
      experts.push(ex)
    }

    // 10个需求 + 5笔订单
    const reqs = [
      { title: "MLCC行业供需格局与涨价趋势", ind: "半导体", sub: "MLCC", dur: "60分钟", outline: "1. 目前MLCC供需格局？\n2. 主要厂商涨价幅度？\n3. 下半年价格预期？" },
      { title: "钠离子电池量产进度与成本调研", ind: "新能源", sub: "钠离子电池", dur: "60分钟", outline: "1. 量产进度？\n2. 与磷酸铁锂成本对比？\n3. 主要厂商产能规划？" },
      { title: "国产AI芯片生态发展现状", ind: "半导体", sub: "AI芯片", dur: "90分钟", outline: "1. 国产芯片产品力差距？\n2. 软件生态进展？\n3. 采购意愿？" },
      { title: "光伏产业链出海壁垒调研", ind: "新能源", sub: "光伏", dur: "60分钟", outline: "1. 出海主要壁垒？\n2. 各市场需求差异？\n3. 产能vs产品出海选择？" },
      { title: "大模型在金融行业应用进展", ind: "人工智能", sub: "大模型", dur: "60分钟", outline: "1. 落地案例？\n2. 投研/风控哪个先跑通？\n3. 对传统AI服务商冲击？" },
      { title: "HBM内存产业链调研", ind: "半导体", sub: "存储", dur: "60分钟", outline: "1. HBM供需格局？\n2. 国内产业链机会？\n3. SK海力士vs三星竞争？" },
      { title: "创新药出海BD交易趋势", ind: "医疗健康", sub: "创新药", dur: "60分钟", outline: "1. BD交易趋势？\n2. 哪些赛道受青睐？\n3. 典型条款结构？" },
      { title: "商业航天发射市场调研", ind: "军工与航天", sub: "商业火箭", dur: "90分钟", outline: "1. 发射频次？\n2. 可回收火箭进展？\n3. 卫星互联网组网节奏？" },
      { title: "AI算力租赁市场供需调研", ind: "人工智能", sub: "算力", dur: "60分钟", outline: "1. 价格趋势？\n2. 主要玩家？\n3. 供应瓶颈何时缓解？" },
      { title: "储能行业政策与竞争格局", ind: "新能源", sub: "储能", dur: "60分钟", outline: "1. 新增装机预测？\n2. 经济性对比？\n3. 竞争格局变化？" },
    ]

    for (let i = 0; i < reqs.length; i++) {
      const d = reqs[i]
      const oNo = `ORD-2026-${6000 + i}`
      const created = new Date(Date.now() - (reqs.length - i) * 86400000)
      const req = await prisma.request.create({
        data: { orderNo: oNo, title: d.title, industry: d.ind, subField: d.sub, duration: d.dur, form: "线上视频", budget: "6000-12000", outline: d.outline, forbidden: "", status: i < 5 ? "MATCHING" : "SUBMITTED", researcherId: rUsers[i % rUsers.length].id, createdAt: created },
      })
      if (i < 5) {
        const e = experts[i * 2]
        const amt = [5000, 8000, 15000, 8000, 10000][i]
        const st_arr: any = ["ACTIVE", "ACTIVE", "DONE", "DONE", "PAID"]
        const st = st_arr[i]
        const cf = new Date(created.getTime() + 3600000)
        const cp = new Date(created.getTime() + 7200000)
        await prisma.order.create({
          data: { orderNo: oNo, requestId: req.id, researcherId: rUsers[i % rUsers.length].id, expertId: e.id, amount: amt, expertFee: Math.round(amt * 0.8), platformFee: Math.round(amt * 0.2), status: st, confirmedAt: st !== "ACTIVE" ? cf : null, completedAt: st !== "ACTIVE" ? cp : null, paidAt: st === "PAID" ? new Date(created.getTime() + 7 * 86400000) : null },
        })
      }
    }

    return NextResponse.json({ message: "演示数据填充完成", researchers: 5, experts: 15, requests: 10, orders: 5, source: "seed" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
