import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const missingOfficialMembers = [
  ["581", "GARCIA", "SOFIA"],
  ["584", "REÑANCO", "JULIETA"],
  ["585", "SOSA", "GABRIELA"],
  ["587", "UNQUEN", "MALENA"],
] as const

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const [memberNumber, lastName, firstName] of missingOfficialMembers) {
      const existing = await tx.member.findFirst({ where: { memberNumber } })
      if (existing) continue

      await tx.member.create({
        data: {
          memberNumber,
          lastName,
          firstName,
          dni: `PENDIENTE-LIBRO-${memberNumber}`,
          joinDate: new Date("2026-08-24T12:00:00-03:00"),
          status: "ACTIVE",
          type: "ACTIVO",
          debtStatus: "AL DIA",
          notes: "Alta desde el libro oficial. Socio nuevo 2026; DNI, teléfono, domicilio y email pendientes de completar.",
        },
      })
    }
  }, { maxWait: 10000, timeout: 30000 })

  const members = await prisma.member.findMany({
    where: { memberNumber: { in: missingOfficialMembers.map(([number]) => number) } },
    select: { memberNumber: true, firstName: true, lastName: true, status: true, type: true, debtStatus: true },
    orderBy: { memberNumber: "asc" },
  })
  console.log(JSON.stringify(members, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
