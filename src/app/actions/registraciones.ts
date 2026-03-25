"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function registerAttendee(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const eventId = formData.get("eventId") as string
  const memberId = (formData.get("memberId") as string) || null
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const dni = formData.get("dni") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const registrationType = formData.get("registrationType") as string
  const amountPaid = parseFloat(formData.get("amountPaid") as string) || 0
  const paymentStatus = (formData.get("paymentStatus") as string) || "PAID"
  const paymentMethod = formData.get("paymentMethod") as string
  const source = (formData.get("source") as string) || "MANAGEMENT"
  const file = formData.get("paymentProof") as File | null

  let paymentProofUrl = ""
  if (file && file.size > 0) {
    if (file.size > 1024 * 1024 * 2) { // 2MB limit
      throw new Error("El archivo es demasiado grande. Máximo 2MB.")
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    paymentProofUrl = `data:${file.type};base64,${buffer.toString("base64")}`
  }

  await db.eventRegistration.create({
    data: {
      eventId,
      memberId,
      firstName,
      lastName,
      dni,
      email,
      phone,
      registrationType,
      amountPaid,
      paymentStatus,
      paymentMethod,
      source,
      paymentProof: paymentProofUrl,
      recordedById: userId,
    },
  })

  revalidatePath(`/admin/eventos/${eventId}`)
}

export async function deleteRegistration(regId: string, eventId: string) {
  await db.eventRegistration.delete({ where: { id: regId } })
  revalidatePath(`/admin/eventos/${eventId}`)
}

export async function updatePaymentStatus(regId: string, eventId: string, status: string, amount: number) {
  await db.eventRegistration.update({
    where: { id: regId },
    data: { paymentStatus: status, amountPaid: amount }
  })
  revalidatePath(`/admin/eventos/${eventId}`)
}
