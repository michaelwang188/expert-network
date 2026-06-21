import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const names = ['资深研究员','health','PingPong','michael']
  const replacements = ['赵国栋','何伟明','沈佳宜','王志远']
  for (let i=0; i<names.length; i++) {
    const r = await p.user.updateMany({where:{name:names[i]}, data:{name:replacements[i]}})
    if (r.count > 0) console.log('✅', names[i], '→', replacements[i], '('+r.count+'条)')
    else console.log('⏭️', names[i], '未匹配')
  }
  const orders = await p.request.findMany({where:{title:{contains:'回归测试'}}})
  for (const o of orders) {
    await p.request.update({where:{id:o.id}, data:{title:'钠离子电池正极材料工艺路线调研'}})
    console.log('✅ 订单标题修复:', o.id)
  }
}
main().catch(e=>console.error(e.message)).finally(()=>p.$disconnect())
