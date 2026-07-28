"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { sendEventRegistrationAlertToBoard } from "@/lib/emails"
import { getEffectiveEventPrices } from "@/lib/event-utils"

async function parseBannerField(formData: FormData): Promise<string | null> {
  const fileOrString = formData.get("eventBanner")
  const existingBanner = formData.get("existingBanner")

  if (fileOrString && typeof fileOrString !== "string" && fileOrString.size > 0) {
    const bytes = await fileOrString.arrayBuffer()
    const buffer = Buffer.from(bytes)
    return `data:${fileOrString.type};base64,${buffer.toString("base64")}`
  }

  if (typeof fileOrString === "string" && fileOrString.length > 0) {
    return fileOrString
  }

  if (typeof existingBanner === "string" && existingBanner.length > 0) {
    return existingBanner
  }

  return null
}

function parseDateInput(dateStr: string | null): Date | null {
  if (!dateStr) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number)
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  }
  return new Date(dateStr)
}

export async function createEvent(prevState: any, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDateStr = formData.get("startDate") as string
    const endDateStr = formData.get("endDate") as string
    const location = (formData.get("location") as string) || "Sede Central CAT"
    const type = (formData.get("type") as string) || "MILONGA"
    const isPublic = formData.get("isPublic") === "on" || formData.get("isPublic") === "true"
    const isFree = formData.get("isFree") === "on" || formData.get("isFree") === "true"
    const sendAttendeeConfirmation = formData.get("sendAttendeeConfirmation") === "on" || formData.get("sendAttendeeConfirmation") === "true" || formData.get("sendAttendeeConfirmation") === null

    const hasMilonga = formData.get("hasMilonga") === "true" || formData.get("hasMilonga") === "on"
    const hasClasses = formData.get("hasClasses") === "true" || formData.get("hasClasses") === "on"
    const isRecurring = formData.get("isRecurring") === "true" || formData.get("isRecurring") === "on"
    const recurrenceDay = formData.get("recurrenceDay") !== null && formData.get("recurrenceDay") !== "" ? parseInt(formData.get("recurrenceDay") as string, 10) : null
    const recurrenceTime = (formData.get("recurrenceTime") as string) || null

    const milongaStartStr = formData.get("milongaStart") as string
    const milongaEndStr = formData.get("milongaEnd") as string
    const milongaEndTime = (formData.get("milongaEndTime") as string) || null
    const milongaLocation = (formData.get("milongaLocation") as string) || null
    const milongaMapsUrl = (formData.get("milongaMapsUrl") as string) || null
    const tangoDJ = (formData.get("tangoDJ") as string) || null
    const organizer = (formData.get("organizer") as string) || "Centro Amigos del Tango"
    const contactPhone = (formData.get("contactPhone") as string) || null
    const contactEmail = (formData.get("contactEmail") as string) || null
    const notificationEmails = (formData.get("notificationEmails") as string) || null

    const parseNum = (val: any) => (val !== null && val !== "" && !isNaN(parseFloat(val)) ? parseFloat(val) : null)

    const hasEarlyBird = formData.get("hasEarlyBird") === "true" || formData.get("hasEarlyBird") === "on"
    const earlyBirdDeadlineStr = formData.get("earlyBirdDeadline") as string
    const earlyBirdDeadline = earlyBirdDeadlineStr ? new Date(earlyBirdDeadlineStr) : null

    const priceSocioEarlyBird = isFree ? 0 : parseNum(formData.get("priceSocioEarlyBird"))
    const priceNonSocioEarlyBird = isFree ? 0 : parseNum(formData.get("priceNonSocioEarlyBird"))
    const priceSocioComboEarlyBird = isFree ? 0 : parseNum(formData.get("priceSocioComboEarlyBird"))
    const priceNonSocioComboEarlyBird = isFree ? 0 : parseNum(formData.get("priceNonSocioComboEarlyBird"))

    const priceSocioMilonga = isFree ? 0 : parseNum(formData.get("priceSocioMilonga"))
    const priceNonSocioMilonga = isFree ? 0 : parseNum(formData.get("priceNonSocioMilonga"))

    const comboTitle = (formData.get("comboTitle") as string) || "Combo Clases"
    const priceSocioCombo = isFree ? 0 : parseNum(formData.get("priceSocioCombo"))
    const priceNonSocioCombo = isFree ? 0 : parseNum(formData.get("priceNonSocioCombo"))
    const priceSocioClassLoose = isFree ? 0 : parseNum(formData.get("priceSocioClassLoose"))
    const priceNonSocioClassLoose = isFree ? 0 : parseNum(formData.get("priceNonSocioClassLoose"))

    const eventBanner = await parseBannerField(formData)

    let classesData: any[] = []
    const classesJsonStr = formData.get("classesData") as string
    if (classesJsonStr) {
      try {
        classesData = JSON.parse(classesJsonStr)
      } catch (err) {
        console.error("Error parsing classesData:", err)
      }
    }

    if (!title || !startDateStr) {
      return { error: "El título y la fecha de inicio son requeridos" }
    }

    await db.event.create({
      data: {
        title,
        description,
        startDate: parseDateInput(startDateStr)!,
        endDate: parseDateInput(endDateStr),
        location,
        type,
        isPublic,
        isFree,
        sendAttendeeConfirmation,
        hasMilonga,
        hasClasses,
        isRecurring,
        recurrenceDay,
        recurrenceTime,
        milongaStart: milongaStartStr ? new Date(milongaStartStr) : null,
        milongaEnd: milongaEndStr ? new Date(milongaEndStr) : null,
        milongaEndTime,
        milongaLocation,
        milongaMapsUrl,
        tangoDJ,
        organizer,
        contactPhone,
        contactEmail,
        notificationEmails,
        hasEarlyBird,
        earlyBirdDeadline,
        priceSocioEarlyBird,
        priceNonSocioEarlyBird,
        priceSocioComboEarlyBird,
        priceNonSocioComboEarlyBird,
        priceSocioMilonga,
        priceNonSocioMilonga,
        comboTitle,
        priceSocioCombo,
        priceNonSocioCombo,
        priceSocioClassLoose,
        priceNonSocioClassLoose,
        eventBanner,
        classes: classesData.length > 0 ? {
          create: classesData.map((c: any, idx: number) => ({
            title: c.title || `Clase ${idx + 1}`,
            description: c.description || null,
            classDate: parseDateInput(c.classDate),
            startTime: c.startTime || null,
            endTime: c.endTime || null,
            order: idx + 1
          }))
        } : undefined
      }
    })

    revalidatePath("/")
    revalidatePath("/admin/eventos")
    revalidatePath("/eventos")
    revalidatePath("/socios")
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) throw error
    return { error: error.message || "Error al crear el evento" }
  }

  redirect("/admin/eventos")
}

