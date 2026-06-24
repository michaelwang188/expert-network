import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// 演示数据邮箱列表（用来识别哪些是可清理的seed数据）
const SEED_EMAILS = [
  // 研究员 (20)
  "wangzhiyuan@demo.com", "zhangyan@demo.com", "liwei@demo.com", "chenhao@demo.com", "liuna@demo.com",
  "zhaoyang@demo.com", "sunming@demo.com", "zhouwei@demo.com", "wujie@demo.com", "xufeng@demo.com",
  "huanglei@demo.com", "linjing@demo.com", "heyun@demo.com", "guoliang@demo.com", "shennan@demo.com",
  "caoyu@demo.com", "fanwen@demo.com", "pengtao@demo.com", "tangjia@demo.com", "dongxue@demo.com",
  // 专家 (100) — 用前缀 expert_ 后面跟名字
  ...["张卫国","陈立新","李国华","王建国","刘永强","赵德明","孙志远","周学军","吴启明","郑文杰",
      "黄志强","林永康","郭建华","唐国强","何志刚","沈国平","曹德旺","范志毅","彭长征","蒋大为",
      "马国梁","冯志远","韩学军","曾德胜","魏国强","夏建国","戴志强","谭国华","崔永平","薛志明",
      "汤国富","苏志强","卢建民","蒋国平","蔡国强","余学军","潘志远","杜国华","戴学军","任志强",
      "姚建国","方志明","石国胜","谭志强","廖国华","熊学军","陆建平","侯志远","龙国华","段学明",
      "罗国强","钟志远","徐国平","胡志强","高建华","梁国胜","宋志明","唐学军","许国华","邓志强",
      "肖建平","冯国强","韩志远","曹国华","彭学军","董志明","梁建平","苏国强","潘志远","范学军",
      "田国平","石志强","谭建平","廖国强","熊志远","陆学明","侯国华","龙志强","段建平","罗学军",
      "钟国强","徐志远","胡建平","高志明","梁国华","宋学军","唐国强","许志远","邓建华","肖国强",
      "冯学军","韩建平","曹志明","彭国华","董学军","梁志远","苏建平","潘国强","范学明","田志强",
  ].map(n => `expert_${n}@demo.com`),
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
      const email = `researcher${i+1}@demo.com`  // 统一格式，但保留旧邮箱也可
      const u = await prisma.user.create({
        data: {
          email: ["wangzhiyuan@demo.com","zhangyan@demo.com","liwei@demo.com","chenhao@demo.com","liuna@demo.com",
                  "zhaoyang@demo.com","sunming@demo.com","zhouwei@demo.com","wujie@demo.com","xufeng@demo.com",
                  "huanglei@demo.com","linjing@demo.com","heyun@demo.com","guoliang@demo.com","shennan@demo.com",
                  "caoyu@demo.com","fanwen@demo.com","pengtao@demo.com","tangjia@demo.com","dongxue@demo.com"][i],
          name: r.name, password: pw, role: "RESEARCHER", points: 25000, orgName: r.org, title: r.title,
          source: "seed",
        },
      })
      rUsers.push(u)
    }

    // ===== 100位专家 =====
    // 按行业分组：半导体20, 新能源20, 人工智能20, 医药20, 消费电子/汽车/其他20
    const eData = [
      // --- 半导体 (20) ---
      { name: "张卫国", title: "前研发VP", org: "华为海思", yrs: 20, reg: "深圳", i1: "半导体", i2: "芯片设计", rol: "研发/技术", rate: 4000, tag: "芯片设计,EDA,SoC", top: "国产芯片设计,先进制程" },
      { name: "陈立新", title: "工艺总监", org: "中芯国际", yrs: 18, reg: "上海", i1: "半导体", i2: "晶圆代工", rol: "研发/技术", rate: 3500, tag: "晶圆代工,良率提升", top: "晶圆产能,成熟制程扩产" },
      { name: "李国华", title: "封测技术专家", org: "长电科技", yrs: 16, reg: "江阴", i1: "半导体", i2: "封测", rol: "研发/技术", rate: 2500, tag: "先进封装,Chiplet", top: "先进封装技术,封测市场" },
      { name: "王建国", title: "存储产品线总监", org: "长江存储", yrs: 15, reg: "武汉", i1: "半导体", i2: "存储芯片", rol: "研发/技术", rate: 3000, tag: "NAND,3D堆叠,存储", top: "国产存储,3D NAND进展" },
      { name: "刘永强", title: "销售副总", org: "韦尔股份", yrs: 17, reg: "上海", i1: "半导体", i2: "模拟芯片", rol: "销售/市场", rate: 2800, tag: "CIS,模拟芯片", top: "CIS市场,图像传感器" },
      { name: "赵德明", title: "功率器件研发总监", org: "华润微", yrs: 19, reg: "无锡", i1: "半导体", i2: "功率器件", rol: "研发/技术", rate: 3200, tag: "MOSFET,IGBT,SiC", top: "功率半导体,第三代半导体" },
      { name: "孙志远", title: "设备工艺经理", org: "北方华创", yrs: 14, reg: "北京", i1: "半导体", i2: "设备", rol: "研发/技术", rate: 2700, tag: "刻蚀,薄膜沉积", top: "国产设备替代,刻蚀设备" },
      { name: "周学军", title: "材料研发总监", org: "沪硅产业", yrs: 16, reg: "上海", i1: "半导体", i2: "材料", rol: "研发/技术", rate: 2600, tag: "硅片,光刻胶,特气", top: "国产半导体材料,硅片产能" },
      { name: "吴启明", title: "中国区总裁", org: "ASML", yrs: 22, reg: "上海", i1: "半导体", i2: "光刻", rol: "管理", rate: 6000, tag: "光刻机,DUV,EUV", top: "光刻机供应,中国半导体设备" },
      { name: "郑文杰", title: "模拟IC设计总监", org: "圣邦股份", yrs: 15, reg: "北京", i1: "半导体", i2: "模拟芯片", rol: "研发/技术", rate: 3000, tag: "模拟芯片,电源管理,信号链", top: "国产模拟芯片,信号链进展" },
      { name: "黄志强", title: "MCU产品经理", org: "兆易创新", yrs: 13, reg: "北京", i1: "半导体", i2: "MCU", rol: "研发/技术", rate: 2500, tag: "MCU,RISC-V,存储", top: "国产MCU替代,RISC-V生态" },
      { name: "林永康", title: "首席架构师", org: "地平线", yrs: 18, reg: "北京", i1: "半导体", i2: "AI芯片", rol: "研发/技术", rate: 4500, tag: "AI芯片,NPU,自动驾驶芯片", top: "AI芯片架构,自动驾驶芯片" },
      { name: "郭建华", title: "战略合作总监", org: "ARM中国", yrs: 16, reg: "上海", i1: "半导体", i2: "IP授权", rol: "销售/市场", rate: 3500, tag: "ARM架构,RISC-V,IP授权", top: "芯片IP生态,RISC-V vs ARM" },
      { name: "唐国强", title: "研发VP", org: "紫光展锐", yrs: 20, reg: "北京", i1: "半导体", i2: "通信芯片", rol: "研发/技术", rate: 3800, tag: "5G芯片,基带,SoC", top: "5G芯片国产化,手机SoC" },
      { name: "何志刚", title: "副总裁", org: "澜起科技", yrs: 17, reg: "上海", i1: "半导体", i2: "接口芯片", rol: "管理", rate: 3500, tag: "DDR5,PCIe,互联芯片", top: "DDR5渗透率,互联芯片市场" },
      { name: "沈国平", title: "EDA技术总监", org: "华大九天", yrs: 15, reg: "北京", i1: "半导体", i2: "EDA", rol: "研发/技术", rate: 3000, tag: "EDA,仿真,验证", top: "国产EDA进展,全流程工具" },
      { name: "曹德旺", title: "碳化硅事业部总经理", org: "三安光电", yrs: 18, reg: "厦门", i1: "半导体", i2: "化合物半导体", rol: "管理", rate: 3200, tag: "SiC,GaN,化合物半导体", top: "SiC衬底,碳化硅产能" },
      { name: "范志毅", title: "前全球副总裁", org: "AMD", yrs: 25, reg: "上海", i1: "半导体", i2: "CPU/GPU", rol: "管理", rate: 7000, tag: "CPU,GPU,高性能计算", top: "高性能计算芯片,CPU竞争格局" },
      { name: "彭长征", title: "研发总监", org: "中科曙光", yrs: 16, reg: "北京", i1: "半导体", i2: "服务器芯片", rol: "研发/技术", rate: 3000, tag: "服务器芯片,信创CPU", top: "信创服务器芯片,国产算力" },
      { name: "蒋大为", title: "光学技术专家", org: "舜宇光学", yrs: 14, reg: "余姚", i1: "半导体", i2: "光学", rol: "研发/技术", rate: 2500, tag: "光学镜片,激光雷达,VCSEL", top: "光学元器件,车载光学" },

      // --- 新能源 (20) ---
      { name: "马国梁", title: "供应链副总", org: "宁德时代", yrs: 15, reg: "宁德", i1: "新能源", i2: "锂电池", rol: "供应链", rate: 3000, tag: "锂电池,储能,动力电池", top: "电池供应链,储能市场" },
      { name: "冯志远", title: "研究院副院长", org: "比亚迪", yrs: 16, reg: "深圳", i1: "新能源", i2: "汽车电子", rol: "研发/技术", rate: 3500, tag: "新能源车,功率半导体", top: "新能源车出海,智能驾驶" },
      { name: "韩学军", title: "运营副总", org: "隆基绿能", yrs: 14, reg: "西安", i1: "新能源", i2: "光伏", rol: "运营/管理", rate: 2800, tag: "光伏,硅片,钙钛矿", top: "光伏产能,全球光伏市场" },
      { name: "曾德胜", title: "CTO", org: "阳光电源", yrs: 18, reg: "合肥", i1: "新能源", i2: "逆变器", rol: "研发/技术", rate: 3200, tag: "逆变器,储能系统,微电网", top: "逆变器出海,储能系统集成" },
      { name: "魏国强", title: "业务发展VP", org: "远景能源", yrs: 17, reg: "上海", i1: "新能源", i2: "风电", rol: "销售/市场", rate: 3000, tag: "风电,海上风电,绿电", top: "海上风电前景,风机大型化" },
      { name: "夏建国", title: "研发总监", org: "亿纬锂能", yrs: 14, reg: "惠州", i1: "新能源", i2: "圆柱电池", rol: "研发/技术", rate: 2800, tag: "圆柱电池,大圆柱,4680", top: "大圆柱电池,锂电新技术" },
      { name: "戴志强", title: "海外市场总监", org: "国轩高科", yrs: 13, reg: "合肥", i1: "新能源", i2: "磷酸铁锂", rol: "销售/市场", rate: 2500, tag: "磷酸铁锂,海外建厂", top: "LFP出海,海外建厂趋势" },
      { name: "谭国华", title: "副总裁", org: "天合光能", yrs: 19, reg: "常州", i1: "新能源", i2: "光伏组件", rol: "管理", rate: 3000, tag: "光伏组件,N型,HJT,TOPCon", top: "TOPCon vs HJT,光伏技术路线" },
      { name: "崔永平", title: "钠电事业部总经理", org: "中科海钠", yrs: 15, reg: "北京", i1: "新能源", i2: "钠离子电池", rol: "管理", rate: 2800, tag: "钠离子电池,层状氧化物", top: "钠电量产进度,成本曲线" },
      { name: "薛志明", title: "产品VP", org: "小鹏汽车", yrs: 14, reg: "广州", i1: "新能源", i2: "智能驾驶", rol: "研发/技术", rate: 3500, tag: "智能驾驶,XNGP,感知方案", top: "智能驾驶落地,纯视觉vs雷达" },
      { name: "汤国富", title: "总经理", org: "鹏辉能源", yrs: 16, reg: "广州", i1: "新能源", i2: "储能电池", rol: "管理", rate: 2700, tag: "储能电池,户用储能,工商业储能", top: "储能市场,工商业储能经济性" },
      { name: "苏志强", title: "研发副总", org: "璞泰来", yrs: 15, reg: "上海", i1: "新能源", i2: "负极材料", rol: "研发/技术", rate: 2600, tag: "负极,硅基负极,人造石墨", top: "硅基负极进展,负极材料格局" },
      { name: "卢建民", title: "首席科学家", org: "恩捷股份", yrs: 20, reg: "珠海", i1: "新能源", i2: "隔膜", rol: "研发/技术", rate: 3000, tag: "隔膜,涂覆,湿法", top: "隔膜产能,干法vs湿法" },
      { name: "蒋国平", title: "运营总经理", org: "华友钴业", yrs: 18, reg: "桐乡", i1: "新能源", i2: "锂电材料", rol: "运营/管理", rate: 2800, tag: "前驱体,正极,镍钴锂", top: "锂电上游资源,前驱体格局" },
      { name: "蔡国强", title: "战略VP", org: "蔚来汽车", yrs: 14, reg: "上海", i1: "新能源", i2: "换电", rol: "战略", rate: 3500, tag: "换电,NIO Power,充换电网络", top: "换电模式经济性,充换电网络布局" },
      { name: "余学军", title: "氢能事业部总经理", org: "亿华通", yrs: 16, reg: "北京", i1: "新能源", i2: "氢能", rol: "管理", rate: 3000, tag: "燃料电池,绿氢,电解槽", top: "氢能产业进展,燃料电池降本" },
      { name: "潘志远", title: "全球销售总监", org: "金风科技", yrs: 17, reg: "北京", i1: "新能源", i2: "风电装备", rol: "销售/市场", rate: 2800, tag: "风电机组,叶片,齿轮箱", top: "风机出海,风电零部件" },
      { name: "杜国华", title: "矿产资源总监", org: "赣锋锂业", yrs: 15, reg: "新余", i1: "新能源", i2: "锂矿", rol: "供应链", rate: 3000, tag: "锂矿,盐湖提锂,锂价", top: "锂供需,锂矿资源" },
      { name: "戴学军", title: "技术VP", org: "理想汽车", yrs: 13, reg: "北京", i1: "新能源", i2: "增程", rol: "研发/技术", rate: 3200, tag: "增程,纯电,高压平台", top: "增程vs纯电,高压快充" },
      { name: "任志强", title: "副董事长", org: "通威股份", yrs: 22, reg: "成都", i1: "新能源", i2: "多晶硅", rol: "管理", rate: 3500, tag: "多晶硅,硅料,一体化", top: "硅料价格走势,光伏一体化" },

      // --- 人工智能 (20) ---
      { name: "姚建国", title: "合伙人", org: "高榕资本", yrs: 12, reg: "上海", i1: "人工智能", i2: "大模型", rol: "投资", rate: 4500, tag: "大模型,AIGC,AI应用", top: "AI商业化,大模型竞争" },
      { name: "方志明", title: "VP Sales", org: "英伟达", yrs: 15, reg: "上海", i1: "人工智能", i2: "算力", rol: "销售/市场", rate: 5500, tag: "GPU,算力,数据中心", top: "算力需求趋势,GPU市场" },
      { name: "石国胜", title: "CEO", org: "云从科技", yrs: 16, reg: "广州", i1: "人工智能", i2: "视觉", rol: "管理", rate: 4000, tag: "AI视觉,智慧城市", top: "AI视觉商业化" },
      { name: "谭志强", title: "产品VP", org: "百度", yrs: 18, reg: "北京", i1: "人工智能", i2: "大模型", rol: "研发/技术", rate: 5000, tag: "文心一言,国产大模型,搜索", top: "国产大模型差距,搜索革新" },
      { name: "廖国华", title: "技术总监", org: "商汤科技", yrs: 14, reg: "深圳", i1: "人工智能", i2: "计算机视觉", rol: "研发/技术", rate: 3500, tag: "CV,多模态,大装置", top: "多模态进展,AI大装置" },
      { name: "熊学军", title: "算法VP", org: "科大讯飞", yrs: 17, reg: "合肥", i1: "人工智能", i2: "NLP", rol: "研发/技术", rate: 3800, tag: "NLP,语音识别,大模型", top: "语音AI,大模型教育应用" },
      { name: "陆建平", title: "中国区总裁", org: "OpenAI", yrs: 20, reg: "北京", i1: "人工智能", i2: "AGI", rol: "管理", rate: 8000, tag: "GPT,AGI,多模态", top: "AGI进展,AI安全" },
      { name: "侯志远", title: "首席科学家", org: "智谱AI", yrs: 16, reg: "北京", i1: "人工智能", i2: "大模型", rol: "研发/技术", rate: 4500, tag: "GLM,开源大模型", top: "开源大模型生态,国产大模型" },
      { name: "龙国华", title: "AI产品VP", org: "字节跳动", yrs: 14, reg: "北京", i1: "人工智能", i2: "AI应用", rol: "产品", rate: 4500, tag: "豆包,推荐系统,AIGC", top: "AI产品化,AIGC流量" },
      { name: "段学明", title: "研发VP", org: "阿里云", yrs: 17, reg: "杭州", i1: "人工智能", i2: "云计算", rol: "研发/技术", rate: 4200, tag: "通义千问,云原生,AI infra", top: "AI Infra,云计算竞争" },
      { name: "罗国强", title: "创业CEO", org: "月之暗面", yrs: 13, reg: "北京", i1: "人工智能", i2: "AI助手", rol: "管理", rate: 4000, tag: "Kimi,长文本,AI对话", top: "AI助手竞争,长文本应用" },
      { name: "钟志远", title: "技术VP", org: "旷视科技", yrs: 15, reg: "北京", i1: "人工智能", i2: "AIoT", rol: "研发/技术", rate: 3000, tag: "AIoT,机器人,智慧物流", top: "AIoT落地,机器人场景" },
      { name: "徐国平", title: "首席AI科学家", org: "腾讯", yrs: 18, reg: "深圳", i1: "人工智能", i2: "大模型", rol: "研发/技术", rate: 5500, tag: "混元,微信AI,推荐", top: "社交AI,大模型应用场景" },
      { name: "胡志强", title: "机器人事业部总经理", org: "小米", yrs: 16, reg: "北京", i1: "人工智能", i2: "机器人", rol: "管理", rate: 3500, tag: "仿生机器人,CyberDog,铁大", top: "仿生机器人进展,人形机器人" },
      { name: "高建华", title: "VP研发", org: "寒武纪", yrs: 14, reg: "北京", i1: "人工智能", i2: "AI芯片", rol: "研发/技术", rate: 3500, tag: "AI训练芯片,推理芯片", top: "国产AI训练芯片,推理降本" },
      { name: "梁国胜", title: "创始人", org: "百川智能", yrs: 18, reg: "北京", i1: "人工智能", i2: "大模型", rol: "管理", rate: 5000, tag: "百川,搜索增强,垂直模型", top: "垂直大模型,搜索增强" },
      { name: "宋志明", title: "AI Lab主任", org: "快手", yrs: 15, reg: "北京", i1: "人工智能", i2: "视频理解", rol: "研发/技术", rate: 3200, tag: "视频理解,可灵,AIGC视频", top: "AIGC视频进展,视频内容理解" },
      { name: "唐学军", title: "首席架构师", org: "第四范式", yrs: 16, reg: "北京", i1: "人工智能", i2: "AutoML", rol: "研发/技术", rate: 3000, tag: "AutoML,决策智能,企业AI", top: "企业AI落地,决策智能" },
      { name: "许国华", title: "算法负责人", org: "MiniMax", yrs: 12, reg: "上海", i1: "人工智能", i2: "多模态", rol: "研发/技术", rate: 4000, tag: "多模态,语音,视频生成", top: "视频生成,Sora竞争" },
      { name: "邓志强", title: "VP", org: "华为云", yrs: 19, reg: "深圳", i1: "人工智能", i2: "AI平台", rol: "销售/市场", rate: 4500, tag: "昇腾,ModelArts,盘古大模型", top: "昇腾生态,华为AI全栈" },

      // --- 医药 (20) ---
      { name: "肖建平", title: "研发总裁", org: "百济神州", yrs: 20, reg: "上海", i1: "医药", i2: "创新药", rol: "研发/技术", rate: 5000, tag: "BTK,PD-1,双抗,ADC", top: "创新药出海,ADC赛道" },
      { name: "冯国强", title: "首席医学官", org: "恒瑞医药", yrs: 22, reg: "上海", i1: "医药", i2: "肿瘤药", rol: "研发/技术", rate: 4500, tag: "肿瘤药,创新药,集采", top: "创新药研发,集采影响" },
      { name: "韩志远", title: "CDMO业务VP", org: "药明康德", yrs: 17, reg: "上海", i1: "医药", i2: "CXO", rol: "销售/市场", rate: 3500, tag: "CXO,CDMO,化学药", top: "CXO景气度,融资环境" },
      { name: "曹国华", title: "生物药工艺总监", org: "信达生物", yrs: 15, reg: "苏州", i1: "医药", i2: "抗体药", rol: "研发/技术", rate: 3200, tag: "单抗,双抗,生物类似药", top: "生物药工艺,双抗开发" },
      { name: "彭学军", title: "CMO", org: "康希诺", yrs: 18, reg: "天津", i1: "医药", i2: "疫苗", rol: "研发/技术", rate: 3500, tag: "mRNA疫苗,腺病毒,流脑", top: "mRNA技术平台,疫苗管线" },
      { name: "董志明", title: "研发副总", org: "智飞生物", yrs: 16, reg: "重庆", i1: "医药", i2: "疫苗代理", rol: "研发/技术", rate: 2800, tag: "HPV疫苗,肺炎疫苗,代理", top: "HPV疫苗市场,国产替代" },
      { name: "梁建平", title: "创始人CEO", org: "君实生物", yrs: 19, reg: "上海", i1: "医药", i2: "免疫治疗", rol: "管理", rate: 4000, tag: "PD-1,特瑞普利,国际化", top: "PD-1竞争格局,出海进展" },
      { name: "苏国强", title: "中药研究院院长", org: "片仔癀", yrs: 25, reg: "漳州", i1: "医药", i2: "中药", rol: "研发/技术", rate: 3000, tag: "中药,天然药物,品牌中药", top: "中药品牌化,中药现代化" },
      { name: "潘志远", title: "医疗器械VP", org: "迈瑞医疗", yrs: 16, reg: "深圳", i1: "医药", i2: "医疗器械", rol: "销售/市场", rate: 3500, tag: "监护仪,超声,体外诊断", top: "医疗设备出海,国产替代" },
      { name: "范学军", title: "研发VP", org: "联影医疗", yrs: 18, reg: "上海", i1: "医药", i2: "影像设备", rol: "研发/技术", rate: 3800, tag: "CT,MRI,分子影像", top: "高端影像国产化,AI辅助诊断" },
      { name: "田国平", title: "临床运营总监", org: "康龙化成", yrs: 14, reg: "北京", i1: "医药", i2: "CRO", rol: "研发/技术", rate: 2800, tag: "CRO,临床试验,SMO", top: "CRO行业景气度,全球临床试验" },
      { name: "石志强", title: "VP", org: "荣昌生物", yrs: 17, reg: "烟台", i1: "医药", i2: "ADC", rol: "研发/技术", rate: 3500, tag: "ADC,HER2,双抗ADC", top: "ADC赛道,TROP2等靶点" },
      { name: "谭建平", title: "质控总监", org: "长春高新", yrs: 20, reg: "长春", i1: "医药", i2: "生长激素", rol: "研发/技术", rate: 3000, tag: "生长激素,重组蛋白", top: "生长激素市场,集采影响" },
      { name: "廖国强", title: "创始人", org: "华大基因", yrs: 22, reg: "深圳", i1: "医药", i2: "基因测序", rol: "管理", rate: 4000, tag: "基因测序,生育健康,肿瘤早筛", top: "基因测序前景,肿瘤早筛" },
      { name: "熊志远", title: "业务VP", org: "爱尔眼科", yrs: 15, reg: "长沙", i1: "医药", i2: "眼科", rol: "运营/管理", rate: 2800, tag: "眼科,屈光,白内障,视光", top: "眼科连锁扩张,消费医疗" },
      { name: "陆学明", title: "首席科学家", org: "复星医药", yrs: 21, reg: "上海", i1: "医药", i2: "生物药", rol: "研发/技术", rate: 4000, tag: "CAR-T,生物药,许可引进", top: "CAR-T进展,生物药许可引进" },
      { name: "侯国华", title: "CMO", org: "科伦博泰", yrs: 16, reg: "成都", i1: "医药", i2: "创新药", rol: "研发/技术", rate: 3200, tag: "ADC,SKB,创新管线", top: "ADC出海,Milestone交易" },
      { name: "龙志强", title: "业务发展VP", org: "诺华中国", yrs: 18, reg: "上海", i1: "医药", i2: "跨国药企", rol: "业务发展", rate: 4000, tag: "许可引进,BD交易,中国策略", top: "MNC中国策略,license-in/out" },
      { name: "段建平", title: "院长", org: "三九医药", yrs: 24, reg: "深圳", i1: "医药", i2: "OTC", rol: "管理", rate: 3000, tag: "OTC,品牌药,中药配方颗粒", top: "OTC市场,中药配方颗粒" },
      { name: "罗学军", title: "创新中心总经理", org: "阿斯利康中国", yrs: 19, reg: "上海", i1: "医药", i2: "肿瘤免疫", rol: "管理", rate: 4500, tag: "免疫治疗,联合用药,肿瘤", top: "肿瘤免疫联合疗法,全球肿瘤研发" },

      // --- 消费电子/汽车/其他 (20) ---
      { name: "钟国强", title: "产品VP", org: "OPPO", yrs: 16, reg: "深圳", i1: "消费电子", i2: "手机", rol: "产品", rate: 3000, tag: "智能手机,折叠屏,影像", top: "折叠屏趋势,手机市场" },
      { name: "徐志远", title: "研发副总裁", org: "小米", yrs: 17, reg: "北京", i1: "消费电子", i2: "IoT", rol: "研发/技术", rate: 3200, tag: "IoT,智能家居,生态链", top: "IoT生态,智能家居互联" },
      { name: "胡建平", title: "全球供应链VP", org: "苹果", yrs: 22, reg: "深圳", i1: "消费电子", i2: "供应链", rol: "供应链", rate: 6000, tag: "富士康,立讯精密,供应链转移", top: "果链,供应链迁移,立讯" },
      { name: "高志明", title: "创始人CEO", org: "大疆创新", yrs: 18, reg: "深圳", i1: "消费电子", i2: "无人机", rol: "管理", rate: 4000, tag: "无人机,相机云台,机器人", top: "无人机市场,美国制裁影响" },
      { name: "梁国华", title: "研发总监", org: "京东方", yrs: 19, reg: "北京", i1: "消费电子", i2: "面板", rol: "研发/技术", rate: 3000, tag: "OLED,液晶面板,柔性屏", top: "面板周期,OLED渗透率" },
      { name: "宋学军", title: "产品线总裁", org: "联想", yrs: 20, reg: "北京", i1: "消费电子", i2: "PC", rol: "管理", rate: 2800, tag: "PC,AIPC,服务器", top: "AIPC渗透率,PC市场复苏" },
      { name: "唐国强", title: "自动驾驶副总裁", org: "百度Apollo", yrs: 16, reg: "北京", i1: "汽车", i2: "无人驾驶", rol: "研发/技术", rate: 4000, tag: "Robotaxi,自动驾驶,L4", top: "Robotaxi商业化,武汉模式" },
      { name: "许志远", title: "VP", org: "禾赛科技", yrs: 14, reg: "上海", i1: "汽车", i2: "激光雷达", rol: "研发/技术", rate: 3500, tag: "激光雷达,ADAS,固态激光", top: "激光雷达降本,ADAS渗透" },
      { name: "邓建华", title: "CEO", org: "地平线", yrs: 17, reg: "北京", i1: "汽车", i2: "汽车芯片", rol: "管理", rate: 5000, tag: "征程,J5,智驾方案", top: "汽车芯片,智驾方案" },
      { name: "肖国强", title: "业务VP", org: "德赛西威", yrs: 15, reg: "惠州", i1: "汽车", i2: "智能座舱", rol: "销售/市场", rate: 2800, tag: "智能座舱,域控,OTA", top: "智能座舱趋势,域控制器" },
      { name: "冯学军", title: "三电技术总监", org: "汇川技术", yrs: 17, reg: "深圳", i1: "汽车", i2: "电驱", rol: "研发/技术", rate: 3000, tag: "电驱,电控,电机,SiC", top: "电驱系统,SiC车载应用" },
      { name: "韩建平", title: "创始人", org: "菜鸟网络", yrs: 16, reg: "杭州", i1: "物流", i2: "智慧物流", rol: "管理", rate: 3500, tag: "快递,仓储自动化,即时配送", top: "智慧物流,物流自动化" },
      { name: "曹志明", title: "供应链VP", org: "京东", yrs: 18, reg: "北京", i1: "电商", i2: "供应链", rol: "运营/管理", rate: 4000, tag: "京东物流,供应链,自营", top: "电商供应链,即时零售" },
      { name: "彭国华", title: "CEO", org: "Shein", yrs: 15, reg: "广州", i1: "电商", i2: "跨境电商", rol: "管理", rate: 4500, tag: "Shein,Temu,快时尚,跨境", top: "跨境电商,快时尚DTC" },
      { name: "董学军", title: "副总裁", org: "华为", yrs: 21, reg: "深圳", i1: "ICT", i2: "企业服务", rol: "销售/市场", rate: 5000, tag: "5G,企业BG,云与AI", top: "5G应用,华为企业业务" },
      { name: "梁志远", title: "中国区总经理", org: "SAP", yrs: 19, reg: "上海", i1: "企业服务", i2: "ERP", rol: "销售/市场", rate: 4000, tag: "ERP,SaaS,数字化转型", top: "企业SaaS,国产替代" },
      { name: "苏建平", title: "创始人", org: "PingCAP", yrs: 14, reg: "北京", i1: "数据库", i2: "分布式", rol: "管理", rate: 3500, tag: "TiDB,分布式数据库,HTAP", top: "国产数据库,分布式替代" },
      { name: "潘国强", title: "CEO", org: "金山办公", yrs: 20, reg: "珠海", i1: "办公软件", i2: "AI办公", rol: "管理", rate: 3500, tag: "WPS,AIGC,协同办公", top: "AI+办公,协同办公竞争" },
      { name: "范学明", title: "研究院院长", org: "海康威视", yrs: 22, reg: "杭州", i1: "安防", i2: "AIoT", rol: "研发/技术", rate: 3800, tag: "安防,AOI,热成像", top: "安防AI化,工业视觉" },
      { name: "田志强", title: "VP", org: "中兴通讯", yrs: 18, reg: "深圳", i1: "通信", i2: "5G/6G", rol: "研发/技术", rate: 3000, tag: "5G,6G,光通信", top: "5G-A,6G研究进展" },
    ]

    const experts = []
    for (const e of eData) {
      const u = await prisma.user.create({
        data: {
          email: `expert_${e.name}@demo.com`, name: e.name, password: pw, role: "EXPERT",
          points: e.rate * 2, orgName: e.org, title: e.title, source: "seed",
        },
      })
      const ex = await prisma.expert.create({
        data: {
          userId: u.id, realName: e.name, title: e.title, org: e.org, years: e.yrs,
          region: e.reg, industry1: e.i1, industry2: e.i2, roleType: e.rol,
          tags: e.tag, topics: e.top,
          forms: "电话访谈,视频会议,线下走访",
          ratePoints: e.rate, rateHour: e.rate,
          status: "ACTIVE", reviewStatus: "APPROVED", complianceSig: true,
          completedOrders: 3 + Math.floor(Math.random() * 10),
          rating: parseFloat((4 + Math.random()).toFixed(1)),
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
    const reqs = []
    for (let i = 0; i < rUsers.length; i++) {
      const oNo = `ORD-2026-${8000 + i}`
      const created = new Date(Date.now() - (rUsers.length - i) * 86400000)
      const indList = ["半导体","新能源","人工智能","新能源","人工智能","半导体","新能源","医药","汽车","消费电子",
                       "新能源","半导体","医药","人工智能","汽车","电商","新能源","企业服务","人工智能","新能源"]
      const subList = ["MLCC","钠离子","AI芯片","光伏","大模型","SiC","储能","创新药","智驾","折叠屏",
                       "风电","半导体设备","ADC","AI算力","汽车电子","跨境电商","光伏","数据库","机器人","氢能"]
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
      const ei = i * 3  // 每3个专家取一个
      const ri = i % rUsers.length
      const amt = [5000, 6000, 7000, 8000, 10000, 12000, 15000, 20000, 25000, 30000][i]
      const statusArr: any[] = ["ACTIVE", "DONE", "PAID", "ACTIVE", "DONE", "PAID", "DONE", "PAID", "ACTIVE", "DONE"]
      const st = statusArr[i]
      const cf = new Date(Date.now() - (10 - i) * 86400000 + 3600000)
      const cp = new Date(Date.now() - (10 - i) * 86400000 + 7200000)
      await prisma.order.create({
        data: {
          orderNo: reqs[i].orderNo,
          requestId: reqs[i].id,  // ✅ 修复：使用实际创建的 request 的 ID
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

    return NextResponse.json({
      message: "演示数据填充完成",
      researchers: rUsers.length,
      experts: experts.length,
      requests: reqs.length,
      orders: 10,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
