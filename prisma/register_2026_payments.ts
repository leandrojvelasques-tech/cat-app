// @ts-nocheck
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const payments = [
  { num: 132, months: { 1: 3000 } },
  { num: 405, months: { 1: 6000, 2: 5000, 3: 6000 } },
  { num: 312, months: { 1: 6000, 2: 6000, 3: 6000 } },
  { num: 338, months: { 1: 3000, 2: 3000, 3: 3000, 4: 3000, 5: 3000 } },
  { num: 490, months: { 1: 6000, 2: 5000, 3: 6000 } },
  { num: 124, months: { 1: 6000, 2: 6000, 3: 6000 } },
  { num: 21, months: { 1: 6000 } },
  { num: 408, months: { 1: 6000, 2: 6000 } },
  { num: 143, months: { 1: 6000, 2: 6000 } },
  { num: 100, months: { 1: 6000, 2: 6000, 3: 6000 } },
  { num: 310, months: { 1: 6000, 2: 6000, 3: 6000, 4: 6000, 5: 6000 } }, // FANKHAUSER
  { num: 441, months: { 1: 5000, 2: 5000 } },
  { num: 415, months: { 1: 6000, 2: 6000, 3: 6000, 4: 6000, 5: 6000, 6: 6000, 7: 6000, 8: 6000, 9: 6000, 10: 6000 } },
  { num: 422, months: { 1: 6000, 2: 6000, 3: 6000 } },
  { num: 308, months: { 1: 6000, 2: 6000 } },
  { num: 366, months: { 1: 6000 } },
  { num: 103, months: { 1: 6000, 2: 3000, 3: 3000 } },
  { num: 305, months: { 1: 6000, 2: 5000 } },
  { num: 227, months: { 1: 6000, 2: 3000 } },
  { num: 35, months: { 1: 6000 } },
  { num: 1, months: { 1: 6000, 2: 6000, 3: 6000, 4: 6000 } },
  { num: 445, months: { 1: 6000, 2: 6000 } },
  { num: 439, months: { 1: 6000, 2: 6000 } },
  { num: 493, months: { 3: 6000 } },
  { num: 129, months: { 1: 6000, 2: 6000 } },
  { num: 390, months: { 1: 6000 } },
  { num: 123, months: { 1: 6000, 2: 6000 } },
  { num: 44, months: { 1: 6000, 2: 6000 } },
  { num: 99, months: { 1: 6000 } },
  { num: 38, months: { 1: 3000, 2: 3000, 3: 3000 } },
  { num: 190, months: { 1: 3000, 2: 3000 } },
  { num: 94, months: { 1: 6000, 2: 6000, 3: 6000 } },
  { num: 370, months: { 1: 6000, 2: 6000, 3: 6000 } },
  { num: 105, months: { 1: 6000, 2: 6000 } },
  { name: 'CHAPARRO JORGE ANTONIO', months: { 3: 6000, 4: 6000 } },
  { name: 'D\'ANGELO ANTONELLA', months: { 3: 6000, 4: 6000, 5: 6000 } },
  { name: 'CELAS MAIDANA FLORENCIA', months: { 3: 6000 } }
]

const AMOUNT_DUE = 6000 // Standard fee

async function main() {
  console.log('Starting migration of 2026 payments...')
  
  for (const p of payments) {
    let member
    if (p.num) {
      member = await db.member.findFirst({ where: { memberNumber: p.num } })
    } else if (p.name) {
      const names = p.name.split(' ')
      member = await db.member.findFirst({ 
        where: { 
          OR: [
            { lastName: { contains: names[0] } },
            { firstName: { contains: names[names.length - 1] } }
          ]
        } 
      })
    }

    if (!member) {
      console.log(`❌ Member not found: ${p.num || p.name}`)
      continue
    }

    console.log(`Processing payments for ${member.firstName} ${member.lastName} (#${member.memberNumber})`)

    for (const [month, amount] of Object.entries(p.months)) {
      const monthInt = parseInt(month)
      
      // Check if already exists
      const existing = await db.membershipFee.findFirst({
        where: {
          memberId: member.id,
          periodYear: 2026,
          periodMonth: monthInt
        }
      })

      if (existing) {
        console.log(`   - Month ${month} already exists. Skipping.`)
        continue
      }

      await db.membershipFee.create({
        data: {
          memberId: member.id,
          periodYear: 2026,
          periodMonth: monthInt,
          amountPaid: amount,
          amountDue: AMOUNT_DUE,
          paymentDate: new Date(),
          paymentStatus: amount >= AMOUNT_DUE ? 'PAID' : 'PARTIAL',
          notes: 'Importado de planilla Excel 2026'
        }
      })
      console.log(`   ✅ Added month ${month} (${amount})`)
    }

    // Update status to ACTIVE
    await db.member.update({
      where: { id: member.id },
      data: { status: 'ACTIVE' }
    })
  }

  // Also reset all DEBTOR members to ACTIVE as requested to discard old debt
  console.log('Resetting all DEBTOR members to ACTIVE...')
  await db.member.updateMany({
    where: { status: 'DEBTOR' },
    data: { status: 'ACTIVE' }
  })

  console.log('Migration finished!')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
