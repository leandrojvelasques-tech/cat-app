"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { recordAuditLog } from "@/lib/audit-utils"

export async function getBenefits(onlyActive = true) {
  try {
    const benefits = await db.memberBenefit.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }]
    })
    return benefits
  } catch (error) {
    console.error("Error fetching benefits:", error)
    return []
  }
}

export async function seedDefaultBenefitsIfEmpty() {
  try {
    const count = await db.memberBenefit.count()
    if (count === 0) {
      await db.memberBenefit.createMany({
        data: [
          {
            title: "Descuento en clases de tango - Academia Swing",
            description: "Los socios del CAT cuentan con el beneficio de no pagar costo de inscripción y un descuento de $8.000 pesos en la cuota mensual para las clases de tango de los días viernes en la Academia Swing.",
            badge: "DESCUENTO",
            isActive: true,
            order: 1
          },
          {
            title: "Acceso gratuito a las milongas tradicionales del CAT",
            description: "Los socios contarán con acceso sin cargo a las milongas organizadas por el Centro Amigos del Tango. Únicamente válido para socios que se encuentren al día al momento de realizarse la milonga.",
            badge: "ACCESO GRATUITO",
            isActive: true,
            order: 2
          }
        ]
      })
    }
  } catch (error) {
    console.error("Error seeding default benefits:", error)
  }
}

export async function createBenefit(formData: FormData) {
  try {
    const session = await auth()
    const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
    if (!session || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "No autorizado" }
    }

    const title = (formData.get("title") as string)?.trim()
    const description = (formData.get("description") as string)?.trim()
    const badge = (formData.get("badge") as string)?.trim() || null
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on"
    const orderRaw = formData.get("order") as string
    const order = orderRaw ? parseInt(orderRaw, 10) : 0

    if (!title || !description) {
      return { success: false, error: "El título y la descripción son obligatorios." }
    }

    const newBenefit = await db.memberBenefit.create({
      data: {
        title,
        description,
        badge,
        isActive,
        order
      }
    })

    await recordAuditLog(
      session.user,
      "Creación de Beneficio para Socios",
      `Creado beneficio: "${title}"`
    )

    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/configuracion/beneficios")
    revalidatePath("/socios")
    revalidatePath("/socios/beneficios")

    return { success: true, data: newBenefit }
  } catch (error: any) {
    console.error("Error creating benefit:", error)
    return { success: false, error: error.message || "Error al crear el beneficio." }
  }
}

export async function updateBenefit(id: string, formData: FormData) {
  try {
    const session = await auth()
    const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
    if (!session || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "No autorizado" }
    }

    const title = (formData.get("title") as string)?.trim()
    const description = (formData.get("description") as string)?.trim()
    const badge = (formData.get("badge") as string)?.trim() || null
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on"
    const orderRaw = formData.get("order") as string
    const order = orderRaw ? parseInt(orderRaw, 10) : 0

    if (!title || !description) {
      return { success: false, error: "El título y la descripción son obligatorios." }
    }

    await db.memberBenefit.update({
      where: { id },
      data: {
        title,
        description,
        badge,
        isActive,
        order
      }
    })

    await recordAuditLog(
      session.user,
      "Actualización de Beneficio para Socios",
      `Modificado beneficio: "${title}"`
    )

    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/configuracion/beneficios")
    revalidatePath("/socios")
    revalidatePath("/socios/beneficios")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating benefit:", error)
    return { success: false, error: error.message || "Error al actualizar el beneficio." }
  }
}

export async function deleteBenefit(id: string) {
  try {
    const session = await auth()
    const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
    if (!session || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "No autorizado" }
    }

    const benefit = await db.memberBenefit.findUnique({ where: { id } })

    await db.memberBenefit.delete({
      where: { id }
    })

    await recordAuditLog(
      session.user,
      "Eliminación de Beneficio para Socios",
      benefit ? `Eliminado beneficio: "${benefit.title}"` : "Eliminado beneficio"
    )

    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/configuracion/beneficios")
    revalidatePath("/socios")
    revalidatePath("/socios/beneficios")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting benefit:", error)
    return { success: false, error: error.message || "Error al eliminar el beneficio." }
  }
}

export async function toggleBenefitStatus(id: string, isActive: boolean) {
  try {
    const session = await auth()
    const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
    if (!session || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "No autorizado" }
    }

    const updated = await db.memberBenefit.update({
      where: { id },
      data: { isActive }
    })

    await recordAuditLog(
      session.user,
      "Cambio de Visibilidad de Beneficio",
      `Beneficio "${updated.title}" ${isActive ? "Activado" : "Desactivado"}`
    )

    revalidatePath("/admin/configuracion")
    revalidatePath("/admin/configuracion/beneficios")
    revalidatePath("/socios")
    revalidatePath("/socios/beneficios")

    return { success: true }
  } catch (error: any) {
    console.error("Error toggling benefit status:", error)
    return { success: false, error: error.message || "Error al cambiar estado." }
  }
}
