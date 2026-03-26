"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"

export async function updateUserPassword(userId: string, newPassword: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await db.user.update({
    where: { id: userId },
    data: { passwordHash }
  })

  revalidatePath("/admin/usuarios")
}

export async function updateUserEmail(userId: string, newEmail: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  await db.user.update({
    where: { id: userId },
    data: { email: newEmail.toLowerCase().trim() }
  })

  revalidatePath("/admin/usuarios")
}

export async function deleteUser(userId: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  // Check if it's the current user
  if (session.user.id === userId) {
    throw new Error("No puedes eliminarte a ti mismo")
  }

  await db.user.delete({
    where: { id: userId }
  })

  revalidatePath("/admin/usuarios")
}

// Reset a member's portal password by their memberId (not their admin user ID)
export async function resetMemberPassword(memberId: string, newPassword: string) {
  const session = await auth()
  if (!session) throw new Error("No autorizado")

  // Find the User record linked to this member
  const user = await db.user.findFirst({ where: { member: { id: memberId } } })
  if (!user) throw new Error("Este socio no tiene cuenta de acceso al portal")

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash }
  })

  revalidatePath(`/admin/socios/${memberId}`)
}
