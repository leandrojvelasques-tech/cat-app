"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"
import { sendTemporaryMemberAccessEmail } from "@/lib/emails"
import { generateTemporaryPassword } from "@/lib/temporary-password"

const ACCESS_MANAGEMENT_ROLES = ["ADMIN", "BOARD", "SUPERADMIN", "COLLABORATOR"]

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
  if (!session?.user || !ACCESS_MANAGEMENT_ROLES.includes(session.user.role)) {
    throw new Error("No autorizado")
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("La clave debe tener al menos 6 caracteres")
  }

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

export async function sendTemporaryMemberAccess(memberId: string) {
  const session = await auth()
  if (!session?.user || !ACCESS_MANAGEMENT_ROLES.includes(session.user.role)) {
    return { success: false, error: "No tenés permisos para reiniciar accesos de socios." }
  }

  if (!memberId || typeof memberId !== "string") {
    return { success: false, error: "El socio indicado no es válido." }
  }

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      user: { select: { id: true, email: true } },
    },
  })

  if (!member) return { success: false, error: "No se encontró el socio." }
  if (!member.email) return { success: false, error: "El socio no tiene un correo registrado. Cargalo en la ficha antes de generar el acceso." }

  const temporaryPassword = generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, 12)
  const accountEmail = member.email.trim().toLowerCase()
  let portalUser = member.user

  if (portalUser) {
    portalUser = await db.user.update({
      where: { id: portalUser.id },
      data: {
        passwordHash,
        mustChangePassword: true,
        resetToken: null,
        resetTokenExpires: null,
      },
      select: { id: true, email: true },
    })
  } else {
    const existingUser = await db.user.findUnique({
      where: { email: accountEmail },
      select: { id: true, email: true, member: { select: { id: true } } },
    })

    if (existingUser) {
      return { success: false, error: "Ya existe otra cuenta con este email. Revisá su vinculación antes de generar el acceso." }
    }

    portalUser = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: accountEmail,
          name: `${member.firstName} ${member.lastName}`,
          passwordHash,
          role: "MEMBER",
          mustChangePassword: true,
        },
        select: { id: true, email: true },
      })

      await tx.member.update({
        where: { id: member.id },
        data: { userId: createdUser.id },
      })

      return createdUser
    })
  }

  const emailSent = await sendTemporaryMemberAccessEmail(
    { ...member, email: member.email },
    portalUser,
    temporaryPassword,
    session.user.email || session.user.id
  )

  revalidatePath("/admin/socios")
  revalidatePath(`/admin/socios/${memberId}`)

  if (!emailSent) {
    return {
      success: false,
      passwordChanged: true,
      error: "La clave fue reiniciada, pero el correo no pudo enviarse. Intentá nuevamente para generar otra clave.",
    }
  }

  return { success: true }
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
