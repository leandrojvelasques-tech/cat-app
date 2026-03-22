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

  const periodMonth = parseInt(formData.get("periodMonth") as string)
  const periodYear = parseInt(formData.get("periodYear") as string)
  const amountPaid = parseFloat(formData.get("amountPaid") as string)
  const amountDue = parseFloat(formData.get("amountDue") as string)
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

  // Simple validation for duplicates
  const existing = await db.membershipFee.findUnique({
    where: {
      memberId_periodYear_periodMonth: {
        memberId,
        periodYear,
        periodMonth
      }
    }
  })

  if (existing) {
    throw new Error("Ya existe un pago registrado para este período.")
  }

  await db.membershipFee.create({
    data: {
      memberId,
      periodMonth,
      periodYear,
      amountDue,
      amountPaid,
      paymentDate: new Date(),
      paymentMethod,
      paymentStatus: amountPaid >= amountDue ? "PAID" : "PARTIAL",
      notes: finalNotes,
      recordedById: userId
    }
  })

  revalidatePath(`/admin/socios/${memberId}`)
  redirect(`/admin/socios/${memberId}`)
}
