import Link from "next/link"
import { CalendarDays, Clock3, Repeat, Sparkles } from "lucide-react"
import { db } from "@/lib/db"
import { getCalendarEventOccurrences } from "@/lib/event-utils"
import { AnnualCalendarClient, type CalendarMonth, type SerializableOccurrence } from "./AnnualCalendarClient"

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
  const groupedMonths = new Map<string, SerializableOccurrence[]>()

  for (const occurrence of occurrences) {
    const date = occurrence.date
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const serialized = { ...occurrence, date: date.toISOString() }
    groupedMonths.set(key, [...(groupedMonths.get(key) || []), serialized])
  }

  const months: CalendarMonth[] = [...groupedMonths.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, monthOccurrences]) => {
      const [year, month] = key.split("-").map(Number)
      return { key, year, month, occurrences: monthOccurrences }
    })

  return (
    <main className="min-h-screen bg-[#131313] text-[#e4e2e0]">
      <header className="border-b border-white/10 bg-[#1b2621] px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-zinc-400 transition-colors hover:text-white">← Volver al inicio</Link>
          <Link href="/login" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-cat-gold/40 hover:text-cat-gold">Portal de socios</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <div className="mb-10 max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cat-gold/30 bg-cat-gold/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cat-gold"><CalendarDays size={13} /> Agenda extendida</div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">Calendario anual</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">Una mirada completa de lo que viene en el CAT: milongas recurrentes, clases y eventos especiales ya programados.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5"><Repeat size={13} className="text-cat-gold" /> Actividad recurrente</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={13} className="text-purple-300" /> Evento especial o externo</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} className="text-zinc-500" /> Tocá una actividad para ver detalles</span>
          </div>
        </div>
        <AnnualCalendarClient initialMonths={months} />
      </div>
    </main>
  )
}
