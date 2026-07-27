"use client"

import { useState } from "react"
import { Eye, X, Smartphone, Monitor, ExternalLink } from "lucide-react"

interface EventPreviewModalProps {
  eventId: string
  eventSlug?: string | null
  eventTitle: string
  isFree?: boolean
  buttonClassName?: string
  buttonText?: string
}

export function EventPreviewModal({
  eventId,
  eventSlug,
  eventTitle,
  isFree = false,
  buttonClassName,
  buttonText = "Previsualizar Front-End"
}: EventPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  const previewSlug = eventSlug || eventId
  const previewPath = `/eventos/${previewSlug}`

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          buttonClassName ||
          "flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        }
      >
        <Eye size={15} />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="bg-zinc-950 border border-white/15 rounded-[32px] w-full max-w-6xl h-[92vh] flex flex-col shadow-[0_0_120px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header / Top Control Bar */}
            <div className="bg-zinc-900/90 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Eye size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-md">
                      Vista previa de cliente
                    </span>
                    {isFree && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        🎁 Evento Sin Cargo
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-md">
                    {eventTitle}
                  </h3>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Viewport toggle */}
                <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode("desktop")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "desktop"
                        ? "bg-amber-500 text-zinc-950 shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Monitor size={14} /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("mobile")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "mobile"
                        ? "bg-amber-500 text-zinc-950 shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Smartphone size={14} /> Móvil
                  </button>
                </div>

                <a
                  href={previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <ExternalLink size={14} /> Abrir Pestaña
                </a>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-colors border border-white/10 cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Iframe Viewport Container */}
            <div className="flex-1 bg-zinc-900/60 p-4 md:p-6 flex items-center justify-center overflow-hidden">
              <div
                className={`transition-all duration-300 h-full bg-[#131313] rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${
                  viewMode === "mobile"
                    ? "w-[400px] max-w-full"
                    : "w-full"
                }`}
              >
                <iframe
                  src={previewPath}
                  title={`Previsualización - ${eventTitle}`}
                  className="w-full h-full border-none"
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
