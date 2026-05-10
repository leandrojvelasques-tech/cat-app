"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Converts an uploaded File to a base64 data URL to store in the DB.
// Using base64 because Vercel's serverless filesystem is read-only.
async function fileToBase64DataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString("base64")
  return `data:${file.type};base64,${base64}`
}

// Helper to merge date from one field with time from another
const mergeDateTime = (baseDate: Date | null, timeStr: string | null) => {
  if (!timeStr) return null
  if (timeStr.includes("T")) return new Date(timeStr)
  if (!baseDate) return null
  const datePart = baseDate.toISOString().split("T")[0]
  return new Date(`${datePart}T${timeStr}:00`)
}

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
  const milongaLocation = formData.get("milongaLocation") as string
  const tangoDJ = formData.get("tangoDJ") as string
  
  // Pricing (Milonga Only)
  const priceSocioMilonga = parseFloat(formData.get("priceSocioMilonga") as string) || 0
  const priceNonSocioMilonga = parseFloat(formData.get("priceNonSocioMilonga") as string) || 0

  const milongaStart = formData.get("milongaStart") ? new Date(formData.get("milongaStart") as string) : null
  const milongaEnd = mergeDateTime(milongaStart, formData.get("milongaEnd") as string)
  
  const eventBannerFile = formData.get("eventBanner") as File | null
  let eventBanner: string | null = null

  // Store banner as base64 data URL
  if (eventBannerFile && eventBannerFile.size > 0) {
    eventBanner = await fileToBase64DataUrl(eventBannerFile)
  }

  const startWithTime = new Date(startDateStr + "T00:00:00")
  const endWithTime = endDateStr ? new Date(endDateStr + "T23:59:59") : null

  await db.event.create({
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
      priceSocioMilonga,
      priceNonSocioMilonga,
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
  const milongaEnd = mergeDateTime(milongaStart, formData.get("milongaEnd") as string)
  const milongaLocation = formData.get("milongaLocation") as string
  const tangoDJ = formData.get("tangoDJ") as string
  
  const priceSocioMilonga = parseFloat(formData.get("priceSocioMilonga") as string) || 0
  const priceNonSocioMilonga = parseFloat(formData.get("priceNonSocioMilonga") as string) || 0

  const eventBannerFile = formData.get("eventBanner") as File | null
  // Default: keep the existing banner stored in the hidden input
  let eventBanner: string | null = (formData.get("existingBanner") as string) || null

  // Override with newly uploaded banner if provided
  if (eventBannerFile && eventBannerFile.size > 0) {
    eventBanner = await fileToBase64DataUrl(eventBannerFile)
  }

  const startWithTime = new Date(startDateStr + "T00:00:00")
  const endWithTime = endDateStr ? new Date(endDateStr + "T23:59:59") : null

  await db.event.update({
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
      priceSocioMilonga,
      priceNonSocioMilonga,
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
      title: original.title,
      description: original.description,
      startDate: new Date(newDate),
      endDate: original.endDate ? shiftTime(original.endDate) : null,
      location: original.location,
      organizer: original.organizer,
      type: original.type,
      isPublic: original.isPublic,
      eventBanner: original.eventBanner,
      milongaStart: shiftTime(original.milongaStart),
      milongaEnd: shiftTime(original.milongaEnd),
      milongaLocation: original.milongaLocation,
      tangoDJ: original.tangoDJ,
      priceSocioMilonga: original.priceSocioMilonga,
      priceNonSocioMilonga: original.priceNonSocioMilonga,
      status: "OPEN"
    }
  })
  
  revalidatePath("/admin/eventos")
}
