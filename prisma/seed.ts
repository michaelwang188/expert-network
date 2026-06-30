// Prisma Seed Script - 创建测试账号
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建测试账号...')

  // 1. 创建研究员账号
  const researcherPassword = await hash('123456', 10)
  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@demo.com' },
    update: { password: researcherPassword },
    create: {
      email: 'researcher@demo.com',
      name: '张研究员',
      password: researcherPassword,
      role: 'RESEARCHER',
      orgName: '腾讯科技',
      emailVerified: new Date(),
    },
  })
  console.log('✅ 研究员账号创建成功:', researcher.email)

  // 2. 创建专家账号
  const expertPassword = await hash('123456', 10)
  const expertUser = await prisma.user.upsert({
    where: { email: 'expert@demo.com' },
    update: { password: expertPassword },
    create: {
      email: 'expert@demo.com',
      name: '李专家',
      password: expertPassword,
      role: 'EXPERT',
      emailVerified: new Date(),
    },
  })

  const expert = await prisma.expert.upsert({
    where: { userId: expertUser.id },
    update: {},
    create: {
      userId: expertUser.id,
      realName: '李教授',
      title: '首席技术官',
      org: '华为技术有限公司',
      years: 15,
      region: '深圳',
      industry1: '半导体',
      industry2: 'AI算力',
      roleType: '企业技术专家',
      tags: 'MLCC,功率半导体,AI芯片',
      topics: 'MLCC元器件技术趋势,功率半导体应用场景,AI芯片市场分析',
      ratePoints: 3000, rateHour: 3000,
      forms: '电话访谈,视频会议',
      idVerified: true,
      empVerified: true,
      interviewDone: true,
      complianceSig: true,
      status: 'ACTIVE',
    },
  })
  // 给专家初始积分
  await prisma.user.update({ where: { id: expertUser.id }, data: { points: { increment: 5000 } } })
  console.log('✅ 专家账号创建成功:', expertUser.email)

  // 3. 创建管理员账号
  const adminPassword = await hash('123456', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@demo.com',
      name: '王管理员',
      password: adminPassword,
      role: 'ADMIN',
      orgName: '产研通 ProLink',
      emailVerified: new Date(),
    },
  })
  console.log('✅ 管理员账号创建成功:', admin.email)

  // 4. 创建5位演示专家（含完整标签/报价/档期）—— ratePoints使用积分而非分
  const demoExperts = [
    { email: 'zhangwei@demo.com', name: '张伟', realName: '张伟博士', title: '芯片设计总监', org: '华为海思半导体', years: 15, region: '上海', industry1: '半导体', industry2: '芯片设计', roleType: '研发/工艺', tags: '芯片设计,EDA工具,先进制程,AI芯片,异构计算', topics: '先进制程芯片设计趋势,EDA工具国产替代现状,AI芯片架构对比,chiplet技术路径', ratePoints: 2500, forms: '线上视频,线下走访', availableTime: '工作日14:00-18:00' },
    { email: 'lifang@demo.com', name: '李芳', realName: '李芳', title: '电池技术副总工', org: '宁德时代', years: 12, region: '宁德', industry1: '新能源', industry2: '动力电池', roleType: '企业技术专家', tags: '动力电池,固态电池,磷酸铁锂,钠离子电池,电池回收', topics: '磷酸铁锂vs三元技术路线,固态电池量产进度,钠离子电池成本优势,电池梯次利用商业模式', ratePoints: 2000, forms: '线上语音,线上视频', availableTime: '周三/周五全天' },
    { email: 'wangqiang@demo.com', name: '王强', realName: '王强', title: '临床研发总监', org: '恒瑞医药', years: 18, region: '苏州', industry1: '创新药', industry2: '生物制药', roleType: '研发/工艺', tags: '创新药,临床试验,肿瘤免疫,生物类似药,license-in', topics: '国内创新药出海路径,PD-1赛道格局,ADC药物研发趋势,license-in vs 自研决策', ratePoints: 3500, forms: '线上视频', availableTime: '工作日全天' },
    { email: 'zhaomin@demo.com', name: '赵敏', realName: '赵敏', title: '供应链总经理', org: '京东物流', years: 14, region: '北京', industry1: '消费电子', industry2: '消费零售', roleType: '供应链', tags: '供应链管理,仓储物流,渠道分销,库存优化,直播电商', topics: '即时零售供应链布局,前置仓盈利模型,全渠道库存协同,直播电商供应链挑战', ratePoints: 1800, forms: '线上语音,线下走访', availableTime: '周一～周四 10:00-16:00' },
    { email: 'chenjie@demo.com', name: '陈杰', realName: '陈杰', title: 'SaaS架构首席专家', org: '字节跳动', years: 11, region: '北京', industry1: 'AI算力', industry2: '企业软件', roleType: '管理/战略', tags: 'SaaS架构,云原生,微服务,AI PaaS,大模型应用', topics: '云原生架构演进最佳实践,大模型在SaaS产品中落地,企业级AI PaaS平台建设,微服务治理经验', ratePoints: 2800, forms: '线上语音,线上视频,线下走访', availableTime: '工作日 9:00-17:00' },
  ]

  for (const e of demoExperts) {
    const pwd = await hash('123456', 10)
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: { password: pwd },
      create: { email: e.email, name: e.name, password: pwd, role: 'EXPERT', orgName: e.org, title: e.title, emailVerified: new Date() },
    })
    const expert = await prisma.expert.upsert({
      where: { userId: user.id },
      update: {
        realName: e.realName, title: e.title, org: e.org, years: e.years, region: e.region,
        industry1: e.industry1, industry2: e.industry2, roleType: e.roleType,
        tags: e.tags, topics: e.topics, ratePoints: e.ratePoints, rateHour: e.ratePoints, forms: e.forms,
        availableTime: e.availableTime,
        idVerified: true, empVerified: true, interviewDone: true, complianceSig: true,
        status: 'ACTIVE',
      },
      create: {
        userId: user.id, realName: e.realName, title: e.title, org: e.org,
        years: e.years, region: e.region, industry1: e.industry1, industry2: e.industry2,
        roleType: e.roleType, tags: e.tags, topics: e.topics,
        ratePoints: e.ratePoints, rateHour: e.ratePoints, forms: e.forms, availableTime: e.availableTime,
        idVerified: true, empVerified: true, interviewDone: true, complianceSig: true,
        status: 'ACTIVE',
      },
    })
    // 给专家积分余额
    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 5000 } } })
  }
  console.log('✅ 5位演示专家创建成功')

  // 5. 创建更多研究员（方便测试统计/匹配功能）
  const moreResearchers = [
    { email: 'liwei@demo.com', name: '李伟', orgName: '南方基金', title: '高级研究员' },
    { email: 'wangfang@demo.com', name: '王芳', orgName: '中金公司', title: '首席分析师' },
    { email: 'zhaolei@demo.com', name: '赵磊', orgName: '高瓴资本', title: '投资总监' },
    { email: 'sunyue@demo.com', name: '孙悦', orgName: '红杉中国', title: 'VP' },
  ]
  for (const r of moreResearchers) {
    const pwd = await hash('123456', 10)
    await prisma.user.upsert({
      where: { email: r.email },
      update: { password: pwd },
      create: { email: r.email, name: r.name, password: pwd, role: 'RESEARCHER', orgName: r.orgName, title: r.title, emailVerified: new Date() },
    })
  }
  console.log('✅ 4位研究员创建成功')

  // 6. 创建更多专家
  const moreExperts = [
    { email: 'huangli@demo.com', name: '黄立', realName: '黄立博士', title: '新能源首席科学家', org: '隆基绿能', years: 16, region: '西安', industry1: '新能源', industry2: '光伏', roleType: '企业技术专家', tags: '光伏,钙钛矿,硅片,HJT,TOPCon', topics: '光伏技术路线对比,钙钛矿量产挑战,硅片薄片化趋势', ratePoints: 2200, forms: '线上视频,线下走访', availableTime: '工作日全天' },
    { email: 'zhouming@demo.com', name: '周明', realName: '周明', title: 'AI算法总监', org: '商汤科技', years: 10, region: '北京', industry1: 'AI算力', industry2: '大模型', roleType: '研发/工艺', tags: '大模型,深度学习,GPU集群,推理优化,多模态', topics: '大模型训练成本优化,国产GPU适配现状,多模态应用场景', ratePoints: 3000, forms: '线上语音,线上视频', availableTime: '周一/周三/周五' },
    { email: 'wujing@demo.com', name: '吴静', realName: '吴静', title: '医药注册总监', org: '药明康德', years: 13, region: '上海', industry1: '医药', industry2: 'CXO', roleType: '管理/战略', tags: 'CXO,药物发现,临床前,注册申报,中美双报', topics: '中美双报策略,创新药IND流程,CXO产能现状', ratePoints: 2600, forms: '线上语音', availableTime: '周二/周四 14:00-18:00' },
  ]
  for (const e of moreExperts) {
    const pwd = await hash('123456', 10)
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: { password: pwd },
      create: { email: e.email, name: e.name, password: pwd, role: 'EXPERT', orgName: e.org, title: e.title, emailVerified: new Date() },
    })
    await prisma.expert.upsert({
      where: { userId: user.id },
      update: {
        realName: e.realName, title: e.title, org: e.org, years: e.years, region: e.region,
        industry1: e.industry1, industry2: e.industry2, roleType: e.roleType,
        tags: e.tags, topics: e.topics, ratePoints: e.ratePoints, rateHour: e.ratePoints, forms: e.forms,
        availableTime: e.availableTime,
        idVerified: true, empVerified: true, complianceSig: true, status: 'ACTIVE',
      },
      create: {
        userId: user.id, realName: e.realName, title: e.title, org: e.org,
        years: e.years, region: e.region, industry1: e.industry1, industry2: e.industry2,
        roleType: e.roleType, tags: e.tags, topics: e.topics,
        ratePoints: e.ratePoints, rateHour: e.ratePoints, forms: e.forms, availableTime: e.availableTime,
        idVerified: true, empVerified: true, complianceSig: true, status: 'ACTIVE',
      },
    })
    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 5000 } } })
  }
  console.log('✅ 3位专家创建成功')



  // 7. 创建测试订单（供统计/看板/排行榜测试）
  console.log('创建测试订单...')
  const allResearchers = await prisma.user.findMany({ where: { role: 'RESEARCHER' } })
  const allActiveExperts = await prisma.expert.findMany({ where: { status: 'ACTIVE' }, include: { user: true } })

  const testOrders = [
    { title: 'MLCC国内头部厂商Q3排产及涨价意愿调研', industry: 'MLCC', amount: 1200, status: 'PAID' as const },
    { title: '先进制程芯片设计工具国产替代现状', industry: '半导体', amount: 2500, status: 'PAID' as const },
    { title: '磷酸铁锂vs三元电池技术路线对比', industry: '新能源', amount: 2000, status: 'PAID' as const },
    { title: '国内创新药出海路径与FDA审批趋势', industry: '创新药', amount: 3500, status: 'PAID' as const },
    { title: '钙钛矿光伏电池量产挑战与进度', industry: '新能源', amount: 1800, status: 'DONE' as const },
    { title: '云原生微服务架构演进最佳实践', industry: 'AI算力', amount: 2800, status: 'DONE' as const },
    { title: '大模型训练GPU集群成本优化方案', industry: 'AI算力', amount: 3000, status: 'ACTIVE' as const },
    { title: '即时零售供应链前置仓盈利模型', industry: '消费电子', amount: 1500, status: 'ACTIVE' as const },
    { title: '钠离子电池成本优势与量产进度', industry: '新能源', amount: 2200, status: 'PENDING' as const },
    { title: 'chiplet先进封装技术路径分析', industry: '半导体', amount: 2600, status: 'PENDING' as const },
  ]

  for (let i = 0; i < testOrders.length; i++) {
    const o = testOrders[i]
    const researcher = allResearchers[i % allResearchers.length]
    const expert = allActiveExperts[i % allActiveExperts.length]
    const orderNo = 'ORD-2026-' + (1000 + i)
    const expertFee = Math.round(o.amount * 0.8)
    const platformFee = o.amount - expertFee

    // Create request
    const req = await prisma.request.upsert({
      where: { orderNo },
      update: {},
      create: {
        orderNo,
        title: o.title,
        industry: o.industry,
        duration: '60分钟',
        form: '线上视频',
        budget: o.amount + '-' + (o.amount + 500),
        outline: '1. 当前市场情况如何？\n2. 主要厂商策略及变化？\n3. 未来6个月预期？',
        researcherId: researcher.id,
        expertId: expert.id,
        status: o.status === 'PENDING' ? 'MATCHING' : 'CONFIRMED',
      }
    })

    // Create order
    const paidAt = o.status === 'PAID' ? new Date(Date.now() - i * 86400000) : undefined // spread over i days ago
    const completedAt = ['PAID','DONE','ACTIVE'].includes(o.status) ? new Date(Date.now() - i * 43200000) : undefined

    await prisma.order.upsert({
      where: { requestId: req.id },
      update: {},
      create: {
        orderNo,
        requestId: req.id,
        researcherId: researcher.id,
        expertId: expert.id,
        amount: o.amount,
        expertFee,
        platformFee,
        status: o.status,
        confirmedAt: completedAt,
        completedAt: ['PAID','DONE'].includes(o.status) ? completedAt : undefined,
        paidAt,
      }
    })

    // Create PointsTransaction for PAID orders
    if (o.status === 'PAID') {
      // Deduct from researcher
      const resAfter = await prisma.user.update({
        where: { id: researcher.id },
        data: { points: { decrement: o.amount } },
      })
      await prisma.pointsTransaction.create({
        data: {
          userId: researcher.id, amount: -o.amount, type: 'SPEND_ORDER',
          description: '支付：' + o.title, refId: req.id, balance: resAfter.points,
        }
      })
      // Add to expert
      const expAfter = await prisma.user.update({
        where: { id: expert.user.id },
        data: { points: { increment: expertFee } },
      })
      await prisma.pointsTransaction.create({
        data: {
          userId: expert.user.id, amount: expertFee, type: 'EARN_LABOR',
          description: '收入：' + o.title, refId: req.id, balance: expAfter.points,
        }
      })
      // Update expert completed count
      await prisma.expert.update({
        where: { id: expert.id },
        data: { completedOrders: { increment: 1 } },
      })
    }

    // Give researchers enough initial points to pay
    await prisma.user.update({
      where: { id: researcher.id },
      data: { points: { increment: 5000 } },
    })
  }
  console.log('✅ ' + testOrders.length + '条测试订单创建成功（含积分流水）')


  console.log('\n🎉 测试账号创建完成！')
  console.log('\n登录信息：')
  console.log('  研究员: researcher@demo.com / 123456')
  console.log('  专家: expert@demo.com / 123456')
  console.log('  管理员: admin@demo.com / 123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
