"use client"

import Link from "next/link"
import { CalendarDays, ChevronLeft, ChevronRight, Download, MessageCircle, Repeat } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export interface SerializableOccurrence {
  eventId: string
  title: string
  description: string | null
  date: string
  time: string | null
  isRecurring: boolean
  isExternal: boolean
  eventBanner: string | null
}

export interface CalendarMonth {
  key: string
  year: number
  month: number
  occurrences: SerializableOccurrence[]
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"]

function dateKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}

function monthLabel(month: CalendarMonth): string {
  const label = new Date(month.year, month.month, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function monthDays(month: CalendarMonth): Array<Date | null> {
  const firstDay = new Date(month.year, month.month, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const totalDays = new Date(month.year, month.month + 1, 0).getDate()
  const days: Array<Date | null> = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= totalDays; day += 1) days.push(new Date(month.year, month.month, day))
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function EventCard({ event }: { event: SerializableOccurrence }) {
  const eventDate = new Date(event.date)
  const recurringDay = eventDate.toLocaleDateString("es-AR", { weekday: "long" })
  const schedule = event.isRecurring ? `Todos los ${recurringDay}` : eventDate.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
  const accent = event.isExternal ? "purple" : event.isRecurring ? "gold" : "coral"
  const badge = event.isExternal ? "Difusión externa" : event.isRecurring ? "Recurrente" : "Evento especial"

  return (
    <Link href={`/eventos/${event.eventId}`} className={`group overflow-hidden rounded-3xl border bg-[#18211d] shadow-xl shadow-black/20 transition-all hover:-translate-y-1 ${accent === "coral" ? "border-[#d7795e]/45 hover:border-[#e79a82]" : accent === "purple" ? "border-purple-400/30 hover:border-purple-300" : "border-cat-gold/30 hover:border-cat-gold"}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
        {event.eventBanner ? <img src={event.eventBanner} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#59412c] via-[#1b2621] to-[#131313] px-8 text-center font-serif text-2xl font-bold text-cat-gold">Centro Amigos del Tango</div>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 pt-16">
          <span className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${accent === "coral" ? "border-[#d7795e]/60 bg-[#d7795e]/20 text-[#ffc0ad]" : accent === "purple" ? "border-purple-300/50 bg-purple-500/20 text-purple-200" : "border-cat-gold/50 bg-cat-gold/20 text-cat-gold"}`}>{event.isRecurring && <Repeat size={10} />} {badge}</span>
          <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] ${accent === "coral" ? "text-[#ffc0ad]" : accent === "purple" ? "text-purple-200" : "text-cat-gold"}`}>{schedule}</span>
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

function MonthGrid({ month }: { month: CalendarMonth }) {
  const eventsByDay = new Map<string, SerializableOccurrence[]>()
  month.occurrences.forEach((event) => {
    const key = dateKey(new Date(event.date))
    eventsByDay.set(key, [...(eventsByDay.get(key) || []), event])
  })

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18211d]/75 shadow-2xl shadow-black/20 print:break-inside-avoid">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 md:px-7">
        <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">{monthLabel(month)}</h2>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cat-gold">{month.occurrences.length} {month.occurrences.length === 1 ? "actividad" : "actividades"}</span>
      </div>
      <div className="grid grid-cols-7 border-b border-white/10 bg-black/10 px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">{WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}</div>
      <div className="grid grid-cols-7 gap-px bg-white/10">
        {monthDays(month).map((date, index) => {
          const events = date ? eventsByDay.get(dateKey(date)) || [] : []
          const hasSpecialEvent = events.some((event) => !event.isRecurring)
          return <div key={date ? dateKey(date) : `empty-${index}`} className={`min-h-36 bg-[#151b18] p-2 md:min-h-44 md:p-3 ${date ? "" : "bg-[#111512]"}`}>
            {date && <><span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${events.length ? hasSpecialEvent ? "bg-[#d7795e] text-zinc-950" : "bg-cat-gold text-zinc-950" : "text-zinc-500"}`}>{date.getDate()}</span><div className="space-y-1.5">{events.map((event) => <Link key={`${event.eventId}-${event.date}`} href={`/eventos/${event.eventId}`} className={`block rounded-xl border px-2.5 py-2 text-xs leading-tight text-zinc-200 transition-colors ${event.isRecurring ? "border-cat-gold/25 bg-cat-gold/5 hover:border-cat-gold/60 hover:bg-cat-gold/10" : event.isExternal ? "border-purple-400/35 bg-purple-500/10 hover:border-purple-300 hover:bg-purple-500/20" : "border-[#d7795e]/50 bg-[#d7795e]/10 hover:border-[#e79a82] hover:bg-[#d7795e]/20"}`}><span className={`mb-1 flex items-center gap-1 text-[10px] font-bold ${event.isRecurring ? "text-cat-gold" : event.isExternal ? "text-purple-200" : "text-[#ffc0ad]"}`}>{event.time || ""} {event.isRecurring ? <Repeat size={10} /> : <span className="rounded border border-current px-1 text-[8px] uppercase">Único</span>}</span><span className="line-clamp-3">{event.title}</span></Link>)}</div></>}
          </div>
        })}
      </div>
    </section>
  )
}

export function AnnualCalendarClient({ initialMonths }: { initialMonths: CalendarMonth[] }) {
  const [selectedKey, setSelectedKey] = useState(initialMonths[0]?.key || "")
  const [isPrintingFullCalendar, setIsPrintingFullCalendar] = useState(false)
  useEffect(() => {
    const sharedMonth = new URLSearchParams(window.location.search).get("mes")
    if (sharedMonth && initialMonths.some((month) => month.key === sharedMonth)) setSelectedKey(sharedMonth)
  }, [initialMonths])
  const selectedIndex = initialMonths.findIndex((month) => month.key === selectedKey)
  const selectedMonth = initialMonths[selectedIndex] || initialMonths[0]
  const landingEvents = useMemo(() => selectedMonth ? [...new Map(selectedMonth.occurrences.map((event) => [event.eventId, event])).values()] : [], [selectedMonth])

  const printFullCalendar = () => {
    setIsPrintingFullCalendar(true)
    window.setTimeout(() => {
      window.print()
      setIsPrintingFullCalendar(false)
    }, 100)
  }

  const shareMonth = () => {
    if (!selectedMonth) return
    const url = `${window.location.origin}${window.location.pathname}?mes=${selectedMonth.key}`
    const text = `Calendario del CAT · ${monthLabel(selectedMonth)}\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  }

  if (!selectedMonth) return <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center"><CalendarDays className="mx-auto mb-4 text-zinc-600" size={40} /><h2 className="text-xl font-bold text-white">Todavía no hay actividades cargadas</h2><p className="mt-2 text-sm text-zinc-500">Cuando se publique un evento, aparecerá automáticamente en este calendario.</p></div>

  return <>
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#18211d]/80 p-4 shadow-xl md:flex-row md:items-center md:justify-between md:p-5 print:hidden">
      <div className="flex items-center gap-2">
        <button aria-label="Mes anterior" disabled={selectedIndex <= 0} onClick={() => setSelectedKey(initialMonths[selectedIndex - 1]?.key || selectedKey)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:border-cat-gold/50 hover:text-cat-gold disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={19} /></button>
        <select aria-label="Elegir mes" value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)} className="min-h-11 flex-1 rounded-xl border border-white/10 bg-[#111512] px-4 text-sm font-bold text-white outline-none focus:border-cat-gold/60 md:w-64 md:flex-none">{initialMonths.map((month) => <option key={month.key} value={month.key}>{monthLabel(month)}</option>)}</select>
        <button aria-label="Mes siguiente" disabled={selectedIndex >= initialMonths.length - 1} onClick={() => setSelectedKey(initialMonths[selectedIndex + 1]?.key || selectedKey)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:border-cat-gold/50 hover:text-cat-gold disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={19} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button onClick={shareMonth} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"><MessageCircle size={16} /> WhatsApp</button>
        <button onClick={printFullCalendar} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cat-gold px-4 text-xs font-black text-zinc-950 transition-colors hover:brightness-110"><Download size={16} /> Descargar completo</button>
      </div>
    </div>

    {!isPrintingFullCalendar && <div className="print:hidden"><MonthGrid month={selectedMonth} /><div className="mt-10"><h2 className="mb-5 font-serif text-2xl font-bold text-white">Eventos de {monthLabel(selectedMonth)}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{landingEvents.map((event) => <EventCard key={event.eventId} event={event} />)}</div></div></div>}
    {isPrintingFullCalendar && <div className="grid gap-8 print:grid-cols-1">{initialMonths.map((month) => <MonthGrid key={month.key} month={month} />)}</div>}
  </>
}
