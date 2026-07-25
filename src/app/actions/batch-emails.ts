"use server"

import { db } from "@/lib/db"
import { sendEmail } from "@/lib/emails"
import { calculateMemberStatus } from "@/lib/member-utils"

export async function sendBatchEmail(
  memberIds: string[],
  subject: string,
  bodyTemplate: string,
  senderEmail: string
) {
  if (!memberIds || memberIds.length === 0) {
    return { success: false, error: "No se seleccionaron socios." }
  }
  if (!subject || subject.trim().length === 0) {
    return { success: false, error: "El asunto del correo no puede estar vacío." }
  }
  if (!bodyTemplate || bodyTemplate.trim().length === 0) {
    return { success: false, error: "El cuerpo del mensaje no puede estar vacío." }
  }

  let sentCount = 0
  let skippedCount = 0

  const now = new Date()

  for (const memberId of memberIds) {
    try {
      const member = await db.member.findUnique({
        where: { id: memberId },
        include: {
          fees: {
            orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
          }
        }
      })

      if (!member || !member.email) {
        skippedCount++
        continue
      }

      const debtList = getMemberDebtDetails(member, now)
      const calculatedStatus = calculateMemberStatus(member, now)
      
      const debtDetailsHtml = debtList.length > 0
        ? `<ul style="color: #c21a1a; font-weight: bold; margin: 10px 0; padding-left: 20px;">
            ${debtList.map(d => `<li>${d}</li>`).join("")}
           </ul>`
        : "<p style='color: #2e7d32; font-weight: bold;'>Al día (Sin deuda pendiente)</p>"

      const debtText = debtList.length > 0 
        ? debtList.join(", ") 
        : "Sin deuda"

      let htmlBody = bodyTemplate
        .replace(/{nombre}/g, `${member.firstName} ${member.lastName}`)
        .replace(/{nro_socio}/g, member.memberNumber)
        .replace(/{dni}/g, member.dni)
        .replace(/{estado}/g, calculatedStatus)
        .replace(/{deuda}/g, debtDetailsHtml)
        .replace(/{deuda_texto}/g, debtText)

      const finalHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
          <div style="border-bottom: 2px solid #1B2621; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #A6702E; font-size: 20px; font-weight: bold; font-family: serif;">Centro Amigos del Tango</span>
          </div>
          
          <div style="font-size: 15px; color: #333;">
            ${htmlBody.replace(/\n/g, "<br />")}
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 11px; color: #888; text-align: center;">© Centro Amigos del Tango. Comodoro Rivadavia, Chubut.</p>
        </div>
      `

      await sendEmail({
        to: member.email,
        subject: subject,
        html: finalHtml,
        memberId: member.id,
        type: "BATCH_COMMUNICATION",
        from: senderEmail
      })

      sentCount++
    } catch (err) {
      console.error(`Error enviando correo por lote al socio ${memberId}:`, err)
      skippedCount++
    }
  }

  return { success: true, sentCount, skippedCount }
}

function getMemberDebtDetails(member: any, referenceDate: Date = new Date()) {
  const currentMonth = referenceDate.getMonth() + 1
  const currentYear = referenceDate.getFullYear()
  const currentDay = referenceDate.getDate()

  let referenceMonth = currentMonth
  let referenceYear = currentYear
  if (currentDay <= 10) {
    referenceMonth = currentMonth - 1
    if (referenceMonth === 0) {
      referenceMonth = 12
      referenceYear = currentYear - 1
    }
  }

  const paidPeriods = new Set(
    (member.fees || [])
      .filter((f: any) => f.paymentStatus === 'PAID')
      .map((f: any) => `${f.periodYear}-${f.periodMonth}`)
  )

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const debtList = []
  let y = 2026
  let m = 1

  const joinDate = member.joinDate ? new Date(member.joinDate) : new Date(2026, 0, 1)
  if (joinDate.getFullYear() > 2026 || (joinDate.getFullYear() === 2026 && joinDate.getMonth() > 0)) {
    y = joinDate.getFullYear()
    m = joinDate.getMonth() + 1
  }

  while (y < referenceYear || (y === referenceYear && m <= referenceMonth)) {
    const periodKey = `${y}-${m}`
    if (!paidPeriods.has(periodKey)) {
      debtList.push(`${monthNames[m - 1]} ${y}`)
    }
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }

  return debtList
}
