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
