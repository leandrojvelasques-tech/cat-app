"use client"

import { useState } from "react"
import { Copy, CheckCircle2 } from "lucide-react"

export function CopyGameLink({ mode }: { mode: "solo" | "live" }) {
  const [copied, setCopied] = useState(false)
  const link = mode === "solo" 
    ? "https://socios.centroamigosdeltango.com/juegos/acertijo"
    : "https://socios.centroamigosdeltango.com/juegos/acertijo/vivo"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link", err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-3 flex items-center justify-between w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
    >
      <span className="text-[10px] text-zinc-400 font-mono truncate mr-2">{link}</span>
      {copied ? (
        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
      ) : (
        <Copy size={14} className="text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
      )}
    </button>
  )
}
