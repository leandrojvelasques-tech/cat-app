import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const pdfData = JSON.parse(fs.readFileSync('../scripts/cuotas_2026_parsed.json', 'utf-8'))

  const dbMembers = await prisma.member.findMany({
    include: {
      fees: {
        where: {
          periodYear: { gte: 2026 }
        },
        orderBy: [
          { periodYear: 'desc' },
          { periodMonth: 'desc' }
        ]
      }
    }
  })

  const dbMapByNum = new Map<string, typeof dbMembers[0]>()
  for (const m of dbMembers) {
    dbMapByNum.set(String(m.memberNumber).trim(), m)
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

  const monthMap: Record<string, number> = {
    'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
    'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
    'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
  }

  const results: any[] = []

  for (const pdfItem of pdfData) {
    const rawName = pdfItem.name
    const rawNum = String(pdfItem.socio_num || '').trim()

    let member = dbMapByNum.get(rawNum)
    if (!member) {
      // search in manualMappings ignoring accent variations
      for (const [k, num] of Object.entries(manualMappings)) {
        if (rawName.toLowerCase().includes(k.toLowerCase().slice(0, 5))) {
          member = dbMapByNum.get(num)
          if (member) break
        }
      }
    }
    if (!member) {
      // Fuzzy search by last name in db
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
      console.log(`⚠ No se pudo vincular: ${rawName}`)
      continue
    }

    // Find latest month in PDF
    let maxPdfMonth = 0
    for (const [mName, p] of Object.entries(pdfItem.payments)) {
      const mNum = monthMap[mName]
      if (mNum && mNum > maxPdfMonth) {
        maxPdfMonth = mNum
      }
    }

    // Find DB fees that are AFTER maxPdfMonth in 2026 or year > 2026
    const subsequentFees = member.fees.filter(f => {
      if (f.periodYear > 2026) return true
      if (f.periodYear === 2026 && f.periodMonth > maxPdfMonth) return true
      return false
    })

    const allDb2026Fees = member.fees.filter(f => f.periodYear === 2026)

    results.push({
      pdfName: rawName,
      dbName: `${member.lastName}, ${member.firstName}`,
      memberNumber: member.memberNumber,
      maxPdfMonth,
      subsequentFeesCount: subsequentFees.length,
      subsequentFees: subsequentFees.map(f => ({
        year: f.periodYear,
        month: f.periodMonth,
        amountPaid: f.amountPaid,
        paymentDate: f.paymentDate
      })),
      totalDb2026FeesCount: allDb2026Fees.length,
      db2026Months: allDb2026Fees.map(f => f.periodMonth).sort((a, b) => a - b)
    })
  }

  console.log('=== AUDITORÍA DE CUOTAS POSTERIORES CARGADAS EN BD ===\n')

  const withSubsequent = results.filter(r => r.subsequentFeesCount > 0)
  console.log(`Total socios con cuotas POSTERIORES en BD: ${withSubsequent.length}\n`)

  for (const r of withSubsequent) {
    console.log(`• Nº ${r.memberNumber} - ${r.dbName}`)
    console.log(`  Último mes abonado en el registro del Tesorero (PDF): Mes ${r.maxPdfMonth}`)
    console.log(`  Cuotas posteriores registradas en la Base de Datos:`)
    for (const sf of r.subsequentFees) {
      const dateStr = sf.paymentDate ? new Date(sf.paymentDate).toISOString().split('T')[0] : 'Sin fecha'
      console.log(`    - Mes ${sf.month}/${sf.year}: $${sf.amountPaid} (Fecha cobro en BD: ${dateStr})`)
    }
    console.log('')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
