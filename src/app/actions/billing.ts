"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getFeeHistory, getFeeAmountForPeriod } from "@/lib/fee-utils"
import { sendPaymentValidatedEmail } from "@/lib/emails"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export async function getActiveEvents() {
  const [events, settings] = await Promise.all([
    db.event.findMany({
      where: { status: 'OPEN' },
      orderBy: { startDate: 'asc' }
    }),
    db.setting.findMany({
      where: { key: { in: ['precio_milonga_socio', 'precio_milonga_nosocio'] } }
    })
  ])

  const precioSocio = settings.find(s => s.key === 'precio_milonga_socio')?.value || "2000"
  const precioNoSocio = settings.find(s => s.key === 'precio_milonga_nosocio')?.value || "9000"

  return events.map(e => ({
    ...e,
    priceSocioMilonga: e.priceSocioMilonga || parseFloat(precioSocio),
    priceNonSocioMilonga: e.priceNonSocioMilonga || parseFloat(precioNoSocio)
  }))
}

export async function searchMembers(query: string) {
  if (!query || query.length < 2) return []

  const terms = query.trim().split(/\s+/)
  
  // If there's only one term, search commonly
  if (terms.length === 1) {
    return await db.member.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query } },
          { memberNumber: { contains: query } }
        ]
      },
      take: 10
    })
  }

  // If there are multiple terms, try searching for combinations
  return await db.member.findMany({
    where: {
      OR: [
        // Case 1: First Term is part of First Name, Second term is part of Last Name
        {
          AND: [
            { firstName: { contains: terms[0], mode: 'insensitive' } },
            { lastName: { contains: terms[1], mode: 'insensitive' } }
          ]
        },
        // Case 2: First Term is part of Last Name, Second term is part of First Name
        {
          AND: [
            { lastName: { contains: terms[0], mode: 'insensitive' } },
            { firstName: { contains: terms[1], mode: 'insensitive' } }
          ]
        },
        // Fallback: Full original query in either field
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 10
  })
}

export async function getMemberDebt(memberId: string) {
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: { fees: true }
  })
  if (!member) return { months: [], total: 0 }

  const joinDate = member.joinDate
  // Ensure we don't calculate debt before Jan 2026
  const START_DATE = new Date(2026, 0, 1)
  const trackFrom = joinDate > START_DATE ? joinDate : START_DATE
  
  const trackYear = trackFrom.getFullYear()
  const trackMonth = trackFrom.getMonth() + 1

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const debtMonths = []
  let totalDebt = 0

  const feeHistory = await getFeeHistory()

  // Iterate from track date to now
  let y = trackYear
  let m = trackMonth

  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    const paidRecord = member.fees.find(f => f.periodYear === y && f.periodMonth === m)
    const expectedFeeForMonth = getFeeAmountForPeriod(y, m, member.isFamilyDiscount, feeHistory)

    if (!paidRecord || (paidRecord.paymentStatus !== 'PAID')) {
      const amountDue = paidRecord ? (paidRecord.amountDue - paidRecord.amountPaid) : expectedFeeForMonth
      if (amountDue > 0) {
        debtMonths.push({
          year: y,
          month: m,
          amount: amountDue,
          existingRecord: !!paidRecord
        })
        totalDebt += amountDue
      }
    }

    m++
    if (m > 12) {
      m = 1
      y++
    }
  }

  return { months: debtMonths, total: totalDebt }
}

export async function processMemberPayment(memberId: string, formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const payloadString = formData.get("payload") as string
  if (!payloadString) throw new Error("Missing payload")
  
  const payload = JSON.parse(payloadString)
  const file = formData.get("paymentProof") as File | null

  let finalNotes = payload.notes || ""
  if (file && file.size > 0) {
    if (file.size > 1024 * 1024 * 5) {
      throw new Error("El comprobante es demasiado grande. Máximo 5MB.")
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }
    const ext = file.name.split('.').pop() || "png"
    const uniqueName = `admin-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const filepath = join(uploadDir, uniqueName)
    writeFileSync(filepath, buffer)

    finalNotes = `[COMPROBANTE: /uploads/${uniqueName}]\n${finalNotes}`
  }

  // Logic to create multiple MembershipFee records
  for (const item of payload.selectedMonths) {
    // Parse the real payment date if provided; fallback to registration date (now)
    const realPaymentDate = payload.realPaymentDate ? new Date(payload.realPaymentDate) : null
    // Check if partial fee exists to update, else create
    await db.membershipFee.upsert({
      where: {
        memberId_periodYear_periodMonth: {
          memberId,
          periodYear: item.year,
          periodMonth: item.month
        }
      },
      update: {
        amountPaid: { increment: item.amount },
        paymentStatus: 'PAID', // Assuming selecting it pays it fully for now
        paymentMethod: payload.paymentMethod,
        paymentDate: new Date(),
        realPaymentDate,
        notes: finalNotes,
        recordedById: userId
      },
      create: {
        memberId,
        periodYear: item.year,
        periodMonth: item.month,
        amountDue: item.amount,
        amountPaid: item.amount,
        paymentStatus: 'PAID',
        paymentMethod: payload.paymentMethod,
        paymentDate: new Date(),
        realPaymentDate,
        notes: finalNotes,
        recordedById: userId
      }
    })
  }

  // Enviar email de confirmación de pago de cuota al socio
  try {
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { id: true, firstName: true, lastName: true, email: true }
    })
    if (member && member.email) {
      const periods = payload.selectedMonths.map((m: any) => ({ month: m.month, year: m.year, amount: m.amount }))
      await sendPaymentValidatedEmail(member, periods)
    }
  } catch (emailErr) {
    console.error("Error al enviar email de confirmación de pago batch:", emailErr)
  }

  revalidatePath("/admin/cuotas")
  revalidatePath(`/admin/socios/${memberId}`)
  redirect("/admin/cuotas")
}
