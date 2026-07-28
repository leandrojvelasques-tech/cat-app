/**
 * Elimina el registro de cuota de Maria Rosa Zurlis - Julio 2026
 * Comprobante: #66BBEFDF
 *
 * Ejecución: npx tsx prisma/scripts/delete_fee_66bbefdf.ts
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function main() {
  // Buscar el registro por ID (el comprobante muestra los primeros 8 caracteres del UUID)
  const fee = await db.membershipFee.findFirst({
    where: {
      id: { startsWith: "66bbefdf", mode: "insensitive" }
    },
    include: { member: true }
  })

  if (!fee) {
    console.error("❌ No se encontró el registro de cuota con ID iniciando en '66bbefdf'")
    process.exit(1)
  }

  console.log(`✅ Registro encontrado:`)
  console.log(`   Socio: ${fee.member.firstName} ${fee.member.lastName}`)
  console.log(`   Período: ${fee.periodMonth}/${fee.periodYear}`)
  console.log(`   Monto: $${fee.amountPaid}`)
  console.log(`   ID completo: ${fee.id}`)

  await db.membershipFee.delete({ where: { id: fee.id } })

  console.log(`\n🗑️  Registro eliminado correctamente.`)
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
