import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const root = path.resolve(__dirname, "../..")
const reportPath = path.join(root, "docs/reports/socios-del-libro-no-cargados-2026-08-18.md")
const now = new Date("2026-08-24T12:00:00-03:00")

const officialRenumbering = [
  ["581", "580", "BARRIA", "ISNELDA"],
  ["585", "582", "LUCERO", "HUMBERTO ESTEBAN"],
  ["586", "583", "OJEDA", "GLADYS"],
  ["589", "586", "THOMAS", "KARINA ELIZABETH"],
  ["590", "588", "ZENI", "MARIELA"],
  ["580", "589", "AYBAR", "ROBERTO DANIEL"],
  ["582", "590", "CHAPARRO", "JORGE ANTONIO"],
  ["583", "591", "D'ANGELO", "ANTONELLA"],
  ["584", "592", "HERNÁNDEZ VERA", "CARLA PAOLA"],
  ["587", "593", "SANTANDER", "FLAVIA"],
  ["591", "594", "ZURLIS", "MARIA ROSA"],
  ["592", "595", "LEVERONI", "GABRIEL"],
  ["593", "596", "PIERRESTEGUY", "JOSE"],
  ["594", "597", "GETTE", "GIMENA"],
] as const

const duplicateRows = [
  ["450", "SANDANDER", "FLAVIA NOEMI", "593"],
  ["464", "MENDOZA", "ADOLFO JULIÁN", "542"],
  ["477", "MARCINKEVICIUS", "MAURO", "561"],
  ["479", "LORENZO", "DIANA", "543"],
] as const

const honoraryNumbers = new Set(["244", "245", "246", "250"])
const deceasedNumbers = new Set(["2"])
const newThisYearNumbers = new Set(["581", "584", "585", "587"])

function parseMainBookRows() {
  const markdown = fs.readFileSync(reportPath, "utf8")
  const start = markdown.indexOf("## Socios que se encuentran en el libro, pero que no se encuentran en el sistema")
  const end = markdown.indexOf("## Casos de socios duplicados en el libro", start)
  if (start < 0 || end < 0) throw new Error("No se encontró la sección principal del informe.")

  return markdown
    .slice(start, end)
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const columns = line.split("|").slice(1, -1).map((column) => column.trim())
      const number = columns[0]
      const rawName = columns[1].replace(/\s*\[validar\]/g, "").replace(/\?/g, "").trim()
      const comma = rawName.indexOf(",")
      if (comma < 1) throw new Error(`Nombre sin formato apellido, nombre en N° ${number}: ${rawName}`)
      return {
        memberNumber: number,
        lastName: rawName.slice(0, comma).trim(),
        firstName: rawName.slice(comma + 1).trim(),
        statusNote: columns[2],
      }
    })
}

function newMemberData(item: { memberNumber: string; firstName: string; lastName: string; statusNote?: string }) {
  const number = item.memberNumber
  const isHonorary = honoraryNumbers.has(number)
  const isDeceased = deceasedNumbers.has(number)
  const isNewThisYear = newThisYearNumbers.has(number)
  const notes = [
    "Alta desde el libro oficial de socios.",
    "DNI, teléfono, domicilio y email pendientes de completar.",
    item.statusNote?.includes("socio honorario") ? "Clasificado como socio honorario según indicación institucional." : "",
    item.statusNote?.includes("fallecido") ? "Clasificado como fallecido según indicación institucional." : "",
    isNewThisYear ? "Alta nueva 2026; cuota marcada al día según criterio aprobado." : "",
  ].filter(Boolean).join(" ")

  return {
    memberNumber: number,
    firstName: item.firstName,
    lastName: item.lastName,
    dni: `PENDIENTE-LIBRO-${number}`,
    joinDate: now,
    status: isDeceased ? "DECEASED" : "ACTIVE",
    type: isHonorary || isDeceased ? (isHonorary ? "HONORARIO" : "BAJA") : "ACTIVO",
    bajaReason: isDeceased ? "FALLECIMIENTO" : null,
    debtStatus: isHonorary || isDeceased || isNewThisYear ? "AL DIA" : "SUSPENDIDO",
    notes,
  }
}

