"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { validateInstitutionalFile } from "@/lib/security-utils"
import { revalidatePath } from "next/cache"

const MANAGEMENT_ROLES = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]

async function requireManagementAccess() {
  const session = await auth()
  if (!session?.user || !MANAGEMENT_ROLES.includes(session.user.role)) {
    throw new Error("No tiene permisos para gestionar comunicaciones a socios.")
  }
  return session.user
}

export async function getMemberCommunications(includeDrafts = false) {
  if (includeDrafts) await requireManagementAccess()
  return db.memberCommunication.findMany({
    where: includeDrafts ? undefined : { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  })
}

export async function createMemberCommunication(formData: FormData) {
  try {
    const user = await requireManagementAccess()
    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const file = formData.get("file")

    if (!title || title.length > 160) {
      return { success: false, error: "El título es obligatorio y no puede superar los 160 caracteres." }
    }
    if (!description || description.length > 5000) {
      return { success: false, error: "La descripción es obligatoria y no puede superar los 5000 caracteres." }
    }
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Debe seleccionar un archivo adjunto." }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const validation = await validateInstitutionalFile(buffer, file.name, file.type)
    if (!validation.isValid || !validation.safeFileName || !validation.mimeType) {
      return { success: false, error: validation.error || "No se pudo validar el archivo." }
    }

    const communication = await db.memberCommunication.create({
      data: {
        title,
        description,
        fileUrl: "",
        storageName: validation.safeFileName,
        fileData: buffer,
        fileName: file.name.slice(0, 255),
        fileMimeType: validation.mimeType,
        createdById: user.id
      }
    })

    await db.memberCommunication.update({
      where: { id: communication.id },
      data: { fileUrl: `/api/socios/comunicaciones/${communication.id}/archivo` }
    })

    revalidatePath("/admin/comunicaciones")
    revalidatePath("/socios")
    return { success: true }
  } catch (error) {
    console.error("Error creating member communication:", error)
    return { success: false, error: error instanceof Error ? error.message : "No se pudo guardar la comunicación." }
  }
}

export async function toggleMemberCommunication(id: string, publish: boolean) {
  try {
    await requireManagementAccess()
    await db.memberCommunication.update({
      where: { id },
      data: { status: publish ? "PUBLISHED" : "DRAFT", publishedAt: publish ? new Date() : null }
    })
    revalidatePath("/admin/comunicaciones")
    revalidatePath("/socios")
    return { success: true }
  } catch (error) {
    console.error("Error changing member communication status:", error)
    return { success: false, error: error instanceof Error ? error.message : "No se pudo actualizar el estado." }
  }
}

export async function deleteMemberCommunication(id: string) {
  try {
    await requireManagementAccess()
    await db.memberCommunication.delete({ where: { id } })
    revalidatePath("/admin/comunicaciones")
    revalidatePath("/socios")
    return { success: true }
  } catch (error) {
    console.error("Error deleting member communication:", error)
    return { success: false, error: error instanceof Error ? error.message : "No se pudo eliminar la comunicación." }
  }
}
