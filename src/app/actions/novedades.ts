"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { sendNovedadNotificationEmail, sendNovedadPreviewEmail as sendPreviewEmail } from "@/lib/emails"
import { calculateMemberStatus } from "@/lib/member-utils"
import { validateInstitutionalFile } from "@/lib/security-utils"
import { slugify } from "@/lib/slug-utils"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

const MANAGEMENT_ROLES = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]

async function requireNovedadesAccess() {
  const session = await auth()
  if (!session?.user || !MANAGEMENT_ROLES.includes(session.user.role)) {
    throw new Error("No tiene permisos para gestionar novedades.")
  }
  return session.user
}

async function parseNovedadImageField(formData: FormData): Promise<string | null> {
  const fileOrString = formData.get("imageFile")
  const imageUrl = formData.get("imageUrl")
  const existingImage = formData.get("existingImage")

  // Check if a file was uploaded
  if (fileOrString && typeof fileOrString !== "string" && fileOrString.size > 0) {
    const bytes = await fileOrString.arrayBuffer()
    const buffer = Buffer.from(bytes)
    return `data:${fileOrString.type};base64,${buffer.toString("base64")}`
  }

  // Check if an image URL string was provided
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.trim()
  }

  // Fallback to existing image
  if (typeof existingImage === "string" && existingImage.length > 0) {
    return existingImage
  }

  return null
}

async function persistNovedadAttachments(novedadId: string, formData: FormData) {
  const files = formData.getAll("attachments").filter((file): file is File => file instanceof File && file.size > 0)

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const validation = await validateInstitutionalFile(buffer, file.name, file.type)
    if (!validation.isValid || !validation.safeFileName || !validation.mimeType) {
      throw new Error(validation.error || "No se pudo validar uno de los archivos adjuntos.")
    }

    await db.novedadAttachment.create({
      data: {
        novedadId,
        fileName: file.name.slice(0, 255),
        storageName: validation.safeFileName,
        fileMimeType: validation.mimeType,
        fileData: buffer,
      },
    })
  }
}

function revalidateNovedadPaths(slug?: string) {
  revalidatePath("/")
  revalidatePath("/novedades")
  if (slug) revalidatePath(`/novedades/${slug}`)
  revalidatePath("/admin/eventos")
  revalidatePath("/admin/eventos/novedades")
  revalidatePath("/socios")
}

