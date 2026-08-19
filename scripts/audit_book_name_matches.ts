import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/gi, " ")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim()
}

async function main() {
  const reportPath = path.resolve(__dirname, "../../docs/reports/socios-del-libro-no-cargados-2026-08-18.md")
  const bookRows = fs
    .readFileSync(reportPath, "utf8")
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const columns = line.split("|").map((column) => column.trim())
      return { number: columns[1], name: normalize(columns[2].replace(/\[validar\]/g, "")) }
    })

  const members = await prisma.member.findMany({
    select: { memberNumber: true, firstName: true, lastName: true, dni: true, email: true, phone: true }
  })

  for (const row of bookRows) {
    const tokens = row.name.split(" ").filter((token) => token.length >= 5)
    const hits = members.filter((member) => {
      const fullName = normalize(`${member.firstName} ${member.lastName}`)
      const matchingTokens = tokens.filter((token) => fullName.includes(token)).length
      return matchingTokens >= Math.min(2, tokens.length)
    })

    if (hits.length > 0) {
      console.log(JSON.stringify({
        bookNumber: row.number,
        bookName: row.name,
        matches: hits.map((member) => ({
          memberNumber: member.memberNumber,
          name: `${member.lastName}, ${member.firstName}`,
          dni: member.dni,
          email: member.email,
          phone: member.phone
        }))
      }))
    }
  }
}

main().finally(() => prisma.$disconnect())
