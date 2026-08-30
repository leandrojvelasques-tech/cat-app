import { db } from "@/lib/db"
import Link from "next/link"
import { 
  Sparkles, 
  Heart, 
  ChevronRight, 
  Music, 
  GraduationCap, 
  Trophy, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  LogIn,
  BookOpen
} from "lucide-react"
import { EscuelitaCarousel } from "./EscuelitaCarousel"
import { NovedadesHomeSection } from "./NovedadesHomeSection"
import { OfficialLogo } from "@/components/OfficialLogo"
import { getDayName, getNextEventDate, isEventCurrentlyActive, isEventOccurrenceWithinWindow, isExternalEvent } from "@/lib/event-utils"
import { Repeat, Sparkles as SparklesIcon } from "lucide-react"
import { getCurrentFeeAmount } from "@/lib/fee-utils"

export const revalidate = 3600 // Revalida cada hora

export default async function Home() {
  const now = new Date()
  const currentFee = await getCurrentFeeAmount()

  // Obtener las últimas 3 novedades publicadas
  const latestNovedades = await db.novedad.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { attachments: { select: { id: true, fileName: true, fileMimeType: true } } }
  })

  // Obtener eventos reales públicos y calcular fecha próxima (incluyendo recurrentes)
  const allPublicEvents = await db.event.findMany({
    where: {
      isPublic: true,
      status: "OPEN"
    },
    orderBy: { startDate: "asc" },
  })

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const agendaWindowEnd = new Date(todayStart)
  agendaWindowEnd.setDate(agendaWindowEnd.getDate() + 30)
  agendaWindowEnd.setHours(23, 59, 59, 999)

  const upcomingEvents = allPublicEvents
    .map(evt => ({
      ...evt,
      computedDate: getNextEventDate(evt, now)
    }))
    .filter(evt => {
      if (!isEventCurrentlyActive(evt, now) || !isEventOccurrenceWithinWindow(evt, evt.computedDate) || evt.computedDate < todayStart) return false
      return evt.isRecurring || evt.computedDate <= agendaWindowEnd
    })
    .sort((a, b) => a.computedDate.getTime() - b.computedDate.getTime())

  // Obtener docentes del mes
  const docentesSetting = await db.setting.findUnique({
    where: { key: "escuelita_docentes_mes" }
  })
  const docentesJsonSetting = await db.setting.findUnique({
    where: { key: "escuelita_docentes_mes_json" }
  })
  const currentDocentes = docentesSetting?.value || "Profesores Rotativos de la Comisión"
  const monthlyTeachersList = docentesJsonSetting?.value ? JSON.parse(docentesJsonSetting.value) : []

  // Obtener fotos reales de la escuela
  const escuelitaClasses = await db.escuelitaClass.findMany({
    where: {
      NOT: { photoUrl: null }
    },
    orderBy: { date: "desc" },
    take: 10
  })

  const classPhotos = escuelitaClasses.map(c => c.photoUrl as string)

  const fallbackPhotos = [
    "/images/tango/tango-orchestra.jpg",
    "/images/tango/tango-pareja.jpg"
  ]

  const carouselPhotos = classPhotos.length > 0 ? classPhotos : fallbackPhotos

  // Obtener los integrantes actuales de la comisión directiva para el frontend
  const boardMembers = await db.member.findMany({
    where: { isBoardMember: true },
    select: {
      firstName: true,
      lastName: true,
      position: true,
      avatarUrl: true,
      memberNumber: true
    },
    orderBy: { lastName: "asc" }
  })

  // Predefinición del orden jerárquico de cargos para ordenar en memoria
  const cargoOrder: Record<string, number> = {
    "Presidente": 1,
    "Vicepresidente": 2,
    "Vice Presidente": 2,
    "Secretario": 3,
    "Secretaria": 3,
    "Tesorero": 4,
    "Primer Vocal": 5,
    "1er Vocal": 5,
    "Segundo Vocal": 6,
    "2do Vocal": 6,
    "Tercer Vocal": 7,
    "3er Vocal": 7,
    "1er Vocal Suplente": 8,
    "2do Vocal Suplente": 9,
    "Vocal": 10
  }

  const sortedBoard = [...boardMembers].sort((a, b) => {
    const orderA = cargoOrder[a.position || ""] || 99
    const orderB = cargoOrder[b.position || ""] || 99
    if (orderA !== orderB) return orderA - orderB
    return a.lastName.localeCompare(b.lastName)
  })

  return (
    <div className="bg-[#131313] text-[#e4e2e0] min-h-screen selection:bg-cat-gold/30 font-sans relative overflow-x-hidden">
      
      {/* Background decoration elements */}
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-cat-dark/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#59412c]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-[#1b2621]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <nav className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <OfficialLogo
              className="h-10 w-[60px] md:h-12 md:w-[72px]"
              priority
              compact
            />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-cat-gold font-bold pb-0.5 border-b border-cat-gold text-sm transition-colors">Inicio</Link>
            <Link href="#novedades" className="text-zinc-400 hover:text-white text-sm transition-colors">Novedades</Link>
            <Link href="#eventos" className="text-zinc-400 hover:text-white text-sm transition-colors">Agenda Tanguera</Link>
            <Link href="/calendario-anual" className="text-cat-gold hover:text-amber-300 text-sm transition-colors">Calendario anual</Link>
            <Link href="#nosotros" className="text-zinc-400 hover:text-white text-sm transition-colors">Nosotros</Link>
            <Link href="/clases" className="text-amber-400 font-bold hover:text-amber-300 text-sm transition-colors flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <BookOpen size={14} />
              <span>Clases de Tango</span>
            </Link>
            <Link href="/login" className="text-zinc-400 hover:text-white text-sm transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/10">
              <LogIn size={14} />
              <span>Portal CD / Socios</span>
            </Link>
          </div>

          <Link
            href="/login"
            aria-label="Ingresar al Portal de Socios"
            className="md:hidden min-h-11 px-3.5 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <LogIn size={17} aria-hidden="true" />
            <span>Socios</span>
          </Link>
          
          <div>
            <Link 
              href="/asociate" 
              className="bg-gradient-to-tr from-cat-gold to-cat-bronze hover:brightness-110 px-6 py-2.5 rounded-full font-bold text-xs text-zinc-950 tracking-wider transition-all shadow-lg shadow-cat-gold/20 active:scale-95 block"
            >
              ASOCIATE
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center z-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-[#131313] z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-center scale-105" 
            style={{ 
              backgroundImage: `url('/images/tango/tango-orchestra.jpg')` 
            }}
          />
        </div>
        <div className="relative z-20 px-6 md:px-16 max-w-7xl mx-auto w-full pt-16 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 font-serif">
              Centro Amigos <br/>
              <span className="bg-gradient-to-r from-cat-gold to-cat-bronze bg-clip-text text-transparent">del Tango</span>
            </h1>
            <p className="text-base md:text-xl text-zinc-400 font-light max-w-xl mb-10 tracking-wide">
              Comodoro Rivadavia · Asociación Civil · Fundado el 13 de noviembre de 2002
            </p>
            <Link 
              href="/asociate" 
              className="bg-gradient-to-tr from-cat-gold to-cat-bronze text-zinc-950 font-bold px-10 py-4 rounded-2xl shadow-[0_0_40px_rgba(242,168,29,0.35)] hover:shadow-[0_0_60px_rgba(242,168,29,0.55)] hover:translate-y-[-2px] active:scale-[0.98] active:translate-y-0 transition-all font-serif"
            >
              Asociate al CAT
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 animate-bounce">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Explorar</span>
          <ChevronRight className="rotate-90 text-cat-gold w-4 h-4" />
        </div>
      </section>

      {/* Próximos Eventos - Agenda Tanguera */}
      <section id="eventos" className="bg-[#131313] py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-3">Agenda Tanguera del mes</h2>
              <div className="w-20 h-1 bg-cat-gold rounded-full"></div>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Milongas habituales y eventos especiales de los próximos 30 días. Las actividades recurrentes se muestran una sola vez con su día habitual.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
                <p className="text-sm text-zinc-400">No hay eventos especiales en los próximos 30 días.</p>
                <p className="mt-2 text-xs text-zinc-500">Consultá el calendario anual para ver toda la programación cargada.</p>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const day = event.computedDate.getDate()
                const month = event.computedDate.toLocaleString("es-ES", { month: "short" }).toUpperCase()
                const weekday = event.computedDate.toLocaleString("es-ES", { weekday: "long" }).toUpperCase()
                
                return (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.id}`}
                    className="group flex h-full flex-col border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-5 rounded-2xl transition-all shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1210]"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-cat-gold/30 bg-cat-gold/10 px-3 py-2 text-cat-gold shadow-sm">
                        <Calendar size={14} aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{weekday}</span>
                        <span className="h-3 w-px bg-cat-gold/40" aria-hidden="true" />
                        <span className="text-sm font-black leading-none">{day}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider">{month.replace(".", "")}</span>
                      </div>
                      {isExternalEvent(event) ? (
                        <div className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-950/80 px-2.5 py-1.5 text-[9px] font-extrabold text-purple-300 shadow-sm">
                          <SparklesIcon size={10} /> DIFUSIÓN
                        </div>
                      ) : event.isRecurring ? (
                        <div className="inline-flex items-center gap-1 rounded-lg border border-cat-gold/30 bg-zinc-950/80 px-2.5 py-1.5 text-[9px] font-extrabold text-cat-gold shadow-sm">
                          <Repeat size={10} /> RECURRENTE
                        </div>
                      ) : null}
                    </div>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6">
                      <div 
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 bg-zinc-800" 
                        style={{ 
                          backgroundImage: event.eventBanner ? `url(${event.eventBanner})` : `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnrWO03v9cI5Z1tDdFLaGnsP5EEmYjL6Onw2iSNZ8aSahDME-gZ6EaH9Yt3ep5DRw6X9TskI141KP2le4Jt2oAOFWFGqcLBzSKnQeBNJUvRWf4pd8Q8yAVDE8R6ymwNU9pp5dOWLkFWDbhwdN6rZflrrJ2aRKTmOhbO1pXCHiehk9dnFM93Y3Ns6nI83eQKOq-wKtju03cL8PuVEG5sbNQhjpP3Cc_onfhs9rMiU-CHZ7LBVTyzkAuYLTsU1dLl-H5dlLOaez9JjBo')` 
                        }}
                      />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{event.title}</h4>
                    {event.isRecurring && event.recurrenceDay !== null && event.recurrenceDay !== undefined && (
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cat-gold">Todos los {getDayName(event.recurrenceDay).toLowerCase()}</p>
                    )}
                    <p className="text-zinc-400 text-xs font-light leading-relaxed mb-6 line-clamp-3">
                      {event.description || "Disfrutá de este gran evento de tango."}
                    </p>
                    <span className="mx-auto mt-auto flex w-fit items-center rounded-full bg-gradient-to-r from-cat-gold to-cat-bronze px-5 py-2.5 text-sm font-black text-zinc-950 shadow-lg shadow-cat-gold/10 transition-all group-hover:scale-105 group-hover:shadow-cat-gold/20">
                      Más info <ArrowRight size={14} className="ml-1 inline-block" />
                    </span>
                  </Link>
                )
              })
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/calendario-anual"
              className="inline-flex items-center gap-2 rounded-full border border-cat-gold/40 bg-cat-gold/10 px-6 py-3 text-sm font-bold text-cat-gold shadow-lg shadow-cat-gold/5 transition-all hover:bg-cat-gold hover:text-zinc-950"
            >
              Ver calendario anual <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Novedades CAT Section */}
      <NovedadesHomeSection novedades={latestNovedades} />

      {/* Sobre Nosotros */}
      <section id="nosotros" className="bg-[#1b2621] py-24 md:py-32 px-6 md:px-16 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-3">Sobre Nosotros</h2>
                <div className="w-20 h-1 bg-cat-gold rounded-full"></div>
              </div>
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed font-light">
                Somos una asociación civil sin fines de lucro dedicada a promover y difundir el Tango en sus diversas expresiones artísticas, culturales y sociales en Comodoro Rivadavia. Desde nuestra fundación el 13 de noviembre de 2002, trabajamos para crear un espacio de pertenencia para todos los amantes del 2x4.
              </p>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Nuestra misión es propender a la difusión del Tango en sus vastas expresiones artísticas, culturales y sociales, como la música instrumental, el canto, la poesía, la danza, la literatura, el teatro, la pintura, la escultura y la historia.
              </p>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 border border-cat-gold/10 rounded-2xl translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
              <div 
                className="aspect-video bg-cover bg-center rounded-2xl border border-white/10 relative z-10 overflow-hidden shadow-2xl" 
                style={{ 
                  backgroundImage: `url('/images/tango/tango-pareja.jpg')` 
                }}
              />
            </div>
          </div>

          {/* Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#59412c]/10 border border-white/5 p-8 rounded-2xl hover:bg-[#59412c]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cat-gold/10 flex items-center justify-center mb-6 text-cat-gold group-hover:scale-110 transition-transform shadow-lg shadow-cat-gold/5">
                <Music size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Milongas Mensuales</h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">Eventos sociales donde la música en vivo y el abrazo se encuentran para celebrar nuestra pasión en la pista.</p>
            </div>
            
            <div className="bg-[#59412c]/10 border border-white/5 p-8 rounded-2xl hover:bg-[#59412c]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cat-gold/10 flex items-center justify-center mb-6 text-cat-gold group-hover:scale-110 transition-transform shadow-lg shadow-cat-gold/5">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Escuela del CAT (Gratuita)</h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">Formación abierta y accesible para todas las edades, garantizando que el tango siga vivo en las nuevas generaciones.</p>
            </div>
            
            <div className="bg-[#59412c]/10 border border-white/5 p-8 rounded-2xl hover:bg-[#59412c]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cat-gold/10 flex items-center justify-center mb-6 text-cat-gold group-hover:scale-110 transition-transform shadow-lg shadow-cat-gold/5">
                <Trophy size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Campeonato Patagónico</h3>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">Sede regional y subsede oficial del Mundial de Tango de Buenos Aires, atrayendo a talentos de todo el sur.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Escuelita Section */}
      <EscuelitaCarousel photos={carouselPhotos} docentes={currentDocentes} teachersList={monthlyTeachersList} />

      {/* Comisión Directiva Section */}
      {sortedBoard.length > 0 && (
        <section id="comision" className="relative bg-gradient-to-b from-[#131313] to-[#1b2621]/30 py-24 md:py-32 overflow-hidden border-t border-white/5">
          <div className="px-6 md:px-16 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">Comisión Directiva</h2>
              <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-light">
                Te damos a conocer quiénes son los miembros de la Comisión Directiva que dirigen y organizan las actividades del Centro Amigos del Tango.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 justify-center">
              {sortedBoard.map((member, i) => (
                <div 
                  key={i} 
                  className="flex flex-col items-center text-center p-6 bg-[#1b2621]/20 border border-white/5 rounded-3xl hover:border-cat-gold/20 hover:bg-[#1b2621]/40 transition-all duration-300 group shadow-lg"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-800 flex items-center justify-center mb-4 group-hover:border-cat-gold/40 transition-colors shadow-inner shrink-0">
                    {member.avatarUrl ? (
                      <img 
                        src={member.avatarUrl} 
                        alt={`${member.firstName} ${member.lastName}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <span className="text-zinc-500 text-xl font-bold uppercase tracking-wider">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-zinc-200 group-hover:text-cat-gold transition-colors duration-300 line-clamp-1">
                    {member.firstName} {member.lastName}
                  </h4>
                  <p className="text-xs text-cat-gold mt-1 font-medium tracking-wide">
                    {member.position}
                  </p>
                  <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-2">
                    Socio #{member.memberNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beneficios de Asociarse */}
      <section id="beneficios" className="relative bg-gradient-to-b from-[#1b2621]/30 to-[#131313] py-24 md:py-32 overflow-hidden border-t border-white/5">
        <div className="px-6 md:px-16 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">¿Por qué asociarte?</h2>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto font-light">
              Formar parte del CAT es apoyar la cultura local y acceder a un mundo de experiencias exclusivas en la Patagonia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {/* Beneficios Directos */}
            <div className="bg-[#1b2621]/80 border border-white/10 p-10 rounded-2xl shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-bold text-cat-gold mb-8 flex items-center gap-3 font-serif">
                <Sparkles className="w-5 h-5 text-cat-gold" />
                <span>Beneficios Directos</span>
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Descuentos exclusivos en todas las Milongas y eventos mensuales organizados por la asociación.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Acceso preferencial y aranceles diferenciados en Seminarios y Talleres con maestros de primer nivel.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Descuentos especiales en artículos de merchandise y vestimenta del CAT.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Suscripción al Newsletter exclusivo de socios con preventas y agendas.</p>
                </li>
              </ul>
            </div>
            
            {/* Beneficios Indirectos */}
            <div className="bg-[#1b2621]/80 border border-white/10 p-10 rounded-2xl shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-bold text-cat-gold mb-8 flex items-center gap-3 font-serif">
                <Heart className="w-5 h-5 text-cat-gold" />
                <span>Beneficios Indirectos</span>
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Colaborás con el sostenimiento societario y legal necesario para nuestro funcionamiento como Asociación Civil.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Haces posible que más milongas, campeonatos y seminarios puedan planificarse en Comodoro Rivadavia.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Ayudás a mantener la "Escuela del CAT" para que más personas aprendan a bailar tango de forma gratuita.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cat-gold shrink-0" />
                  <p className="text-sm md:text-base text-zinc-300 font-light">Colaborás con la realización anual del Campeonato Patagónico de Tango (Subsede Oficial del Mundial de Tango).</p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <Link 
              href="/asociate" 
              className="bg-gradient-to-tr from-cat-gold to-cat-bronze text-zinc-950 font-bold px-12 py-5 rounded-full text-base shadow-2xl shadow-cat-gold/30 hover:scale-105 hover:shadow-cat-gold/50 active:scale-95 transition-all duration-300"
            >
              Asociate Ahora
            </Link>
            <p className="mt-6 text-xs text-zinc-500">Suscripción mensual simple y transparente de ${currentFee.toLocaleString("es-AR")}. Trámite digital.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/5 py-20 px-6 md:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="font-bold text-2xl text-white font-serif tracking-wide">CAT</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Centro Amigos del Tango. Fomentando la pasión, el abrazo y la cultura rioplatense en Comodoro Rivadavia, Chubut, desde el 13 de noviembre de 2002.
            </p>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-xs font-black uppercase tracking-widest text-cat-gold">Secciones</h5>
            <ul className="space-y-3">
              <li><Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="#nosotros" className="text-xs text-zinc-500 hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="#comision" className="text-xs text-zinc-500 hover:text-white transition-colors">Comisión Directiva</Link></li>
              <li><Link href="#eventos" className="text-xs text-zinc-500 hover:text-white transition-colors">Próximos Eventos</Link></li>
              <li><Link href="/asociate" className="text-xs text-zinc-500 hover:text-white transition-colors">Inscripción Socios</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-xs font-black uppercase tracking-widest text-cat-gold">Contacto</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-cat-gold shrink-0 w-4 h-4 mt-0.5" />
                <span className="text-xs text-zinc-500 leading-relaxed">Comodoro Rivadavia, Chubut, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-cat-gold shrink-0 w-4 h-4" />
                <span className="text-xs text-zinc-500">info@centroamigosdeltango.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-cat-gold shrink-0 w-4 h-4" />
                <a href="tel:+5492975295100" className="text-xs text-zinc-500 hover:text-white transition-colors">+54 9 297 529-5100</a>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-xs font-black uppercase tracking-widest text-cat-gold">Ubicación</h5>
            <div className="rounded-xl overflow-hidden h-36 border border-white/5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500 shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d42898.394142386165!2d-67.545!3d-45.86!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDUxJzM2LjAiUyA2N8KwMzInNDIuMCJX!5e0!3m2!1ses-419!2sar!4v1700000000000" 
                className="w-full h-full border-0" 
                allowFullScreen={false} 
                loading="lazy"
              />
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-[10px] text-zinc-600 font-light">
            © {new Date().getFullYear()} Centro Amigos del Tango. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-[10px] text-zinc-600 hover:text-white transition-colors">Portal Administrativo</Link>
            <Link href="#" className="text-[10px] text-zinc-600 hover:text-white transition-colors">Términos y Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
