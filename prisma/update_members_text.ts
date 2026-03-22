// @ts-nocheck
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

async function main() {
  const filePath = "tmp_members.txt"
  if (!fs.existsSync(filePath)) {
    console.error("File not found")
    return
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.split("\n")

  console.log(`Processing ${lines.length} lines...`)

  for (const line of lines) {
    if (!line.trim()) continue
    
    // Split by tab (usually how spreadsheets paste)
    const parts = line.split("\t").map(p => p.trim())
    
    if (parts.length < 2) continue

    const nroStr = parts[0]
    const fullName = parts[1]
    const email = parts[2] === "No tiene" || parts[2] === "no tiene" || !parts[2] ? null : parts[2]
    const phone = parts[3] === "No tiene" || parts[3] === "no tiene" || !parts[3] ? null : parts[3]
    const statusStr = parts[4]
    const joinDateStr = parts[5]

    const nro = parseInt(nroStr)
    if (isNaN(nro)) continue

    // Clean name and check for notes
    let cleanName = fullName.replace(/Falleció/gi, "").replace(/falleció/gi, "").trim()
    const isDeceased = fullName.toLowerCase().includes("falleció") || (statusStr && statusStr.toLowerCase().includes("falleció"))
    
    const names = cleanName.split(" ").map(n => n.trim().toUpperCase())
    const lastName = names[0]
    const firstName = names.slice(1).join(" ")

    console.log(`- Proc [N° ${nro}] ${cleanName}`)

    // Status mapping
    let status = "ACTIVE"
    let type = "ACTIVO"

    if (statusStr?.toLowerCase().includes("baja")) status = "INACTIVE"
    if (statusStr?.toLowerCase().includes("honorario")) type = "HONORARIO"
    if (isDeceased) status = "DECEASED"

    // Parse Date
    let joinDate: Date | null = null
    if (joinDateStr && joinDateStr.includes("/")) {
        const dparts = joinDateStr.split("/")
        const d = parseInt(dparts[0])
        const m = parseInt(dparts[1])
        const yStr = dparts[2]
        
        if (!isNaN(d) && !isNaN(m)) {
            let y = parseInt(yStr)
            if (!isNaN(y)) {
                if (y < 100) y += (y < 30 ? 2000 : 1900)
                joinDate = new Date(y, m - 1, d)
            }
        }
    }

    // Find member by number
    let existingMember = await prisma.member.findFirst({
        where: { memberNumber: nro.toString() }
    })

    if (existingMember) {
        await prisma.member.update({
            where: { id: existingMember.id },
            data: {
                firstName: firstName || existingMember.firstName,
                lastName: lastName || existingMember.lastName,
                email: email || existingMember.email,
                phone: phone || existingMember.phone,
                joinDate: joinDate || existingMember.joinDate,
                type: type,
                status: status,
                notes: isDeceased ? "MARCADO COMO FALLECIDO DESDE TEXTO" : existingMember.notes
            }
        })
    } else {
        // Create new if not found (though expected to find most)
        try {
            // Check if email is already used by another user to avoid crash
            let userEmail = email ? email.toLowerCase().trim() : `socio${nro}@cat.com`
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

            await prisma.member.create({
                data: {
                    memberNumber: nro.toString(),
                    firstName: firstName || cleanName || "S/D",
                    lastName: lastName || "S/D",
                    dni: `MIG-${nro}-${Math.random().toString(36).substring(7)}`,
                    email: email,
                    phone: phone,
                    joinDate: joinDate || new Date(),
                    status: status,
                    type: type,
                    userId: user.id,
                    address: "Importado desde actualización de texto"
                }
            })
        } catch (e: any) {
            console.warn(`Could not sync member ${nro}: ${e.message}`)
        }
    }
  }

  console.log("\n✅ Update finished.")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
