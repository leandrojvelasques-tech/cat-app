import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const fees2026 = await prisma.membershipFee.findMany({
    where: { periodYear: 2026 },
    include: { member: true }
  })

  const totalPaid = fees2026.reduce((acc, f) => acc + f.amountPaid, 0)
  const totalCount = fees2026.length

  console.log('=== VERIFICACIÓN FINAL EN LA BASE DE DATOS ===')
  console.log(`Total registros de cuotas 2026 en BD: ${totalCount}`)
  console.log(`Total recaudación de cuotas 2026 (Caja): $${totalPaid.toLocaleString('es-AR')}`)

  const activeCount = await prisma.member.count({ where: { status: 'ACTIVE' } })
  console.log(`Socios con estado ACTIVE en BD: ${activeCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
