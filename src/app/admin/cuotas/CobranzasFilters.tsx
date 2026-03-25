"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, CreditCard, Filter, Calendar, Tag, History as HistoryIcon } from "lucide-react"
import { useTransition, useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Props {
  currentMonth: number
  currentYear: number
  currentQuery: string
  currentType: string
  currentEventType: string
  currentEventId: string
  events?: any[]
}

export function CobranzasFilters({ currentMonth, currentYear, currentQuery, currentType, currentEventType, currentEventId, events = [] }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    startTransition(() => {
      router.replace(`/admin/cuotas?${params.toString()}`)
    })
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? "text-amber-500 animate-pulse" : "text-zinc-600 group-focus-within:text-amber-500"}`} size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre, DNI o concepto..."
            defaultValue={currentQuery}
            onChange={(e) => updateParams({ query: e.target.value })}
            className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-[24px] pl-12 pr-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none transition-all shadow-inner font-medium"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-2">
           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4 flex items-center gap-2">
             <Filter size={10} /> Categoría
           </label>
           <select 
             value={currentType}
             onChange={(e) => updateParams({ type: e.target.value, eventId: '' })}
             className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-white/10 transition-all min-w-[160px] appearance-none"
           >
             <option value="all" className="bg-zinc-900">Todos los ingresos</option>
             <option value="fee" className="bg-zinc-900">Cuotas Sociales</option>
             <option value="event" className="bg-zinc-900">Eventos / Milongas</option>
           </select>
        </div>

        {/* Event Type Filter (Conditional) */}
        {currentType === 'event' && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-left-4 duration-300">
             <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4 flex items-center gap-2">
               <HistoryIcon size={10} /> Tipo
             </label>
             <select 
               value={currentEventType}
               onChange={(e) => updateParams({ eventType: e.target.value })}
               className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-white/10 transition-all appearance-none"
             >
               <option value="all" className="bg-zinc-900">Todas las entradas</option>
               <option value="MILONGA" className="bg-zinc-900">Solo Milongas</option>
               <option value="WORKSHOP" className="bg-zinc-900">Solo Workshops</option>
             </select>
          </div>
        )}

        {/* Event Selector (Conditional) */}
        {currentType === 'event' && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-left-4 duration-300">
             <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4 flex items-center gap-2">
               <Tag size={10} /> Evento Específico
             </label>
             <select 
               value={currentEventId}
               onChange={(e) => updateParams({ eventId: e.target.value })}
               className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-white/10 transition-all min-w-[200px] max-w-[300px] appearance-none"
             >
               <option value="" className="bg-zinc-900">Seleccionar Evento...</option>
               {events.map((e: any) => (
                 <option key={e.id} value={e.id} className="bg-zinc-900">
                   {format(new Date(e.startDate), 'dd/MM')} - {e.title}
                 </option>
               ))}
             </select>
          </div>
        )}

        {/* Date Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4 flex items-center gap-2">
             <Calendar size={10} /> Período
          </label>
          <div className="flex gap-2 bg-white/5 p-1 rounded-[24px] border border-white/10">
            <select 
              value={currentMonth}
              onChange={(e) => updateParams({ month: e.target.value })}
              className="bg-transparent text-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-white/5 transition-all"
            >
              <option value="" className="bg-zinc-900 italic">Mes (Ver todo)</option>
              {monthNames.map((m, i) => <option key={m} value={i+1} className="bg-zinc-900">{m}</option>)}
            </select>
            <div className="w-px h-6 bg-white/10 self-center"></div>
            <select 
              value={currentYear}
              onChange={(e) => updateParams({ year: e.target.value })}
              className="bg-transparent text-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:bg-white/5 transition-all"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-zinc-900">{y}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
