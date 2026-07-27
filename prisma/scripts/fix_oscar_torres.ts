/**
 * Script de reparación: Reactiva a Óscar Torres (DECEASED → ACTIVE)
 * y le aplica el descuento familiar del 50% vinculándolo a Elena Herold.
 *
 * Ejecución: npx tsx prisma/scripts/fix_oscar_torres.ts
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  // 1. Buscar a Óscar Torres
  const oscar = await db.member.findFirst({
    where: {
      AND: [
        { firstName: { contains: "scar", mode: "insensitive" } },
        { lastName: { contains: "Torres", mode: "insensitive" } },
      ],
    },
  })

  if (!oscar) {
    console.error("❌ No se encontró ningún socio con nombre Óscar Torres")
    process.exit(1)
  }

  console.log(`✅ Encontrado: ${oscar.firstName} ${oscar.lastName} (ID: ${oscar.id}) — Estado actual: ${oscar.status}`)

  // 2. Buscar a Elena Herold
  const elena = await db.member.findFirst({
    where: {
      AND: [
        { firstName: { contains: "Elena", mode: "insensitive" } },
        { lastName: { contains: "Herold", mode: "insensitive" } },
      ],
    },
  })

  if (!elena) {
    console.error("❌ No se encontró ningún socio con nombre Elena Herold")
    process.exit(1)
  }

  console.log(`✅ Encontrada: ${elena.firstName} ${elena.lastName} (ID: ${elena.id}) — Estado actual: ${elena.status}`)

  // 3. Reactivar a Óscar Torres + aplicar descuento familiar
  await db.member.update({
    where: { id: oscar.id },
    data: {
      status: "ACTIVE",
      deactivatedAt: null,
      isFamilyDiscount: true,
      partnerId: elena.id,
    },
  })
  console.log(`✅ Óscar Torres reactivado → ACTIVE con descuento familiar (partner: Elena Herold)`)

  // 4. Vincular el descuento familiar en Elena Herold (simétrico)
  await db.member.update({
    where: { id: elena.id },
    data: {
      isFamilyDiscount: true,
      partnerId: oscar.id,
    },
  })
  console.log(`✅ Elena Herold actualizada → isFamilyDiscount=true (partner: Óscar Torres)`)

  console.log("\n🎉 Operación completada exitosamente.")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
