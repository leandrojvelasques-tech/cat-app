"use client"

import { useState } from "react"
import { X, Calendar, MapPin, Sparkles, MessageSquare, Mail, ExternalLink, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ExternalEventData {
  id: string
  title: string
  description?: string | null
  eventBanner?: string | null
  startDate: Date | string
  location?: string | null
  milongaLocation?: string | null
  milongaMapsUrl?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
}

interface SocioExternalEventModalProps {
  event: ExternalEventData
}

export function SocioExternalEventModal({ event }: SocioExternalEventModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  const eventDate = new Date(event.startDate)
  const rawLoc = event.location || event.milongaLocation || "Lugar a confirmar"
  const isUrl = rawLoc.startsWith("http://") || rawLoc.startsWith("https://")
  const mapUrl = event.milongaMapsUrl || (isUrl ? rawLoc : null)
  const displayLocation = isUrl ? "Ver Ubicación" : rawLoc

  const whatsappPhone = event.contactPhone || ""
  const cleanPhone = whatsappPhone.replace(/\D/g, "")
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith("54") ? cleanPhone : "549" + cleanPhone}?text=Hola!%20Consulta%20sobre%20el%20evento%20${encodeURIComponent(event.title)}`
    : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg shadow-purple-950/20"
      >
        <Sparkles size={14} className="text-purple-400" />
        <span>Ver Info / Flyer</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-[40px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-zinc-900/90 backdrop-blur-md p-6 md:p-8 border-b border-white/5 z-20 shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 inline-flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} /> Agenda Tanguera · Evento de Difusión
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight line-clamp-2">
                  {event.title}
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all border border-white/10 shrink-0 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent]">
              
              {/* Flyer Image */}
              {event.eventBanner ? (
                <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">
                  <img 
                    src={event.eventBanner} 
                    alt={event.title} 
                    className="w-full h-auto object-contain max-h-[450px] mx-auto cursor-pointer hover:scale-[1.01] transition-transform" 
                    onClick={() => setIsImageExpanded(true)}
                  />
                  <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 pointer-events-none">
                    <ImageIcon size={14} className="text-purple-400" /> Toca para ampliar flyer
                  </div>
                </div>
              ) : (
                <div className="p-10 bg-purple-950/20 border border-purple-500/20 rounded-3xl text-center space-y-2">
                  <Calendar size={36} className="mx-auto text-purple-400 opacity-60" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Evento de Difusión Externa</p>
                </div>
              )}

              {/* Date & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-400" /> Fecha del Evento
                  </span>
                  <p className="text-sm font-bold text-white">
                    {format(eventDate, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <MapPin size={14} className="text-purple-400" /> Ubicación
                  </span>
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-purple-300 hover:text-purple-200 underline underline-offset-2 flex items-center gap-1"
                    >
                      <span>{displayLocation}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-white">{displayLocation}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="space-y-2 bg-zinc-950/60 p-6 rounded-3xl border border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-purple-400">Detalle & Descripción</h4>
                  <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Contact Actions */}
              {(whatsappUrl || event.contactEmail) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contactar Organizador</h4>
                  <div className="flex flex-wrap gap-3">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[180px] flex items-center justify-center gap-2 p-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-bold transition-all"
                      >
                        <MessageSquare size={16} /> Consultar por WhatsApp
                      </a>
                    )}
                    {event.contactEmail && (
                      <a
                        href={`mailto:${event.contactEmail}`}
                        className="flex-1 min-w-[180px] flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-2xl text-xs font-bold transition-all"
                      >
                        <Mail size={16} className="text-purple-400" /> {event.contactEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 text-center italic pt-2">
                💡 Este evento es compartido para la comunidad tanguera comodorense como espacio de difusión cultural.
              </p>

            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {isImageExpanded && event.eventBanner && (
        <div 
          className="fixed inset-0 z-[1100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsImageExpanded(false)}
        >
          <button 
            onClick={() => setIsImageExpanded(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer z-50"
          >
            <X size={24} />
          </button>
          <img 
            src={event.eventBanner} 
            alt={event.title} 
            className="max-w-full max-h-[95vh] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}
    </>
  )
}
