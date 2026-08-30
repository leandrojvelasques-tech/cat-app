"use client"

import { useState } from "react"
import Link from "next/link"
import { Newspaper, Calendar, ArrowRight } from "lucide-react"
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
  attachments?: { id: string; fileName: string; fileMimeType: string }[]
}

interface NovedadesHomeSectionProps {
  novedades: Novedad[]
}

export function NovedadesHomeSection({ novedades }: NovedadesHomeSectionProps) {
  const [selectedNovedad, setSelectedNovedad] = useState<Novedad | null>(null)

  if (!novedades || novedades.length === 0) return null

  return (
    <section id="novedades" className="py-16 sm:py-24 px-6 md:px-16 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-3">
            Últimas Novedades
          </h2>
          <div className="w-20 h-1 bg-cat-gold rounded-full"></div>
          <p className="text-zinc-400 text-sm sm:text-base mt-5 max-w-xl">
            Entérate de las actividades, noticias y acontecimientos recientes de la comunidad del CAT.
          </p>
        </div>

        <Link
          href="/novedades"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 self-start md:self-auto group"
        >
          <span>Ver todas las novedades</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-400" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {novedades.map((item) => {
          const dateStr = item.publishedAt
            ? format(new Date(item.publishedAt), "dd 'de' MMM, yyyy", { locale: es })
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
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-white/10 flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{dateStr}</span>
                </div>
              </div>

              {/* Text Info */}
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

                {/* Footer Link */}
                <div className="pt-4 border-t border-white/5 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Leer novedad completa</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedNovedad && (
        <NovedadDetailModal
          novedad={selectedNovedad}
          onClose={() => setSelectedNovedad(null)}
        />
      )}

      </div>
    </section>
  )
}
