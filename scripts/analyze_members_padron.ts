import fs from "fs"
import path from "path"

const envFile = fs.readFileSync(path.join(__dirname, "../.env"), "utf8")
for (const line of envFile.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
  if (match) {
    process.env[match[1]] = match[2]
  }
}

import { db } from "../src/lib/db"

async function main() {
  const members = await db.member.findMany({
    orderBy: { createdAt: "asc" }
  })

  console.log("Total total de socios en base de datos:", members.length)

  // Desglose por tipo
  const byType: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  const parsedNumbers: { num: number; raw: string; name: string; type: string; status: string }[] = []
  const nonNumeric: string[] = []

  for (const m of members) {
    byType[m.type] = (byType[m.type] || 0) + 1
    byStatus[m.status] = (byStatus[m.status] || 0) + 1

    const num = parseInt(m.memberNumber, 10)
    if (!isNaN(num)) {
      parsedNumbers.push({
        num,
        raw: m.memberNumber,
        name: `${m.lastName}, ${m.firstName}`,
        type: m.type,
        status: m.status
      })
    } else {
      nonNumeric.push(`${m.memberNumber} (${m.lastName}, ${m.firstName})`)
    }
  }

  console.log("\nDesglose por Tipo de Socio:", byType)
  console.log("Desglose por Estado:", byStatus)

  // Ordenar numéricamente
  parsedNumbers.sort((a, b) => a.num - b.num)

  console.log("\nSocios con números numéricos:", parsedNumbers.length)
  if (nonNumeric.length > 0) {
    console.log("Socios con número NO numérico:", nonNumeric)
  }

  const existingNumSet = new Set(parsedNumbers.map(n => n.num))
  const minNum = parsedNumbers.length > 0 ? parsedNumbers[0].num : 0
  const maxNum = parsedNumbers.length > 0 ? parsedNumbers[parsedNumbers.length - 1].num : 0

  console.log(`Número Mínimo: #${minNum}, Número Máximo: #${maxNum}`)

  // Buscar huecos/números faltantes entre 1 y maxNum
  const missingBetween1AndMax: number[] = []
  for (let i = 1; i <= maxNum; i++) {
    if (!existingNumSet.has(i)) {
      missingBetween1AndMax.push(i)
    }
  }

  console.log(`\nFaltantes entre #1 y #${maxNum} (total ${missingBetween1AndMax.length} huecos):`)
  if (missingBetween1AndMax.length <= 50) {
    console.log(missingBetween1AndMax.join(", "))
  } else {
    console.log(`Primeros 50 huecos: ${missingBetween1AndMax.slice(0, 50).join(", ")}... y ${missingBetween1AndMax.length - 50} más.`)
  }

  // Agrupar rangos de números faltantes para legibilidad
  const ranges: string[] = []
  if (missingBetween1AndMax.length > 0) {
    let start = missingBetween1AndMax[0]
    let prev = start
    for (let i = 1; i < missingBetween1AndMax.length; i++) {
      const curr = missingBetween1AndMax[i]
      if (curr === prev + 1) {
        prev = curr
      } else {
        ranges.push(start === prev ? `#${start}` : `#${start} al #${prev}`)
        start = curr
        prev = curr
      }
    }
    ranges.push(start === prev ? `#${start}` : `#${start} al #${prev}`)
  }

  console.log("\nRangos de números vacíos/salteados:")
  console.log(ranges.join(", "))
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
