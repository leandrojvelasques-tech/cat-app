"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, CreditCard } from "lucide-react"
import { useTransition } from "react"

interface Props {
  currentMonth: number
  currentYear: number
  currentQuery: string
}

export function CobranzasFilters({ currentMonth, currentYear, currentQuery }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.replace(`/admin/cuotas?${params.toString()}`)
    })
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="space-y-8">
      {/* Header with Month Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <CreditCard size={32} className="text-amber-500" />
            Gestión de Cobranzas
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Control de cuotas y recaudación mensual.</p>
        </div>
        
        <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 relative z-10">
          <select 
            value={currentMonth}
            onChange={(e) => updateParams('month', e.target.value)}
            className="bg-transparent text-white px-4 py-2 rounded-xl text-sm font-bold focus:outline-none cursor-pointer"
          >
            {monthNames.map((m, i) => <option key={m} value={i+1} className="bg-zinc-900 font-bold">{m}</option>)}
          </select>
          <select 
            value={currentYear}
            onChange={(e) => updateParams('year', e.target.value)}
            className="bg-transparent text-white px-4 py-2 rounded-xl text-sm font-bold focus:outline-none cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-zinc-900 font-bold">{y}</option>)}
          </select>
        </div>
        
        {/* Decorative element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Search Bar - Part of the main table section later, but we can put the interactive search here or export it */}
      <div className="relative w-full md:w-96">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isPending ? "text-amber-500 animate-pulse" : "text-zinc-500"}`} size={18} />
        <input 
          type="text"
          placeholder="Buscar por nombre o DNI..."
          defaultValue={currentQuery}
          onChange={(e) => updateParams('query', e.target.value)}
          className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none transition-all shadow-inner"
        />
      </div>
    </div>
  )
}
