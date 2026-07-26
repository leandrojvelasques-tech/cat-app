"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcrypt"

export async function addBoardMember(formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string
    const position = formData.get("position") as string || "Vocal"
    const periodStart = formData.get("periodStart") as string || new Date().getFullYear().toString()
    const periodEnd = formData.get("periodEnd") as string
    const notes = formData.get("notes") as string

    if (!memberId) {
      throw new Error("Debe seleccionar un socio.")
    }

    // 1. Actualizar el estado en el socio
    await db.member.update({
      where: { id: memberId },
      data: {
        isBoardMember: true,
        position
      }
    })

    // Sincronizar con el modelo User si el socio tiene cuenta vinculada
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { userId: true }
    })
    if (member?.userId) {
      const user = await db.user.findUnique({ where: { id: member.userId } })
      await db.user.update({
        where: { id: member.userId },
        data: {
          isBoardMember: true,
          position,
          role: user?.role === "MEMBER" ? "BOARD" : undefined
        }
      })
    }

    // 2. Crear registro histórico de Comisión Directiva
    await db.boardHistory.create({
      data: {
        memberId,
        position,
        periodStart,
        periodEnd: periodEnd || null,
        notes: notes || `Asignado en Comisión Directiva`
      }
    })

    revalidatePath("/admin/comision")
    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/socios")
  } catch (e: any) {
    console.error("Error al agregar miembro de la comisión:", e)
  }
}

export async function removeBoardMember(memberId: string) {
  try {
    // 1. Quitar flag de Comisión Directiva del socio
    await db.member.update({
      where: { id: memberId },
      data: {
        isBoardMember: false,
        position: null
      }
    })

    // Sincronizar con el modelo User si el socio tiene cuenta vinculada
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { userId: true }
    })
    if (member?.userId) {
      const user = await db.user.findUnique({ where: { id: member.userId } })
      await db.user.update({
        where: { id: member.userId },
        data: {
          isBoardMember: false,
          position: null,
          role: user?.role === "BOARD" ? "MEMBER" : undefined
        }
      })
    }

    // 2. Actualizar el último BoardHistory activo para este socio agregando el año de finalización actual
    const lastHistory = await db.boardHistory.findFirst({
      where: { memberId, periodEnd: null },
      orderBy: { createdAt: "desc" }
    })

    if (lastHistory) {
      await db.boardHistory.update({
        where: { id: lastHistory.id },
        data: {
          periodEnd: new Date().getFullYear().toString()
        }
      })
    }

    revalidatePath("/admin/comision")
    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/socios")
  } catch (e: any) {
    console.error("Error al remover miembro de la comisión:", e)
  }
}

export async function updateBoardMember(memberId: string, formData: FormData) {
  try {
    const position = formData.get("position") as string || "Vocal"
    const periodStart = formData.get("periodStart") as string || new Date().getFullYear().toString()
    const periodEnd = formData.get("periodEnd") as string
    const notes = formData.get("notes") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const avatarUrl = formData.get("avatarUrl") as string

    // 1. Actualizar Member: cargo, email, teléfono, y foto
    await db.member.update({
      where: { id: memberId },
      data: {
        position,
        email: email || null,
        phone: phone || null,
        avatarUrl: avatarUrl || null
      }
    })

    // 2. Sincronizar con el modelo User si el socio tiene cuenta vinculada
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { userId: true }
    })
    if (member?.userId) {
      const user = await db.user.findUnique({ where: { id: member.userId } })
      await db.user.update({
        where: { id: member.userId },
        data: {
          isBoardMember: true,
          position,
          role: user?.role === "MEMBER" ? "BOARD" : undefined
        }
      })
    }

    // 3. Buscar y actualizar el último BoardHistory activo o el más reciente para este socio
    let lastHistory = await db.boardHistory.findFirst({
      where: { memberId, periodEnd: null },
      orderBy: { createdAt: "desc" }
    })

    if (!lastHistory) {
      lastHistory = await db.boardHistory.findFirst({
        where: { memberId },
        orderBy: { createdAt: "desc" }
      })
    }

    if (lastHistory) {
      await db.boardHistory.update({
        where: { id: lastHistory.id },
        data: {
          position,
          periodStart,
          periodEnd: periodEnd || null,
          notes: notes || lastHistory.notes
        }
      })
    } else {
      await db.boardHistory.create({
        data: {
          memberId,
          position,
          periodStart,
          periodEnd: periodEnd || null,
          notes: notes || `Asignado en Comisión Directiva`
        }
      })
    }

    revalidatePath("/admin/comision")
    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/socios")
    revalidatePath(`/admin/socios/${memberId}`)
  } catch (e: any) {
    console.error("Error al actualizar miembro de la comisión:", e)
    throw e
  }
}

export async function createAndLinkBoardUser(formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string
    const password = formData.get("password") as string

    if (!memberId || !password || password.trim().length < 6) {
      throw new Error("Datos inválidos. La contraseña debe tener al menos 6 caracteres.")
    }

    const member = await db.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      throw new Error("Socio no encontrado.")
    }

    if (member.userId) {
      throw new Error("Este socio ya tiene una cuenta vinculada.")
    }

    if (!member.email) {
      throw new Error("El socio debe tener un correo electrónico asignado para crear una cuenta.")
    }

    const email = member.email.toLowerCase().trim()

    // Verificar si ya existe un usuario con ese correo electrónico
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new Error("Ya existe un usuario con este correo electrónico en el sistema.")
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Crear User
    const newUser = await db.user.create({
      data: {
        email,
        name: `${member.firstName} ${member.lastName}`,
        passwordHash,
        role: "BOARD",
        position: member.position,
        isBoardMember: true,
        mustChangePassword: true
      }
    })

    // Vincular User al Member
    await db.member.update({
      where: { id: memberId },
      data: {
        userId: newUser.id
      }
    })

    revalidatePath("/admin/comision")
    revalidatePath("/admin/configuracion")
    revalidatePath(`/admin/comision/${memberId}/editar`)
  } catch (e: any) {
    console.error("Error al crear y vincular usuario:", e)
    throw e
  }
}
