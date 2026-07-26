import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const membersToInsert = [
  {
    memberNumber: '427',
    firstName: 'SILVIO A.',
    lastName: 'VILLAROEL',
    status: 'INACTIVE',
    type: 'ACTIVO',
    notes: 'Importado de planilla antigua (Cuotas CAT)'
  },
  {
    memberNumber: '428',
    firstName: 'MAXIMILIANO',
    lastName: 'ACQUAVIVA',
    status: 'INACTIVE',
    type: 'ACTIVO',
    notes: 'Importado de planilla antigua (Cuotas CAT)'
  },
  {
    memberNumber: '429',
    firstName: 'DAMIAN',
    lastName: 'CARIZZO',
    status: 'INACTIVE',
    type: 'ACTIVO',
    notes: 'Importado de planilla antigua (Cuotas CAT)'
  },
  {
    memberNumber: '577',
    firstName: 'ANGELA DANIELA',
    lastName: 'TABOADA',
    status: 'ACTIVE',
    type: 'ACTIVO',
    notes: 'Importado de planilla antigua (Cuotas CAT - Socio Activo)'
  },
  {
    memberNumber: '291',
    firstName: 'Diana',
    lastName: 'BELLISOMI',
    phone: '448-6658',
    status: 'DECEASED',
    type: 'BAJA',
    notes: 'Falleció / Socio de Baja en planilla antigua'
  },
  {
    memberNumber: '301',
    firstName: 'MIGUEL ROQUE (Chiche)',
    lastName: 'MARTINEZ',
    status: 'DECEASED',
    type: 'BAJA',
    notes: 'Falleció / Socio de Baja en planilla antigua'
  },
  {
    memberNumber: '282',
    firstName: 'SOCIO SIN IDENTIFICAR',
    lastName: 'Nº 282',
    email: 'omarbalc@yahoo.es',
    status: 'INACTIVE',
    type: 'SIN DEFINIR',
    notes: 'Cargado a partir del email omarbalc@yahoo.es en planilla antigua'
  },
  {
    memberNumber: '294',
    firstName: 'SOCIO SIN IDENTIFICAR',
    lastName: 'Nº 294',
    email: 'anamgarcia@hotmail.com',
    phone: '444-0144',
    status: 'INACTIVE',
    type: 'SIN DEFINIR',
    notes: 'Cargado a partir del email anamgarcia@hotmail.com en planilla antigua'
  }
]

async function main() {
  console.log('=== INSERTANDO 8 SOCIOS FALTANTES ===\n')

  let insertedCount = 0

  for (const item of membersToInsert) {
    // Check if member number already exists
    const existing = await prisma.member.findFirst({
      where: { memberNumber: item.memberNumber }
    })

    if (existing) {
      console.log(`⚠ El socio Nº ${item.memberNumber} ya existe en DB: ${existing.lastName}, ${existing.firstName}`)
      continue
    }

    const created = await prisma.member.create({
      data: {
        memberNumber: item.memberNumber,
        firstName: item.firstName,
        lastName: item.lastName,
        dni: `PENDIENTE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email: item.email || null,
        phone: item.phone || null,
        status: item.status,
        type: item.type,
        notes: item.notes,
        joinDate: new Date('2023-01-01')
      }
    })

    console.log(`✓ Insertado Nº ${created.memberNumber}: ${created.lastName}, ${created.firstName} (Estado: ${created.status})`)
    insertedCount++
  }

  console.log(`\n=== PROCESO COMPLETADO: ${insertedCount} socios insertados ===`)
}

main()
  .catch(e => {
    console.error('Error insertando socios:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
