import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const marchMembers = [
    { num: "432", last: "ALCARAZ", first: "VICTOR DAMIAN", amount: 6000, date: "2026-03-05" },
    { num: "302", last: "ANDRADA", first: "MARCELA", amount: 6000, date: "2026-03-04" },
    { num: "338", last: "BALDINI", first: "ALBERTO JAVIER", amount: 3000, date: "2026-03-06" },
    { num: "480", last: "DAS NEVES GUERREIRO", first: "RICARDO", amount: 6000, date: "2026-03-04" },
    { num: "124", last: "DIAZ IRIBARNE", first: "LILIANA", amount: 6000, date: "2026-02-16" },
    { num: "109", last: "HERRERA", first: "STELLA MARIS", amount: 6000, date: "2026-03-05" },
    { num: "207", last: "LARROCA", first: "NORBERTO", amount: 6000, date: "2026-03-01" },
    { num: "449", last: "LOPEZ", first: "SERGIO", amount: 6000, date: "2026-02-09" },
    { num: "999", last: "LORENZO", first: "DIANA", amount: 6000, date: "2026-03-01" },
    { num: "205", last: "MATUS", first: "ALICIA", amount: 6000, date: "2026-03-03" },
    { num: "1",   last: "MORON", first: "MARIA DOLORES", amount: 6000, date: "2026-02-25" },
    { num: "36",  last: "SOTOMAYOR", first: "MANUEL", amount: 3000, date: "2026-03-05" },
    { num: "TH-01", last: "THOMAS", first: "KARINA ELIZABETH", amount: 6000, date: "2026-03-06" },
    { num: "UR-01", last: "URIBE", first: "JOSE RUPERTO", amount: 6000, date: "2026-03-03" },
    { num: "164", last: "VELASQUES", first: "LEANDRO", amount: 3000, date: "2026-03-06" },
    { num: "94",  last: "ZEGARRA", first: "VICTOR MANUEL", amount: 6000, date: "2026-03-04" },
    { num: "ZE-01", last: "ZENI", first: "MARIELA", amount: 3000, date: "2026-03-01" },
  ]

  console.log("Cleaning up March 2026 payments to reset count...")
  await prisma.membershipFee.deleteMany({
    where: { periodMonth: 3, periodYear: 2026 }
  })

  for (const item of marchMembers) {
    // Try to find member by number or name
    let member = await prisma.member.findFirst({
      where: {
        OR: [
          { memberNumber: item.num },
          { AND: [{ lastName: { contains: item.last } }, { firstName: { contains: item.first } }] }
        ]
      }
    })

    if (!member) {
      console.log(`Creating member: ${item.first} ${item.last}`)
      member = await prisma.member.create({
        data: {
          memberNumber: item.num,
          firstName: item.first,
          lastName: item.last,
          dni: item.num.startsWith("T") || item.num.startsWith("U") || item.num.startsWith("Z") ? "S/D" : item.num,
          status: "ACTIVE",
          type: "ACTIVO",
          joinDate: new Date("2025-01-01")
        }
      })
    }

    console.log(`Recording March payment for: ${member.lastName} (#${member.memberNumber})`)
    await prisma.membershipFee.create({
      data: {
        memberId: member.id,
        periodMonth: 3,
        periodYear: 2026,
        amountPaid: item.amount,
        paymentDate: new Date(item.date),
        paymentMethod: "EFECTIVO",
        paymentStatus: "PAID",
        notes: "Sincronización con planilla Excel"
      }
    })
  }

  console.log("Done! Total marked as 'Al día' for March 2026: 17")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
