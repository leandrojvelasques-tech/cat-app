"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useTransition } from "react"

export function EstadoSociosFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
    }
    startTransition(() => {
      router.replace(`/admin/estado-socios?${params.toString()}`)
    })
  }

  const handleSort = (sortOption: string) => {
    const params = new URLSearchParams(searchParams)
    if (sortOption) {
      params.set("sort", sortOption)
    } else {
      params.delete("sort")
    }
    startTransition(() => {
      router.replace(`/admin/estado-socios?${params.toString()}`)
    })
  }

  const currentSort = searchParams.get("sort") || ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isPending ? "text-amber-500 animate-pulse" : "text-zinc-500"}`} size={16} />
            <input 
              type="text"
              placeholder="Buscar cualquier socio en la base de datos (incluso inactivos)..."
              defaultValue={searchParams.get("query")?.toString()}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
            />
          </div>
          
          <select
            value={currentSort}
            onChange={(e) => handleSort(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all min-w-[160px]"
          >
            <option value="" className="bg-zinc-900">Ordenar por defecto</option>
            <option value="apellido_asc" className="bg-zinc-900">Apellido (A-Z)</option>
            <option value="apellido_desc" className="bg-zinc-900">Apellido (Z-A)</option>
            <option value="estado_asc" className="bg-zinc-900">Estado (Al Día primero)</option>
            <option value="estado_desc" className="bg-zinc-900">Estado (Bajas primero)</option>
            <option value="pago_desc" className="bg-zinc-900">Último pago (Más reciente)</option>
            <option value="pago_asc" className="bg-zinc-900">Último pago (Más antiguo)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
