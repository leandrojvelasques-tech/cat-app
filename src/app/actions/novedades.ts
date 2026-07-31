"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

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

export async function createNovedad(formData: FormData) {
  try {
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

    await db.novedad.create({
      data: {
        title,
        subtitle,
        content,
        imageUrl,
        publishedAt,
        isPublished
      }
    })

    revalidatePath("/")
    revalidatePath("/novedades")
    revalidatePath("/admin/eventos")
    revalidatePath("/admin/eventos/novedades")
    revalidatePath("/socios")

    return { success: true }
  } catch (error: any) {
    console.error("Error creating Novedad:", error)
    return { success: false, error: error.message || "Error al crear la novedad." }
  }
}

export async function updateNovedad(id: string, formData: FormData) {
  try {
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

    await db.novedad.update({
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

    revalidatePath("/")
    revalidatePath("/novedades")
    revalidatePath("/admin/eventos")
    revalidatePath("/admin/eventos/novedades")
    revalidatePath("/socios")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating Novedad:", error)
    return { success: false, error: error.message || "Error al actualizar la novedad." }
  }
}

export async function deleteNovedad(id: string) {
  try {
    await db.novedad.delete({
      where: { id }
    })

    revalidatePath("/")
    revalidatePath("/novedades")
    revalidatePath("/admin/eventos")
    revalidatePath("/admin/eventos/novedades")
    revalidatePath("/socios")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting Novedad:", error)
    return { success: false, error: error.message || "Error al eliminar la novedad." }
  }
}

export async function toggleNovedadStatus(id: string, isPublished: boolean) {
  try {
    await db.novedad.update({
      where: { id },
      data: { isPublished }
    })

    revalidatePath("/")
    revalidatePath("/novedades")
    revalidatePath("/admin/eventos")
    revalidatePath("/admin/eventos/novedades")
    revalidatePath("/socios")

    return { success: true }
  } catch (error: any) {
    console.error("Error toggling Novedad status:", error)
    return { success: false, error: error.message || "Error al cambiar el estado." }
  }
}

export async function getNovedades(onlyPublished = true, take?: number) {
  try {
    const novedades = await db.novedad.findMany({
      where: onlyPublished ? { isPublished: true } : undefined,
      orderBy: { publishedAt: "desc" },
      take: take
    })
    return novedades
  } catch (error) {
    console.error("Error getting Novedades:", error)
    return []
  }
}
