"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useRef, useState, useTransition } from "react"

export function EstadoSociosFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query")?.toString() || "")

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
    }
    searchTimer.current = setTimeout(() => {
      startTransition(() => router.replace(`/admin/estado-socios?${params.toString()}`))
    }, 300)
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

  const currentSort = searchParams.get("sort") || "num_desc"

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex w-full flex-col gap-2 md:flex-row">
          <div className="relative w-full min-w-0 md:min-w-[360px] md:flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isPending ? "text-amber-500 animate-pulse" : "text-zinc-500"}`} size={16} />
            <input 
              type="text"
              placeholder="Buscar socio..."
              aria-label="Buscar socio"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white shadow-inner transition-all placeholder:text-zinc-500 focus:border-white/20 focus:outline-none"
            />
          </div>
          
          <select
            value={currentSort}
            onChange={(e) => handleSort(e.target.value)}
            aria-label="Ordenar socios"
            className="min-h-11 w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:bg-white/10 focus:outline-none md:min-w-[160px]"
          >
            <option value="num_desc" className="bg-zinc-900">N° Socio: Más nuevo arriba</option>
            <option value="num_asc" className="bg-zinc-900">N° Socio: Más antiguo arriba</option>
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
