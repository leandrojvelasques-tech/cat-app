"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { join } from "path"

export async function createEvent(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startDateStr = formData.get("startDate") as string // Now just YYYY-MM-DD
  const endDateStr = formData.get("endDate") as string
  const location = formData.get("location") as string
  const organizer = (formData.get("organizer") as string) || "Centro Amigos del Tango"
  const type = formData.get("type") as string
  const isPublic = formData.get("isPublic") === "on"
  
  // Specific Schedules
  const milongaStart = formData.get("milongaStart") ? new Date(formData.get("milongaStart") as string) : null
  const milongaEnd = formData.get("milongaEnd") ? new Date(formData.get("milongaEnd") as string) : null
  const milongaLocation = formData.get("milongaLocation") as string
  const tangoDJ = formData.get("tangoDJ") as string
  
  const workshopStart = formData.get("workshopStart") ? new Date(formData.get("workshopStart") as string) : null
  const workshopEnd = formData.get("workshopEnd") ? new Date(formData.get("workshopEnd") as string) : null
  const workshopLocation = formData.get("workshopLocation") as string
  const workshopClasses = formData.get("workshopClasses") as string // Stringified JSON

  // Pricing
  const priceSocioMilonga = parseFloat(formData.get("priceSocioMilonga") as string) || 0
  const priceNonSocioMilonga = parseFloat(formData.get("priceNonSocioMilonga") as string) || 0
  const priceSocioWorkshop = parseFloat(formData.get("priceSocioWorkshop") as string) || 0
  const priceNonSocioWorkshop = parseFloat(formData.get("priceNonSocioWorkshop") as string) || 0
  const priceSocioFull = parseFloat(formData.get("priceSocioFull") as string) || 0
  const priceNonSocioFull = parseFloat(formData.get("priceNonSocioFull") as string) || 0

  const eventBannerFile = formData.get("eventBanner") as File | null
  let eventBanner = null

  if (eventBannerFile && eventBannerFile.size > 0) {
    const bytes = await eventBannerFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueName = `${Date.now()}-${eventBannerFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const uploadDir = join(process.cwd(), "public", "uploads", "events")
    const { existsSync, mkdirSync, writeFileSync } = await import("fs")
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
    writeFileSync(join(uploadDir, uniqueName), buffer)
    eventBanner = `/uploads/events/${uniqueName}`
  }

  const startWithTime = new Date(startDateStr + "T00:00:00")
  const endWithTime = endDateStr ? new Date(endDateStr + "T23:59:59") : null

  await (db.event.create as any)({
    data: {
      title,
      description,
      startDate: startWithTime,
      endDate: endWithTime,
      location,
      organizer,
      type,
      isPublic,
      eventBanner,
      milongaStart,
      milongaEnd,
      milongaLocation,
      tangoDJ,
      workshopStart,
      workshopEnd,
      workshopLocation,
      workshopClasses,
      priceSocioMilonga,
      priceNonSocioMilonga,
      priceSocioWorkshop,
      priceNonSocioWorkshop,
      priceSocioFull,
      priceNonSocioFull,
      status: "OPEN"
    }
  })

  revalidatePath("/admin/eventos")
  redirect("/admin/eventos")
}

export async function updateEvent(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const location = formData.get("location") as string
  const organizer = (formData.get("organizer") as string) || "Centro Amigos del Tango"
  const type = formData.get("type") as string
  const isPublic = formData.get("isPublic") === "on"
  
  const milongaStart = formData.get("milongaStart") ? new Date(formData.get("milongaStart") as string) : null
  const milongaEnd = formData.get("milongaEnd") ? new Date(formData.get("milongaEnd") as string) : null
  const milongaLocation = formData.get("milongaLocation") as string
  const tangoDJ = formData.get("tangoDJ") as string
  
  const workshopStart = formData.get("workshopStart") ? new Date(formData.get("workshopStart") as string) : null
  const workshopEnd = formData.get("workshopEnd") ? new Date(formData.get("workshopEnd") as string) : null
  const workshopClasses = formData.get("workshopClasses") as string

  const priceSocioMilonga = parseFloat(formData.get("priceSocioMilonga") as string) || 0
  const priceNonSocioMilonga = parseFloat(formData.get("priceNonSocioMilonga") as string) || 0
  const priceSocioWorkshop = parseFloat(formData.get("priceSocioWorkshop") as string) || 0
  const priceNonSocioWorkshop = parseFloat(formData.get("priceNonSocioWorkshop") as string) || 0
  const priceSocioFull = parseFloat(formData.get("priceSocioFull") as string) || 0
  const priceNonSocioFull = parseFloat(formData.get("priceNonSocioFull") as string) || 0

  const eventBannerFile = formData.get("eventBanner") as File | null
  let eventBanner = formData.get("existingBanner") as string | null

  if (eventBannerFile && eventBannerFile.size > 0) {
    const bytes = await eventBannerFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uniqueName = `${Date.now()}-${eventBannerFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const uploadDir = join(process.cwd(), "public", "uploads", "events")
    const { existsSync, mkdirSync, writeFileSync } = await import("fs")
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
    writeFileSync(join(uploadDir, uniqueName), buffer)
    eventBanner = `/uploads/events/${uniqueName}`
  }

  const startWithTime = new Date(startDateStr + "T00:00:00")
  const endWithTime = endDateStr ? new Date(endDateStr + "T23:59:59") : null

  await (db.event.update as any)({
    where: { id },
    data: {
      title,
      description,
      startDate: startWithTime,
      endDate: endWithTime,
      location,
      organizer,
      type,
      isPublic,
      eventBanner,
      milongaStart,
      milongaEnd,
      milongaLocation,
      tangoDJ,
      workshopStart,
      workshopEnd,
      workshopClasses,
      priceSocioMilonga,
      priceNonSocioMilonga,
      priceSocioWorkshop,
      priceNonSocioWorkshop,
      priceSocioFull,
      priceNonSocioFull,
    }
  })

  revalidatePath("/admin/eventos")
  revalidatePath(`/admin/eventos/${id}`)
  redirect(`/admin/eventos/${id}`)
}

export async function duplicateEvent(eventId: string, newDate: string) {
  const original = await db.event.findUnique({ where: { id: eventId } })
  if (!original) return

  // Calculate difference to shift specific times
  const oldBase = new Date(original.startDate).getTime()
  const newBase = new Date(newDate).getTime()
  const diff = newBase - oldBase

  const shiftTime = (date: Date | null) => date ? new Date(date.getTime() + diff) : null

  await db.event.create({
    data: {
      ...original,
      id: undefined,
      startDate: new Date(newDate),
      endDate: original.endDate ? shiftTime(original.endDate) : null,
      milongaStart: shiftTime(original.milongaStart),
      milongaEnd: shiftTime(original.milongaEnd),
      workshopStart: shiftTime(original.workshopStart),
      workshopEnd: shiftTime(original.workshopEnd),
      status: "OPEN",
      createdAt: undefined,
      updatedAt: undefined
    }
  })
  
  revalidatePath("/admin/eventos")
}
