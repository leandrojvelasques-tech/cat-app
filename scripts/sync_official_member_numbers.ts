import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const officialMembers = [
  ["579", "AGUERRI", "MAGALI CELESTE"],
  ["580", "BARRIA", "ISNELDA"],
  ["581", "GARCIA", "SOFIA"],
  ["582", "LUCERO", "HUMBERTO ESTEBAN"],
  ["583", "OJEDA", "GLADYS"],
  ["584", "REÑANCO", "JULIETA"],
  ["585", "SOSA", "GABRIELA"],
  ["586", "THOMAS", "KARINA ELIZABETH"],
  ["587", "UNQUEN", "MALENA"],
  ["588", "ZENI", "MARIELA"],
  ["589", "AYBAR", "ROBERTO DANIEL"],
  ["590", "CHAPARRO", "JORGE ANTONIO"],
  ["591", "D'ANGELO", "ANTONELLA"],
  ["592", "HERNÁNDEZ VERA", "CARLA PAOLA"],
  ["593", "SANTANDER", "FLAVIA"],
  ["594", "ZURLIS", "MARIA ROSA"],
  ["595", "LEVERONI", "GABRIEL"],
  ["596", "PIERRESTEGUY", "JOSE"],
  ["597", "GETTE", "GIMENA"],
] as const

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
}

function samePerson(member: { firstName: string; lastName: string }, lastName: string, firstName: string) {
  const lastNameMatches = normalize(member.lastName) === normalize(lastName)
    || (normalize(member.lastName) === "SANTANDER" && normalize(lastName) === "SANDANDER")
  return lastNameMatches && normalize(member.firstName) === normalize(firstName)
}

async function main() {
  const apply = process.argv.includes("--apply")
  const members = await prisma.member.findMany({
    select: { id: true, memberNumber: true, firstName: true, lastName: true, status: true },
  })

  const resolved = officialMembers.map(([number, lastName, firstName]) => {
    const matches = members.filter((member) => samePerson(member, lastName, firstName))
    if (matches.length > 1) throw new Error(`Identidad duplicada para ${lastName}, ${firstName}`)
    return { number, lastName, firstName, member: matches[0] }
  })

  const missing = resolved.filter((item) => !item.member)
  const targetIds = new Set(resolved.filter((item) => item.member).map((item) => item.member!.id))
  const occupiedTargets = members.filter((member) => officialMembers.some(([number]) => number === member.memberNumber) && !targetIds.has(member.id))

  console.log(`Socios oficiales: ${officialMembers.length}`)
  console.log(`Encontrados: ${resolved.length - missing.length}`)
  console.log(`Faltantes: ${missing.length}`)
  missing.forEach((item) => console.log(`  - ${item.number}: ${item.lastName}, ${item.firstName}`))
  console.log(`Conflictos de destino ajenos: ${occupiedTargets.length}`)
  occupiedTargets.forEach((member) => console.log(`  - N° ${member.memberNumber}: ${member.lastName}, ${member.firstName}`))

  if (!apply) {
    console.log("Modo verificación. Usá --apply para persistir la sincronización.")
    return
  }

  if (missing.length > 0 || occupiedTargets.length > 0) {
    throw new Error("Sincronización detenida: primero hay que resolver socios faltantes y conflictos de numeración.")
  }

  await prisma.$transaction(async (tx) => {
    const timestamp = Date.now()
    for (const item of resolved) {
      if (item.member) {
        await tx.member.update({ where: { id: item.member.id }, data: { memberNumber: `SYNC-${timestamp}-${item.member.id}` } })
      }
    }

    for (const item of resolved) {
      if (item.member) {
        await tx.member.update({ where: { id: item.member.id }, data: { memberNumber: item.number } })
      } else {
        await tx.member.create({
          data: {
            memberNumber: item.number,
            firstName: item.firstName,
            lastName: item.lastName,
            dni: `PENDIENTE-OFICIAL-${item.number}-${timestamp}`,
            status: "ACTIVE",
            type: "ACTIVO",
            notes: "Alta mínima creada a partir del listado oficial de socios.",
          },
        })
      }
    }
  })

  console.log("Sincronización oficial aplicada correctamente.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
