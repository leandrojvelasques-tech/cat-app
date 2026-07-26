import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ChangePasswordForm from "./ChangePasswordForm"
import { KeyRound, ShieldAlert } from "lucide-react"

export default async function CambiarClavePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // If user does not need to change password, redirect to home/dashboard
  if (!session.user.mustChangePassword) {
    const target = ["ADMIN", "BOARD", "SUPERADMIN", "COLLABORATOR"].includes(session.user.role) ? "/admin" : "/socios"
    redirect(target)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center text-white mb-4 shadow-xl shadow-amber-900/30">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Actualiza tu Contraseña
          </h1>
          <p className="text-sm text-zinc-400">
            Por seguridad, debes cambiar tu clave temporal por una contraseña personal definitiva antes de continuar.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-amber-300 text-xs">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <span>Esta acción es requerida únicamente en tu primer inicio de sesión con clave temporal.</span>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  )
}
