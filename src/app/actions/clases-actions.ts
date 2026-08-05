"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// ==========================================
// PUBLIC ACTIONS
// ==========================================

export async function getPublicTangoClasses(filters?: {
  city?: string
  priceType?: string
  search?: string
}) {
  try {
    const where: any = {
      isPublished: true,
    }

    if (filters?.city && filters.city !== "TODAS") {
      where.city = filters.city
    }

    if (filters?.priceType && filters.priceType !== "TODOS") {
      where.priceType = filters.priceType
    }

    if (filters?.search && filters.search.trim() !== "") {
      const search = filters.search.trim()
      where.OR = [
        { teacherName: { contains: search, mode: "insensitive" } },
        { locationName: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { schedule: { contains: search, mode: "insensitive" } },
      ]
    }

    const classes = await db.localTangoClass.findMany({
      where,
      include: {
        teacher: true,
      },
      orderBy: [
        { order: "asc" },
        { city: "asc" },
        { teacherName: "asc" },
      ],
    })

    return { success: true, data: classes }
  } catch (error: any) {
    console.error("Error fetching public tango classes:", error)
    return { success: false, error: "Error al cargar las clases" }
  }
}

export async function getPublicTangoTeachers() {
  try {
    const teachers = await db.localTangoTeacher.findMany({
      where: { isActive: true },
      include: {
        classes: {
          where: { isPublished: true },
        },
      },
      orderBy: { fullName: "asc" },
    })

    return { success: true, data: teachers }
  } catch (error: any) {
    console.error("Error fetching public teachers:", error)
    return { success: false, error: "Error al cargar profesores" }
  }
}

// ==========================================
// ADMIN ACTIONS (Require auth)
// ==========================================

async function checkAdminAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("No autorizado")
  }
  return session
}

export async function getAdminTangoClasses() {
  try {
    await checkAdminAuth()

    const classes = await db.localTangoClass.findMany({
      include: {
        teacher: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    return { success: true, data: classes }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al cargar clases de admin" }
  }
}

export async function createTangoClass(data: {
  teacherName: string
  group?: string | null
  teacherId?: string | null
  city: string
  neighborhood?: string | null
  locationName: string
  address: string
  schedule: string
  contactInfo?: string | null
  priceType: string
  priceDetails?: string | null
  registrationUrl?: string | null
  notes?: string | null
  isPublished?: boolean
  order?: number
}) {
  try {
    await checkAdminAuth()

    const newClass = await db.localTangoClass.create({
      data: {
        teacherName: data.teacherName,
        group: data.group || null,
        teacherId: data.teacherId || null,
        city: data.city || "Comodoro Rivadavia",
        neighborhood: data.neighborhood || null,
        locationName: data.locationName,
        address: data.address,
        schedule: data.schedule,
        contactInfo: data.contactInfo || null,
        priceType: data.priceType || "ARANCELADO",
        priceDetails: data.priceDetails || null,
        registrationUrl: data.registrationUrl || null,
        notes: data.notes || null,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        order: data.order || 0,
      },
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    revalidatePath("/eventos")
    return { success: true, data: newClass }
  } catch (error: any) {
    console.error("Error creating class:", error)
    return { success: false, error: error.message || "Error al crear la clase" }
  }
}

export async function updateTangoClass(
  id: string,
  data: {
    teacherName?: string
    group?: string | null
    teacherId?: string | null
    city?: string
    neighborhood?: string | null
    locationName?: string
    address?: string
    schedule?: string
    contactInfo?: string | null
    priceType?: string
    priceDetails?: string | null
    registrationUrl?: string | null
    notes?: string | null
    isPublished?: boolean
    order?: number
  }
) {
  try {
    await checkAdminAuth()

    const updated = await db.localTangoClass.update({
      where: { id },
      data,
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    revalidatePath("/eventos")
    return { success: true, data: updated }
  } catch (error: any) {
    console.error("Error updating class:", error)
    return { success: false, error: error.message || "Error al actualizar la clase" }
  }
}

export async function toggleTangoClassVisibility(id: string, isPublished: boolean) {
  try {
    await checkAdminAuth()

    const updated = await db.localTangoClass.update({
      where: { id },
      data: { isPublished },
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    revalidatePath("/eventos")
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al cambiar estado" }
  }
}

export async function deleteTangoClass(id: string) {
  try {
    await checkAdminAuth()

    await db.localTangoClass.delete({
      where: { id },
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    revalidatePath("/eventos")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar la clase" }
  }
}

// TEACHER ACTIONS

export async function getAdminTangoTeachers() {
  try {
    await checkAdminAuth()

    const teachers = await db.localTangoTeacher.findMany({
      include: {
        classes: true,
      },
      orderBy: { fullName: "asc" },
    })

    return { success: true, data: teachers }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al cargar profesores" }
  }
}

export async function createTangoTeacher(data: {
  fullName: string
  photoUrl?: string | null
  bio?: string | null
  phone?: string | null
  email?: string | null
  instagram?: string | null
  city?: string
}) {
  try {
    await checkAdminAuth()

    const teacher = await db.localTangoTeacher.create({
      data: {
        fullName: data.fullName,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        phone: data.phone || null,
        email: data.email || null,
        instagram: data.instagram || null,
        city: data.city || "Comodoro Rivadavia",
        isActive: true,
      },
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    return { success: true, data: teacher }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear profesor" }
  }
}

export async function updateTangoTeacher(
  id: string,
  data: {
    fullName?: string
    photoUrl?: string | null
    bio?: string | null
    phone?: string | null
    email?: string | null
    instagram?: string | null
    city?: string
    isActive?: boolean
  }
) {
  try {
    await checkAdminAuth()

    const updated = await db.localTangoTeacher.update({
      where: { id },
      data,
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar profesor" }
  }
}

export async function deleteTangoTeacher(id: string) {
  try {
    await checkAdminAuth()

    await db.localTangoTeacher.delete({
      where: { id },
    })

    revalidatePath("/admin/clases-comodoro")
    revalidatePath("/clases")
    revalidatePath("/clases-comodoro")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar profesor" }
  }
}
