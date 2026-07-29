"use client"

import { useState } from "react"
import { Star, CheckCircle, Loader2 } from "lucide-react"
import { toggleAttendeePresence } from "@/app/actions/registraciones"

interface PresenceButtonProps {
  registrationId: string
  eventId: string
  initialAttended: boolean
}

export function PresenceButton({ registrationId, eventId, initialAttended }: PresenceButtonProps) {
  const [attended, setAttended] = useState(initialAttended)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await toggleAttendeePresence(registrationId, eventId, !attended)
      if (res.success) {
        setAttended(res.attended)
      }
    } catch (err) {
      console.error("Error al actualizar presencia:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
        attended
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
          : "bg-zinc-800/80 text-zinc-400 border-white/10 hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/10"
      }`}
      title={attended ? "Presencia confirmada (Click para cancelar)" : "Marcar como presente en la milonga"}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin text-amber-500" />
      ) : attended ? (
        <>
          <CheckCircle size={12} className="text-emerald-400" />
          ★ Presente
        </>
      ) : (
        <>
          <Star size={12} className="text-zinc-500" />
          ☆ Dar Presente
        </>
      )}
    </button>
  )
}
