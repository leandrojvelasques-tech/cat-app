import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Menu, Sparkles } from "lucide-react"

const activities = [
  { date: "15 AGO", type: "Milonga", title: "Gran Milonga Mensual", place: "Salón del CAT", tone: "bg-[#1b2621]" },
  { date: "22 AGO", type: "Escuela", title: "Clase abierta de tango", place: "Comodoro Rivadavia", tone: "bg-[#6e5137]" },
  { date: "12 OCT", type: "Campeonato", title: "Preliminar Regional", place: "Patagonia", tone: "bg-[#929397]" },
]

export default function PreviewPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-[#242522]">
      <header className="relative z-20 border-b border-[#242522]/10 bg-[#f4f0e8]/95">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/preview" aria-label="Centro Amigos del Tango - inicio" className="shrink-0">
            <Image src="/preview-assets/logo-horizontal.jpeg" alt="Centro Amigos del Tango" width={220} height={115} className="h-14 w-auto object-contain mix-blend-multiply sm:h-16" priority />
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.18em] md:flex">
            <a href="#agenda" className="transition-colors hover:text-[#d89a19]">Agenda</a>
            <a href="#escuela" className="transition-colors hover:text-[#d89a19]">Escuela</a>
            <a href="#historia" className="transition-colors hover:text-[#d89a19]">Nosotros</a>
            <Link href="/asociate" className="bg-[#d89a19] px-5 py-3 text-[#242522] transition-colors hover:bg-[#242522] hover:text-white">Asociate</Link>
          </nav>
          <button className="rounded-full border border-[#242522]/15 p-2 md:hidden" aria-label="Abrir menú"><Menu size={20} /></button>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[680px] max-w-[1320px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-24">
        <div className="relative z-10 max-w-xl">
          <p className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#6e5137]"><span className="h-px w-10 bg-[#d89a19]" /> Comodoro Rivadavia</p>
          <h1 className="font-serif text-[clamp(4rem,8vw,7.8rem)] leading-[0.84] tracking-[-0.07em] text-[#1b2621]">El tango<br /><em className="font-normal text-[#d89a19]">se encuentra</em><br />acá.</h1>
          <p className="mt-10 max-w-md text-lg leading-relaxed text-[#242522]/70">Una comunidad que baila, aprende y sostiene la cultura del tango en la Patagonia.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#agenda" className="inline-flex items-center gap-3 bg-[#1b2621] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-transform hover:-translate-y-1">Ver agenda <ArrowUpRight size={16} /></a>
            <Link href="/asociate" className="inline-flex items-center gap-3 border-b-2 border-[#d89a19] px-1 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#1b2621]">Asociate al CAT <ChevronRight size={16} /></Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[650px]">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-[#d89a19]/50" />
          <div className="absolute -bottom-7 -left-8 z-20 w-36 bg-[#d89a19] p-5 text-[#1b2621] sm:w-44">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Una casa para</p>
            <p className="mt-3 font-serif text-3xl leading-none">el abrazo</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#1b2621] sm:aspect-[5/6]">
            <Image src="/images/tango/tango-pareja.jpg" alt="Pareja bailando tango" fill className="object-cover grayscale-[20%]" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b2621]/65 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d89a19]">Centro Amigos del Tango</p><p className="mt-2 font-serif text-2xl">Desde la comunidad</p></div>
          </div>
          <div className="absolute -bottom-14 -right-20 hidden h-36 w-72 rotate-[-18deg] rounded-[50%] border-b-2 border-[#d89a19] sm:block" />
        </div>
      </section>

      <section className="border-y border-[#242522]/10 bg-white/45" aria-label="Próxima actividad">
        <div className="mx-auto grid max-w-[1320px] items-center gap-5 px-5 py-6 sm:px-8 md:grid-cols-[160px_1fr_auto] lg:px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6e5137]">Próxima actividad</p>
          <div className="flex items-center gap-4"><CalendarDays className="text-[#d89a19]" size={22} /><div><p className="font-serif text-2xl text-[#1b2621]">Gran Milonga Mensual</p><p className="text-sm text-[#242522]/60">15 de agosto · Salón del CAT</p></div></div>
          <a href="#agenda" className="text-xs font-bold uppercase tracking-[0.16em] text-[#1b2621] underline decoration-[#d89a19] decoration-2 underline-offset-8">Ver detalles <ArrowUpRight className="ml-2 inline" size={14} /></a>
        </div>
      </section>

      <section id="agenda" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6e5137]">Lo que está pasando</p><h2 className="mt-3 font-serif text-5xl leading-none text-[#1b2621] sm:text-6xl">Agenda tanguera</h2></div><p className="max-w-xs text-sm leading-relaxed text-[#242522]/60">Milongas, clases y encuentros para vivir el tango todo el año.</p></div>
        <div className="grid gap-px bg-[#242522]/15 md:grid-cols-3">
          {activities.map((activity) => <article key={activity.title} className={`${activity.tone} group min-h-[300px] p-7 text-white transition-transform hover:-translate-y-2`}><div className="flex items-start justify-between"><p className="font-mono text-xs tracking-[0.18em] text-[#f5d687]">{activity.date}</p><Sparkles size={18} className="opacity-60" /></div><div className="mt-24"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{activity.type}</p><h3 className="font-serif text-3xl leading-none">{activity.title}</h3><p className="mt-4 flex items-center gap-2 text-sm text-white/65"><MapPin size={14} /> {activity.place}</p></div></article>)}
        </div>
      </section>

      <section id="escuela" className="bg-[#1b2621] px-5 py-24 text-white sm:px-8 lg:px-12"><div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d89a19]">Aprender también es pertenecer</p><h2 className="mt-5 max-w-2xl font-serif text-6xl leading-[0.9] sm:text-8xl">La Escuela<br /><em className="font-normal text-[#d89a19]">del CAT</em></h2></div><div><p className="text-lg leading-relaxed text-white/70">Clases gratuitas, docentes invitados y un espacio para que el tango siga vivo en las nuevas generaciones.</p><a href="/clases" className="mt-8 inline-flex items-center gap-3 border-b border-[#d89a19] pb-3 text-xs font-bold uppercase tracking-[0.16em] text-white">Conocer las clases <ArrowUpRight size={16} /></a></div></div></section>

      <section id="historia" className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.75fr_1fr] lg:items-center lg:px-12"><div className="bg-white p-4 shadow-[18px_18px_0_#d89a19]/30"><Image src="/preview-assets/logo-vertical.jpeg" alt="Logo vertical oficial del Centro Amigos del Tango" width={600} height={800} className="h-auto w-full object-contain" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6e5137]">Una institución con historia</p><h2 className="mt-5 font-serif text-5xl leading-none text-[#1b2621] sm:text-7xl">El tango como<br /><em className="font-normal text-[#d89a19]">punto de encuentro.</em></h2><p className="mt-8 max-w-lg text-lg leading-relaxed text-[#242522]/65">El Centro Amigos del Tango nace para promover el tango en sus expresiones artísticas, culturales y sociales en Comodoro Rivadavia.</p><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#6e5137]">Historia · Comunidad · Cultura</p></div></section>

      <footer className="bg-[#242522] px-5 py-12 text-white sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1320px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><Image src="/preview-assets/logo-symbol.jpeg" alt="CAT" width={120} height={120} className="h-20 w-20 object-contain mix-blend-screen" /><div className="sm:text-right"><p className="font-serif text-3xl">Ser socio es sostener esta casa.</p><Link href="/asociate" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#d89a19]">Quiero asociarme <ArrowUpRight size={15} /></Link></div></div></footer>
    </main>
  )
}
