/**
 * Script de migración Mayo 2026
 * - Borra todas las cuotas previas a 2026
 * - Carga cuotas 2026 desde datos del Excel
 * - Actualiza estados de socios (ACTIVE/DEBTOR/INACTIVE)
 * - Crea socios nuevos que no existían
 * - Carga catálogo de buffet
 * - Borra cobranzas de eventos existentes
 * - Agrega settings de precio milonga
 */

import { PrismaClient } from '@prisma/client'
import { MEMBER_PAYMENTS, BUFFET_PRODUCTS } from './migration-data'

const prisma = new PrismaClient()

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  // Formato: APELLIDO(S) NOMBRE(S) - el primer token es apellido
  // Heurística: si hay 2 palabras, primera=apellido, segunda=nombre
  // Si hay más, intentamos detectar patrones comunes
  if (parts.length <= 1) return { firstName: parts[0] || '', lastName: '' }
  
  // Casos especiales con apellidos compuestos conocidos
  const compoundLastNames = ['DAS NEVES', "D'ANGELO", 'DIAZ IRIBARNE', 'CEJAS MAIDANA', 
    'MAYORGA SANCHEZ', 'LOPEZ MIGUEL', 'ORTIZ YANINA', 'THOMAS KARINA']
  
  // Para este dataset, el formato es: APELLIDO NOMBRE
  // Tomamos la primera palabra como apellido y el resto como nombre
  const lastName = parts[0]
  const firstName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

async function findMemberByNameAndNumber(
  fullName: string, 
  memberNumber: string
): Promise<string | null> {
  const { firstName, lastName } = parseName(fullName)
  
  // Intentar match por número de socio (si no es 999)
  if (memberNumber !== '999') {
    const byNumber = await prisma.member.findFirst({
      where: { memberNumber }
    })
    if (byNumber) return byNumber.id
  }

  // Match por apellido+nombre (case insensitive)
  const byName = await prisma.member.findFirst({
    where: {
      AND: [
        { lastName: { contains: lastName, mode: 'insensitive' } },
        { firstName: { contains: firstName.split(' ')[0], mode: 'insensitive' } }
      ]
    }
  })
  if (byName) return byName.id

  // Match invertido: nombre en apellido y viceversa
  const byNameInverted = await prisma.member.findFirst({
    where: {
      AND: [
        { firstName: { contains: lastName, mode: 'insensitive' } },
        { lastName: { contains: firstName.split(' ')[0], mode: 'insensitive' } }
      ]
    }
  })
  if (byNameInverted) return byNameInverted.id

  return null
}

