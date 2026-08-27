import Link from "next/link"
import { CalendarDays, ChevronRight, Clock3, Repeat, Sparkles } from "lucide-react"
import { db } from "@/lib/db"
import { getCalendarDateKey, getCalendarEventOccurrences } from "@/lib/event-utils"

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"]

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function buildMonthDays(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<Date | null> = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function MonthCalendar({ year, month, occurrences }: { year: number; month: number; occurrences: ReturnType<typeof getCalendarEventOccurrences> }) {
  const occurrenceMap = new Map<string, typeof occurrences>()
  for (const occurrence of occurrences) {
    const key = getCalendarDateKey(occurrence.date)
    occurrenceMap.set(key, [...(occurrenceMap.get(key) || []), occurrence])
  }
  const days = buildMonthDays(year, month)
  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18211d]/75 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="font-serif text-xl font-bold text-white">{monthTitle}</h2>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cat-gold">{occurrences.length} {occurrences.length === 1 ? "actividad" : "actividades"}</span>
      </div>

      <div className="hidden grid-cols-7 border-b border-white/10 bg-black/10 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 md:grid">
        {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="hidden grid-cols-7 gap-px bg-white/10 md:grid">
        {days.map((date, index) => {
          const dayEvents = date ? occurrenceMap.get(getCalendarDateKey(date)) || [] : []
          return (
            <div key={date ? getCalendarDateKey(date) : `empty-${index}`} className={`min-h-28 bg-[#151b18] p-2 ${date ? "" : "bg-[#111512]"}`}>
              {date && (
                <>
                  <span className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${dayEvents.length ? "bg-cat-gold text-zinc-950" : "text-zinc-500"}`}>{date.getDate()}</span>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <Link key={`${event.eventId}-${event.date.toISOString()}`} href={`/eventos/${event.eventId}`} className="block rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] leading-tight text-zinc-200 transition-colors hover:border-cat-gold/50 hover:bg-cat-gold/10">
                        <span className="mb-0.5 flex items-center gap-1 text-[9px] font-bold text-cat-gold">{event.time || ""} {event.isRecurring ? <Repeat size={9} /> : null}</span>
                        <span className="line-clamp-2">{event.title}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="divide-y divide-white/10 md:hidden">
        {[...occurrenceMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, dayEvents]) => (
          <div key={key} className="flex gap-4 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-cat-gold/10 text-cat-gold">
              <span className="text-lg font-black">{new Date(`${key}T12:00:00`).getDate()}</span>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {dayEvents.map((event) => (
                <Link key={`${event.eventId}-${event.date.toISOString()}`} href={`/eventos/${event.eventId}`} className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-cat-gold/50 hover:bg-cat-gold/10">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cat-gold">{event.time || "Horario a confirmar"} {event.isRecurring ? <Repeat size={10} /> : null}</span>
                  <span className="mt-1 block text-sm font-semibold text-white">{event.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function EventLandingCard({ event }: { event: ReturnType<typeof getCalendarEventOccurrences>[number] }) {
  const schedule = event.isRecurring
    ? "Actividad recurrente"
    : event.date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })

  return (
    <Link href={`/eventos/${event.eventId}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-[#18211d] shadow-xl shadow-black/20 transition-all hover:-translate-y-1 hover:border-cat-gold/40 hover:shadow-cat-gold/5">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
        {event.eventBanner ? <img src={event.eventBanner} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#59412c] via-[#1b2621] to-[#131313] px-8 text-center font-serif text-2xl font-bold text-cat-gold">Centro Amigos del Tango</div>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 pt-16">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cat-gold">{event.isRecurring ? <span className="inline-flex items-center gap-1"><Repeat size={11} /> {schedule}</span> : schedule}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-cat-gold">{event.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">{event.description || "Actividad tanguera del CAT."}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cat-gold">Ver detalles <ChevronRight size={14} /></span>
      </div>
    </Link>
  )
}

export default async function CalendarioAnualPage() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  const events = await db.event.findMany({
    where: { isPublic: true, status: "OPEN" },
    orderBy: { startDate: "asc" },
    select: { id: true, title: true, description: true, startDate: true, endDate: true, isRecurring: true, recurrenceDay: true, recurrenceTime: true, eventBanner: true, type: true },
  })

  const latestScheduledDate = events.reduce((latest, event) => {
    const candidate = new Date(event.endDate || event.startDate)
    return candidate > latest ? candidate : latest
  }, currentYearEnd)
  const rangeEnd = new Date(Math.max(currentYearEnd.getTime(), latestScheduledDate.getTime()))
  const occurrences = getCalendarEventOccurrences(events, today, rangeEnd)
  const monthGroups = new Map<string, typeof occurrences>()
  for (const occurrence of occurrences) {
    const key = monthKey(occurrence.date)
    monthGroups.set(key, [...(monthGroups.get(key) || []), occurrence])
  }
  const monthEntries = [...monthGroups.entries()].sort(([a], [b]) => a.localeCompare(b))
  const years = [...new Set(monthEntries.map(([key]) => Number(key.split("-")[0])))]
  const landingEvents = [...new Map(occurrences.map((occurrence) => [occurrence.eventId, occurrence])).values()].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <main className="min-h-screen bg-[#131313] text-[#e4e2e0]">
      <header className="border-b border-white/10 bg-[#1b2621] px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-zinc-400 transition-colors hover:text-white">← Volver al inicio</Link>
          <Link href="/login" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-cat-gold/40 hover:text-cat-gold">Portal de socios</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cat-gold/30 bg-cat-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cat-gold"><CalendarDays size={13} /> Agenda extendida</div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">Calendario anual</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">Una mirada completa de lo que viene en el CAT: milongas recurrentes, clases y eventos especiales ya programados.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5"><Repeat size={13} className="text-cat-gold" /> Actividad recurrente</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={13} className="text-purple-300" /> Evento especial o externo</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} className="text-zinc-500" /> Tocá una actividad para ver detalles</span>
          </div>
        </div>

        {monthEntries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
            <CalendarDays className="mx-auto mb-4 text-zinc-600" size={40} />
            <h2 className="text-xl font-bold text-white">Todavía no hay actividades cargadas</h2>
            <p className="mt-2 text-sm text-zinc-500">Cuando se publique un evento, aparecerá automáticamente en este calendario.</p>
          </div>
        ) : (
          <>
            <section className="mb-14">
              <div className="mb-5 flex items-center gap-3"><h2 className="font-serif text-2xl font-bold text-cat-gold">Todos los eventos</h2><div className="h-px flex-1 bg-cat-gold/20" /></div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {landingEvents.map((event) => <EventLandingCard key={event.eventId} event={event} />)}
              </div>
            </section>
            {years.map((year) => (
            <section key={year} className="mb-12">
              <div className="mb-5 flex items-center gap-3"><h2 className="font-serif text-2xl font-bold text-cat-gold">{year}</h2><div className="h-px flex-1 bg-cat-gold/20" /><ChevronRight size={16} className="text-cat-gold/50" /></div>
              <div className="grid gap-6 lg:grid-cols-2">
                {monthEntries.filter(([key]) => Number(key.split("-")[0]) === year).map(([key, monthOccurrences]) => {
                  const [, month] = key.split("-").map(Number)
                  return <MonthCalendar key={key} year={year} month={month} occurrences={monthOccurrences} />
                })}
              </div>
            </section>
            ))}
          </>
        )}
      </div>
    </main>
  )
}