export async function updateEvent(id: string, prevState: any, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDateStr = formData.get("startDate") as string
    const endDateStr = formData.get("endDate") as string
    const location = (formData.get("location") as string) || "Sede Central CAT"
    const type = (formData.get("type") as string) || "MILONGA"
    const isPublic = formData.get("isPublic") === "on" || formData.get("isPublic") === "true"
    const isFree = formData.get("isFree") === "on" || formData.get("isFree") === "true"
    const sendAttendeeConfirmation = formData.get("sendAttendeeConfirmation") === "on" || formData.get("sendAttendeeConfirmation") === "true" || formData.get("sendAttendeeConfirmation") === null

    const hasMilonga = formData.get("hasMilonga") === "true" || formData.get("hasMilonga") === "on"
    const hasClasses = formData.get("hasClasses") === "true" || formData.get("hasClasses") === "on"
    const isRecurring = formData.get("isRecurring") === "true" || formData.get("isRecurring") === "on"
    const recurrenceDay = formData.get("recurrenceDay") !== null && formData.get("recurrenceDay") !== "" ? parseInt(formData.get("recurrenceDay") as string, 10) : null
    const recurrenceTime = (formData.get("recurrenceTime") as string) || null

    const milongaStartStr = formData.get("milongaStart") as string
    const milongaEndStr = formData.get("milongaEnd") as string
    const milongaEndTime = (formData.get("milongaEndTime") as string) || null
    const milongaLocation = (formData.get("milongaLocation") as string) || null
    const milongaMapsUrl = (formData.get("milongaMapsUrl") as string) || null
    const tangoDJ = (formData.get("tangoDJ") as string) || null
    const organizer = (formData.get("organizer") as string) || "Centro Amigos del Tango"
    const contactPhone = (formData.get("contactPhone") as string) || null
    const contactEmail = (formData.get("contactEmail") as string) || null
    const notificationEmails = (formData.get("notificationEmails") as string) || null

    const parseNum = (val: any) => (val !== null && val !== "" && !isNaN(parseFloat(val)) ? parseFloat(val) : null)

    const hasEarlyBird = formData.get("hasEarlyBird") === "true" || formData.get("hasEarlyBird") === "on"
    const earlyBirdDeadlineStr = formData.get("earlyBirdDeadline") as string
    const earlyBirdDeadline = earlyBirdDeadlineStr ? new Date(earlyBirdDeadlineStr) : null

    const priceSocioEarlyBird = isFree ? 0 : parseNum(formData.get("priceSocioEarlyBird"))
    const priceNonSocioEarlyBird = isFree ? 0 : parseNum(formData.get("priceNonSocioEarlyBird"))
    const priceSocioComboEarlyBird = isFree ? 0 : parseNum(formData.get("priceSocioComboEarlyBird"))
    const priceNonSocioComboEarlyBird = isFree ? 0 : parseNum(formData.get("priceNonSocioComboEarlyBird"))

    const priceSocioMilonga = isFree ? 0 : parseNum(formData.get("priceSocioMilonga"))
    const priceNonSocioMilonga = isFree ? 0 : parseNum(formData.get("priceNonSocioMilonga"))

    const comboTitle = (formData.get("comboTitle") as string) || "Combo Clases"
    const priceSocioCombo = isFree ? 0 : parseNum(formData.get("priceSocioCombo"))
    const priceNonSocioCombo = isFree ? 0 : parseNum(formData.get("priceNonSocioCombo"))
    const priceSocioClassLoose = isFree ? 0 : parseNum(formData.get("priceSocioClassLoose"))
    const priceNonSocioClassLoose = isFree ? 0 : parseNum(formData.get("priceNonSocioClassLoose"))

    const eventBanner = await parseBannerField(formData)

    let classesData: any[] = []
    const classesJsonStr = formData.get("classesData") as string
    if (classesJsonStr) {
      try {
        classesData = JSON.parse(classesJsonStr)
      } catch (err) {
        console.error("Error parsing classesData:", err)
      }
    }

    if (!title || !startDateStr) {
      return { error: "El título y la fecha de inicio son requeridos" }
    }

    const updateData: any = {
      title,
      description,
      startDate: parseDateInput(startDateStr)!,
      endDate: parseDateInput(endDateStr),
      location,
      type,
      isPublic,
      isFree,
      sendAttendeeConfirmation,
      hasMilonga,
      hasClasses,
      isRecurring,
      recurrenceDay,
      recurrenceTime,
      milongaStart: milongaStartStr ? new Date(milongaStartStr) : null,
      milongaEnd: milongaEndStr ? new Date(milongaEndStr) : null,
      milongaEndTime,
      milongaLocation,
      milongaMapsUrl,
      tangoDJ,
      organizer,
      contactPhone,
      contactEmail,
      notificationEmails,
      hasEarlyBird,
      earlyBirdDeadline,
      priceSocioEarlyBird,
      priceNonSocioEarlyBird,
      priceSocioComboEarlyBird,
      priceNonSocioComboEarlyBird,
      priceSocioMilonga,
      priceNonSocioMilonga,
      comboTitle,
      priceSocioCombo,
      priceNonSocioCombo,
      priceSocioClassLoose,
      priceNonSocioClassLoose,
      eventBanner
    }

    await db.event.update({
      where: { id },
      data: updateData
    })

    // Recreate classes
    await db.eventClass.deleteMany({ where: { eventId: id } })
    if (classesData.length > 0) {
      await db.eventClass.createMany({
        data: classesData.map((c: any, idx: number) => ({
          eventId: id,
          title: c.title || `Clase ${idx + 1}`,
          description: c.description || null,
          classDate: c.classDate ? new Date(c.classDate) : null,
          startTime: c.startTime || null,
          endTime: c.endTime || null,
          order: idx + 1
        }))
      })
    }

    revalidatePath("/")
    revalidatePath("/admin/eventos")
    revalidatePath(`/admin/eventos/${id}`)
    revalidatePath("/eventos")
    revalidatePath("/socios")
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) throw error
    return { error: error.message || "Error al actualizar el evento" }
  }

  redirect("/admin/eventos")
}

