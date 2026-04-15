"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react"

interface Product {
  id: string
  name: string
  brand: string | null
  size: string | null
  price: number
  type: string
  active: boolean
}

export function BuffetProductActions({ product }: { product: Product }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggleActive = async () => {
    setLoading(true)
    await fetch("/api/buffet/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, active: !product.active }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={toggleActive}
        disabled={loading}
        title={product.active ? "Desactivar" : "Activar"}
        className={`p-2 rounded-xl transition-all border ${product.active ? "text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10" : "text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/10"}`}
      >
        {product.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      </button>
      <a
        href={`/admin/buffet/${product.id}/editar`}
        className="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Pencil size={16} />
      </a>
    </div>
  )
}
