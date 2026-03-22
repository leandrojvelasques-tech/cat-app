import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

async function main() {
  const csvPath = "C:\\Users\\Leandro Velasques\\Downloads\\Hoja de cálculo sin título - Hoja 1.csv"
  const content = fs.readFileSync(csvPath, "utf-8")
  const lines = content.split("\n")

  console.log(`Processing ${lines.length} lines from CSV...`)

  for (const line of lines) {
    if (!line.trim()) continue
    
    // Simple CSV parse handling quotes for names with comma
    const parts = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') inQuotes = !inQuotes
        else if (char === ',' && !inQuotes) {
            parts.push(current.trim())
            current = ""
        } else {
            current += char
        }
    }
    parts.push(current.trim())

    if (parts.length < 2) continue

    const nroStr = parts[0]
    const fullName = parts[1]
    const email = parts[2] === "no tiene" || parts[2] === "No tiene" ? null : parts[2]
    const phone = parts[3] === "no tiene" || parts[3] === "No tiene" ? null : parts[3]
    const statusStr = parts[4]
    const joinDateStr = parts[5]

    const nro = parseInt(nroStr)
    if (isNaN(nro)) continue

    const names = fullName.split(" ").map(n => n.trim().toUpperCase())
    const lastName = names[0]
    const firstName = names.slice(1).join(" ")

    console.log(`- Proc [N° ${nro}] ${fullName}`)

    // 1. Determine base status
    let status = "ACTIVE"
    if (statusStr?.toLowerCase().includes("baja")) status = "RESIGNED"
    if (statusStr?.toLowerCase().includes("definir")) status = "PENDING"
    if (statusStr?.toLowerCase().includes("honorario")) status = "HONORARY"

    // 2. Parse Date
    let joinDate: Date | null = null
    if (joinDateStr && joinDateStr.includes("/")) {
        const dparts = joinDateStr.split("/")
        const d = parseInt(dparts[0])
        const m = parseInt(dparts[1])
        const y = parseInt(dparts[2])
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
            let fixedYear = y
            if (y < 100) fixedYear += (y < 30 ? 2000 : 1900)
            if (y > 2100) fixedYear = 2004
            joinDate = new Date(fixedYear, m - 1, d)
        }
    }

    // 3. Upsert User Email
    let userEmail = email ? email.toLowerCase().trim() : null
    if (!userEmail || userEmail === "no tiene" || userEmail.includes("falleció")) {
      userEmail = `socio${nro}@cat.com` // Unique fallback
    }

    // 4. Find if member exists by number
    let existingMember = await prisma.member.findFirst({
        where: { memberNumber: nro }
    })

    // Attempt to find or create user
    let user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: userEmail,
                passwordHash: "$2b$10$TangoAdmin2026!HashPlaceholder",
                role: "MEMBER"
            }
        })
    }

    if (existingMember) {
        // Update
        // Only update userId if not set to avoid collision if user is already taken by another member
        const userTaken = await prisma.member.findFirst({ where: { userId: user.id, id: { not: existingMember.id } } })
        
        await prisma.member.update({
            where: { id: existingMember.id },
            data: {
                firstName: firstName || existingMember.firstName,
                lastName: lastName || existingMember.lastName,
                email: email || existingMember.email,
                phone: phone || existingMember.phone,
                joinDate: joinDate || existingMember.joinDate,
                status: status,
                userId: userTaken ? existingMember.userId : user.id
            }
        })
    } else {
        // Create new
        try {
            // Check if user is already taken by a new member created in this loop (collision on email)
            const userTaken = await prisma.member.findUnique({ where: { userId: user.id } })
            if (userTaken) {
                // Generate a truly unique user for this specific duplicate number if it happens
                const uniqueEmail = `socio${nro}_${Math.random().toString(36).substring(7)}@cat.com`
                const newUser = await prisma.user.create({
                    data: {
                        email: uniqueEmail,
                        passwordHash: "$2b$10$TangoAdmin2026!HashPlaceholder",
                        role: "MEMBER"
                    }
                })
                user = newUser
            }

            await prisma.member.create({
                data: {
                    memberNumber: nro,
                    firstName: firstName || lastName || "DESCONOCIDO",
                    lastName: lastName || "DESCONOCIDO",
                    email: email,
                    phone: phone,
                    joinDate: joinDate || new Date(),
                    status: status,
                    userId: user.id,
                    dni: `MIG-${nro}-${Math.random().toString(36).substring(7)}`,
                    type: "ACTIVO",
                    address: "Importado desde CSV v2"
                }
            })
        } catch (e: any) {
            console.warn(`Could not create member ${nro}: ${e.message}`)
        }
    }
  }

  console.log("\n✅ Migration finished.")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
