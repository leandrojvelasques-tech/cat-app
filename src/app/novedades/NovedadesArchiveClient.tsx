"use client"

import { useState } from "react"
import Link from "next/link"
import { Newspaper, Calendar, ArrowLeft, Search, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { NovedadDetailModal } from "@/components/NovedadDetailModal"

interface Novedad {
  id: string
  title: string
  subtitle?: string | null
  content: string
  imageUrl?: string | null
  publishedAt: Date | string
}

interface NovedadesArchiveClientProps {
  initialNovedades: Novedad[]
}

export function NovedadesArchiveClient({ initialNovedades }: NovedadesArchiveClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null)

  const filteredNovedades = initialNovedades.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      item.title.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
      item.content.toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-[#131313] text-[#e4e2e0] font-sans selection:bg-amber-500/30">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1b2621]/90 backdrop-blur-xl border-b border-white/5 px-6 md:px-16 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5"
          >
            <ArrowLeft size={16} />
            <span>Volver al Inicio</span>
          </Link>

          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center font-black text-zinc-950">
              C
            </div>
            <span className="font-bold tracking-wider text-white text-sm">CAT NOVEDADES</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 py-12 sm:py-20 space-y-12">
        
        {/* Title & Search Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-3">
              <Newspaper size={16} />
              <span>Archivo de Comunicados</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tight">
              Novedades CAT
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
              Explora todas las noticias, eventos pasados, comunicados e informaciones oficiales del Centro Amigos del Tango.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en novedades..."
              className="w-full bg-black/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Novedades Grid */}
        {filteredNovedades.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 p-8 space-y-4">
            <Newspaper size={48} className="mx-auto text-zinc-600" />
            <h3 className="text-xl font-bold text-white uppercase italic">No se encontraron novedades</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              {searchTerm ? `No hay resultados para "${searchTerm}". Intenta buscar con otros términos.` : "Próximamente publicaremos nuevas informaciones."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNovedades.map((item) => {
              const dateStr = item.publishedAt
                ? format(new Date(item.publishedAt), "dd 'de' MMMM, yyyy", { locale: es })
                : ""

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNovedad(item)}
                  className="bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-amber-950/20 border-b border-white/5">
                        <Newspaper size={48} className="text-amber-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-80" />

                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-amber-400 border border-white/10 flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {item.subtitle && (
                        <p className="text-xs font-semibold text-amber-400/90 mt-1 line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}

                      <p className="text-xs text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span>Leer novedad completa</span>
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* Modal Detail */}
      {selectedNovedad && (
        <NovedadDetailModal
          novedad={selectedNovedad}
          onClose={() => setSelectedNovedad(null)}
        />
      )}

    </div>
  )
}
