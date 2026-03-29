/**
 * EMERGENCY RESTORE SCRIPT
 * Recreates admin users and ALL members from tmp_members.txt data
 * Run with: npx tsx prisma/emergency_restore.ts
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

const ADMIN_PASSWORD = "TangoAdmin2026!"

// Board members from the original seed
const boardMembers = [
  { email: "dolores.moron@centroamigosdeltango.com", name: "Dolores Moron", position: "Presidente" },
  { email: "federico.riquelme@centroamigosdeltango.com", name: "Federico Riquelme", position: "Vice Presidente" },
  { email: "camila.elly@centroamigosdeltango.com", name: "Camila Elly", position: "Secretaria" },
  { email: "alberto.baldini@centroamigosdeltango.com", name: "Alberto Baldini", position: "Tesorero" },
  { email: "barbara.morales@centroamigosdeltango.com", name: "Bárbara Morales", position: "1er Vocal" },
  { email: "diana.lorenzo@centroamigosdeltango.com", name: "Diana Lorenzo", position: "2do Vocal" },
  { email: "laura.marinelli@centroamigosdeltango.com", name: "Laura Marinelli", position: "3er Vocal" },
  { email: "sergio.lopez@centroamigosdeltango.com", name: "Sergio López", position: "1er Vocal Suplente" },
  { email: "pablo.correia@centroamigosdeltango.com", name: "Pablo Correia", position: "2do Vocal Suplente" },
]

function parseStatus(raw: string): string {
  const s = raw.trim().toLowerCase()
  if (s.includes("baja") || s.includes("falleció") || s.includes("fallecio")) return "RESIGNED"
  if (s.includes("honorario")) return "ACTIVE"
  if (s.includes("activo")) return "ACTIVE"
  return "ACTIVE"
}

function parseDate(raw: string): Date {
  if (!raw || raw.trim() === "") return new Date("2010-01-01")
  const parts = raw.trim().split("/")
  if (parts.length === 3) {
    const day = parseInt(parts[0]) || 1
    const month = parseInt(parts[1]) || 1
    let year = parseInt(parts[2]) || 2010
    // Fix typos like 2204 -> 2004, 2088 -> 2008
    if (year > 2030) year = parseInt(parts[2].substring(0, 2) + parts[2].substring(2)) 
    if (year > 2030) year = 2010
    return new Date(year, month - 1, day)
  }
  return new Date("2010-01-01")
}

async function main() {
  console.log("=== EMERGENCY RESTORE STARTED ===")
  
  const pwHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  // 1. Restore SuperAdmin
  console.log("Creating superadmin...")
  await prisma.user.upsert({
    where: { email: "admin@centroamigosdeltango.com" },
    update: { passwordHash: pwHash, role: "ADMIN", name: "SuperAdmin" },
    create: {
      email: "admin@centroamigosdeltango.com",
      passwordHash: pwHash,
      role: "ADMIN",
      name: "SuperAdmin",
    },
  })

  // Leandro's personal admin access
  await prisma.user.upsert({
    where: { email: "leandrojvelasques@gmail.com" },
    update: { passwordHash: pwHash, role: "ADMIN", name: "Leandro Velasques" },
    create: {
      email: "leandrojvelasques@gmail.com",
      passwordHash: pwHash,
      role: "ADMIN",
      name: "Leandro Velasques",
    },
  })

  // 2. Restore Board Members
  console.log("Creating board members...")
  for (const bm of boardMembers) {
    await prisma.user.upsert({
      where: { email: bm.email },
      update: { passwordHash: pwHash, role: "BOARD", position: bm.position, isBoardMember: true, name: bm.name },
      create: {
        email: bm.email,
        passwordHash: pwHash,
        role: "BOARD",
        position: bm.position,
        isBoardMember: true,
        name: bm.name,
      },
    })
  }

  // 3. Restore Members from tmp_members.txt
  const txtPath = path.join(process.cwd(), "tmp_members.txt")
  const lines = fs.readFileSync(txtPath, "utf-8").split("\n").filter(l => l.trim())
  
  console.log(`Restoring ${lines.length} members from tmp_members.txt...`)
  let created = 0
  let skipped = 0

  for (const line of lines) {
    const cols = line.split("\t")
    if (cols.length < 2) { skipped++; continue }

    const nroStr = cols[0].trim()
    const nombre = cols[1].trim()
    const email = cols[2]?.trim() || ""
    const phone = cols[3]?.trim() || ""
    const statusRaw = cols[4]?.trim() || "Socio Activo"
    const joinRaw = cols[5]?.trim() || ""

    if (!nombre || nombre === "") { skipped++; continue }

    // Parse name: APELLIDO NOMBRE
    const nameParts = nombre.split(" ")
    const lastName = nameParts[0] || nombre
    const firstName = nameParts.slice(1).join(" ") || lastName

    const memberNumber = nroStr.replace(/\D/g, "") || "999"
    const status = parseStatus(statusRaw)
    const joinDate = parseDate(joinRaw)

    // Normalize email — skip invalid/placeholder strings
    const cleanEmail = (email && 
      !email.toLowerCase().includes("no tiene") && 
      email.includes("@")) ? email.toLowerCase().trim() : null

    try {
      // Check for existing member by memberNumber to avoid duplicates
      const existing = await prisma.member.findFirst({
        where: { memberNumber }
      })

      if (!existing) {
        // Generate a placeholder DNI based on memberNumber to ensure uniqueness
        const placeholderDni = `TEMP${memberNumber.padStart(6, "0")}${created}`
        await prisma.member.create({
          data: {
            memberNumber,
            firstName,
            lastName,
            dni: placeholderDni,
            email: cleanEmail,
            phone: phone || null,
            type: statusRaw.toLowerCase().includes("honorario") ? "HONORARIO" : "ACTIVO",
            status,
            joinDate,
          }
        })
        created++
      } else {
        skipped++
      }
    } catch (err: any) {
      console.error(`  Error on member ${memberNumber} ${nombre}: ${err.message}`)
      skipped++
    }
  }

  console.log(`=== RESTORE COMPLETE ===`)
  console.log(`Members: ${created} created, ${skipped} skipped`)
  console.log(``)
  console.log(`LOGIN CREDENTIALS:`)
  console.log(`  Email: admin@centroamigosdeltango.com`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log(``)
  console.log(`  Also:`)
  console.log(`  Email: leandrojvelasques@gmail.com`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
