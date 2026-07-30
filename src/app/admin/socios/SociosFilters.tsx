"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, ArrowUpDown, Download } from "lucide-react"
import { useTransition } from "react"

export function SociosFilters() {
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
      router.replace(`/admin/socios?${params.toString()}`)
    })
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    startTransition(() => {
      router.replace(`/admin/socios?${params.toString()}`)
    })
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    if (sort && sort !== "num_desc") {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }
    startTransition(() => {
      router.replace(`/admin/socios?${params.toString()}`)
    })
  }

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("view", view)
    params.delete("status")
    startTransition(() => {
      router.replace(`/admin/socios?${params.toString()}`)
    })
  }

  const currentView = searchParams.get("view") || "active"
  const currentStatus = searchParams.get("status") || ""
  const currentSort = searchParams.get("sort") || "num_desc"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
          <button 
            onClick={() => handleViewChange("active")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === "active" ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            Directorio Activo
          </button>
          <button 
            onClick={() => handleViewChange("all")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === "all" ? "bg-emerald-500 text-zinc-950 shadow-xl font-extrabold" : "text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10"}`}
          >
            Padrón Completo
          </button>
          <button 
            onClick={() => handleViewChange("honorary")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === "honorary" ? "bg-amber-500 text-zinc-950 shadow-xl font-extrabold" : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"}`}
          >
            Honorarios
          </button>
          <button 
            onClick={() => handleViewChange("archive")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentView === "archive" ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            Archivo / Bajas
          </button>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isPending ? "text-amber-500 animate-pulse" : "text-zinc-500"}`} size={16} />
            <input 
              type="text"
              placeholder="Buscar socio..."
              defaultValue={searchParams.get("query")?.toString()}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Ordenamiento por N° de Socio / Registro */}
          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            <select 
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all font-medium min-w-[200px]"
            >
              <option value="num_desc" className="bg-zinc-900 font-bold">N° Socio: Más nuevo arriba</option>
              <option value="num_asc" className="bg-zinc-900">N° Socio: Más antiguo arriba</option>
              <option value="name_asc" className="bg-zinc-900">Apellido (A-Z)</option>
              <option value="name_desc" className="bg-zinc-900">Apellido (Z-A)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-white/10 pl-2">
               <div className="w-1.5 h-1.5 border-r border-b border-zinc-500 rotate-45 transform -translate-y-0.5"></div>
            </div>
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            <select 
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all font-medium min-w-[170px]"
            >
              {currentView === 'active' || currentView === 'all' ? (
                <>
                  <option value="" className="bg-zinc-900 italic">Todos</option>
                  <option value="ACTIVE" className="bg-zinc-900 font-bold text-emerald-400">Al Día</option>
                  <option value="DEBTOR" className="bg-zinc-900 font-bold text-amber-400">En Mora</option>
                  <option value="INACTIVE" className="bg-zinc-900 font-bold text-zinc-400">Inactivos</option>
                  <option value="SUSPENDED" className="bg-zinc-900 font-bold text-red-400">Suspendidos</option>
                  {currentView === 'all' && <option value="BAJA" className="bg-zinc-900 font-bold text-red-500">Bajas</option>}
                </>
              ) : (
                <>
                  <option value="" className="bg-zinc-900 italic">Todos los motivos</option>
                  <option value="DECEASED" className="bg-zinc-900 font-bold text-purple-400">Baja por Fallecimiento</option>
                  <option value="RESIGNED" className="bg-zinc-900 font-bold text-orange-400">Baja por Renuncia</option>
                  <option value="INACTIVE" className="bg-zinc-900 font-bold text-zinc-400">Baja Administrativa</option>
                </>
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-white/10 pl-2">
               <div className="w-1.5 h-1.5 border-r border-b border-zinc-500 rotate-45 transform -translate-y-0.5"></div>
            </div>
          </div>

          <a
            href={`/api/export/padron?view=${currentView}&query=${searchParams.get("query") || ""}&status=${currentStatus}`}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer shrink-0"
            title="Descargar padrón completo en formato CSV"
          >
            <Download size={16} />
            <span>Descargar CSV</span>
          </a>
        </div>
      </div>
    </div>
  )
}