async function main() {
  const apply = process.argv.includes("--apply")
  const mainRows = parseMainBookRows()
  const duplicateMembers = duplicateRows.map(([memberNumber, lastName, firstName, definitiveNumber]) => ({
    memberNumber,
    lastName,
    firstName,
    status: "DUPLICATE",
    type: "BAJA",
    bajaReason: "DUPLICADO",
    debtStatus: "AL DIA",
    dni: `PENDIENTE-LIBRO-${memberNumber}`,
    joinDate: now,
    notes: `Alta desde el libro oficial. Baja por duplicación; conservar el socio N° ${definitiveNumber} como definitivo. DNI pendiente de confirmar.`,
  }))

  const members = await prisma.member.findMany({
    select: { id: true, memberNumber: true, firstName: true, lastName: true, dni: true, status: true, type: true, debtStatus: true },
  })
  const byNumber = new Map(members.map((member) => [member.memberNumber, member]))
  const existingDnis = new Set(members.map((member) => member.dni))
  const renumberSources = new Set(officialRenumbering.map(([current]) => current))
  renumberSources.add("588")
  const renumberTargets = new Set(officialRenumbering.map(([, target]) => target))
  const requestedRows = [...mainRows, ...duplicateMembers]
  const duplicateCreateNumbers = new Set(duplicateMembers.map((member) => member.memberNumber))
  const missingCreateRows = mainRows.filter((row) => (!byNumber.has(row.memberNumber) || renumberSources.has(row.memberNumber)) && !renumberTargets.has(row.memberNumber))

  const conflicts = members.filter((member) => renumberTargets.has(member.memberNumber) && !renumberSources.has(member.memberNumber) && !duplicateCreateNumbers.has(member.memberNumber))
  const missingSources = officialRenumbering.filter(([current]) => !byNumber.has(current))
  const alreadyPresentCreates = requestedRows.filter((row) => byNumber.has(row.memberNumber) && !renumberSources.has(row.memberNumber) && !renumberTargets.has(row.memberNumber))
  const duplicateDniPlaceholders = [...missingCreateRows, ...duplicateMembers].filter((row) => existingDnis.has(`PENDIENTE-LIBRO-${row.memberNumber}`))

  console.log(`Altas nuevas previstas: ${missingCreateRows.length}`)
  console.log(`Altas duplicadas previstas: ${duplicateMembers.length}`)
  console.log(`Renumeraciones previstas: ${officialRenumbering.length}`)
  console.log(`Conflictos de destino: ${conflicts.length}`)
  console.log(`Fuentes de renumeración faltantes: ${missingSources.length}`)
  console.log(`Registros que ya existen sin renumeración: ${alreadyPresentCreates.length}`)
  if (missingCreateRows.length) console.log(`Nuevos: ${missingCreateRows.map((row) => row.memberNumber).join(", ")}`)
  if (conflicts.length) console.log(`Conflictos: ${conflicts.map((row) => `${row.memberNumber} ${row.lastName}, ${row.firstName}`).join(" | ")}`)
  if (missingSources.length) console.log(`Fuentes faltantes: ${missingSources.map(([current]) => current).join(", ")}`)

  if (!apply) {
    console.log("Modo verificación. No se modificó la base. Usá --apply para ejecutar.")
    return
  }

  if (conflicts.length || missingSources.length || alreadyPresentCreates.length || duplicateDniPlaceholders.length) {
    throw new Error("La validación detectó conflictos; no se ejecutó ninguna escritura.")
  }

  await prisma.$transaction(async (tx) => {
    const timestamp = Date.now()
    const sourceMembers = officialRenumbering.map(([current]) => byNumber.get(current)!).filter(Boolean)
    const sierra = byNumber.get("588")
    if (!sierra) throw new Error("No se encontró a Sierra Melisa en el N° 588.")
    sourceMembers.push(sierra)

    for (let index = 0; index < sourceMembers.length; index++) {
      await tx.member.update({ where: { id: sourceMembers[index].id }, data: { memberNumber: `TMP-RECON-${timestamp}-${index}` } })
    }

    for (const [current, target, lastName, firstName] of officialRenumbering) {
      const member = byNumber.get(current)!
      await tx.member.update({
        where: { id: member.id },
        data: { memberNumber: target, lastName, firstName },
      })
    }

    await tx.member.update({
      where: { id: sierra.id },
      data: {
        memberNumber: "598",
        status: "DUPLICATE",
        type: "BAJA",
        bajaReason: "DUPLICADO",
        debtStatus: "AL DIA",
        notes: "Registro duplicado de Sierra Melisa Alejandra N° 567; reubicado desde el N° 588 para asignar ese número oficial a Zeni Mariela.",
      },
    })

    for (const row of missingCreateRows) {
      await tx.member.create({ data: newMemberData(row) })
    }

    for (const row of duplicateMembers) {
      await tx.member.create({ data: row })
    }

    const duplicateExisting = byNumber.get("546")
    if (!duplicateExisting) throw new Error("No se encontró el registro actual N° 546 para marcarlo como duplicado.")
    await tx.member.update({
      where: { id: duplicateExisting.id },
      data: {
        status: "DUPLICATE",
        type: "BAJA",
        bajaReason: "DUPLICADO",
        debtStatus: "AL DIA",
        notes: "Baja por duplicación del libro; conservar el socio N° 593 como definitivo. DNI pendiente de confirmar.",
      },
    })
  }, { maxWait: 10000, timeout: 120000 })

  const finalMembers = await prisma.member.findMany({ select: { memberNumber: true, firstName: true, lastName: true, status: true, type: true, debtStatus: true } })
  const numeric = finalMembers.map((member) => Number(member.memberNumber)).filter(Number.isInteger)
  const duplicates = numeric.filter((number, index) => numeric.indexOf(number) !== index)
  console.log(`Aplicación completada. Registros finales: ${finalMembers.length}`)
  console.log(`Números duplicados finales: ${duplicates.length ? duplicates.join(", ") : "ninguno"}`)
  console.log(JSON.stringify(finalMembers.filter((member) => [2, 244, 245, 246, 250, 450, 464, 477, 479, 542, 543, 546, 561, 581, 584, 585, 587, 588, 593, 595, 596, 597, 598].includes(Number(member.memberNumber))), null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
