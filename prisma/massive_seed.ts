import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
const p = new PrismaClient()

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function daysAgo(d: number) { return new Date(Date.now() - d * 86400000 - Math.random() * 86400000) }

async function main() {
  const pwd = await hash('123456', 10)

  // ━━━ 阶段1: 20位新专家 ━━━
  const newExperts = [
    { name:'刘智深', realName:'刘智深博士', title:'药物研发总监', org:'药明生物', years:14, region:'上海', industry1:'医药', industry2:'生物制药', roleType:'研发/工艺', tags:'ADC药物,双抗,细胞治疗,基因编辑', topics:'ADC药物研发趋势,双特异性抗体技术,细胞治疗产业化', ratePoints:3200 },
    { name:'陈思远', realName:'陈思远', title:'机器人算法首席', org:'大疆创新', years:10, region:'深圳', industry1:'机器人', industry2:'智能硬件', roleType:'研发/工艺', tags:'运动控制,SLAM,多传感器融合,ROS2', topics:'人形机器人运动控制,SLAM算法对比,多传感器融合方案', ratePoints:2800 },
    { name:'杨柳青', realName:'杨柳青', title:'碳纤维技术专家', org:'中复神鹰', years:12, region:'连云港', industry1:'新材料', industry2:'碳纤维', roleType:'企业技术专家', tags:'碳纤维,复合材料,航空航天,风电叶片', topics:'碳纤维国产替代进程,大丝束碳纤维应用,航空航天复材需求', ratePoints:2500 },
    { name:'郑明远', realName:'郑明远', title:'光伏电池CTO', org:'通威股份', years:16, region:'成都', industry1:'新能源', industry2:'光伏电池', roleType:'企业技术专家', tags:'TOPCon,HJT,钙钛矿,叠层电池', topics:'TOPCon量产路线,HJT降本路径,钙钛矿稳定性突破', ratePoints:3500 },
    { name:'林晓峰', realName:'林晓峰', title:'医疗器械注册总监', org:'迈瑞医疗', years:13, region:'深圳', industry1:'医药', industry2:'医疗器械', roleType:'管理/战略', tags:'FDA,CE,创新器械,临床评价', topics:'FDA 510k流程,创新器械绿色通道,临床评价策略', ratePoints:2600 },
    { name:'唐雅琴', realName:'唐雅琴', title:'消费电子供应链VP', org:'立讯精密', years:15, region:'昆山', industry1:'消费电子', industry2:'精密制造', roleType:'供应链', tags:'精密制造,自动化产线,质量控制,供应商管理', topics:'消费电子供应链布局,自动化产线效率,供应商评估体系', ratePoints:2400 },
    { name:'孙志刚', realName:'孙志刚', title:'氢能技术总监', org:'亿华通', years:11, region:'北京', industry1:'新能源', industry2:'氢能', roleType:'企业技术专家', tags:'燃料电池,氢能,电解水,PEM', topics:'燃料电池商用车经济性,绿氢成本路径,PEM电解槽技术', ratePoints:3000 },
    { name:'马海龙', realName:'马海龙', title:'MCU芯片架构师', org:'兆易创新', years:12, region:'北京', industry1:'半导体', industry2:'MCU', roleType:'研发/工艺', tags:'RISC-V,ARM Cortex-M,车规MCU,物联网芯片', topics:'RISC-V生态进展,车规MCU认证,物联网芯片低功耗设计', ratePoints:2700 },
    { name:'何雅文', realName:'何雅文', title:'AI制药首席科学家', org:'晶泰科技', years:9, region:'深圳', industry1:'医药', industry2:'AI制药', roleType:'研发/工艺', tags:'AI制药,分子动力学,蛋白质结构预测,虚拟筛选', topics:'AI制药落地场景,分子动力学模拟进展,蛋白质结构预测应用', ratePoints:3100 },
    { name:'罗建国', realName:'罗建国', title:'固态电池研发总监', org:'清陶能源', years:13, region:'苏州', industry1:'新能源', industry2:'固态电池', roleType:'研发/工艺', tags:'固态电池,硫化物,氧化物,锂金属负极', topics:'固态电池量产时间表,硫化物vs氧化物路线,锂金属负极挑战', ratePoints:3300 },
    { name:'彭丽华', realName:'彭丽华', title:'显示技术专家', org:'京东方', years:14, region:'北京', industry1:'消费电子', industry2:'显示面板', roleType:'企业技术专家', tags:'OLED,MicroLED,柔性显示,车载显示', topics:'OLED成本下降路径,MicroLED量产挑战,车载显示技术趋势', ratePoints:2300 },
    { name:'段永昌', realName:'段永昌', title:'硅光芯片总监', org:'曦智科技', years:8, region:'上海', industry1:'半导体', industry2:'硅光芯片', roleType:'研发/工艺', tags:'硅光,光计算,光互联,CPO', topics:'硅光芯片产业化,光计算架构对比,CPO技术路线', ratePoints:2900 },
    { name:'方晓红', realName:'方晓红', title:'临床医学总监', org:'百济神州', years:15, region:'北京', industry1:'医药', industry2:'临床研发', roleType:'管理/战略', tags:'临床试验,肿瘤免疫,PD-1,双抗', topics:'临床试验设计策略,肿瘤免疫联合用药,出海临床路径', ratePoints:3400 },
    { name:'丁志强', realName:'丁志强', title:'稀土材料专家', org:'北方稀土', years:18, region:'包头', industry1:'新材料', industry2:'稀土永磁', roleType:'企业技术专家', tags:'钕铁硼,稀土永磁,风电,新能源汽车', topics:'稀土永磁供需分析,钕铁硼技术路线,新能源汽车磁材需求', ratePoints:2200 },
    { name:'蒋文斌', realName:'蒋文斌', title:'自动驾驶感知总监', org:'小鹏汽车', years:10, region:'广州', industry1:'机器人', industry2:'自动驾驶', roleType:'研发/工艺', tags:'自动驾驶,激光雷达,4D毫米波,BEV感知', topics:'自动驾驶感知架构,激光雷达降本,BEV+Transformer方案', ratePoints:3100 },
    { name:'沈玉梅', realName:'沈玉梅', title:'疫苗研发VP', org:'智飞生物', years:16, region:'重庆', industry1:'医药', industry2:'疫苗', roleType:'企业技术专家', tags:'mRNA疫苗,重组蛋白,佐剂,临床前', topics:'mRNA疫苗技术进展,重组蛋白疫苗产业化,新型佐剂研发', ratePoints:3000 },
    { name:'韩冬青', realName:'韩冬青', title:'碳化硅器件专家', org:'天科合达', years:11, region:'北京', industry1:'半导体', industry2:'碳化硅', roleType:'企业技术专家', tags:'碳化硅,SiC衬底,功率器件,车规', topics:'碳化硅衬底国产化,SiC MOS工艺,车规认证路径', ratePoints:2600 },
    { name:'秦慧敏', realName:'秦慧敏', title:'消费品牌战略VP', org:'珀莱雅', years:12, region:'杭州', industry1:'消费电子', industry2:'消费品牌', roleType:'管理/战略', tags:'DTC,私域运营,品牌定位,消费者洞察', topics:'消费品DTC策略,私域流量运营,品牌年轻化路径', ratePoints:2000 },
    { name:'曹建民', realName:'曹建民', title:'EDA算法总监', org:'华大九天', years:14, region:'北京', industry1:'半导体', industry2:'EDA', roleType:'研发/工艺', tags:'EDA,仿真,OPC,DTCO', topics:'EDA国产替代进展,先进制程仿真,DTCO方法论', ratePoints:2800 },
    { name:'魏玉兰', realName:'魏玉兰', title:'锂电回收技术总监', org:'格林美', years:10, region:'深圳', industry1:'新能源', industry2:'电池回收', roleType:'企业技术专家', tags:'电池回收,湿法冶金,磷酸铁锂,三元', topics:'动力电池回收经济性,湿法vs火法工艺,磷酸铁锂回收技术', ratePoints:2500 },
  ]

  let expertCount = 0
  for (const e of newExperts) {
    const exists = await p.user.findUnique({ where: { email: e.name.toLowerCase() + '@expert.prolink.cn' } })
    if (exists) continue
    const user = await p.user.create({
      data: { email: e.name.toLowerCase() + '@expert.prolink.cn', name: e.name, password: pwd, role: 'EXPERT', orgName: e.org, title: e.title, points: rand(3000, 20000) }
    })
    await p.expert.create({
      data: { userId: user.id, realName: e.realName, title: e.title, org: e.org, years: e.years, region: e.region, industry1: e.industry1, industry2: e.industry2, roleType: e.roleType, tags: e.tags, topics: e.topics, ratePoints: e.ratePoints, rateHour: e.ratePoints, forms: '线上视频', status: 'ACTIVE', idVerified: true, empVerified: true, complianceSig: true, completedOrders: rand(0, 8), rating: rand(30, 50) / 10 }
    })
    expertCount++
  }
  console.log(`✅ 新增${expertCount}位专家`)

  // ━━━ 新增10位研究员 ━━━
  const newResearchers = [
    { name:'宋明哲', orgName:'易方达基金', title:'高级研究员' },
    { name:'许志豪', orgName:'华夏基金', title:'TMT研究员' },
    { name:'陆晓燕', orgName:'广发基金', title:'新能源研究员' },
    { name:'潘建平', orgName:'中信证券', title:'首席分析师' },
    { name:'梁思琪', orgName:'华泰证券', title:'医药研究员' },
    { name:'范国栋', orgName:'景林资产', title:'投资经理' },
    { name:'田海涛', orgName:'淡水泉投资', title:'半导体研究员' },
    { name:'余秋雨', orgName:'重阳投资', title:'合伙人' },
    { name:'邱志伟', orgName:'睿远基金', title:'研究总监' },
    { name:'冯雪娟', orgName:'兴证全球', title:'消费研究员' },
  ]
  let researcherCount = 0
  for (const r of newResearchers) {
    const email = r.name.toLowerCase() + '@research.prolink.cn'
    const exists = await p.user.findUnique({ where: { email } })
    if (exists) continue
    await p.user.create({
      data: { email, name: r.name, password: pwd, role: 'RESEARCHER', orgName: r.orgName, title: r.title, points: rand(5000, 25000) }
    })
    researcherCount++
  }
  console.log(`✅ 新增${researcherCount}位研究员`)

  // ━━━ 阶段2: 40条真实感订单 ━━━
  const allExperts = await p.expert.findMany({ where: { status: 'ACTIVE' }, include: { user: true } })
  const allResearchers = await p.user.findMany({ where: { role: 'RESEARCHER' } })
  const industries = ['半导体','新能源','AI算力','医药','新材料','机器人','消费电子']

  const orderTemplates = [
    { title:'先进制程EDA工具国产化替代进展调研', industry:'半导体', amount: 3200 },
    { title:'HJT vs TOPCon光伏电池量产成本对比', industry:'新能源', amount: 4000 },
    { title:'ADC药物linker-payload技术路线分析', industry:'医药', amount: 3500 },
    { title:'碳化硅衬底8英寸量产良率及成本路径', industry:'半导体', amount: 2800 },
    { title:'固态电池硫化物电解质量产工艺评估', industry:'新能源', amount: 3800 },
    { title:'微创手术机器人运动控制算法对比', industry:'机器人', amount: 2500 },
    { title:'碳纤维T1000级国产化进程及下游应用', industry:'新材料', amount: 2200 },
    { title:'mRNA疫苗LNP递送系统技术进展', industry:'医药', amount: 3000 },
    { title:'折叠屏手机盖板玻璃供应链格局', industry:'消费电子', amount: 1800 },
    { title:'SiC MOS车规认证流程及国内进展', industry:'半导体', amount: 2800 },
    { title:'钠离子电池正极材料普鲁士白vs层状氧化物', industry:'新能源', amount: 3400 },
    { title:'人形机器人关节电机技术路线及供应商格局', industry:'机器人', amount: 2600 },
    { title:'基因治疗AAV载体生产工艺优化', industry:'医药', amount: 3200 },
    { title:'钙钛矿叠层电池稳定性测试标准进展', industry:'新能源', amount: 3600 },
    { title:'RISC-V架构车规MCU芯片生态进展', industry:'半导体', amount: 2400 },
    { title:'动力电池回收湿法冶金经济性评估', industry:'新能源', amount: 2000 },
    { title:'AI制药分子生成模型实用性评估', industry:'医药', amount: 2800 },
    { title:'钕铁硼永磁材料稀土价格传导机制', industry:'新材料', amount: 1800 },
    { title:'自动驾驶4D毫米波雷达国产替代现状', industry:'机器人', amount: 3000 },
    { title:'OLED材料国产化率及供应商格局', industry:'消费电子', amount: 1600 },
    { title:'动力电池CTP/CTC结构创新对比', industry:'新能源', amount: 3200 },
    { title:'小核酸药物肝靶向递送技术进展', industry:'医药', amount: 3400 },
    { title:'硅光芯片封装技术(CPO)产业化进度', industry:'半导体', amount: 2600 },
    { title:'人形机器人灵巧手传动方案对比', industry:'机器人', amount: 2200 },
    { title:'氢能重卡经济性分析及推广障碍', industry:'新能源', amount: 2800 },
    { title:'AI芯片推理性能对比: GPU vs NPU vs LPU', industry:'半导体', amount: 3500 },
    { title:'双特异性抗体CMC工艺开发要点', industry:'医药', amount: 3000 },
    { title:'MiniLED背光TV渗透率及成本路径', industry:'消费电子', amount: 1500 },
    { title:'碳纤维缠绕工艺在IV型储氢瓶中的应用', industry:'新材料', amount: 2000 },
    { title:'手术机器人力反馈技术现状', industry:'机器人', amount: 2400 },
    { title:'锂电隔膜涂覆技术路线对比', industry:'新能源', amount: 2200 },
    { title:'Chiplet先进封装UCIe接口标准化进展', industry:'半导体', amount: 3000 },
    { title:'GLP-1多靶点药物研发竞争格局', industry:'医药', amount: 3800 },
    { title:'光伏电站功率预测AI模型评估', industry:'新能源', amount: 1800 },
    { title:'协作机器人末端执行器技术方案', industry:'机器人', amount: 2000 },
    { title:'碳陶刹车盘在新能源汽车中的应用前景', industry:'新材料', amount: 2400 },
    { title:'TWS耳机ANC降噪芯片方案对比', industry:'消费电子', amount: 1400 },
    { title:'晶圆厂AMHS自动物料搬运系统国产化', industry:'半导体', amount: 2600 },
    { title:'细胞基因治疗CAR-T实体瘤突破进展', industry:'医药', amount: 3500 },
    { title:'虚拟电厂聚合分布式储能商业模式', industry:'新能源', amount: 2200 },
  ]

  const statuses = ['PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','PAID','DONE','DONE','DONE','DONE','DONE','DONE','DONE','DONE','ACTIVE','ACTIVE','ACTIVE','ACTIVE','ACTIVE','ACTIVE','ACTIVE','PENDING','PENDING','PENDING','PENDING','PENDING','PENDING','CANCELLED','CANCELLED','CANCELLED','CANCELLED']

  let orderCount = 0
  for (let i = 0; i < orderTemplates.length; i++) {
    const t = orderTemplates[i]
    const researcher = allResearchers[i % allResearchers.length]
    // Match expert by industry
    const matchedExperts = allExperts.filter(e => e.industry1 === t.industry)
    const expert = matchedExperts.length > 0 ? pick(matchedExperts) : pick(allExperts)
    const status = statuses[i]
    const orderNo = 'ORD-2026-' + (4000 + i) + '-' + Date.now().toString(36)
    const amount = t.amount
    const expertFee = Math.round(amount * 0.8)
    const platformFee = amount - expertFee
    const createdAt = daysAgo(rand(1, 30))

    // Create request
    const req = await p.request.create({
      data: {
        orderNo, title: t.title, industry: t.industry, duration: pick(['30分钟','60分钟','90分钟']),
        form: pick(['线上语音','线上视频']), budget: `${amount-200}-${amount+300}`,
        outline: `1. 当前市场现状？\n2. 主要玩家及策略？\n3. 未来6-12个月趋势？`,
        researcherId: researcher.id, expertId: expert.id,
        status: ['PENDING','CANCELLED'].includes(status) ? 'MATCHING' : 'CONFIRMED',
        createdAt,
      }
    })

    // Create order
    const paidAt = status === 'PAID' ? new Date(createdAt.getTime() + 86400000) : undefined
    const order = await p.order.create({
      data: {
        orderNo, requestId: req.id, researcherId: researcher.id, expertId: expert.id,
        amount, expertFee, platformFee, status: status as any,
        confirmedAt: ['ACTIVE','DONE','PAID'].includes(status) ? createdAt : undefined,
        completedAt: ['DONE','PAID'].includes(status) ? new Date(createdAt.getTime() + 43200000) : undefined,
        paidAt, createdAt, updatedAt: createdAt,
      }
    })

    // PointsTransaction for PAID orders
    if (status === 'PAID') {
      // Deduct researcher
      const resAfter = await p.user.update({ where: { id: researcher.id }, data: { points: { decrement: amount } }, select: { points: true } })
      await p.pointsTransaction.create({ data: { userId: researcher.id, amount: -amount, type: 'SPEND_ORDER', description: `支付：${t.title}`, refId: req.id, balance: resAfter.points, createdAt: paidAt! } })
      // Add to expert
      const expAfter = await p.user.update({ where: { id: expert.user.id }, data: { points: { increment: expertFee } }, select: { points: true } })
      await p.pointsTransaction.create({ data: { userId: expert.user.id, amount: expertFee, type: 'EARN_LABOR', description: `收入：${t.title}`, refId: req.id, balance: expAfter.points, createdAt: paidAt! } })
      // Update expert completedOrders
      await p.expert.update({ where: { id: expert.id }, data: { completedOrders: { increment: 1 } } })
    }

    orderCount++
  }
  console.log(`✅ 新增${orderCount}条订单(含积分流水)`)

  // ━━━ 阶段3: 合规日志 ━━━
  for (let i = 0; i < 15; i++) {
    await p.complianceLog.create({
      data: { targetType: pick(['request','order','expert']), targetId: `log-${i}-${Date.now()}`, eventType: pick(['SENSITIVE_WORD_DETECTED','OUTLINE_APPROVED','EXPERT_VERIFIED','ORDER_SETTLED']), description: pick(['提纲含3个敏感词已阻断','提纲通过合规审查','专家资质三级审核完成','订单积分流水记录完成']), handled: i < 10, createdAt: daysAgo(rand(1, 25)) }
    })
  }
  console.log('✅ 新增15条合规日志')

  // 通知50条
  for (let i = 0; i < 50; i++) {
    const user = pick(allResearchers)
    await p.notification.create({
      data: { userId: user.id, type: pick(['ORDER_ASSIGNED','EXPERT_APPROVED','ORDER_COMPLETED','PAYMENT_RECEIVED']), title: pick(['新的访谈订单','审核已通过','订单已完成','积分已到账']), message: pick(['您有新的访谈订单待确认','您的专家申请已通过审核','您的订单已完成，积分已结算','您收到一笔访谈收入']), read: i > 30, createdAt: daysAgo(rand(1, 20)) }
    })
  }
  console.log('✅ 新增50条通知')

  // ━━━ 最终统计 ━━━
  const totalExperts = await p.expert.count({ where: { status: 'ACTIVE' } })
  const totalOrders = await p.order.count()
  const totalUsers = await p.user.count()
  const lbCount = await p.user.count({ where: { points: { gt: 0 } } })
  console.log(`\n📊 平台数据:`)
  console.log(`  活跃专家: ${totalExperts}`)
  console.log(`  订单总数: ${totalOrders}`)
  console.log(`  用户总数: ${totalUsers}`)
  console.log(`  排行榜: ${lbCount}人`)
  console.log(`\n🎉 数据可信度突击完成`)
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1) }).finally(() => p.$disconnect())
