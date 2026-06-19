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
      rateHour: 3000,
      forms: '电话访谈,视频会议',
      idVerified: true,
      empVerified: true,
      interviewDone: true,
      complianceSig: true,
      status: 'ACTIVE',
    },
  })
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
    },
  })
  console.log('✅ 管理员账号创建成功:', admin.email)

  // 4. 创建5位演示专家（含完整标签/报价/档期）
  const demoExperts = [
    { email: 'zhangwei@demo.com', name: '张伟', realName: '张伟博士', title: '芯片设计总监', org: '华为海思半导体', years: 15, region: '上海', industry1: '半导体', industry2: '芯片设计', roleType: '研发/工艺', tags: '芯片设计,EDA工具,先进制程,AI芯片,异构计算', topics: '先进制程芯片设计趋势,EDA工具国产替代现状,AI芯片架构对比,chiplet技术路径', rateHour: 250000, forms: '线上视频,线下走访', availableTime: '工作日14:00-18:00' },
    { email: 'lifang@demo.com', name: '李芳', realName: '李芳', title: '电池技术副总工', org: '宁德时代', years: 12, region: '宁德', industry1: '新能源', industry2: '动力电池', roleType: '企业技术专家', tags: '动力电池,固态电池,磷酸铁锂,钠离子电池,电池回收', topics: '磷酸铁锂vs三元技术路线,固态电池量产进度,钠离子电池成本优势,电池梯次利用商业模式', rateHour: 200000, forms: '线上语音,线上视频', availableTime: '周三/周五全天' },
    { email: 'wangqiang@demo.com', name: '王强', realName: '王强', title: '临床研发总监', org: '恒瑞医药', years: 18, region: '苏州', industry1: '创新药', industry2: '生物制药', roleType: '研发/工艺', tags: '创新药,临床试验,肿瘤免疫,生物类似药,license-in', topics: '国内创新药出海路径,PD-1赛道格局,ADC药物研发趋势,license-in vs 自研决策', rateHour: 350000, forms: '线上视频', availableTime: '工作日全天' },
    { email: 'zhaomin@demo.com', name: '赵敏', realName: '赵敏', title: '供应链总经理', org: '京东物流', years: 14, region: '北京', industry1: '消费电子', industry2: '消费零售', roleType: '供应链', tags: '供应链管理,仓储物流,渠道分销,库存优化,直播电商', topics: '即时零售供应链布局,前置仓盈利模型,全渠道库存协同,直播电商供应链挑战', rateHour: 180000, forms: '线上语音,线下走访', availableTime: '周一～周四 10:00-16:00' },
    { email: 'chenjie@demo.com', name: '陈杰', realName: '陈杰', title: 'SaaS架构首席专家', org: '字节跳动', years: 11, region: '北京', industry1: 'AI算力', industry2: '企业软件', roleType: '管理/战略', tags: 'SaaS架构,云原生,微服务,AI PaaS,大模型应用', topics: '云原生架构演进最佳实践,大模型在SaaS产品中落地,企业级AI PaaS平台建设,微服务治理经验', rateHour: 280000, forms: '线上语音,线上视频,线下走访', availableTime: '工作日 9:00-17:00' },
  ]

  for (const e of demoExperts) {
    const pwd = await hash('123456', 10)
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: { password: pwd },
      create: { email: e.email, name: e.name, password: pwd, role: 'EXPERT', orgName: e.org, title: e.title },
    })
    const expert = await prisma.expert.upsert({
      where: { userId: user.id },
      update: {
        realName: e.realName, title: e.title, org: e.org, years: e.years, region: e.region,
        industry1: e.industry1, industry2: e.industry2, roleType: e.roleType,
        tags: e.tags, topics: e.topics, rateHour: e.rateHour, forms: e.forms,
        availableTime: e.availableTime,
        idVerified: true, empVerified: true, interviewDone: true, complianceSig: true,
        status: 'ACTIVE',
      },
      create: {
        userId: user.id, realName: e.realName, title: e.title, org: e.org,
        years: e.years, region: e.region, industry1: e.industry1, industry2: e.industry2,
        roleType: e.roleType, tags: e.tags, topics: e.topics,
        rateHour: e.rateHour, forms: e.forms, availableTime: e.availableTime,
        idVerified: true, empVerified: true, interviewDone: true, complianceSig: true,
        status: 'ACTIVE',
      },
    })
  }
  console.log('✅ 5位演示专家创建成功')

  console.log('\n🎉 测试账号创建完成！')
  console.log('\n登录信息：')
  console.log('  研究员: researcher@demo.com / 123456')
  console.log('  专家: expert@demo.com / 123456')
  console.log('  管理员: admin@demo.com / 123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
