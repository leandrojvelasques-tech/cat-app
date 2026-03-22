import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const members = await prisma.member.findMany({
    include: { fees: true }
  })
  
  console.log('Total members:', members.length)
  members.forEach(m => {
    const marchFee = m.fees.find(f => f.periodMonth === 3 && f.periodYear === 2026)
    console.log(`Member #${m.memberNumber}: ${m.lastName}, ${m.firstName} | St: ${m.status} | March: ${marchFee ? 'PAID' : 'MISSING'}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
