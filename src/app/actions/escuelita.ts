"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createClass(data: FormData) {
  const teachers = data.get("teachers") as string
  const dateStr = data.get("date") as string

  if (!teachers || !dateStr) {
    throw new Error("Profesores y fecha son obligatorios")
  }

  // Handle local date accurately
  const dateParts = dateStr.split("-")
  const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 20, 0, 0) // Defaults to 20:00

  const newClass = await db.escuelitaClass.create({
    data: {
      teachers,
      date: dateObj
    }
  })

  revalidatePath("/admin/escuelita")
  redirect(`/admin/escuelita/clases/${newClass.id}`)
}

export async function submitAttendance(formData: FormData) {
  const classId = formData.get("classId") as string
  const dni = formData.get("dni") as string
  
  if (!classId || !dni) throw new Error("Faltan datos")

  let studentId = ""

  // 1. Check if student already exists
  const existingStudent = await db.escuelitaStudent.findUnique({
    where: { dni }
  })

  if (existingStudent) {
    studentId = existingStudent.id
  } else {
    // We need more data to create them
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string

    if (!firstName || !lastName) {
      // If we don't have first/last name, we return a signal to the client to show the full registration form
      return { _action: "REQUIRE_FULL_FORM", dni }
    }

    const newStudent = await db.escuelitaStudent.create({
      data: {
        dni,
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined
      }
    })
    studentId = newStudent.id
  }

  // 2. Register attendance
  try {
    await db.escuelitaAttendance.create({
      data: {
        classId,
        studentId
      }
    })
  } catch (error: any) {
    // If unique constraint fails, they are already registered
    if (error.code === 'P2002') {
      return { success: false, message: "¡Este alumno ya registró su asistencia hoy!" }
    }
    throw error
  }

  revalidatePath(`/admin/escuelita/clases/${classId}`)
  revalidatePath(`/escuelita/${classId}/asistencia`)
  
  return { success: true, message: `Asistencia de DNI ${dni} registrada correctamente.` }
}

export async function uploadClassPhoto(formData: FormData) {
  // In a real app we would upload the file to S3/Supabase storage.
  // For now, depending on how `cat-app` handles images (like eventBanner), 
  // we will pretend the client handles the upload and sends a URL, or we save it as base64 for simplicity.
  // We'll assume the URL is sent from the client or another action that orchestrates upload.
  const classId = formData.get("classId") as string
  const photoUrl = formData.get("photoUrl") as string
  
  if (!classId || !photoUrl) return

  await db.escuelitaClass.update({
    where: { id: classId },
    data: { photoUrl }
  })

  revalidatePath(`/admin/escuelita/clases/${classId}`)
}

import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export async function uploadEscuelitaDocentePhoto(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file || typeof file === "string") {
      return { success: false, error: "No se proporcionó archivo de imagen" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const uniqueName = `escuelita_teacher_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filepath = join(uploadDir, uniqueName)

    writeFileSync(filepath, buffer)

    return { success: true, url: `/uploads/${uniqueName}` }
  } catch (error: any) {
    console.error("Error al subir foto de docente de Escuela del CAT:", error)
    return { success: false, error: error.message || "Error al subir la foto" }
  }
}

export async function updateEscuelitaDocentes(formData: FormData) {
  try {
    const docentes = formData.get("docentes_mes") as string

    await db.setting.upsert({
      where: { key: "escuelita_docentes_mes" },
      update: { value: docentes },
      create: { key: "escuelita_docentes_mes", value: docentes }
    })

    revalidatePath("/admin/escuelita")
    revalidatePath("/")
  } catch (e: any) {
    console.error("Error al actualizar docentes del mes de la escuela:", e)
  }
}

export interface MonthlyTeacher {
  id: string
  firstName: string
  lastName: string
  photoUrl: string
  role?: string
}

export async function updateEscuelitaDocentesStructured(teachers: MonthlyTeacher[]) {
  try {
    const jsonValue = JSON.stringify(teachers)
    
    // Save structured JSON
    await db.setting.upsert({
      where: { key: "escuelita_docentes_mes_json" },
      update: { value: jsonValue },
      create: { key: "escuelita_docentes_mes_json", value: jsonValue }
    })

    // Also update raw string summary for fallback compatibility
    const namesSummary = teachers.length > 0 
      ? teachers.map(t => `${t.firstName} ${t.lastName}`).join(" y ") 
      : "Profesores Rotativos de la Comisión"

    await db.setting.upsert({
      where: { key: "escuelita_docentes_mes" },
      update: { value: namesSummary },
      create: { key: "escuelita_docentes_mes", value: namesSummary }
    })

    revalidatePath("/admin/escuelita")
    revalidatePath("/")
    return { success: true }
  } catch (e: any) {
    console.error("Error al actualizar profesores del mes estructurados:", e)
    return { success: false, error: e.message || "Error al guardar profesores" }
  }
}

export async function getEscuelitaDocentesStructured(): Promise<MonthlyTeacher[]> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: "escuelita_docentes_mes_json" }
    })

    if (!setting?.value) return []
    return JSON.parse(setting.value) as MonthlyTeacher[]
  } catch (e) {
    console.error("Error al obtener profesores del mes estructurados:", e)
    return []
  }
}

