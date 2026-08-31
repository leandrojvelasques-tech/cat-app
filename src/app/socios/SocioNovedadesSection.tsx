"use client"

import Link from "next/link"
import { Newspaper, Calendar, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Novedad {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  content: string
  imageUrl?: string | null
  publishedAt: Date | string
  attachments?: { id: string; fileName: string; fileMimeType: string }[]
}

interface SocioNovedadesSectionProps {
  novedades: Novedad[]
}

export function SocioNovedadesSection({ novedades }: SocioNovedadesSectionProps) {
  if (!novedades || novedades.length === 0) return null

  return (
    <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[48px] backdrop-blur-md shadow-2xl space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <Newspaper size={24} className="text-amber-500" /> Novedades & Comunicados CAT
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Informaciones oficiales, comunicados y noticias recientes de la asociación
          </p>
        </div>

        <Link
          href="/novedades"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 transition-colors"
        >
          <span>Ver todas las novedades</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {novedades.map((item) => {
          const dateStr = item.publishedAt
            ? format(new Date(item.publishedAt), "dd 'de' MMM, yyyy", { locale: es })
            : ""

          return (
            <Link
              key={item.id}
              href={`/novedades/${item.slug}`}
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
                    <Newspaper size={40} className="text-amber-500/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-80" />

                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{dateStr}</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-xs font-semibold text-amber-400/90 mt-1 line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Leer novedad completa</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
