const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const existingExperts = await prisma.expert.count()
  if (existingExperts > 3) {
    console.log(`数据库已有 ${existingExperts} 位专家，跳过`)
    return
  }

  const pw = await bcrypt.hash('123456', 10)

  // 5位研究员
  const rData = [
    { email: 'wangzhiyuan@demo.com', name: '王志远', org: '东北证券', title: '电子分析师' },
    { email: 'zhangyan@demo.com', name: '张岩', org: '广发证券', title: '新能源研究员' },
    { email: 'liwei@demo.com', name: '李薇', org: '中信建投', title: '半导体研究员' },
    { email: 'chenhao@demo.com', name: '陈浩', org: '天风证券', title: '策略研究员' },
    { email: 'liuna@demo.com', name: '刘娜', org: '国泰海通', title: '消费电子研究员' },
  ]
  for (const r of rData) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { email: r.email, name: r.name, password: pw, role: 'RESEARCHER', points: 25000, orgName: r.org, title: r.title },
    })
  }
  console.log(`✅ 5位研究员`)

  // 8位精选专家（精不在多）
  const eData = [
    { name: '赵建国', title: '前产品线总监', org: '华为技术', years: 18, region: '深圳', i1: '半导体', i2: 'AI芯片', role: '研发/技术', tags: '昇腾,AI服务器,芯片设计', topics: 'AI芯片架构,国产算力', rate: 3000, orders: 12, rating: 4.5 },
    { name: '陈敏', title: '供应链副总', org: '宁德时代', years: 14, region: '福建', i1: '新能源', i2: '锂电池', role: '供应链', tags: '锂电池,储能,动力电池', topics: '电池供应链,储能市场', rate: 2500, orders: 8, rating: 4.2 },
    { name: '李明辉', title: '研发总监', org: '中芯国际', years: 20, region: '上海', i1: '半导体', i2: '晶圆代工', role: '研发/技术', tags: '晶圆代工,成熟制程', topics: '晶圆产能,国产替代', rate: 4000, orders: 6, rating: 4.8 },
    { name: '刘洋', title: '研究院副院长', org: '比亚迪', years: 15, region: '深圳', i1: '新能源', i2: '汽车电子', role: '研发/技术', tags: '新能源车,功率半导体', topics: '新能源车出海,智能驾驶', rate: 3500, orders: 10, rating: 4.3 },
    { name: '周杰', title: '合伙人', org: '高榕资本', years: 12, region: '上海', i1: '人工智能', i2: '大模型', role: '投资', tags: '大模型,AIGC,AI应用', topics: 'AI商业化', rate: 4500, orders: 15, rating: 4.6 },
    { name: '孙丽', title: 'VP of Sales', org: '英伟达', years: 15, region: '上海', i1: '人工智能', i2: '算力', role: '销售/市场', tags: 'GPU,算力租赁,数据中心', topics: '算力需求趋势', rate: 5500, orders: 5, rating: 4.7 },
    { name: '黄涛', title: '创始人兼CEO', org: '云从科技', years: 16, region: '广州', i1: '人工智能', i2: '视觉', role: '管理', tags: 'AI视觉,智慧城市', topics: 'AI视觉商业化', rate: 4000, orders: 7, rating: 4.1 },
    { name: '杨帆', title: '创始人', org: '星际荣耀', years: 18, region: '北京', i1: '军工与航天', i2: '商业航天', role: '管理', tags: '商业航天,火箭', topics: '商业航天进展', rate: 3500, orders: 3, rating: 4.4 },
  ]

  const createdExperts = []
  for (const e of eData) {
    const u = await prisma.user.create({
      data: { email: `expert_${e.name}@demo.com`, name: e.name, password: pw, role: 'EXPERT', points: e.rate * 2, orgName: e.org, title: e.title },
    })
    const ex = await prisma.expert.create({
      data: {
        userId: u.id, realName: e.name, title: e.title, org: e.org,
        years: e.years, region: e.region, industry1: e.i1, industry2: e.i2,
        roleType: e.role, tags: e.tags, topics: e.topics,
        forms: '电话访谈,视频会议,线下走访',
        ratePoints: e.rate, rateHour: e.rate,
        status: 'ACTIVE', reviewStatus: 'APPROVED',
        complianceSig: true,
        completedOrders: e.orders,
        rating: e.rating,
      },
    })
    createdExperts.push(ex)
  }
  console.log(`✅ 8位产业专家`)

  // 5个调研需求（精简但真实）
  const reqData = [
    { title: 'MLCC行业供需格局与涨价趋势', ind: '半导体', sub: 'MLCC', dur: '60分钟', bug: '3000-6000', outline: '1. 目前MLCC供需格局？\n2. 主要厂商涨价幅度？\n3. 下半年预期？' },
    { title: '钠离子电池量产进度与成本调研', ind: '新能源', sub: '钠离子电池', dur: '60分钟', bug: '6000-12000', outline: '1. 量产进度？\n2. 与磷酸铁锂成本对比？\n3. 产能规划？' },
    { title: '国产AI芯片生态发展现状', ind: '半导体', sub: 'AI芯片', dur: '90分钟', bug: '12000-24000', outline: '1. 产品力差距？\n2. 软件生态进展？\n3. 采购意愿？' },
    { title: '商业航天发射市场调研', ind: '军工与航天', sub: '商业火箭', dur: '90分钟', bug: '6000-12000', outline: '1. 发射频次？\n2. 可回收火箭进展？\n3. 卫星互联网节奏？' },
    { title: 'AI算力租赁市场供需调研', ind: '人工智能', sub: '算力', dur: '60分钟', bug: '6000-12000', outline: '1. 价格趋势？\n2. 主要玩家？\n3. 供应瓶颈？' },
  ]

  const rs = await prisma.user.findMany({ where: { role: 'RESEARCHER' }, take: 5 })
  for (let i = 0; i < reqData.length; i++) {
    const d = reqData[i]
    const oNo = `ORD-2026-${String(5000 + i)}`
    const daysAgo = 5 - i
    const created = new Date(Date.now() - daysAgo * 86400000)
    const req = await prisma.request.create({
      data: {
        orderNo: oNo, title: d.title, industry: d.ind, subField: d.sub,
        duration: d.dur, form: '线上视频', budget: d.bug,
        outline: d.outline, forbidden: '',
        status: i < 3 ? 'MATCHING' : i < 4 ? 'COMPLIANCE_OK' : 'SUBMITTED',
        researcherId: rs[i % rs.length].id,
        createdAt: created,
      },
    })
    // 前3个需求生成关联订单
    if (i < 3) {
      const expert = createdExperts[i * 2]
      const amount = [5000, 8000, 15000][i]
      const status = ['ACTIVE', 'DONE', 'PAID'][i]
      const confirmed = new Date(created.getTime() + 3600000)
      const completed = new Date(created.getTime() + 7200000)
      await prisma.order.create({
        data: {
          orderNo: oNo, requestId: req.id,
          researcherId: rs[i % rs.length].id,
          expertId: expert.id,
          amount, expertFee: Math.round(amount * 0.8), platformFee: Math.round(amount * 0.2),
          status,
          confirmedAt: status !== 'ACTIVE' ? confirmed : null,
          completedAt: status !== 'ACTIVE' ? completed : null,
          paidAt: status === 'PAID' ? new Date(created.getTime() + 7 * 86400000) : null,
        },
      })
    }
  }
  console.log(`✅ 5个调研需求 + 3笔订单`)

  console.log(`\n📊 完成！`)
  console.log(`   5位研究员 · 8位专家 · 5个需求 · 3笔订单`)
  console.log(`   登录: admin@demo.com / 123456`)
  console.log(`   研究员登录: researcher@demo.com / 123456`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
