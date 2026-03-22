"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const position = formData.get("position") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string

  if (!email || !password || !name) {
    throw new Error("Faltan datos obligatorios")
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error("El usuario ya existe")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      position,
      isBoardMember: role === "BOARD"
    }
  })

  revalidatePath("/admin/configuracion")
  redirect("/admin/configuracion")
}
