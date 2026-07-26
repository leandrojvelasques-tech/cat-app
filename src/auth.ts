import NextAuth, { type DefaultSession } from "next-auth"
import authConfig from "./auth.config"
import { db } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      mustChangePassword: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    mustChangePassword: boolean
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword
      } else if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { mustChangePassword: true, role: true }
        })
        if (dbUser) {
          token.mustChangePassword = dbUser.mustChangePassword
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      return session
    },
  },
})
