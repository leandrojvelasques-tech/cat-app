"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { db } from "@/lib/db"

export async function authenticate(
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    const user = await db.user.findUnique({ where: { email } })
    const redirectTo = user?.role === "ADMIN" ? "/admin" : "/socios"
    
    console.log(`LOGGING: Attempting signIn for ${email}, redirecting to ${redirectTo}`)
    await signIn("credentials", { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      console.log("LOGGING: AuthError captured:", error.type)
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas."
        default:
          return "Error inesperado de autenticación."
      }
    }
    // IMPORTANT: Re-throw redirect errors!
    console.log("LOGGING: Non-AuthError captured, re-throwing:", error)
    throw error
  }
}
