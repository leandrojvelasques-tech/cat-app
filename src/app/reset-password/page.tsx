"use client"

import { useState, useTransition, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/app/actions/reset-password"
import { Lock, Eye, EyeOff, CheckCircle, Info, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Token de restablecimiento inválido.")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    startTransition(async () => {
      const res = await resetPassword(token, password)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(res.error || "Hubo un error al restablecer la contraseña.")
      }
    })
  }

  if (!token) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-center text-red-500/80">
          <Info className="w-16 h-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-white">Enlace Inválido</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Este enlace para restablecer tu contraseña es inválido, está mal formado o ha expirado. Por favor, solicita un nuevo enlace.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-amber-600 to-red-800 text-white px-5 py-3 rounded-xl border border-white/5 transition-all font-medium hover:scale-[1.02]"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in duration-300">
      {success ? (
        <div className="space-y-6 text-center animate-in fade-in duration-300">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle className="w-16 h-16" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-white">¡Contraseña Cambiada!</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Tu contraseña ha sido actualizada con éxito. Serás redirigido a la pantalla de inicio de sesión en unos momentos.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="text-xs text-amber-500 hover:text-amber-400 underline transition-colors"
            >
              Haga clic aquí si no es redirigido automáticamente
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            Ingresa tu nueva contraseña para volver a acceder al Portal de Gestión.
          </p>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-light"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-light"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm animate-in fade-in">
              <Info className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-900/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Establecer Contraseña</span>
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a iniciar sesión</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-white tracking-wide mb-2">Nueva Contraseña</h1>
          <p className="text-zinc-400 font-light tracking-widest text-sm uppercase">Centro Amigos del Tango</p>
        </div>

        <Suspense fallback={
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex items-center justify-center py-20 text-zinc-400">
            <Loader2 className="animate-spin w-8 h-8 mr-2 text-amber-500 animate-pulse" />
            <span>Cargando verificador...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
