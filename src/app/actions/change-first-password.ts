"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"

export async function changeFirstPassword(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    return { error: "No autorizado" }
  }

  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!newPassword || newPassword.trim().length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." }
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await db.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash,
      mustChangePassword: false
    }
  })

  const target = ["ADMIN", "BOARD", "SUPERADMIN", "COLLABORATOR"].includes(session.user.role) ? "/admin" : "/socios"
  redirect(target)
}
