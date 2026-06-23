const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@demo.com' } })
  if (existing) { console.log('Seed skipped - users exist'); return }

  const pw = await bcrypt.hash('123456', 10)

  await prisma.user.create({ data: { email: 'admin@demo.com', name: 'Admin', password: pw, role: 'ADMIN', points: 99999 } })
  const r = await prisma.user.create({ data: { email: 'researcher@demo.com', name: 'Researcher', password: pw, role: 'RESEARCHER', points: 10000 } })
  await prisma.user.create({
    data: { email: 'expert@demo.com', name: 'Expert', password: pw, role: 'EXPERT',
      expertProfile: { create: { realName: 'Expert Li', title: 'CTO', org: 'Tech Corp', years: 15, region: 'SZ', industry1: 'Tech', roleType: 'Tech', tags: 'MLCC', topics: 'MLCC', forms: 'Online', ratePoints: 500, rateHour: 500, status: 'ACTIVE', reviewStatus: 'APPROVED', complianceSig: true } } }
  })
  await prisma.user.update({ where: { id: r.id }, data: { points: 10000 } })
  console.log('Seed complete')
}

main().catch(e => { console.error(e.message); process.exit(1) })
