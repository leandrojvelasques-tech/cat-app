"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export async function getActiveEvents() {
  return await db.event.findMany({
    where: { status: 'OPEN' },
    orderBy: { startDate: 'asc' }
  })
}

export async function searchMembers(query: string) {
  if (!query || query.length < 2) return []
  return await db.member.findMany({
    where: {
      AND: [
        { status: { notIn: ["INACTIVE", "DECEASED", "RESIGNED"] } },
        {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { dni: { contains: query } },
          ]
        }
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
  const joinYear = joinDate.getFullYear()
  const joinMonth = joinDate.getMonth() + 1

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const debtMonths = []
  let totalDebt = 0

  // Standard fee - should ideally fetch from settings but for simplicity use a common value or fetch once
  const cuotaSetting = await db.setting.findUnique({ where: { key: 'cuota_mensual' } })
  const cuotaMensual = parseFloat(cuotaSetting?.value || "6000")

  // Iterate from join date to now
  let y = joinYear
  let m = joinMonth

  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    const paidRecord = member.fees.find(f => f.periodYear === y && f.periodMonth === m)
    
    if (!paidRecord || (paidRecord.paymentStatus !== 'PAID')) {
      const amountDue = paidRecord ? (paidRecord.amountDue - paidRecord.amountPaid) : cuotaMensual
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

  // Ensure upload directory exists
  const uploadDir = join(process.cwd(), "public", "uploads")
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }

  let finalNotes = payload.notes || ""
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = join(uploadDir, uniqueName)
    writeFileSync(filepath, buffer)
    finalNotes = `[COMPROBANTE: /uploads/${uniqueName}]\n${finalNotes}`
  }

  // Logic to create multiple MembershipFee records
  for (const item of payload.selectedMonths) {
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
        notes: finalNotes,
        recordedById: userId
      }
    })
  }

  // TODO: Trigger email notification logic here

  revalidatePath("/admin/cuotas")
  revalidatePath(`/admin/socios/${memberId}`)
  redirect("/admin/cuotas")
}
