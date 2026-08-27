import Link from "next/link"
import { CalendarDays, Clock3, Mail, Repeat, Sparkles } from "lucide-react"
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
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`
    const serialized = { ...occurrence, date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` }
    groupedMonths.set(key, [...(groupedMonths.get(key) || []), serialized])
  }

  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, "0")}`
  if (!groupedMonths.has(currentMonthKey)) groupedMonths.set(currentMonthKey, [])

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
          <h1 className="mb-3 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">Calendario anual</h1>
          <div className="h-1 w-20 rounded-full bg-cat-gold" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">Una mirada completa de lo que viene en el CAT: milongas recurrentes, clases y eventos especiales ya programados.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5"><Repeat size={13} className="text-cat-gold" /> Actividad recurrente</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={13} className="text-purple-300" /> Evento especial o externo</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} className="text-zinc-500" /> Tocá una actividad para ver detalles</span>
          </div>
        </div>
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-cat-gold/20 bg-cat-gold/5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-sm font-bold text-white">¿Tenés un evento de tango que no figura?</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">Mandanos la información para que podamos incorporarlo al calendario.</p>
          </div>
          <a href="mailto:info@centroamigosdeltango.com?subject=Evento%20de%20tango%20para%20el%20calendario" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-cat-gold px-4 text-xs font-black text-zinc-950 transition-colors hover:brightness-110"><Mail size={16} /> Enviar evento</a>
        </div>
        <AnnualCalendarClient initialMonths={months} />
      </div>
    </main>
  )
}
