import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// 演示数据清理方式：通过source="seed"字段识别，无需枚举邮箱
export async function POST() {
  try {
    const pw = await bcrypt.hash("123456", 10)

    // 清理旧seed数据 — 按source="seed" + @demo.com邮箱双重识别
    const oldSeedUsers = await prisma.user.findMany({
      where: { OR: [{ source: "seed" }, { email: { contains: "@demo.com" } }] },
      select: { id: true },
    })
    const oldIds = oldSeedUsers.map(u => u.id)
    if (oldIds.length > 0) {
      await prisma.order.deleteMany({ where: { researcherId: { in: oldIds } } })
      await prisma.request.deleteMany({ where: { researcherId: { in: oldIds } } })
      await prisma.expert.deleteMany({ where: { userId: { in: oldIds } } })
      await prisma.notification.deleteMany({ where: { userId: { in: oldIds } } })
      await prisma.pointsTransaction.deleteMany({ where: { userId: { in: oldIds } } })
      await prisma.user.deleteMany({ where: { id: { in: oldIds } } })
    }

    // 研究员邮箱前缀（只用于识别，不是中文）
    const rEmails = [
      "wangzhiyuan@demo.com", "zhangyan@demo.com", "liwei@demo.com", "chenhao@demo.com", "liuna@demo.com",
      "zhaoyang@demo.com", "sunming@demo.com", "zhouwei@demo.com", "wujie@demo.com", "xufeng@demo.com",
      "huanglei@demo.com", "linjing@demo.com", "heyun@demo.com", "guoliang@demo.com", "shennan@demo.com",
      "caoyu@demo.com", "fanwen@demo.com", "pengtao@demo.com", "tangjia@demo.com", "dongxue@demo.com",
    ]

    // ===== 20位研究员 =====
    const rData = [
      { name: "王志远", org: "东北证券", title: "电子分析师" },
      { name: "张岩", org: "广发证券", title: "新能源研究员" },
      { name: "李薇", org: "中信建投", title: "半导体研究员" },
      { name: "陈浩", org: "天风证券", title: "策略研究员" },
      { name: "刘娜", org: "国泰海通", title: "消费电子研究员" },
      { name: "赵阳", org: "华泰证券", title: "医药研究员" },
      { name: "孙明", org: "招商证券", title: "汽车研究员" },
      { name: "周伟", org: "中金公司", title: "军工研究员" },
      { name: "吴杰", org: "中信证券", title: "AI研究员" },
      { name: "徐峰", org: "国信证券", title: "机械研究员" },
      { name: "黄磊", org: "兴业证券", title: "化工研究员" },
      { name: "林静", org: "银河证券", title: "消费研究员" },
      { name: "何云", org: "光大证券", title: "通信研究员" },
      { name: "郭亮", org: "东方证券", title: "地产研究员" },
      { name: "沈楠", org: "平安证券", title: "金融研究员" },
      { name: "曹宇", org: "长城证券", title: "有色研究员" },
      { name: "范文", org: "国金证券", title: "煤炭研究员" },
      { name: "彭涛", org: "东吴证券", title: "食品饮料研究员" },
      { name: "唐佳", org: "方正证券", title: "互联网研究员" },
      { name: "董雪", org: "浙商证券", title: "传媒研究员" },
    ]
    const rUsers = []
    for (let i = 0; i < rData.length; i++) {
      const r = rData[i]
      const u = await prisma.user.create({
        data: {
          email: rEmails[i],
          name: r.name, password: pw, role: "RESEARCHER", points: 25000, orgName: r.org, title: r.title,
          source: "seed",
        },
      })
      rUsers.push(u)
    }

    // ===== 100位专家 =====
    // 邮箱用拼音，避免中文字符
    const ePinyin = [
      "zhangweiguo", "chenlixin", "liguohua", "wangjianguo", "liuyongqiang",
      "zhaodeming", "sunzhiyuan", "zhouxuejun", "wuqiming", "zhengwenjie",
      "huangzhiqiang", "linyongkang", "guojianhua", "tangguoqiang", "hezhigang",
      "shenguoping", "caodewang", "fanzhiyi", "pengchangzheng", "jiangdawei",
      "maguoliang", "fengzhiyuan", "hanxuejun", "zengdesheng", "weiguoqiang",
      "xiajianguo", "daizhiqiang", "tanguohua", "cuiyongping", "xuezhiming",
      "tangguofu", "suzhiqiang", "lujianmin", "jiangguoping", "caiguoqiang",
      "yuxuejun", "panzhiyuan", "daguohua", "daixuejun", "renzhiqiang",
      "yaojianguo", "fangzhiming", "shiguosheng", "tanzhiqiang", "liaoguohua",
      "xiongxuejun", "lujianping", "houzhiyuan", "longguohua", "duanxueming",
      "luoguoqiang", "zhongzhiyuan", "xuguoping", "huzhiqiang", "gaojianhua",
      "liangguosheng", "songzhiming", "tangxuejun", "xuguohua", "dengzhiqiang",
      "xiaojianping", "fengguoqiang", "hanzhiyuan", "caoguohua", "pengxuejun",
      "dongzhiming", "liangjianping", "suguoqiang", "panzhiyuan2", "fanxuejun",
      "tianguoping", "shizhiqiang", "tanjianping", "liaoguoqiang", "xiongzhiyuan",
      "luxueming", "houguohua", "longzhiqiang", "duanjianping", "luoxuejun",
      "zhongguoqiang", "xuzhiyuan", "hujianping", "gaozhiming", "liangguohua",
      "songxuejun", "tangguoqiang2", "xuzhiyuan2", "dengjianhua", "xiaoguoqiang",
      "fengxuejun", "hanjianping", "caozhiming", "pengguohua", "dongxuejun",
      "liangzhiyuan", "sujianping", "panguoqiang", "fanxueming", "tianzhiqiang",
    ]
    const eData = [
      // --- 半导体 (20) ---
      { p: "zhangweiguo", n: "张卫国", t: "前研发VP", o: "华为海思", y: 20, r: "深圳", i1: "半导体", i2: "芯片设计", ro: "研发/技术", rt: 4000, tg: "芯片设计,EDA,SoC", tp: "国产芯片设计,先进制程" },
      { p: "chenlixin", n: "陈立新", t: "工艺总监", o: "中芯国际", y: 18, r: "上海", i1: "半导体", i2: "晶圆代工", ro: "研发/技术", rt: 3500, tg: "晶圆代工,良率提升", tp: "晶圆产能,成熟制程扩产" },
      { p: "liguohua", n: "李国华", t: "封测技术专家", o: "长电科技", y: 16, r: "江阴", i1: "半导体", i2: "封测", ro: "研发/技术", rt: 2500, tg: "先进封装,Chiplet", tp: "先进封装技术,封测市场" },
      { p: "wangjianguo", n: "王建国", t: "存储产品线总监", o: "长江存储", y: 15, r: "武汉", i1: "半导体", i2: "存储芯片", ro: "研发/技术", rt: 3000, tg: "NAND,3D堆叠,存储", tp: "国产存储,3D NAND进展" },
      { p: "liuyongqiang", n: "刘永强", t: "销售副总", o: "韦尔股份", y: 17, r: "上海", i1: "半导体", i2: "模拟芯片", ro: "销售/市场", rt: 2800, tg: "CIS,模拟芯片", tp: "CIS市场,图像传感器" },
      { p: "zhaodeming", n: "赵德明", t: "功率器件研发总监", o: "华润微", y: 19, r: "无锡", i1: "半导体", i2: "功率器件", ro: "研发/技术", rt: 3200, tg: "MOSFET,IGBT,SiC", tp: "功率半导体,第三代半导体" },
      { p: "sunzhiyuan", n: "孙志远", t: "设备工艺经理", o: "北方华创", y: 14, r: "北京", i1: "半导体", i2: "设备", ro: "研发/技术", rt: 2700, tg: "刻蚀,薄膜沉积", tp: "国产设备替代,刻蚀设备" },
      { p: "zhouxuejun", n: "周学军", t: "材料研发总监", o: "沪硅产业", y: 16, r: "上海", i1: "半导体", i2: "材料", ro: "研发/技术", rt: 2600, tg: "硅片,光刻胶,特气", tp: "国产半导体材料,硅片产能" },
      { p: "wuqiming", n: "吴启明", t: "中国区总裁", o: "ASML", y: 22, r: "上海", i1: "半导体", i2: "光刻", ro: "管理", rt: 6000, tg: "光刻机,DUV,EUV", tp: "光刻机供应,中国半导体设备" },
      { p: "zhengwenjie", n: "郑文杰", t: "模拟IC设计总监", o: "圣邦股份", y: 15, r: "北京", i1: "半导体", i2: "模拟芯片", ro: "研发/技术", rt: 3000, tg: "模拟芯片,电源管理,信号链", tp: "国产模拟芯片,信号链进展" },
      { p: "huangzhiqiang", n: "黄志强", t: "MCU产品经理", o: "兆易创新", y: 13, r: "北京", i1: "半导体", i2: "MCU", ro: "研发/技术", rt: 2500, tg: "MCU,RISC-V,存储", tp: "国产MCU替代,RISC-V生态" },
      { p: "linyongkang", n: "林永康", t: "首席架构师", o: "地平线", y: 18, r: "北京", i1: "半导体", i2: "AI芯片", ro: "研发/技术", rt: 4500, tg: "AI芯片,NPU,自动驾驶芯片", tp: "AI芯片架构,自动驾驶芯片" },
      { p: "guojianhua", n: "郭建华", t: "战略合作总监", o: "ARM中国", y: 16, r: "上海", i1: "半导体", i2: "IP授权", ro: "销售/市场", rt: 3500, tg: "ARM架构,RISC-V,IP授权", tp: "芯片IP生态,RISC-V vs ARM" },
      { p: "tangguoqiang", n: "唐国强", t: "研发VP", o: "紫光展锐", y: 20, r: "北京", i1: "半导体", i2: "通信芯片", ro: "研发/技术", rt: 3800, tg: "5G芯片,基带,SoC", tp: "5G芯片国产化,手机SoC" },
      { p: "hezhigang", n: "何志刚", t: "副总裁", o: "澜起科技", y: 17, r: "上海", i1: "半导体", i2: "接口芯片", ro: "管理", rt: 3500, tg: "DDR5,PCIe,互联芯片", tp: "DDR5渗透率,互联芯片市场" },
      { p: "shenguoping", n: "沈国平", t: "EDA技术总监", o: "华大九天", y: 15, r: "北京", i1: "半导体", i2: "EDA", ro: "研发/技术", rt: 3000, tg: "EDA,仿真,验证", tp: "国产EDA进展,全流程工具" },
      { p: "caodewang", n: "曹德旺", t: "碳化硅事业部总经理", o: "三安光电", y: 18, r: "厦门", i1: "半导体", i2: "化合物半导体", ro: "管理", rt: 3200, tg: "SiC,GaN,化合物半导体", tp: "SiC衬底,碳化硅产能" },
      { p: "fanzhiyi", n: "范志毅", t: "前全球副总裁", o: "AMD", y: 25, r: "上海", i1: "半导体", i2: "CPU/GPU", ro: "管理", rt: 7000, tg: "CPU,GPU,高性能计算", tp: "高性能计算芯片,CPU竞争格局" },
      { p: "pengchangzheng", n: "彭长征", t: "研发总监", o: "中科曙光", y: 16, r: "北京", i1: "半导体", i2: "服务器芯片", ro: "研发/技术", rt: 3000, tg: "服务器芯片,信创CPU", tp: "信创服务器芯片,国产算力" },
      { p: "jiangdawei", n: "蒋大为", t: "光学技术专家", o: "舜宇光学", y: 14, r: "余姚", i1: "半导体", i2: "光学", ro: "研发/技术", rt: 2500, tg: "光学镜片,激光雷达,VCSEL", tp: "光学元器件,车载光学" },
      // --- 新能源 (20) ---
      { p: "maguoliang", n: "马国梁", t: "供应链副总", o: "宁德时代", y: 15, r: "宁德", i1: "新能源", i2: "锂电池", ro: "供应链", rt: 3000, tg: "锂电池,储能,动力电池", tp: "电池供应链,储能市场" },
      { p: "fengzhiyuan", n: "冯志远", t: "研究院副院长", o: "比亚迪", y: 16, r: "深圳", i1: "新能源", i2: "汽车电子", ro: "研发/技术", rt: 3500, tg: "新能源车,功率半导体", tp: "新能源车出海,智能驾驶" },
      { p: "hanxuejun", n: "韩学军", t: "运营副总", o: "隆基绿能", y: 14, r: "西安", i1: "新能源", i2: "光伏", ro: "运营/管理", rt: 2800, tg: "光伏,硅片,钙钛矿", tp: "光伏产能,全球光伏市场" },
      { p: "zengdesheng", n: "曾德胜", t: "CTO", o: "阳光电源", y: 18, r: "合肥", i1: "新能源", i2: "逆变器", ro: "研发/技术", rt: 3200, tg: "逆变器,储能系统,微电网", tp: "逆变器出海,储能系统集成" },
      { p: "weiguoqiang", n: "魏国强", t: "业务发展VP", o: "远景能源", y: 17, r: "上海", i1: "新能源", i2: "风电", ro: "销售/市场", rt: 3000, tg: "风电,海上风电,绿电", tp: "海上风电前景,风机大型化" },
      { p: "xiajianguo", n: "夏建国", t: "研发总监", o: "亿纬锂能", y: 14, r: "惠州", i1: "新能源", i2: "圆柱电池", ro: "研发/技术", rt: 2800, tg: "圆柱电池,大圆柱,4680", tp: "大圆柱电池,锂电新技术" },
      { p: "daizhiqiang", n: "戴志强", t: "海外市场总监", o: "国轩高科", y: 13, r: "合肥", i1: "新能源", i2: "磷酸铁锂", ro: "销售/市场", rt: 2500, tg: "磷酸铁锂,海外建厂", tp: "LFP出海,海外建厂趋势" },
      { p: "tanguohua", n: "谭国华", t: "副总裁", o: "天合光能", y: 19, r: "常州", i1: "新能源", i2: "光伏组件", ro: "管理", rt: 3000, tg: "光伏组件,N型,HJT,TOPCon", tp: "TOPCon vs HJT,光伏技术路线" },
      { p: "cuiyongping", n: "崔永平", t: "钠电事业部总经理", o: "中科海钠", y: 15, r: "北京", i1: "新能源", i2: "钠离子电池", ro: "管理", rt: 2800, tg: "钠离子电池,层状氧化物", tp: "钠电量产进度,成本曲线" },
      { p: "xuezhiming", n: "薛志明", t: "产品VP", o: "小鹏汽车", y: 14, r: "广州", i1: "新能源", i2: "智能驾驶", ro: "研发/技术", rt: 3500, tg: "智能驾驶,XNGP,感知方案", tp: "智能驾驶落地,纯视觉vs雷达" },
      { p: "tangguofu", n: "汤国富", t: "总经理", o: "鹏辉能源", y: 16, r: "广州", i1: "新能源", i2: "储能电池", ro: "管理", rt: 2700, tg: "储能电池,户用储能,工商业储能", tp: "储能市场,工商业储能经济性" },
      { p: "suzhiqiang", n: "苏志强", t: "研发副总", o: "璞泰来", y: 15, r: "上海", i1: "新能源", i2: "负极材料", ro: "研发/技术", rt: 2600, tg: "负极,硅基负极,人造石墨", tp: "硅基负极进展,负极材料格局" },
      { p: "lujianmin", n: "卢建民", t: "首席科学家", o: "恩捷股份", y: 20, r: "珠海", i1: "新能源", i2: "隔膜", ro: "研发/技术", rt: 3000, tg: "隔膜,涂覆,湿法", tp: "隔膜产能,干法vs湿法" },
      { p: "jiangguoping", n: "蒋国平", t: "运营总经理", o: "华友钴业", y: 18, r: "桐乡", i1: "新能源", i2: "锂电材料", ro: "运营/管理", rt: 2800, tg: "前驱体,正极,镍钴锂", tp: "锂电上游资源,前驱体格局" },
      { p: "caiguoqiang", n: "蔡国强", t: "战略VP", o: "蔚来汽车", y: 14, r: "上海", i1: "新能源", i2: "换电", ro: "战略", rt: 3500, tg: "换电,NIO Power,充换电网络", tp: "换电模式经济性,充换电网络布局" },
      { p: "yuxuejun", n: "余学军", t: "氢能事业部总经理", o: "亿华通", y: 16, r: "北京", i1: "新能源", i2: "氢能", ro: "管理", rt: 3000, tg: "燃料电池,绿氢,电解槽", tp: "氢能产业进展,燃料电池降本" },
      { p: "panzhiyuan", n: "潘志远", t: "全球销售总监", o: "金风科技", y: 17, r: "北京", i1: "新能源", i2: "风电装备", ro: "销售/市场", rt: 2800, tg: "风电机组,叶片,齿轮箱", tp: "风机出海,风电零部件" },
      { p: "daguohua", n: "杜国华", t: "矿产资源总监", o: "赣锋锂业", y: 15, r: "新余", i1: "新能源", i2: "锂矿", ro: "供应链", rt: 3000, tg: "锂矿,盐湖提锂,锂价", tp: "锂供需,锂矿资源" },
      { p: "daixuejun", n: "戴学军", t: "技术VP", o: "理想汽车", y: 13, r: "北京", i1: "新能源", i2: "增程", ro: "研发/技术", rt: 3200, tg: "增程,纯电,高压平台", tp: "增程vs纯电,高压快充" },
      { p: "renzhiqiang", n: "任志强", t: "副董事长", o: "通威股份", y: 22, r: "成都", i1: "新能源", i2: "多晶硅", ro: "管理", rt: 3500, tg: "多晶硅,硅料,一体化", tp: "硅料价格走势,光伏一体化" },
      // --- 人工智能 (20) ---
      { p: "yaojianguo", n: "姚建国", t: "合伙人", o: "高榕资本", y: 12, r: "上海", i1: "人工智能", i2: "大模型", ro: "投资", rt: 4500, tg: "大模型,AIGC,AI应用", tp: "AI商业化,大模型竞争" },
      { p: "fangzhiming", n: "方志明", t: "VP Sales", o: "英伟达", y: 15, r: "上海", i1: "人工智能", i2: "算力", ro: "销售/市场", rt: 5500, tg: "GPU,算力,数据中心", tp: "算力需求趋势,GPU市场" },
      { p: "shiguosheng", n: "石国胜", t: "CEO", o: "云从科技", y: 16, r: "广州", i1: "人工智能", i2: "视觉", ro: "管理", rt: 4000, tg: "AI视觉,智慧城市", tp: "AI视觉商业化" },
      { p: "tanzhiqiang", n: "谭志强", t: "产品VP", o: "百度", y: 18, r: "北京", i1: "人工智能", i2: "大模型", ro: "研发/技术", rt: 5000, tg: "文心一言,国产大模型,搜索", tp: "国产大模型差距,搜索革新" },
      { p: "liaoguohua", n: "廖国华", t: "技术总监", o: "商汤科技", y: 14, r: "深圳", i1: "人工智能", i2: "计算机视觉", ro: "研发/技术", rt: 3500, tg: "CV,多模态,大装置", tp: "多模态进展,AI大装置" },
      { p: "xiongxuejun", n: "熊学军", t: "算法VP", o: "科大讯飞", y: 17, r: "合肥", i1: "人工智能", i2: "NLP", ro: "研发/技术", rt: 3800, tg: "NLP,语音识别,大模型", tp: "语音AI,大模型教育应用" },
      { p: "lujianping", n: "陆建平", t: "中国区总裁", o: "OpenAI", y: 20, r: "北京", i1: "人工智能", i2: "AGI", ro: "管理", rt: 8000, tg: "GPT,AGI,多模态", tp: "AGI进展,AI安全" },
      { p: "houzhiyuan", n: "侯志远", t: "首席科学家", o: "智谱AI", y: 16, r: "北京", i1: "人工智能", i2: "大模型", ro: "研发/技术", rt: 4500, tg: "GLM,开源大模型", tp: "开源大模型生态,国产大模型" },
      { p: "longguohua", n: "龙国华", t: "AI产品VP", o: "字节跳动", y: 14, r: "北京", i1: "人工智能", i2: "AI应用", ro: "产品", rt: 4500, tg: "豆包,推荐系统,AIGC", tp: "AI产品化,AIGC流量" },
      { p: "duanxueming", n: "段学明", t: "研发VP", o: "阿里云", y: 17, r: "杭州", i1: "人工智能", i2: "云计算", ro: "研发/技术", rt: 4200, tg: "通义千问,云原生,AI infra", tp: "AI Infra,云计算竞争" },
      { p: "luoguoqiang", n: "罗国强", t: "创业CEO", o: "月之暗面", y: 13, r: "北京", i1: "人工智能", i2: "AI助手", ro: "管理", rt: 4000, tg: "Kimi,长文本,AI对话", tp: "AI助手竞争,长文本应用" },
      { p: "zhongzhiyuan", n: "钟志远", t: "技术VP", o: "旷视科技", y: 15, r: "北京", i1: "人工智能", i2: "AIoT", ro: "研发/技术", rt: 3000, tg: "AIoT,机器人,智慧物流", tp: "AIoT落地,机器人场景" },
      { p: "xuguoping", n: "徐国平", t: "首席AI科学家", o: "腾讯", y: 18, r: "深圳", i1: "人工智能", i2: "大模型", ro: "研发/技术", rt: 5500, tg: "混元,微信AI,推荐", tp: "社交AI,大模型应用场景" },
      { p: "huzhiqiang", n: "胡志强", t: "机器人事业部总经理", o: "小米", y: 16, r: "北京", i1: "人工智能", i2: "机器人", ro: "管理", rt: 3500, tg: "仿生机器人,CyberDog,铁大", tp: "仿生机器人进展,人形机器人" },
      { p: "gaojianhua", n: "高建华", t: "VP研发", o: "寒武纪", y: 14, r: "北京", i1: "人工智能", i2: "AI芯片", ro: "研发/技术", rt: 3500, tg: "AI训练芯片,推理芯片", tp: "国产AI训练芯片,推理降本" },
      { p: "liangguosheng", n: "梁国胜", t: "创始人", o: "百川智能", y: 18, r: "北京", i1: "人工智能", i2: "大模型", ro: "管理", rt: 5000, tg: "百川,搜索增强,垂直模型", tp: "垂直大模型,搜索增强" },
      { p: "songzhiming", n: "宋志明", t: "AI Lab主任", o: "快手", y: 15, r: "北京", i1: "人工智能", i2: "视频理解", ro: "研发/技术", rt: 3200, tg: "视频理解,可灵,AIGC视频", tp: "AIGC视频进展,视频内容理解" },
      { p: "tangxuejun", n: "唐学军", t: "首席架构师", o: "第四范式", y: 16, r: "北京", i1: "人工智能", i2: "AutoML", ro: "研发/技术", rt: 3000, tg: "AutoML,决策智能,企业AI", tp: "企业AI落地,决策智能" },
      { p: "xuguohua", n: "许国华", t: "算法负责人", o: "MiniMax", y: 12, r: "上海", i1: "人工智能", i2: "多模态", ro: "研发/技术", rt: 4000, tg: "多模态,语音,视频生成", tp: "视频生成,Sora竞争" },
      { p: "dengzhiqiang", n: "邓志强", t: "VP", o: "华为云", y: 19, r: "深圳", i1: "人工智能", i2: "AI平台", ro: "销售/市场", rt: 4500, tg: "昇腾,ModelArts,盘古大模型", tp: "昇腾生态,华为AI全栈" },
      // --- 医药 (20) ---
      { p: "xiaojianping", n: "肖建平", t: "研发总裁", o: "百济神州", y: 20, r: "上海", i1: "医药", i2: "创新药", ro: "研发/技术", rt: 5000, tg: "BTK,PD-1,双抗,ADC", tp: "创新药出海,ADC赛道" },
      { p: "fengguoqiang", n: "冯国强", t: "首席医学官", o: "恒瑞医药", y: 22, r: "上海", i1: "医药", i2: "肿瘤药", ro: "研发/技术", rt: 4500, tg: "肿瘤药,创新药,集采", tp: "创新药研发,集采影响" },
      { p: "hanzhiyuan", n: "韩志远", t: "CDMO业务VP", o: "药明康德", y: 17, r: "上海", i1: "医药", i2: "CXO", ro: "销售/市场", rt: 3500, tg: "CXO,CDMO,化学药", tp: "CXO景气度,融资环境" },
      { p: "caoguohua", n: "曹国华", t: "生物药工艺总监", o: "信达生物", y: 15, r: "苏州", i1: "医药", i2: "抗体药", ro: "研发/技术", rt: 3200, tg: "单抗,双抗,生物类似药", tp: "生物药工艺,双抗开发" },
      { p: "pengxuejun", n: "彭学军", t: "CMO", o: "康希诺", y: 18, r: "天津", i1: "医药", i2: "疫苗", ro: "研发/技术", rt: 3500, tg: "mRNA疫苗,腺病毒,流脑", tp: "mRNA技术平台,疫苗管线" },
      { p: "dongzhiming", n: "董志明", t: "研发副总", o: "智飞生物", y: 16, r: "重庆", i1: "医药", i2: "疫苗代理", ro: "研发/技术", rt: 2800, tg: "HPV疫苗,肺炎疫苗,代理", tp: "HPV疫苗市场,国产替代" },
      { p: "liangjianping", n: "梁建平", t: "创始人CEO", o: "君实生物", y: 19, r: "上海", i1: "医药", i2: "免疫治疗", ro: "管理", rt: 4000, tg: "PD-1,特瑞普利,国际化", tp: "PD-1竞争格局,出海进展" },
      { p: "suguoqiang", n: "苏国强", t: "中药研究院院长", o: "片仔癀", y: 25, r: "漳州", i1: "医药", i2: "中药", ro: "研发/技术", rt: 3000, tg: "中药,天然药物,品牌中药", tp: "中药品牌化,中药现代化" },
      { p: "panzhiyuan2", n: "潘志远", t: "医疗器械VP", o: "迈瑞医疗", y: 16, r: "深圳", i1: "医药", i2: "医疗器械", ro: "销售/市场", rt: 3500, tg: "监护仪,超声,体外诊断", tp: "医疗设备出海,国产替代" },
      { p: "fanxuejun", n: "范学军", t: "研发VP", o: "联影医疗", y: 18, r: "上海", i1: "医药", i2: "影像设备", ro: "研发/技术", rt: 3800, tg: "CT,MRI,分子影像", tp: "高端影像国产化,AI辅助诊断" },
      { p: "tianguoping", n: "田国平", t: "临床运营总监", o: "康龙化成", y: 14, r: "北京", i1: "医药", i2: "CRO", ro: "研发/技术", rt: 2800, tg: "CRO,临床试验,SMO", tp: "CRO行业景气度,全球临床试验" },
      { p: "shizhiqiang", n: "石志强", t: "VP", o: "荣昌生物", y: 17, r: "烟台", i1: "医药", i2: "ADC", ro: "研发/技术", rt: 3500, tg: "ADC,HER2,双抗ADC", tp: "ADC赛道,TROP2等靶点" },
      { p: "tanjianping", n: "谭建平", t: "质控总监", o: "长春高新", y: 20, r: "长春", i1: "医药", i2: "生长激素", ro: "研发/技术", rt: 3000, tg: "生长激素,重组蛋白", tp: "生长激素市场,集采影响" },
      { p: "liaoguoqiang", n: "廖国强", t: "创始人", o: "华大基因", y: 22, r: "深圳", i1: "医药", i2: "基因测序", ro: "管理", rt: 4000, tg: "基因测序,生育健康,肿瘤早筛", tp: "基因测序前景,肿瘤早筛" },
      { p: "xiongzhiyuan", n: "熊志远", t: "业务VP", o: "爱尔眼科", y: 15, r: "长沙", i1: "医药", i2: "眼科", ro: "运营/管理", rt: 2800, tg: "眼科,屈光,白内障,视光", tp: "眼科连锁扩张,消费医疗" },
      { p: "luxueming", n: "陆学明", t: "首席科学家", o: "复星医药", y: 21, r: "上海", i1: "医药", i2: "生物药", ro: "研发/技术", rt: 4000, tg: "CAR-T,生物药,许可引进", tp: "CAR-T进展,生物药许可引进" },
      { p: "houguohua", n: "侯国华", t: "CMO", o: "科伦博泰", y: 16, r: "成都", i1: "医药", i2: "创新药", ro: "研发/技术", rt: 3200, tg: "ADC,SKB,创新管线", tp: "ADC出海,Milestone交易" },
      { p: "longzhiqiang", n: "龙志强", t: "业务发展VP", o: "诺华中国", y: 18, r: "上海", i1: "医药", i2: "跨国药企", ro: "业务发展", rt: 4000, tg: "许可引进,BD交易,中国策略", tp: "MNC中国策略,license-in/out" },
      { p: "duanjianping", n: "段建平", t: "院长", o: "三九医药", y: 24, r: "深圳", i1: "医药", i2: "OTC", ro: "管理", rt: 3000, tg: "OTC,品牌药,中药配方颗粒", tp: "OTC市场,中药配方颗粒" },
      { p: "luoxuejun", n: "罗学军", t: "创新中心总经理", o: "阿斯利康中国", y: 19, r: "上海", i1: "医药", i2: "肿瘤免疫", ro: "管理", rt: 4500, tg: "免疫治疗,联合用药,肿瘤", tp: "肿瘤免疫联合疗法,全球肿瘤研发" },
      // --- 消费电子/汽车/其他 (20) ---
      { p: "zhongguoqiang", n: "钟国强", t: "产品VP", o: "OPPO", y: 16, r: "深圳", i1: "消费电子", i2: "手机", ro: "产品", rt: 3000, tg: "智能手机,折叠屏,影像", tp: "折叠屏趋势,手机市场" },
      { p: "xuzhiyuan", n: "徐志远", t: "研发副总裁", o: "小米", y: 17, r: "北京", i1: "消费电子", i2: "IoT", ro: "研发/技术", rt: 3200, tg: "IoT,智能家居,生态链", tp: "IoT生态,智能家居互联" },
      { p: "hujianping", n: "胡建平", t: "全球供应链VP", o: "苹果", y: 22, r: "深圳", i1: "消费电子", i2: "供应链", ro: "供应链", rt: 6000, tg: "富士康,立讯精密,供应链转移", tp: "果链,供应链迁移,立讯" },
      { p: "gaozhiming", n: "高志明", t: "创始人CEO", o: "大疆创新", y: 18, r: "深圳", i1: "消费电子", i2: "无人机", ro: "管理", rt: 4000, tg: "无人机,相机云台,机器人", tp: "无人机市场,美国制裁影响" },
      { p: "liangguohua", n: "梁国华", t: "研发总监", o: "京东方", y: 19, r: "北京", i1: "消费电子", i2: "面板", ro: "研发/技术", rt: 3000, tg: "OLED,液晶面板,柔性屏", tp: "面板周期,OLED渗透率" },
      { p: "songxuejun", n: "宋学军", t: "产品线总裁", o: "联想", y: 20, r: "北京", i1: "消费电子", i2: "PC", ro: "管理", rt: 2800, tg: "PC,AIPC,服务器", tp: "AIPC渗透率,PC市场复苏" },
      { p: "tangguoqiang2", n: "唐国强", t: "自动驾驶副总裁", o: "百度Apollo", y: 16, r: "北京", i1: "汽车", i2: "无人驾驶", ro: "研发/技术", rt: 4000, tg: "Robotaxi,自动驾驶,L4", tp: "Robotaxi商业化,武汉模式" },
      { p: "xuzhiyuan2", n: "许志远", t: "VP", o: "禾赛科技", y: 14, r: "上海", i1: "汽车", i2: "激光雷达", ro: "研发/技术", rt: 3500, tg: "激光雷达,ADAS,固态激光", tp: "激光雷达降本,ADAS渗透" },
      { p: "dengjianhua", n: "邓建华", t: "CEO", o: "地平线", y: 17, r: "北京", i1: "汽车", i2: "汽车芯片", ro: "管理", rt: 5000, tg: "征程,J5,智驾方案", tp: "汽车芯片,智驾方案" },
      { p: "xiaoguoqiang", n: "肖国强", t: "业务VP", o: "德赛西威", y: 15, r: "惠州", i1: "汽车", i2: "智能座舱", ro: "销售/市场", rt: 2800, tg: "智能座舱,域控,OTA", tp: "智能座舱趋势,域控制器" },
      { p: "fengxuejun", n: "冯学军", t: "三电技术总监", o: "汇川技术", y: 17, r: "深圳", i1: "汽车", i2: "电驱", ro: "研发/技术", rt: 3000, tg: "电驱,电控,电机,SiC", tp: "电驱系统,SiC车载应用" },
      { p: "hanjianping", n: "韩建平", t: "创始人", o: "菜鸟网络", y: 16, r: "杭州", i1: "物流", i2: "智慧物流", ro: "管理", rt: 3500, tg: "快递,仓储自动化,即时配送", tp: "智慧物流,物流自动化" },
      { p: "caozhiming", n: "曹志明", t: "供应链VP", o: "京东", y: 18, r: "北京", i1: "电商", i2: "供应链", ro: "运营/管理", rt: 4000, tg: "京东物流,供应链,自营", tp: "电商供应链,即时零售" },
      { p: "pengguohua", n: "彭国华", t: "CEO", o: "Shein", y: 15, r: "广州", i1: "电商", i2: "跨境电商", ro: "管理", rt: 4500, tg: "Shein,Temu,快时尚,跨境", tp: "跨境电商,快时尚DTC" },
      { p: "dongxuejun", n: "董学军", t: "副总裁", o: "华为", y: 21, r: "深圳", i1: "ICT", i2: "企业服务", ro: "销售/市场", rt: 5000, tg: "5G,企业BG,云与AI", tp: "5G应用,华为企业业务" },
      { p: "liangzhiyuan", n: "梁志远", t: "中国区总经理", o: "SAP", y: 19, r: "上海", i1: "企业服务", i2: "ERP", ro: "销售/市场", rt: 4000, tg: "ERP,SaaS,数字化转型", tp: "企业SaaS,国产替代" },
      { p: "sujianping", n: "苏建平", t: "创始人", o: "PingCAP", y: 14, r: "北京", i1: "数据库", i2: "分布式", ro: "管理", rt: 3500, tg: "TiDB,分布式数据库,HTAP", tp: "国产数据库,分布式替代" },
      { p: "panguoqiang", n: "潘国强", t: "CEO", o: "金山办公", y: 20, r: "珠海", i1: "办公软件", i2: "AI办公", ro: "管理", rt: 3500, tg: "WPS,AIGC,协同办公", tp: "AI+办公,协同办公竞争" },
      { p: "fanxueming", n: "范学明", t: "研究院院长", o: "海康威视", y: 22, r: "杭州", i1: "安防", i2: "AIoT", ro: "研发/技术", rt: 3800, tg: "安防,AOI,热成像", tp: "安防AI化,工业视觉" },
      { p: "tianzhiqiang", n: "田志强", t: "VP", o: "中兴通讯", y: 18, r: "深圳", i1: "通信", i2: "5G/6G", ro: "研发/技术", rt: 3000, tg: "5G,6G,光通信", tp: "5G-A,6G研究进展" },
    ]

    const experts = []
    for (const e of eData) {
      const u = await prisma.user.create({
        data: {
          email: `${e.p}@demo.com`, name: e.n, password: pw, role: "EXPERT",
          points: e.rt * 2, orgName: e.o, title: e.t, source: "seed",
        },
      })
      const ex = await prisma.expert.create({
        data: {
          userId: u.id, realName: e.n, title: e.t, org: e.o, years: e.y,
          region: e.r, industry1: e.i1, industry2: e.i2, roleType: e.ro,
          tags: e.tg, topics: e.tp,
          forms: "电话访谈,视频会议,线下走访",
          ratePoints: e.rt, rateHour: e.rt,
          status: "ACTIVE", reviewStatus: "APPROVED", complianceSig: true,
          completedOrders: 3 + (eData.indexOf(e) % 10),
          rating: parseFloat((4 + (eData.indexOf(e) % 10) * 0.1).toFixed(1)),
        },
      })
      experts.push(ex)
    }

    // ===== 20个需求（每个研究员1个） =====
    const reqTitles = [
      "MLCC行业供需格局与涨价趋势", "钠离子电池量产进度与成本调研",
      "国产AI芯片生态发展现状", "光伏产业链出海壁垒调研",
      "大模型在金融行业应用进展", "SiC功率器件国产替代前景",
      "储能系统集成市场格局与竞争分析", "创新药出海趋势与FDA审批",
      "智能驾驶方案对比与产业链格局", "折叠屏手机供应链投资机会",
      "风电零部件出海与海上风电前景", "半导体设备国产替代进展追踪",
      "ADC药物研发趋势与商业化前景", "AI算力需求分析与GPU供应链",
      "汽车电子国产化进展与格局", "跨境电商竞争格局与模式比较",
      "光伏技术路线之争：TOPCon vs HJT", "信创数据库替代趋势评估",
      "机器人产业链投资机会分析", "氢能产业发展趋势与商业化路径",
    ]
    const indList = ["半导体","新能源","人工智能","新能源","人工智能","半导体","新能源","医药","汽车","消费电子",
                     "新能源","半导体","医药","人工智能","汽车","电商","新能源","企业服务","人工智能","新能源"]
    const subList = ["MLCC","钠离子","AI芯片","光伏","大模型","SiC","储能","创新药","智驾","折叠屏",
                     "风电","半导体设备","ADC","AI算力","汽车电子","跨境电商","光伏","数据库","机器人","氢能"]
    const reqs = []
    for (let i = 0; i < rUsers.length; i++) {
      const oNo = `ORD-2026-${8000 + i}`
      const created = new Date(Date.now() - (rUsers.length - i) * 86400000)
      const req = await prisma.request.create({
        data: {
          orderNo: oNo, title: reqTitles[i], industry: indList[i], subField: subList[i],
          duration: "60分钟", form: "线上视频", budget: "6000-12000",
          outline: "1. 行业现状？\n2. 竞争格局？\n3. 发展趋势？\n4. 投资要点？",
          forbidden: "", status: "MATCHING",
          researcherId: rUsers[i].id, createdAt: created,
        },
      })
      reqs.push(req)
    }

    // ===== 10个订单 =====
    for (let i = 0; i < 10; i++) {
      const ei = i * 10  // 取不同专家
      const ri = i % rUsers.length
      const amt = [5000, 6000, 7000, 8000, 10000, 12000, 15000, 20000, 25000, 30000][i]
      const statusArr: any[] = ["ACTIVE", "DONE", "PAID", "ACTIVE", "DONE", "PAID", "DONE", "PAID", "ACTIVE", "DONE"]
      const st = statusArr[i]
      const cf = new Date(Date.now() - (10 - i) * 86400000 + 3600000)
      const cp = new Date(Date.now() - (10 - i) * 86400000 + 7200000)
      await prisma.order.create({
        data: {
          orderNo: reqs[i].orderNo,
          requestId: reqs[i].id,
          researcherId: rUsers[ri].id,
          expertId: experts[ei]?.id,
          amount: amt, expertFee: Math.round(amt * 0.8), platformFee: Math.round(amt * 0.2),
          status: st,
          confirmedAt: st !== "ACTIVE" ? cf : null,
          completedAt: st !== "ACTIVE" ? cp : null,
          paidAt: st === "PAID" ? new Date(Date.now() - (10 - i) * 86400000 + 7 * 86400000) : null,
        },
      })
    }

    // ===== 管理员账户 =====
    const adminExists = await prisma.user.findUnique({ where: { email: "admin@prolink.com" } })
    if (!adminExists) {
      await prisma.user.create({
        data: { email: "admin@prolink.com", name: "平台管理员", password: pw, role: "ADMIN", source: "seed" },
      })
    }

    return NextResponse.json({
      message: "演示数据填充完成",
      researchers: rUsers.length,
      experts: experts.length,
      requests: reqs.length,
      orders: 10,
      admin: "admin@prolink.com / 123456",
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