async function createUniqueNovedadSlug(title: string) {
  const baseSlug = slugify(title).slice(0, 110) || "novedad"
  let candidate = baseSlug
  let suffix = 2

  while (await db.novedad.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return candidate
}

export async function createNovedad(formData: FormData) {
  try {
    await requireNovedadesAccess()
    const title = formData.get("title") as string
    const subtitle = (formData.get("subtitle") as string) || null
    const content = formData.get("content") as string
    const publishedAtStr = formData.get("publishedAt") as string
    const isPublished = formData.get("isPublished") === "true" || formData.get("isPublished") === "on"

    if (!title || !content) {
      return { success: false, error: "El título y el contenido son obligatorios." }
    }

    const imageUrl = await parseNovedadImageField(formData)

    const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date()

    const slug = await createUniqueNovedadSlug(title)
    const novedad = await db.novedad.create({
      data: {
        id: randomUUID(),
        slug,
        title,
        subtitle,
        content,
        imageUrl,
        publishedAt,
        isPublished
      }
    })
    await persistNovedadAttachments(novedad.id, formData)

    revalidateNovedadPaths(novedad.slug)

    return { success: true, id: novedad.id, slug: novedad.slug }
  } catch (error) {
    console.error("Error creating Novedad:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al crear la novedad." }
  }
}

export async function updateNovedad(id: string, formData: FormData) {
  try {
    await requireNovedadesAccess()
    const title = formData.get("title") as string
    const subtitle = (formData.get("subtitle") as string) || null
    const content = formData.get("content") as string
    const publishedAtStr = formData.get("publishedAt") as string
    const isPublished = formData.get("isPublished") === "true" || formData.get("isPublished") === "on"

    if (!title || !content) {
      return { success: false, error: "El título y el contenido son obligatorios." }
    }

    const imageUrl = await parseNovedadImageField(formData)
    const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date()

    const novedad = await db.novedad.update({
      where: { id },
      data: {
        title,
        subtitle,
        content,
        imageUrl,
        publishedAt,
        isPublished
      }
    })
    await persistNovedadAttachments(id, formData)

    revalidateNovedadPaths(novedad.slug)

    return { success: true }
  } catch (error) {
    console.error("Error updating Novedad:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al actualizar la novedad." }
  }
}

export async function deleteNovedad(id: string) {
  try {
    await requireNovedadesAccess()
    const novedad = await db.novedad.delete({
      where: { id }
    })

    revalidateNovedadPaths(novedad.slug)

    return { success: true }
  } catch (error) {
    console.error("Error deleting Novedad:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al eliminar la novedad." }
  }
}

export async function toggleNovedadStatus(id: string, isPublished: boolean) {
  try {
    await requireNovedadesAccess()
    const novedad = await db.novedad.update({
      where: { id },
      data: { isPublished }
    })

    revalidateNovedadPaths(novedad.slug)

    return { success: true }
  } catch (error) {
    console.error("Error toggling Novedad status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al cambiar el estado." }
  }
}

export async function getNovedades(onlyPublished = true, take?: number) {
  try {
    const novedades = await db.novedad.findMany({
      where: onlyPublished ? { isPublished: true } : undefined,
      orderBy: { publishedAt: "desc" },
      take: take,
      include: { attachments: { select: { id: true, fileName: true, fileMimeType: true } } },
    })
    return novedades
  } catch (error) {
    console.error("Error getting Novedades:", error)
    return []
  }
}

async function getEligibleNovedadRecipients() {
  const members = await db.member.findMany({
    where: { wantsMailing: true, email: { not: null } },
    include: { fees: { select: { periodYear: true, periodMonth: true, paymentStatus: true } } },
  })

  return members.filter((member) => {
    if (!member.email?.trim()) return false
    const status = calculateMemberStatus(member)
    return status === "AL DIA" || status === "EN MORA"
  })
}

export async function getNovedadMailingSummary(novedadId: string) {
  try {
    await requireNovedadesAccess()
    const [novedad, recipients, sent] = await Promise.all([
      db.novedad.findUnique({ where: { id: novedadId }, select: { id: true, title: true, isPublished: true } }),
      getEligibleNovedadRecipients(),
      db.novedadMailing.count({ where: { novedadId, status: "SENT" } }),
    ])
    if (!novedad) return { success: false, error: "No se encontró la novedad." }
    return { success: true, title: novedad.title, isPublished: novedad.isPublished, recipientCount: recipients.length, sentCount: sent }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "No se pudo preparar el envío." }
  }
}

export async function sendNovedadToEligibleMembers(novedadId: string) {
  try {
    await requireNovedadesAccess()
    const novedad = await db.novedad.findUnique({ where: { id: novedadId } })
    if (!novedad) return { success: false, error: "No se encontró la novedad." }
    if (!novedad.isPublished) return { success: false, error: "Publicá la novedad antes de enviarla a socios." }

    const recipients = await getEligibleNovedadRecipients()
    let sentCount = 0
    let skippedCount = 0
    let failedCount = 0

    for (const member of recipients) {
      const mailing = await db.novedadMailing.upsert({
        where: { novedadId_memberId: { novedadId, memberId: member.id } },
        create: { novedadId, memberId: member.id },
        update: {},
      })
      if (mailing.status === "SENT") {
        skippedCount++
        continue
      }

      const sent = await sendNovedadNotificationEmail(member, novedad)
      await db.novedadMailing.update({
        where: { id: mailing.id },
        data: { status: sent ? "SENT" : "FAILED", sentAt: sent ? new Date() : null },
      })
      if (sent) sentCount++
      else failedCount++
    }

    return { success: true, sentCount, skippedCount, failedCount }
  } catch (error) {
    console.error("Error sending novedad mailing:", error)
    return { success: false, error: error instanceof Error ? error.message : "No se pudo enviar la novedad." }
  }
}

export async function sendNovedadPreview(novedadId: string, recipientEmail: string) {
  try {
    await requireNovedadesAccess()
    const email = recipientEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "La dirección de prueba no es válida." }
    }

    const novedad = await db.novedad.findUnique({ where: { id: novedadId } })
    if (!novedad) return { success: false, error: "No se encontró la novedad." }
    if (!novedad.isPublished) return { success: false, error: "Publicá la novedad antes de enviarla." }

    const sent = await sendPreviewEmail(email, novedad)
    return sent
      ? { success: true, recipientEmail: email }
      : { success: false, error: "El proveedor de correo no confirmó el envío." }
  } catch (error) {
    console.error("Error sending novedad preview:", error)
    return { success: false, error: error instanceof Error ? error.message : "No se pudo enviar la prueba." }
  }
}
