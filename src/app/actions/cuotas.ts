"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export async function createPayment(memberId: string, formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const periodMonthsStr = formData.get("periodMonths") as string
  const singlePeriodMonth = parseInt(formData.get("periodMonth") as string)
  
  let months: number[] = []
  if (periodMonthsStr) {
    try {
      months = JSON.parse(periodMonthsStr)
    } catch(e) {}
  }
  if (months.length === 0 && !isNaN(singlePeriodMonth)) {
    months = [singlePeriodMonth]
  }

  if (months.length === 0) {
    throw new Error("Debe seleccionar al menos un mes.")
  }

  const periodYear = parseInt(formData.get("periodYear") as string)
  const totalAmountPaid = parseFloat(formData.get("amountPaid") as string)
  const totalAmountDue = parseFloat(formData.get("amountDue") as string)
  const paymentMethod = formData.get("paymentMethod") as string
  const notes = formData.get("notes") as string
  const file = formData.get("paymentProof") as File | null

  // Ensure upload directory exists
  const uploadDir = join(process.cwd(), "public", "uploads")
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
  }

  let finalNotes = notes || ""
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create unique filename
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = join(uploadDir, uniqueName)
    
    // Write file
    writeFileSync(filepath, buffer)
    
    // Prepend link to notes
    finalNotes = `[COMPROBANTE: /uploads/${uniqueName}]\n${finalNotes}`
  }

  const amountPaidPerMonth = totalAmountPaid / months.length
  const amountDuePerMonth = totalAmountDue / months.length

  // Check for duplicates
  for (const m of months) {
    const existing = await db.membershipFee.findUnique({
      where: {
        memberId_periodYear_periodMonth: {
          memberId,
          periodYear,
          periodMonth: m
        }
      }
    })

    if (existing) {
      throw new Error(`Ya existe un pago registrado para el mes ${m}.`)
    }
  }

  // Create payments
  for (const m of months) {
    await db.membershipFee.create({
      data: {
        memberId,
        periodMonth: m,
        periodYear,
        amountDue: amountDuePerMonth,
        amountPaid: amountPaidPerMonth,
        paymentDate: new Date(),
        paymentMethod,
        paymentStatus: amountPaidPerMonth >= amountDuePerMonth ? "PAID" : "PARTIAL",
        notes: finalNotes,
        recordedById: userId
      }
    })
  }

  const returnTo = formData.get("returnTo") as string | null

  revalidatePath(`/admin/socios/${memberId}`)
  
  if (returnTo) {
    redirect(returnTo)
  } else {
    redirect(`/admin/socios/${memberId}`)
  }
}
