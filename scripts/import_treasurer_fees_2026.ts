import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

const monthMap: Record<string, number> = {
  'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
  'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
  'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
}

const manualMappings: Record<string, string> = {
  'DIAZ, MARGOT MARIA': '513',
  'LOPEZ MIGUEL ALFREDO': '562',
  'AGUERRI, MAGALÍ CELESTE': '1000',
  'AGUERRI, MAGAL CELESTE': '1000',
  'URIBE, JOSÉ RUPERTO': '571',
  'URIBE, JOS RUPERTO': '571',
  'CHAPARRO JORGE ANTONIO': '567',
  "D'ANGELO ANTONELLA": '570',
  'CEJAS MAIDANA FLORENCIA': '573',
  'VILLALOBOS GRACIELA': '568',
  'AYBAR ROBERTO': '572',
  'ZURLIS MARIA ROSA': '569',
  'TRONCOSO ANTONIO': '1011',
  'HERNANDEZ CARLA': '576'
}

function parsePaymentDate(dateStr: string | null, monthNum: number): Date {
  if (dateStr) {
    const parts = dateStr.split('/')
    if (parts.length === 2) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      if (!isNaN(day) && !isNaN(month)) {
        return new Date(2026, month - 1, day)
      }
    }
  }
  return new Date(2026, monthNum - 1, 1)
}

async function main() {
  console.log('=== CARGANDO PAGOS REGISTRADOS POR EL TESORERO (2026) ===\n')

  const pdfData = JSON.parse(fs.readFileSync('../scripts/cuotas_2026_parsed.json', 'utf-8'))

  const dbMembers = await prisma.member.findMany()
  const dbMapByNum = new Map<string, typeof dbMembers[0]>()
  for (const m of dbMembers) {
    dbMapByNum.set(String(m.memberNumber).trim(), m)
  }

  let totalFeesCreated = 0
  let totalFeesUpdated = 0
  let totalAmountImported = 0
  const memberStatusUpdates = new Set<string>()

  for (const pdfItem of pdfData) {
    const rawName = pdfItem.name
    const rawNum = String(pdfItem.socio_num || '').trim()

    let member = dbMapByNum.get(rawNum)
    if (!member) {
      for (const [k, num] of Object.entries(manualMappings)) {
        if (rawName.toLowerCase().includes(k.toLowerCase().slice(0, 5))) {
          member = dbMapByNum.get(num)
          if (member) break
        }
      }
    }
    if (!member) {
      const tokens = rawName.toUpperCase().replace(/[^A-Z]/g, ' ').split(/\s+/)
      for (const m of dbMembers) {
        const full = `${m.lastName} ${m.firstName}`.toUpperCase()
        if (tokens[0] && full.includes(tokens[0])) {
          member = m
          break
        }
      }
    }

    if (!member) {
      console.log(`❌ No se encontró socio en BD para: ${rawName}`)
      continue
    }

    // Process each month payment
    for (const [monthName, pInfo] of Object.entries(pdfItem.payments) as [string, any][]) {
      const monthNum = monthMap[monthName]
      if (!monthNum) continue

      const amount = pInfo.amount || 6000
      const pDate = parsePaymentDate(pInfo.date, monthNum)

      const existingFee = await prisma.membershipFee.findUnique({
        where: {
          memberId_periodYear_periodMonth: {
            memberId: member.id,
            periodYear: 2026,
            periodMonth: monthNum
          }
        }
      })

      if (existingFee) {
        await prisma.membershipFee.update({
          where: { id: existingFee.id },
          data: {
            amountDue: amount,
            amountPaid: amount,
            paymentStatus: 'PAID',
            paymentDate: pDate,
            notes: 'Actualizado según registro del Tesorero (PDF 2026)'
          }
        })
        totalFeesUpdated++
      } else {
        await prisma.membershipFee.create({
          data: {
            memberId: member.id,
            periodYear: 2026,
            periodMonth: monthNum,
            amountDue: amount,
            amountPaid: amount,
            paymentStatus: 'PAID',
            paymentMethod: 'EFECTIVO',
            paymentDate: pDate,
            notes: 'Cargado según registro del Tesorero (PDF 2026)'
          }
        })
        totalFeesCreated++
      }

      totalAmountImported += amount
    }

    // Update status to ACTIVE if member has paid cuotas for recent months (e.g. May/June/etc)
    memberStatusUpdates.add(member.id)
  }

  // Update status for active members
  for (const mId of memberStatusUpdates) {
    const m = await prisma.member.findUnique({ where: { id: mId } })
    if (m && m.status !== 'DECEASED' && m.status !== 'RESIGNED') {
      await prisma.member.update({
        where: { id: mId },
        data: { status: 'ACTIVE' }
      })
    }
  }

  console.log(`✓ Cuotas creadas nuevas: ${totalFeesCreated}`)
  console.log(`✓ Cuotas actualizadas: ${totalFeesUpdated}`)
  console.log(`✓ Total recaudado importado en cuotas 2026: $${totalAmountImported.toLocaleString('es-AR')}`)
  console.log(`✓ Socios con estado actualizado a ACTIVO: ${memberStatusUpdates.size}`)
}

main()
  .catch(e => {
    console.error('Error importando cuotas del Tesorero:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
