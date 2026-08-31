import { db } from "@/lib/db"
import { Calendar, CalendarDays, Plus, Users, Music, ShoppingBag, Share2, Tag, ShieldAlert, ArrowRight, CheckCircle2, Sparkles, BookOpen } from "lucide-react"
import Link from "next/link"
import { EventPreviewModal } from "./components/EventPreviewModal"
import { isExternalEvent } from "@/lib/event-utils"
import { finalizePastEvents } from "@/lib/event-status"

export default async function EventosPage() {
  await finalizePastEvents()

  const events = await db.event.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } }
  })

  // Consultar inscripciones / comprobantes pendientes de aprobación
  const pendingRegistrations = await db.eventRegistration.findMany({
    where: {
      paymentStatus: "PENDING"
    },
    include: { event: true },
    orderBy: { createdAt: "desc" }
  })

  const activeEvents = events.filter(event => event.status !== "FINALIZADO")
  const finishedEvents = events.filter(event => event.status === "FINALIZADO")
  const finishedEventsByYear = finishedEvents.reduce<Record<string, typeof finishedEvents>>((groups, event) => {
    const year = new Date(event.startDate).getUTCFullYear().toString()
    groups[year] = groups[year] || []
    groups[year].push(event)
    return groups
  }, {})

  const renderEventCard = (event: typeof events[number]) => {
    const dateStr = new Date(event.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    const eventSlug = event.slug || event.id
    const publicUrl = `https://centroamigosdeltango.com/eventos/${eventSlug}`
    const waShareText = `💃 *${event.title}* - Centro Amigos del Tango\n🗓️ Fecha: ${dateStr}\n📍 Lugar: ${event.location || 'Sede CAT'}\n\n👉 ¡Inscríbete y reserva tu entrada aquí!\n${publicUrl}`
    const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waShareText)}`
    const isExternal = isExternalEvent(event)

    return (
      <div key={event.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:bg-white/[0.08] transition-all hover:border-white/20 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${
              isExternal ? "bg-purple-500/10 text-purple-400" :
              event.type === "MILONGA" ? "bg-red-500/10 text-red-400" :
              event.type === "WORKSHOP" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
            }`}>
              {isExternal ? <Sparkles size={24} /> : event.type === "MILONGA" ? <Music size={24} /> : <Users size={24} />}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              {isExternal && (
                <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 tracking-wider">
                  📢 DIFUSIÓN
                </span>
              )}
              {event.isFree && !isExternal && (
                <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 tracking-wider">
                  🎁 SIN CARGO
                </span>
              )}
              {event.isRecurring && (
                <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider">
                  🔄 RECURRENTE
                </span>
              )}
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                event.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-white/10"
              }`}>
                {event.status === "OPEN" ? "ABIERTO" : "FINALIZADO"}
              </span>
            </div>
          </div>

          {event.eventBanner && (
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl mb-4 border border-white/5 bg-zinc-800">
              <img src={event.eventBanner} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <h3 className="text-xl font-semibold text-white/90 mb-1 group-hover:text-amber-500 transition-colors">
            {event.title}
          </h3>
          <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{event.description || "Sin descripción"}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <Calendar size={14} className="text-amber-500" />
              {dateStr}
              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`}
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-sm">
              <div className="flex items-center gap-2">
                {isExternal ? (
                  <span className="text-xs text-purple-300 font-medium">Difusión externa</span>
                ) : (
                  <>
                    <Users size={14} className="text-zinc-600" />
                    <span className="text-white font-medium">{event._count.registrations}</span> inscritos
                  </>
                )}
              </div>
              {event.hasEarlyBird && !isExternal && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <Tag size={12} />
                  <span>Venta Anticipada</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
            >
              <Share2 size={14} />
              WhatsApp
            </a>

            <EventPreviewModal
              eventId={event.id}
              eventSlug={event.slug}
              eventTitle={event.title}
              isFree={event.isFree}
              buttonText="Previsualizar"
            />
          </div>

          <Link
            href={`/admin/eventos/${event.id}`}
            className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors border border-white/5"
          >
            Gestionar Evento
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Eventos y Milongas</h1>
          <p className="text-zinc-400 mt-1">Gestione milongas, capacitaciones, difusión, novedades, clases locales y registros.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/calendario-anual" 
            className="flex items-center gap-2 bg-gradient-to-r from-cat-gold/15 to-amber-600/10 hover:bg-cat-gold/25 text-cat-gold border border-cat-gold/30 px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg"
          >
            <CalendarDays size={18} />
            Calendario anual
          </Link>

          <Link 
            href="/admin/clases-comodoro" 
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg"
          >
            <BookOpen size={18} />
            Clases en Comodoro
          </Link>

          <Link 
            href="/admin/buffet" 
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/30 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg"
          >
            <ShoppingBag size={18} />
            Catálogo Buffet
          </Link>

          <Link 
            href="/admin/eventos/nuevo" 
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-amber-900/20"
          >
            <Plus size={18} />
            Nuevo Evento
          </Link>
        </div>
      </div>

      {/* Banner Destacado: Se requiere aprobación */}
      {pendingRegistrations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-amber-950/70 border border-amber-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in zoom-in-95 duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-zinc-950">
                  Se requiere aprobación
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {pendingRegistrations.length} {pendingRegistrations.length === 1 ? "comprobante pendiente" : "comprobantes pendientes"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Hay inscripciones o comprobantes aguardando validación de Tesorería
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Revise los comprobantes adjuntos y apruebe el acceso a los eventos correspondientes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            {Array.from(new Set(pendingRegistrations.map(r => r.eventId))).map(eventId => {
              const regCount = pendingRegistrations.filter(r => r.eventId === eventId).length
              const eventTitle = pendingRegistrations.find(r => r.eventId === eventId)?.event.title
              return (
                <Link
                  key={eventId}
                  href={`/admin/eventos/${eventId}`}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-95"
                >
                  <span className="truncate max-w-[160px]">{eventTitle}</span>
                  <span className="bg-zinc-950/20 text-zinc-950 px-2 py-0.5 rounded-md font-black">{regCount}</span>
                  <ArrowRight size={14} />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {activeEvents.length === 0 ? (
        <div className="py-20 text-center bg-white/5 border border-white/10 rounded-3xl border-dashed">
          <Calendar size={48} className="mx-auto text-zinc-600 mb-4 opacity-20" />
          <p className="text-zinc-500 font-medium">No hay eventos próximos</p>
          <p className="text-zinc-600 text-sm mt-1 text-balance px-10">
            Comience creando una nueva milonga o capacitación para el CAT.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeEvents.map(renderEventCard)}
        </div>
      )}

      {Object.entries(finishedEventsByYear).length > 0 && (
        <details className="group/finished rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-white hover:bg-white/[0.04] transition-colors [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-sm font-bold uppercase tracking-wider text-zinc-300">Eventos finalizados</span>
              <span className="block text-xs text-zinc-500 mt-1">Histórico disponible sin ocupar la grilla principal</span>
            </span>
            <span className="flex items-center gap-3 text-xs font-bold text-zinc-400">
              {finishedEvents.length} {finishedEvents.length === 1 ? "evento" : "eventos"}
              <ArrowRight size={16} className="rotate-90 transition-transform group-open/finished:-rotate-90" />
            </span>
          </summary>
          <div className="border-t border-white/10 p-6 space-y-8">
            {Object.entries(finishedEventsByYear)
              .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
              .map(([year, yearEvents]) => (
                <section key={year}>
                  <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-amber-500">Eventos {year} cerrados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {yearEvents.map(renderEventCard)}
                  </div>
                </section>
              ))}
          </div>
        </details>
      )}
    </div>
  )
}
