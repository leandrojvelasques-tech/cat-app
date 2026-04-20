"use client"

import { useState } from "react"
import { toggleGameActive } from "@/app/actions/juegos"

interface Props {
  isActive: boolean
}

export function ToggleGameButton({ isActive: initialActive }: Props) {
  const [isActive, setIsActive] = useState(initialActive)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleGameActive(!isActive)
      setIsActive(!isActive)
    } catch {
      // revert
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${
        isActive ? "bg-emerald-500" : "bg-zinc-700"
      } ${loading ? "opacity-50" : ""}`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
          isActive ? "translate-x-7" : "translate-x-1"
        }`}
      />
      <span className="sr-only">{isActive ? "Desactivar" : "Activar"} juego</span>
    </button>
  )
}
