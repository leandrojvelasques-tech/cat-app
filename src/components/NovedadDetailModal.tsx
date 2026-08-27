"use client"

import { X, Calendar, Newspaper, Share2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Novedad {
  id: string
  title: string
  subtitle?: string | null
  content: string
  imageUrl?: string | null
  publishedAt: Date | string
}

interface NovedadDetailModalProps {
  novedad: Novedad | null
  onClose: () => void
}

export function NovedadDetailModal({ novedad, onClose }: NovedadDetailModalProps) {
  if (!novedad) return null

  const formattedDate = novedad.publishedAt 
    ? format(new Date(novedad.publishedAt), "d 'de' MMMM, yyyy", { locale: es })
    : ""

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header bar / Close button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90 transition-all border border-white/10 active:scale-95"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cover Image */}
        {novedad.imageUrl ? (
          <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
            <img
              src={novedad.imageUrl}
              alt={novedad.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/30 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-r from-amber-900/30 via-zinc-900 to-amber-900/20 border-b border-white/5 flex items-center justify-center">
            <Newspaper size={48} className="text-amber-500/30" />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-6">
          {/* Metadata & Tag */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Newspaper size={13} />
              <span>Novedad CAT</span>
            </span>

            {formattedDate && (
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <Calendar size={13} className="text-zinc-500" />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight uppercase italic">
              {novedad.title}
            </h2>
            {novedad.subtitle && (
              <p className="text-lg sm:text-xl font-medium text-amber-400/90 leading-snug">
                {novedad.subtitle}
              </p>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-amber-500/30 via-white/10 to-transparent" />

          {/* Formatted Text Body */}
          <div className="prose prose-invert max-w-none text-zinc-300 text-base sm:text-lg leading-relaxed whitespace-pre-line font-sans">
            {novedad.content}
          </div>

          {/* Footer actions */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