async function main() {
  console.log('=== MIGRACIÓN MAYO 2026 ===\n')

  // PASO 1: Borrar todas las cuotas anteriores a 2026
  console.log('1. Borrando cuotas anteriores a 2026...')
  const deletedOldFees = await prisma.membershipFee.deleteMany({
    where: { periodYear: { lt: 2026 } }
  })
  console.log(`   → ${deletedOldFees.count} cuotas eliminadas\n`)

  // PASO 1b: Borrar cuotas 2026 existentes para empezar limpio
  console.log('1b. Borrando cuotas 2026 existentes (reset)...')
  const deleted2026 = await prisma.membershipFee.deleteMany({
    where: { periodYear: 2026 }
  })
  console.log(`   → ${deleted2026.count} cuotas 2026 eliminadas\n`)

  // PASO 2: Procesar cada socio del Excel
  console.log('2. Procesando socios del Excel...\n')
  
  const results = { created: 0, matched: 0, feesCreated: 0, errors: [] as string[] }
  const processedMemberIds: string[] = []

  for (const mp of MEMBER_PAYMENTS) {
    const { firstName, lastName } = parseName(mp.name)
    
    // Buscar socio existente
    let memberId = await findMemberByNameAndNumber(mp.name, mp.memberNumber)

    if (!memberId) {
      // Crear socio nuevo
      console.log(`   NUEVO: ${mp.name} (N° ${mp.memberNumber})`)
      const newMember = await prisma.member.create({
        data: {
          memberNumber: mp.memberNumber,
          firstName,
          lastName,
          dni: `PENDIENTE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          status: 'ACTIVE',
          type: 'ACTIVO',
          joinDate: new Date('2026-01-01'),
        }
      })
      memberId = newMember.id
      results.created++
    } else {
      console.log(`   MATCH: ${mp.name} → encontrado en DB`)
      results.matched++
    }

    processedMemberIds.push(memberId)

    // Cargar pagos
    for (const payment of mp.payments) {
      const paymentDate = new Date(2026, payment.payMonth - 1, payment.payDay)
      
      try {
        await prisma.membershipFee.create({
          data: {
            memberId,
            periodYear: 2026,
            periodMonth: payment.month,
            amountDue: 6000,
            amountPaid: payment.amount,
            paymentDate,
            paymentMethod: 'EFECTIVO',
            paymentStatus: payment.amount >= 6000 ? 'PAID' : 'PAID',
          }
        })
        results.feesCreated++
      } catch (e: any) {
        // Puede haber duplicados si se corre 2 veces
        results.errors.push(`Fee ${mp.name} mes ${payment.month}: ${e.message}`)
      }
    }
  }

  console.log(`\n   Resumen: ${results.matched} existentes, ${results.created} nuevos, ${results.feesCreated} cuotas cargadas`)
  if (results.errors.length > 0) {
    console.log(`   ⚠ ${results.errors.length} errores:`)
    results.errors.forEach(e => console.log(`     - ${e}`))
  }

  // PASO 3: Actualizar estados
  console.log('\n3. Actualizando estados de socios...\n')

  // 3a: Los que tienen Mayo pagado → ACTIVE
  const membersWithMay = await prisma.membershipFee.findMany({
    where: { periodYear: 2026, periodMonth: 5 },
    select: { memberId: true }
  })
  const mayMemberIds = membersWithMay.map(f => f.memberId)
  
  const activeUpdated = await prisma.member.updateMany({
    where: { id: { in: mayMemberIds } },
    data: { status: 'ACTIVE' }
  })
  console.log(`   AL DÍA (ACTIVE): ${activeUpdated.count} socios`)

  // 3b: Los que tienen Feb/Mar/Abr pero NO Mayo → DEBTOR
  const membersWithFebMarAbr = await prisma.membershipFee.findMany({
    where: {
      periodYear: 2026,
      periodMonth: { in: [2, 3, 4] },
      memberId: { notIn: mayMemberIds }
    },
    select: { memberId: true },
    distinct: ['memberId']
  })
  const debtorMemberIds = membersWithFebMarAbr.map(f => f.memberId)

  const debtorUpdated = await prisma.member.updateMany({
    where: { id: { in: debtorMemberIds } },
    data: { status: 'DEBTOR' }
  })
  console.log(`   EN MORA (DEBTOR): ${debtorUpdated.count} socios`)

  // 3c: Los que solo tienen Enero o nada en 2026 → INACTIVE
  // Primero: socios en el Excel con solo Enero
  const onlyJanIds = processedMemberIds.filter(
    id => !mayMemberIds.includes(id) && !debtorMemberIds.includes(id)
  )
  if (onlyJanIds.length > 0) {
    await prisma.member.updateMany({
      where: { id: { in: onlyJanIds } },
      data: { status: 'INACTIVE' }
    })
  }

  // 3d: TODOS los socios que NO están en el Excel → INACTIVE
  // (excepto los que ya procesamos y los que son DECEASED/RESIGNED/HONORARIO)
  const inactivated = await prisma.member.updateMany({
    where: {
      id: { notIn: processedMemberIds },
      status: { notIn: ['DECEASED', 'RESIGNED'] },
      type: { not: 'HONORARIO' }
    },
    data: { status: 'INACTIVE' }
  })
  console.log(`   INACTIVOS: ${onlyJanIds.length + inactivated.count} socios (${onlyJanIds.length} del Excel + ${inactivated.count} fuera del Excel)`)

  // PASO 4: Borrar registraciones/cobranzas de eventos existentes
  console.log('\n4. Borrando registraciones de eventos existentes...')
  const deletedRegs = await prisma.eventRegistration.deleteMany({})
  console.log(`   → ${deletedRegs.count} registraciones eliminadas`)

  // PASO 5: Cargar catálogo de buffet
  console.log('\n5. Actualizando catálogo de buffet...')
  
  // Desactivar productos existentes
  await prisma.buffetProduct.updateMany({
    data: { active: false }
  })

  for (const product of BUFFET_PRODUCTS) {
    await prisma.buffetProduct.create({
      data: {
        name: product.name,
        price: product.price,
        type: product.type,
        active: true,
      }
    })
  }
  console.log(`   → ${BUFFET_PRODUCTS.length} productos cargados`)

  // PASO 6: Configurar precios de milonga
  console.log('\n6. Configurando precios de milonga...')
  await prisma.setting.upsert({
    where: { key: 'precio_milonga_socio' },
    update: { value: '2000' },
    create: { key: 'precio_milonga_socio', value: '2000' }
  })
  await prisma.setting.upsert({
    where: { key: 'precio_milonga_no_socio' },
    update: { value: '9000' },
    create: { key: 'precio_milonga_no_socio', value: '9000' }
  })
  console.log('   → Socio: $2000, No Socio: $9000')

  // RESUMEN FINAL
  console.log('\n=== MIGRACIÓN COMPLETADA ===')
  
  const totalActive = await prisma.member.count({ where: { status: 'ACTIVE' } })
  const totalDebtor = await prisma.member.count({ where: { status: 'DEBTOR' } })
  const totalInactive = await prisma.member.count({ where: { status: 'INACTIVE' } })
  const totalFees = await prisma.membershipFee.count({ where: { periodYear: 2026 } })
  const totalProducts = await prisma.buffetProduct.count({ where: { active: true } })

  console.log(`\n  Socios AL DÍA:    ${totalActive}`)
  console.log(`  Socios EN MORA:   ${totalDebtor}`)
  console.log(`  Socios INACTIVOS: ${totalInactive}`)
  console.log(`  Cuotas 2026:      ${totalFees}`)
  console.log(`  Productos Buffet: ${totalProducts}`)
}

main()
  .catch(e => {
    console.error('ERROR:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
