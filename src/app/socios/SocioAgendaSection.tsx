import { Calendar, MapPin, Sparkles, ShieldCheck, Repeat, Music, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getDayName, isExternalEvent } from "@/lib/event-utils"
import { SocioEventRegisterModal } from "./SocioEventRegisterModal"
import { SocioExternalEventModal } from "./SocioExternalEventModal"

interface SocioAgendaSectionProps {
  filteredEvents: any[]
  registrations: any[]
  member: any
}

export function SocioAgendaSection({ filteredEvents, registrations, member }: SocioAgendaSectionProps) {
  return (
    <section className="space-y-7 rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md sm:p-8 md:rounded-[48px] md:p-10">
      <div>
        <div className="flex items-center gap-3">
          <Calendar size={22} className="text-cat-gold" aria-hidden="true" />
          <h2 className="font-serif text-3xl font-bold leading-tight text-white md:text-4xl">Agenda tanguera</h2>
        </div>
        <div className="mt-3 h-1 w-16 rounded-full bg-cat-gold" />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Milongas, clases y encuentros para vivir el tango durante este mes y el próximo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
            <Sparkles size={32} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No hay eventos programados para este período</p>
            <p className="mt-1 text-xs text-zinc-600">Pronto publicaremos nuevas milongas y actividades.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const registration = registrations.find((item) => item.eventId === event.id)
            const rawLoc = event.location || event.milongaLocation || "Sede Central CAT"
            const isUrl = rawLoc.startsWith("http://") || rawLoc.startsWith("https://")
            const mapUrl = event.milongaMapsUrl || (isUrl ? rawLoc : null)
            const displayLocation = isUrl ? "Sede Central CAT" : rawLoc
            const eventTags = (event.type || "MILONGA").split(",").map((tag: string) => tag.trim()).filter(Boolean)
            const external = isExternalEvent(event)

            return (
              <article key={event.id} className="group flex flex-col overflow-hidden rounded-[28px] border border-white/5 bg-zinc-950/60 shadow-lg transition-all hover:border-cat-gold/30">
                <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-cat-gold/30 bg-cat-gold/10 px-3 py-2 text-cat-gold shadow-sm">
                    <Calendar size={14} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{format(event.computedDate, "EEEE", { locale: es })}</span>
                    <span className="h-3 w-px bg-cat-gold/40" aria-hidden="true" />
                    <span className="text-sm font-black leading-none">{format(event.computedDate, "dd")}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{format(event.computedDate, "MMM", { locale: es })}</span>
                  </div>
                  {event.isRecurring && event.recurrenceDay !== null && event.recurrenceDay !== undefined && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-cat-gold/30 bg-amber-950/80 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-300">
                      <Repeat size={10} /> {getDayName(event.recurrenceDay)}
                    </span>
                  )}
                </div>

                <div className="relative h-48 overflow-hidden border-y border-white/10 bg-zinc-900">
                  {event.eventBanner ? (
                    <img src={event.eventBanner} alt={event.title} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950">
                      <Music className="h-10 w-10 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex max-w-[75%] flex-wrap gap-1.5">
                    {eventTags.map((tag: string, index: number) => {
                      const isExternalTag = tag.toUpperCase().includes("DIFUS") || tag.toUpperCase().includes("EXTERNO")
                      return (
                        <span key={index} className={`${isExternalTag ? "hidden md:inline-flex" : "inline-flex"} rounded-lg border border-white/20 bg-zinc-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md`}>
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white transition-colors group-hover:text-cat-gold">{event.title}</h3>
                  {mapUrl ? (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-cat-gold">
                      <MapPin size={14} className="shrink-0 text-cat-gold" aria-hidden="true" />
                      <span className="truncate underline decoration-cat-gold/40 underline-offset-2">{displayLocation}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <MapPin size={14} className="shrink-0 text-cat-gold" aria-hidden="true" />
                      <span className="truncate">{displayLocation}</span>
                    </div>
                  )}
                  <div className="mt-auto pt-1">
                    {external ? <SocioExternalEventModal event={event} /> : <SocioEventRegisterModal event={event} member={member} registration={registration} />}
                  </div>
                </div>
              </article>
            )
          })
        )}

        <div className="col-span-full mt-2 flex flex-col items-center justify-between gap-5 overflow-hidden rounded-[28px] border border-cat-gold/30 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-950 p-6 text-center shadow-2xl md:flex-row md:p-8 md:text-left">
          <div>
            <span className="rounded-full border border-cat-gold/20 bg-cat-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">Calendario anual</span>
            <h3 className="pt-3 font-serif text-xl font-bold text-white">Toda la agenda del CAT</h3>
            <p className="mt-1 max-w-xl text-xs text-zinc-400">Consultá milongas, seminarios, conciertos y campeonatos durante todo el año.</p>
          </div>
          <a href="/calendario-anual" className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-cat-gold px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-xl transition-all hover:scale-105 hover:bg-amber-400">
            Ver calendario anual <ChevronRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
