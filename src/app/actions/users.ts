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
