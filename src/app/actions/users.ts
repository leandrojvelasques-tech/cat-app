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
    data: {
      passwordHash,
      mustChangePassword: true
    }
  })

  revalidatePath(`/admin/socios/${memberId}`)
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await auth()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    throw new Error("No autorizado")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const position = formData.get("position") as string || null
  const memberId = formData.get("memberId") as string || null // ID of the member to link to, or empty string/null to unlink

  if (!name || !email || !role) {
    throw new Error("Faltan datos obligatorios")
  }

  // Find the current user state to check existing links
  const currentUser = await db.user.findUnique({
    where: { id: userId },
    include: { member: true }
  })

  if (!currentUser) {
    throw new Error("Usuario no encontrado")
  }

  // 1. Update user fields
  const isBoardMember = role === "BOARD" || !!position
  await db.user.update({
    where: { id: userId },
    data: {
      name,
      email: email.toLowerCase().trim(),
      role,
      position,
      isBoardMember
    }
  })

  // 2. Handle linking/unlinking of Member (Socio)
  const currentMemberId = currentUser.member?.id || null

  if (currentMemberId !== memberId) {
    // Unlink the old member first if there was one
    if (currentMemberId) {
      await db.member.update({
        where: { id: currentMemberId },
        data: {
          userId: null,
          isBoardMember: false,
          position: null
        }
      })
    }

    // Link the new member if specified
    if (memberId) {
      // Check if this member is already linked to another user
      const existingLink = await db.member.findUnique({
        where: { id: memberId },
        select: { userId: true }
      })

      if (existingLink?.userId && existingLink.userId !== userId) {
        throw new Error("El socio seleccionado ya está vinculado a otra cuenta de usuario")
      }

      await db.member.update({
        where: { id: memberId },
        data: {
          userId,
          isBoardMember,
          position: isBoardMember ? position : null
        }
      })
    }
  } else if (memberId) {
    // If the link didn't change but the position/role did, sync the member's details
    await db.member.update({
      where: { id: memberId },
      data: {
        isBoardMember,
        position: isBoardMember ? position : null
      }
    })
  }

  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/configuracion")
  revalidatePath("/admin/comision")
}