export async function deleteEvent(id: string) {
  try {
    await db.eventRegistration.deleteMany({ where: { eventId: id } })
    await db.buffetSale.deleteMany({ where: { eventId: id } })
    await db.buffetCashRegister.deleteMany({ where: { eventId: id } })
    await db.eventClass.deleteMany({ where: { eventId: id } })
    
    await db.event.delete({ where: { id } })

    revalidatePath("/")
    revalidatePath("/admin/eventos")
    revalidatePath("/eventos")
    revalidatePath("/socios")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Error al eliminar el evento" }
  }
}

export async function registerSocioForEvent(eventId: string, formData: FormData) {
  const session = await auth()
  if (!session || !session.user) {
    return { success: false, error: "No autorizado" }
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { member: true }
  })

  if (!user || !user.member) {
    return { success: false, error: "No se encontró ficha de socio asociada" }
  }

  const member = user.member
  const event = await db.event.findUnique({ where: { id: eventId } })

  if (!event) {
    return { success: false, error: "Evento no encontrado" }
  }

  const registrationType = (formData.get("registrationType") as string) || "MILONGA"
  const paymentMethod = (formData.get("paymentMethod") as string) || "CASH"
  const paymentProof = (formData.get("avatarUrl") as string) || (formData.get("paymentProof") as string) || null

  const prices = getEffectiveEventPrices(event)
  let amountPaid = prices.milongaSocio
  if (registrationType === "COMBO_CLASES") {
    amountPaid = prices.comboSocio
  } else if (registrationType === "CLASE_SUELTA") {
    amountPaid = prices.classLooseSocio
  }

  const existing = await db.eventRegistration.findFirst({
    where: {
      eventId,
      memberId: member.id
    }
  })

  const paymentStatus = paymentProof ? "PAID" : "PENDING"

  if (existing) {
    await db.eventRegistration.update({
      where: { id: existing.id },
      data: {
        registrationType,
        amountPaid,
        paymentMethod,
        paymentProof: paymentProof || existing.paymentProof,
        paymentStatus: paymentProof ? "PAID" : existing.paymentStatus
      }
    })

    // Disparar alertas por correo a la directiva y mails adicionales
    sendEventRegistrationAlertToBoard(event, {
      firstName: member.firstName,
      lastName: member.lastName,
      dni: member.dni,
      email: member.email,
      phone: member.phone,
      registrationType,
      amountPaid,
      paymentMethod,
      paymentProof: paymentProof || existing.paymentProof
    }).catch(err => console.error("Error sending event registration alert email:", err))

    revalidatePath("/admin")
    revalidatePath("/admin/eventos")
    revalidatePath(`/admin/eventos/${eventId}`)
    revalidatePath("/socios")
    revalidatePath(`/eventos/${eventId}`)
    return { success: true, message: "Inscripción actualizada correctamente" }
  }

  await db.eventRegistration.create({
    data: {
      eventId: event.id,
      memberId: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      dni: member.dni,
      email: member.email,
      phone: member.phone,
      registrationType,
      amountPaid,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      paymentProof: paymentProof
    }
  })

  // Disparar alertas por correo a la directiva y mails adicionales
  sendEventRegistrationAlertToBoard(event, {
    firstName: member.firstName,
    lastName: member.lastName,
    dni: member.dni,
    email: member.email,
    phone: member.phone,
    registrationType,
    amountPaid,
    paymentMethod,
    paymentProof
  }).catch(err => console.error("Error sending event registration alert email:", err))

  revalidatePath("/admin")
  revalidatePath("/admin/eventos")
  revalidatePath(`/admin/eventos/${eventId}`)
  revalidatePath("/socios")
  revalidatePath(`/eventos/${eventId}`)
  return { success: true, message: "¡Reserva realizada con éxito con Tarifa Socio!" }
}

export async function getSocioEventRegistrations(memberId: string) {
  return await db.eventRegistration.findMany({
    where: { memberId },
    select: {
      id: true,
      eventId: true,
      registrationType: true,
      paymentStatus: true,
      paymentMethod: true,
      amountPaid: true
    }
  })
}

