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

      // Email de confirmación automática al asistente si está habilitado
      if (event.sendAttendeeConfirmation !== false) {
        sendAttendeeFreeEventConfirmationEmail({
          firstName,
          email,
          eventTitle: event.title,
          registrationType,
          eventDate: event.startDate,
          location: event.location
        }).catch(err => console.error("Error enviando email de confirmacion de evento gratuito:", err))
      }

      // Notificación a la directiva
      sendEventRegistrationAlertToBoard(event, {
        firstName,
        lastName,
        dni,
        email,
        phone,
        registrationType,
        amountPaid: 0,
        paymentMethod: "GRATUITO"
      }).catch(err => console.error("Error notificando a la directiva sobre evento gratuito:", err))

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

      paymentProofUrl = `data:${validation.mimeType};base64,${buffer.toString("base64")}`
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

    // Enviar acuse de recibo al cliente avisando que su comprobante está en verificación
    sendAttendeePendingProofEmail({
      firstName,
      email,
      eventTitle: event.title,
      registrationType,
      amountPaid
    }).catch(err => console.error("Error al enviar acuse de recibo de comprobante al cliente:", err))

    // Disparar alertas por email a la directiva y mails adicionales
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
    }).catch(err => console.error("Error al enviar alerta por email a la directiva:", err))

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
    include: { event: true }
  })

  // Si el estado pasa a "PAID", enviar correo de confirmación de aprobación al asistente
  if (status === "PAID" && updatedReg.email) {
    sendAttendeeRegistrationApprovedEmail({
      firstName: updatedReg.firstName,
      email: updatedReg.email,
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


