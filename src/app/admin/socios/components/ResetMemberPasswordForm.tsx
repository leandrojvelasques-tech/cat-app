"use client"

import { useState, useTransition } from "react"
import { Key, Eye, EyeOff, Check } from "lucide-react"
import { resetMemberPassword } from "@/app/actions/users"

interface Props {
  memberId: string
  hasPortalAccess: boolean
}

export function ResetMemberPasswordForm({ memberId, hasPortalAccess }: Props) {
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  if (!hasPortalAccess) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl border border-dashed border-white/10 text-zinc-600">
        <Key size={16} />
        <p className="text-xs font-medium italic">Este socio no tiene cuenta de acceso al portal</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setError("La clave debe tener al menos 6 caracteres")
      return
    }
    setError("")
    startTransition(async () => {
      try {
        await resetMemberPassword(memberId, password)
        setDone(true)
        setPassword("")
      } catch (err: any) {
        setError(err.message || "Error al cambiar la clave")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {done && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <Check size={14} /> Clave actualizada exitosamente
        </div>
      )}
      {error && (
        <p className="text-red-400 text-xs font-medium">{error}</p>
      )}
      <div className="relative">
        <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setDone(false) }}
          placeholder="Nueva contraseña para el portal..."
          className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light text-sm"
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <button
        type="submit"
        disabled={isPending || !password}
        className="flex items-center gap-2 bg-amber-600/80 hover:bg-amber-600 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
      >
        <Key size={14} /> {isPending ? "Actualizando..." : "Cambiar Clave del Portal"}
      </button>
    </form>
  )
}
