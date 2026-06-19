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

  console.log('\n🎉 测试账号创建完成！')
  console.log('\n登录信息：')
  console.log('  研究员: researcher@demo.com / 123456')
  console.log('  专家: expert@demo.com / 123456')
  console.log('  管理员: admin@demo.com / 123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
