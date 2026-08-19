import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendSocioEnMoraEmail } from "@/lib/emails"
import { finalizePastEvents } from "@/lib/event-status"

export async function GET(request: Request) {
  // Protección por Token en la cabecera para evitar ejecuciones maliciosas
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("No autorizado", { status: 401 })
  }

  try {
    const now = new Date()
    const finalizedEvents = await finalizePastEvents(now)
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const currentDay = now.getDate()

    // Mes de referencia exigible (si es día 10 o menos, el mes actual no venció)
    let referenceMonth = currentMonth
    let referenceYear = currentYear

    if (currentDay <= 10) {
      referenceMonth = currentMonth - 1
      if (referenceMonth === 0) {
        referenceMonth = 12
        referenceYear = currentYear - 1
      }
    }

    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    // Obtener todos los socios activos (que no estén en baja o inactivos definitivos)
    const members = await db.member.findMany({
      where: {
        NOT: {
          status: { in: ["BAJA", "DECEASED", "RESIGNED", "ARCHIVED", "INACTIVE", "DUPLICATE", "MOROSIDAD", "ADMINISTRATIVE"] }
        }
      },
      include: {
        fees: true
      }
    })

    let processedCount = 0
    let moraCount = 0

    for (const member of members) {
      const paidFees = member.fees.filter(f => f.paymentStatus === 'PAID')
      
      // Calcular meses exigibles desde su ingreso (desde 2026 en adelante)
      const START_YEAR = 2026
      const START_MONTH = 1
      
      let trackFromMonth = START_MONTH
      let trackFromYear = START_YEAR
      
      if (member.joinDate) {
        const joinDate = new Date(member.joinDate)
        const joinYear = joinDate.getFullYear()
        const joinMonth = joinDate.getMonth() + 1
        
        if (joinYear > START_YEAR || (joinYear === START_YEAR && joinMonth > START_MONTH)) {
          trackFromMonth = joinMonth
          trackFromYear = joinYear
        }
      }

      const expectedMonths: { month: number; year: number }[] = []
      let y = trackFromYear
      let m = trackFromMonth
      
      while (y < referenceYear || (y === referenceYear && m <= referenceMonth)) {
        expectedMonths.push({ month: m, year: y })
        m++
        if (m > 12) {
          m = 1
          y++
        }
      }

      // Filtrar cuáles de los meses exigibles no tienen pago registrado
      const unpaidMonths = expectedMonths.filter(
        em => !paidFees.some(f => f.periodMonth === em.month && f.periodYear === em.year)
      )

      const debtMonths = unpaidMonths.length

      // Si debe 3 o más meses, entra en estado de MORA en la base de datos
      if (debtMonths >= 3) {
        // Solo actualizar y enviar email si no estaba marcado ya como deudor (DEBTOR o SUSPENDED)
        if (member.debtStatus !== "EN MORA" && member.debtStatus !== "SUSPENDIDO") {
          await db.member.update({
            where: { id: member.id },
            data: { debtStatus: "EN MORA" }
          })

          const unpaidMonthLabels = unpaidMonths.map(um => `${monthNames[um.month - 1]} ${um.year}`)
          
          // Enviar email de mora
          await sendSocioEnMoraEmail(member, unpaidMonthLabels)
          moraCount++
        }
      } else {
        // Si regularizó su deuda a menos de 3 meses, reactivar su ficha automáticamente a ACTIVE
        if (member.debtStatus === "EN MORA" || member.debtStatus === "SUSPENDIDO") {
          await db.member.update({
            where: { id: member.id },
            data: { debtStatus: "AL DIA" }
          })
        }
      }

      processedCount++
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      moraEmailsSent: moraCount,
      finalizedEvents
    })

  } catch (e: unknown) {
    console.error("Error en cron de mora:", e)
    const message = e instanceof Error ? e.message : "Error desconocido en el proceso automático"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
