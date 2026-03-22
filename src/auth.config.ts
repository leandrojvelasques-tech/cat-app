import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { z } from "zod"
import { db } from "@/lib/db"

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("LOGGING: Authorizing credentials for", credentials?.email)
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await db.user.findUnique({ where: { email } })
          console.log("LOGGING: User found in DB:", !!user)
          if (!user) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
          console.log("LOGGING: Passwords match:", passwordsMatch)
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
            }
          }
        } else {
          console.log("LOGGING: Zod parsing failed:", parsedCredentials.error.issues)
        }
        return null
      },
    }),
  ],
} satisfies NextAuthConfig
