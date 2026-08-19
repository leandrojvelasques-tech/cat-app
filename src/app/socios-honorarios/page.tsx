import type { Metadata } from "next"
import Link from "next/link"
import { Award, ArrowLeft, Calendar, Sparkles } from "lucide-react"
import { db } from "@/lib/db"
import { OfficialLogo } from "@/components/OfficialLogo"

export const metadata: Metadata = {
  title: "Socios Honorarios | Centro Amigos del Tango",
  description: "Mural de socios honorarios del Centro Amigos del Tango."
}

const INACTIVE_STATUS_KEYS = ["BAJA", "DECEASED", "RESIGNED", "INACTIVE", "ARCHIVED", "DUPLICATE", "MOROSIDAD", "ADMINISTRATIVE"]

function formatDate(value: Date | null) {
  if (!value) return null
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(value)
}

export default async function SociosHonorariosPage() {
  const members = await db.member.findMany({
    where: { type: "HONORARIO", status: { notIn: INACTIVE_STATUS_KEYS } },
    select: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      honoraryAppointmentDate: true,
      honoraryReason: true,
      honoraryAchievements: {
        orderBy: [{ sortOrder: "asc" }, { eventDate: "asc" }, { createdAt: "asc" }],
        select: { title: true, description: true, eventDate: true }
      }
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
  })

  return (
    <main className="min-h-screen bg-[#131313] text-zinc-100">
      <header className="border-b border-white/10 bg-[#1b2621]/90 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3"><OfficialLogo className="h-10 w-[60px]" priority compact /><span className="hidden text-xs font-black uppercase tracking-widest text-zinc-400 md:inline">Centro Amigos del Tango</span></Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"><ArrowLeft size={15} /> Volver al inicio</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-br from-[#2a2116] via-[#181818] to-[#131313] px-6 py-20 md:px-16 md:py-28">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-400"><Award size={32} /></div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-amber-400">Distinción institucional</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">Socios Honorarios</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">Personas distinguidas por su trayectoria, sus aportes y su vínculo con la cultura del tango y con el Centro Amigos del Tango.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-16 md:py-24">
        {members.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 px-6 py-20 text-center text-zinc-500">Todavía no hay socios honorarios publicados.</div> : <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">{members.map((member) => <article key={`${member.lastName}-${member.firstName}`} className="overflow-hidden rounded-[32px] border border-amber-500/20 bg-white/[0.03] shadow-2xl"><div className="flex flex-col gap-6 p-7 md:flex-row md:p-9"><div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-white/5"><>{member.avatarUrl ? <img src={member.avatarUrl} alt={`Fotografía de ${member.firstName} ${member.lastName}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl font-black text-amber-300">{member.firstName[0]}{member.lastName[0]}</div>}</></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="font-serif text-2xl font-bold uppercase text-white">{member.firstName} {member.lastName}</h2><span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">Socio honorario</span></div>{member.honoraryAppointmentDate && <p className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><Calendar size={14} className="text-amber-400" /> Nombrado el {formatDate(member.honoraryAppointmentDate)}</p>}<div className="mt-5 border-l-2 border-amber-500/40 pl-4"><p className="text-sm leading-relaxed text-zinc-300">{member.honoraryReason || "Distinguido por su trayectoria y aporte al tango."}</p></div></div></div>{member.honoraryAchievements.length > 0 && <div className="border-t border-white/10 bg-black/20 p-7 md:p-9"><div className="mb-5 flex items-center gap-2 text-amber-400"><Sparkles size={16} /><h3 className="text-xs font-black uppercase tracking-[0.2em]">Trayectoria y reconocimientos</h3></div><div className="grid gap-3">{member.honoraryAchievements.map((achievement) => <div key={`${achievement.title}-${achievement.eventDate?.toISOString() || "sin-fecha"}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold text-white">{achievement.title}</h4>{achievement.eventDate && <span className="text-xs font-black text-amber-400">{achievement.eventDate.getFullYear()}</span>}</div>{achievement.description && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{achievement.description}</p>}</div>)}</div></div>}</article>)}</div>}
      </section>
    </main>
  )
}
