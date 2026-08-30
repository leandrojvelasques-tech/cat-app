"use client"

import { X, Calendar, Newspaper, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Novedad {
  id: string
  title: string
  subtitle?: string | null
  content: string
  imageUrl?: string | null
  publishedAt: Date | string
  attachments?: { id: string; fileName: string; fileMimeType: string }[]
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
    <div
      className="fixed inset-0 z-[9999] isolate overflow-y-auto overscroll-contain bg-[#070907]/90 p-4 pt-20 backdrop-blur-md sm:p-8 sm:pt-12 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={novedad.title}
    >
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] shadow-2xl">
        
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
            <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {novedad.title}
            </h2>
            {novedad.subtitle && (
              <p className="font-serif text-lg font-bold leading-snug text-amber-400/90 sm:text-xl">
                {novedad.subtitle}
              </p>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-amber-500/30 via-white/10 to-transparent" />

          {/* Formatted Text Body */}
          <div className="prose prose-invert max-w-none whitespace-pre-line text-base font-light leading-relaxed text-zinc-300 sm:text-lg">
            {novedad.content}
          </div>

          {novedad.attachments && novedad.attachments.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-400">Archivos adjuntos</p>
              <div className="flex flex-wrap gap-2">
                {novedad.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={`/api/novedades/${novedad.id}/archivos/${attachment.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    <Paperclip size={15} className="text-amber-400" />
                    {attachment.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}

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
