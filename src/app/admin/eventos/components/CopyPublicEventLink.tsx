"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

interface CopyPublicEventLinkProps {
  eventId: string
  eventSlug?: string | null
  className?: string
}

export function CopyPublicEventLink({ eventId, eventSlug, className }: CopyPublicEventLinkProps) {
  const [isCopied, setIsCopied] = useState(false)
  const publicUrl = `https://www.centroamigosdeltango.com/eventos/${eventSlug || eventId}`

  async function copyPublicLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1800)
    } catch {
      window.prompt("Copiá este enlace público:", publicUrl)
    }
  }

  return (
    <button
      type="button"
      onClick={copyPublicLink}
      className={className || "flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-xl text-xs font-bold transition-all"}
      aria-label="Copiar enlace público del evento"
    >
      {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      {isCopied ? "Enlace copiado" : "Copiar enlace"}
    </button>
  )
}
