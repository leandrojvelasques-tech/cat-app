"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { 
  sendEventRegistrationAlertToBoard,
  sendAttendeePendingProofEmail,
  sendAttendeeRegistrationApprovedEmail,
  sendAttendeeFreeEventConfirmationEmail
} from "@/lib/emails"
import { validateAndSanitizeFile } from "@/lib/security-utils"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export async function registerAttendee(formData: FormData) {
  try {
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
    const realPaymentDateStr = formData.get("realPaymentDate") as string | null

    // Parse real payment date if provided by staff; null means "use createdAt as reference"
    const realPaymentDate = realPaymentDateStr ? new Date(realPaymentDateStr) : null

    let paymentProofUrl = null
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const validation = await validateAndSanitizeFile(buffer, file.type)
      if (!validation.isValid) {
        return { error: validation.error || "El archivo adjunto no es válido por seguridad." }
      }
      
      paymentProofUrl = `data:${validation.mimeType};base64,${buffer.toString("base64")}`
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
        realPaymentDate,
      },
    })

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (event) {
      await sendEventRegistrationAlertToBoard(event, {
        firstName,
        lastName,
        dni,
        email,
        phone,
        registrationType,
        amountPaid,
        paymentMethod,
        paymentProof: paymentProofUrl
      }).catch(err => console.error("Error sending event registration alert email:", err))
    }

    revalidatePath("/admin")
    revalidatePath("/admin/eventos")
    revalidatePath(`/admin/eventos/${eventId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error registering attendee:", error)
    return { error: "Error al guardar el registro. Por favor intente nuevamente." }
  }
}

export async function registerPublicAttendee(formData: FormData) {
  try {
    const eventId = (formData.get("eventId") as string || "").trim()
    const firstName = (formData.get("firstName") as string || "").trim()
    const lastName = (formData.get("lastName") as string || "").trim()
    const dni = (formData.get("dni") as string || "").trim()
    const email = (formData.get("email") as string || "").trim().toLowerCase()
    const phone = (formData.get("phone") as string || "").trim()
    const registrationType = (formData.get("registrationType") as string || "ENTRADA_GENERAL").trim()
    let amountPaid = parseFloat(formData.get("amountPaid") as string) || 0
    const paymentMethod = (formData.get("paymentMethod") as string || "CASH").trim()
    const file = formData.get("paymentProof") as File | null

    if (!eventId || !firstName || !lastName || !dni || !email || !phone) {
      return { success: false, error: "Por favor completá todos los campos obligatorios (*)." }
    }

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (!event || !event.isPublic) {
      return { success: false, error: "El evento no existe o ya no está disponible." }
    }

    // 1. Manejo de Eventos 100% Gratuitos ($0)
    if (event.isFree) {
      amountPaid = 0
      const registration = await db.eventRegistration.create({
        data: {
          eventId: event.id,
          firstName,
          lastName,
          dni,
          email,
          phone,
          registrationType,
          amountPaid: 0,
          paymentStatus: "PAID", // Aprobado instantáneo
          paymentMethod: "FREE",
          source: "WEB"
        }
      })

      // Notificaciones por correo
      const emailPromises: Promise<any>[] = []
      if (event.sendAttendeeConfirmation !== false) {
        emailPromises.push(sendAttendeeFreeEventConfirmationEmail({
          firstName,
          email,
          eventTitle: event.title,
          registrationType,
          eventDate: event.startDate,
          location: event.location
        }))
      }
      emailPromises.push(sendEventRegistrationAlertToBoard(event, {
        firstName,
        lastName,
        dni,
        email,
        phone,
        registrationType,
        amountPaid: 0,
        paymentMethod: "GRATUITO"
      }))

      await Promise.allSettled(emailPromises).catch(err => console.error("Error enviando notificaciones de evento gratuito:", err))

      revalidatePath("/admin")
      revalidatePath("/admin/eventos")
      revalidatePath(`/admin/eventos/${eventId}`)
      revalidatePath(`/eventos/${eventId}`)

      return {
        success: true,
        message: "¡Inscripción confirmada! Te hemos enviado la confirmación a tu correo electrónico."
      }
    }

    // 2. Manejo de Eventos con Costo (Pago)
    let paymentProofUrl = null
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Validación defensiva por Magic Bytes binarios (seguridad anti-malware)
      const validation = await validateAndSanitizeFile(buffer, file.type)
      if (!validation.isValid) {
        return { success: false, error: validation.error || "Formato de comprobante no permitido por seguridad." }
      }

      const uploadDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true })
      }
      const ext = file.name.split('.').pop() || "png"
      const uniqueName = `evento-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const filepath = join(uploadDir, uniqueName)
      writeFileSync(filepath, buffer)

      paymentProofUrl = `/uploads/${uniqueName}`
    }

    const paymentStatus = paymentProofUrl ? "PENDING" : (paymentMethod === "TRANSFER" ? "PENDING" : "PENDING")

    const registration = await db.eventRegistration.create({
      data: {
        eventId: event.id,
        firstName,
        lastName,
        dni,
        email,
        phone,
        registrationType,
        amountPaid,
        paymentStatus,
        paymentMethod,
        paymentProof: paymentProofUrl,
        source: "WEB"
      }
    })

    // Enviar notificaciones por correo al cliente y directiva
    await Promise.allSettled([
      sendAttendeePendingProofEmail({
        firstName,
        email,
        eventTitle: event.title,
        registrationType,
        amountPaid
      }),
      sendEventRegistrationAlertToBoard(event, {
        firstName,
        lastName,
        dni,
        email,
        phone,
        registrationType,
        amountPaid,
        paymentMethod,
        paymentProof: paymentProofUrl
      })
    ]).catch(err => console.error("Error al enviar notificaciones de comprobante de evento:", err))

    revalidatePath("/admin")
    revalidatePath("/admin/eventos")
    revalidatePath(`/admin/eventos/${eventId}`)
    revalidatePath(`/eventos/${eventId}`)

    return { 
      success: true, 
      message: "¡Recibimos tu comprobante! Tu pago está en proceso de verificación por Tesorería. Te enviaremos un correo apenas sea aprobado." 
    }
  } catch (err: any) {
    console.error("Error en registerPublicAttendee:", err)
    return { success: false, error: err?.message || "Ocurrió un error al procesar tu inscripción." }
  }
}

