"use server"

import { db } from "@/lib/db"
import { sendPasswordResetEmail, getBaseUrl } from "@/lib/emails"
import crypto from "crypto"
import bcrypt from "bcrypt"

export async function requestPasswordReset(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Por favor ingresa un correo electrónico válido." }
  }

  try {
    const cleanEmail = email.toLowerCase().trim()
    
    // 1. Buscar el usuario
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      include: { member: true }
    })

    if (!user) {
      // Retornar éxito ficticio por seguridad
      return { success: true }
    }

    // 2. Generar token y expiración (1 hora)
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000)

    // 3. Guardar en BD
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires
      }
    })

    // 4. Construir enlace de reset
    const baseUrl = getBaseUrl()
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // 5. Enviar el correo
    await sendPasswordResetEmail(
      { id: user.id, email: user.email, name: user.name },
      resetLink,
      user.member?.id
    )

    return { success: true }
  } catch (error) {
    console.error("Error solicitando restablecimiento de contraseña:", error)
    return { success: false, error: "Hubo un error al procesar tu solicitud." }
  }
}

export async function resetPassword(token: string, password: string) {
  if (!token) {
    return { success: false, error: "Token de restablecimiento no válido o inexistente." }
  }
  if (!password || password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres." }
  }

  try {
    // 1. Buscar usuario con el token que no haya expirado
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return { success: false, error: "El enlace de restablecimiento es inválido o ha expirado." }
    }

    // 2. Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // 3. Actualizar contraseña y limpiar tokens
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error)
    return { success: false, error: "Hubo un error al restablecer tu contraseña." }
  }
}
