"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

const MEMBER_MANAGEMENT_ROLES = ["ADMIN", "BOARD", "SUPERADMIN", "COLLABORATOR"]

async function requireMemberManagementAccess() {
  const session = await auth()
  if (!session?.user || !MEMBER_MANAGEMENT_ROLES.includes(session.user.role)) {
    throw new Error("No autorizado")
  }
}

async function requireHonoraryMember(memberId: string) {
  const member = await db.member.findUnique({ where: { id: memberId }, select: { type: true, status: true } })
  if (!member || member.type !== "HONORARIO" || member.status === "BAJA") {
    throw new Error("Los reconocimientos solo pueden cargarse para un socio honorario vigente.")
  }
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value.trim()) return null
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) throw new Error("La fecha del reconocimiento no es válida.")
  return date
}

export async function createHonoraryAchievement(memberId: string, formData: FormData) {
  await requireMemberManagementAccess()
  await requireHonoraryMember(memberId)
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const sortOrder = Number(formData.get("sortOrder") || 0)

  if (!title) throw new Error("El título del reconocimiento es obligatorio.")
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden del reconocimiento no es válido.")

  await db.honoraryAchievement.create({
    data: { memberId, title, description: description || null, eventDate: parseOptionalDate(formData.get("eventDate")), sortOrder }
  })

  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/socios-honorarios")
}

export async function updateHonoraryAchievement(achievementId: string, memberId: string, formData: FormData) {
  await requireMemberManagementAccess()
  await requireHonoraryMember(memberId)
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const sortOrder = Number(formData.get("sortOrder") || 0)

  if (!title) throw new Error("El título del reconocimiento es obligatorio.")
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("El orden del reconocimiento no es válido.")

  await db.honoraryAchievement.updateMany({
    where: { id: achievementId, memberId },
    data: { title, description: description || null, eventDate: parseOptionalDate(formData.get("eventDate")), sortOrder }
  })

  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/socios-honorarios")
}

export async function deleteHonoraryAchievement(achievementId: string, memberId: string) {
  await requireMemberManagementAccess()
  await db.honoraryAchievement.deleteMany({ where: { id: achievementId, memberId } })
  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/socios-honorarios")
}