export async function deleteRegistration(regId: string, eventId: string) {
  await db.eventRegistration.delete({ where: { id: regId } })
  revalidatePath(`/admin/eventos/${eventId}`)
}

export async function updatePaymentStatus(regId: string, eventId: string, status: string, amount: number) {
  const updatedReg = await db.eventRegistration.update({
    where: { id: regId },
    data: { paymentStatus: status, amountPaid: amount },
    include: { event: true, member: true }
  })

  const targetEmail = updatedReg.email || updatedReg.member?.email

  // Si el estado pasa a "PAID", enviar correo de confirmación de aprobación al asistente desde cobranzas
  if (status === "PAID" && targetEmail) {
    await sendAttendeeRegistrationApprovedEmail({
      firstName: updatedReg.firstName,
      email: targetEmail,
      eventTitle: updatedReg.event.title,
      registrationType: updatedReg.registrationType,
      amountPaid: amount,
      eventDate: updatedReg.event.startDate,
      location: updatedReg.event.location
    }).catch(err => console.error("Error enviando email de aprobacion de inscripcion al asistente:", err))
  }

  revalidatePath(`/admin/eventos/${eventId}`)
  revalidatePath("/admin/eventos")
  revalidatePath("/admin")
}

export async function toggleAttendeePresence(regId: string, eventId: string, attended: boolean) {
  const updatedReg = await db.eventRegistration.update({
    where: { id: regId },
    data: { 
      attended,
      attendedAt: attended ? new Date() : null
    }
  })

  revalidatePath(`/admin/eventos/${eventId}`)
  revalidatePath("/socios")
  revalidatePath("/admin")
  return { success: true, attended: updatedReg.attended }
}


