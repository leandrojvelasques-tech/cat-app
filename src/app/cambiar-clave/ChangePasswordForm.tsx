"use client"

import { useActionState } from "react"
import { changeFirstPassword } from "@/app/actions/change-first-password"
import { Lock, ArrowRight, Loader2 } from "lucide-react"

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changeFirstPassword, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-medium">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="password"
            name="newPassword"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-zinc-950/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Confirmar Nueva Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            placeholder="Repite tu nueva contraseña"
            className="w-full bg-zinc-950/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Guardando contraseña...</span>
          </>
        ) : (
          <>
            <span>Guardar Contraseña y Continuar</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  )
}
