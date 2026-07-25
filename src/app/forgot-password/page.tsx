"use client"

import { useState, useTransition } from "react"
import { requestPasswordReset } from "@/app/actions/reset-password"
import { Mail, ArrowLeft, Loader2, CheckCircle, Info } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    startTransition(async () => {
      const res = await requestPasswordReset(email)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || "Hubo un error al enviar el correo.")
      }
    })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-white tracking-wide mb-2">Restablecer Acceso</h1>
          <p className="text-zinc-400 font-light tracking-widest text-sm uppercase">Centro Amigos del Tango</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          {success ? (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="flex justify-center text-amber-500">
                <CheckCircle className="w-16 h-16" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-white">Correo Enviado</h2>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  Si la dirección ingresada corresponde a una cuenta activa, recibirás un correo electrónico con instrucciones para restablecer tu contraseña en los próximos minutos.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a iniciar sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace de un solo uso para establecer tu nueva contraseña.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-light"
                    placeholder="socio@ejemplo.com"
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
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Enlace</span>
                  )}
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancelar y volver</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
