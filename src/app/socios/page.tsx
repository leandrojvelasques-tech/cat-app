import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, User, AlertCircle, Sparkles, ShieldCheck, Repeat, Music, Gift } from "lucide-react"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { EditProfileModal } from "./EditProfileModal"
import { SocioAccordionSections } from "./SocioAccordionSections"
import { SocioEventRegisterModal } from "./SocioEventRegisterModal"
import { SocioExternalEventModal } from "./SocioExternalEventModal"
import { SocioCarnetToggle } from "./SocioCarnetToggle"
import { SocioDuesPaymentSection } from "./SocioDuesPaymentSection"
import { SocioNovedadesSection } from "./SocioNovedadesSection"
import { getSocioEventRegistrations } from "@/app/actions/eventos"
import { getMemberDebt } from "@/app/actions/billing"
import { getNextEventDate, getDayName, isEventCurrentlyActive, isEventOccurrenceWithinWindow, isExternalEvent } from "@/lib/event-utils"
import { getMemberCommunications } from "@/app/actions/member-communications"
import { SocioCommunicationsSection } from "./SocioCommunicationsSection"
import { SocioAgendaSection } from "./SocioAgendaSection"

export default async function PortalSocioPage() {
  const session = await auth()
  if (!session || !session.user) redirect("/login")

  const userWithMember = (await db.user.findUnique({
    where: { id: session.user.id },
    include: { 
      member: { 
        include: { 
          fees: { orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }] },
          boardHistory: { orderBy: { periodStart: 'desc' } }
        } 
      } 
    }
  })) as any

  // If user has no member record linked yet
  if (!userWithMember?.member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white/5 rounded-[48px] border border-white/10 p-10 m-4">
        <AlertCircle size={48} className="text-amber-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-black mb-2 text-white italic uppercase tracking-tighter">Padrón no Encontrado</h2>
        <p className="text-zinc-500 max-w-sm mx-auto">Comuníquese con administración para vincular su cuenta de usuario con su ficha de socio.</p>
      </div>
    )
  }

  const member = userWithMember.member
  const now = new Date()
  const calculatedStatus = calculateMemberStatus(member as any, now)
  const isAlDia = calculatedStatus === 'AL DIA'

  // Fetch Member Debt / Unpaid months
  const debtData = await getMemberDebt(member.id, { includeUpcoming: true })

  // Fetch Member's Attended Milongas (presente registrado)
  const attendedRegistrations = await db.eventRegistration.findMany({
    where: {
      memberId: member.id,
      attended: true
    },
    include: {
      event: { select: { id: true, title: true, startDate: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const attendedMilongas = attendedRegistrations.map(r => ({
    id: r.id,
    title: r.event.title,
    date: r.event.startDate
  }))

  // Filter events: Rest of current month + full next month
  now.setHours(0, 0, 0, 0)
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1)
  const nextMonth = nextMonthDate.getMonth()
  const nextMonthYear = nextMonthDate.getFullYear()

  const allEvents = await db.event.findMany({
    where: { status: "OPEN" },
    include: { classes: { orderBy: { order: "asc" } } }
  })

  const filteredEvents = allEvents
    .map(evt => ({
      ...evt,
      computedDate: getNextEventDate(evt, now)
    }))
    .filter(evt => {
      if (!isEventCurrentlyActive(evt, now) || !isEventOccurrenceWithinWindow(evt, evt.computedDate)) return false
      const m = evt.computedDate.getMonth()
      const y = evt.computedDate.getFullYear()
      const isCurrentMonth = (y === currentYear && m === currentMonth)
      const isNextMonth = (y === nextMonthYear && m === nextMonth)
      return isCurrentMonth || isNextMonth || evt.isRecurring
    })
    .sort((a, b) => a.computedDate.getTime() - b.computedDate.getTime())

  // Fetch member's event registrations
  const registrations = await getSocioEventRegistrations(member.id)

  // Fetch active novedades for member portal
  const novedadesForSocio = await db.novedad.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: { attachments: { select: { id: true, fileName: true, fileMimeType: true } } }
  })
  const communicationsForSocio = await getMemberCommunications()

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. Header */}
      <section id="perfil" className="relative grid scroll-mt-24 grid-cols-1 items-center gap-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl sm:p-8 md:rounded-[36px] md:p-10">
         <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] -mr-32 -mt-32" />
         
         <div className="relative z-10">
           <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-[28px] overflow-hidden border-4 border-white/5 bg-zinc-800 flex items-center justify-center shadow-2xl relative">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-zinc-600" size={32} />
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">
                    Hola, <span className="text-amber-500 font-black">{member.firstName}</span>
                </h1>
                <EditProfileModal member={member} />
              </div>
           </div>

           <p className="text-zinc-400 text-sm md:text-base mb-6 max-w-sm font-light">
              Bienvenido a su portal personal del Centro Amigos del Tango.
           </p>
           
           <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="flex gap-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-1">Estado Administrativo</span>
                    <span className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm ${getStatusBadgeStyles(calculatedStatus)}`}>
                      {calculatedStatus}
                    </span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-1">Socio Desde</span>
                    <span className="text-white font-bold text-sm">{format(new Date(member.joinDate), "yyyy")}</span>
                 </div>
              </div>

              <Link
                href="/socios/beneficios"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
              >
                <Gift size={18} className="group-hover:rotate-12 transition-transform" />
                <span>Beneficios Socios</span>
              </Link>
           </div>
         </div>
      </section>


      {/* 2. Carnet Digital Plegable ("Ver Carnet") */}
      <SocioCarnetToggle 
        member={member} 
        awards={[]} 
        attendedMilongas={attendedMilongas}
        calculatedStatus={calculatedStatus}
      />

      <SocioAgendaSection
        filteredEvents={filteredEvents}
        registrations={registrations}
        member={member}
      />

      {/* 3. Control de Morosidad y Pago de Cuotas (Solo si registra deuda) */}
      {debtData.total > 0 && (
        <section id="pagar" className="scroll-mt-24">
          <SocioDuesPaymentSection
            memberId={member.id}
            debtMonths={debtData.months}
            totalDebt={debtData.total}
            calculatedStatus={calculatedStatus}
          />
        </section>
      )}

      {/* 4. Novedades & Comunicados CAT */}
      <SocioNovedadesSection novedades={novedadesForSocio} />

      <SocioCommunicationsSection communications={communicationsForSocio} />

      {/* Legacy agenda markup retained temporarily while the extracted responsive section is validated. */}
      {false && (
      <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[48px] backdrop-blur-md shadow-2xl space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                  <Calendar size={24} className="text-amber-500" /> Agenda Tanguera
               </h2>
               <p className="text-xs text-zinc-400 mt-1">
                  Eventos programados para lo que queda del mes y el próximo mes
               </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-1.5">
               <ShieldCheck size={14} /> Beneficio Socio Activo
            </span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length === 0 ? (
               <div className="col-span-full py-16 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                  <Sparkles size={32} className="mx-auto text-zinc-600 mb-3" />
                  <p className="text-zinc-500 font-bold uppercase italic tracking-widest text-sm">No hay eventos programados para este período</p>
                  <p className="text-zinc-600 text-xs mt-1">Pronto publicaremos nuevas milongas y actividades.</p>
               </div>
            ) : (
               filteredEvents.map(event => {
                  const registration = registrations.find(r => r.eventId === event.id)

                  const getTypeBadgeStyles = (typeStr: string) => {
                     const t = (typeStr || "").toUpperCase()
                     if (t.includes("DIFUSIÓN") || t.includes("DIFUSION") || t.includes("EXTERNO")) return "bg-purple-600/90 text-white border-purple-400/40 font-black shadow-purple-900/30"
                     if (t === "MILONGA") return "bg-red-500/80 text-white border-red-400/30"
                     if (t === "CLASE") return "bg-cyan-500/80 text-white border-cyan-400/30"
                     if (t === "WORKSHOP" || t === "SEMINARIO") return "bg-purple-500/80 text-white border-purple-400/30"
                     if (t === "CAMPEONATO" || t === "COMPETENCIA") return "bg-amber-500/90 text-zinc-950 font-black border-amber-300/50"
                     if (t === "CONCIERTO") return "bg-emerald-500/80 text-white border-emerald-400/30"
                     return "bg-blue-500/80 text-white border-blue-400/30"
                  }

                  const rawLoc = event.location || event.milongaLocation || "Sede Central CAT"
                  const isUrl = rawLoc.startsWith("http://") || rawLoc.startsWith("https://")
                  const mapUrl = event.milongaMapsUrl || (isUrl ? rawLoc : null)
                  const displayLocation = isUrl ? "Sede Central CAT" : rawLoc

                  const eventTags = (event.type || "MILONGA").split(",").map(t => t.trim()).filter(Boolean)

                  return (
                     <div key={event.id} className="relative group bg-zinc-950/60 rounded-[32px] overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-lg">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-all z-20" />
                        
                        <div>
                           {/* Miniatura del Flyer del Evento */}
                           <div className="relative w-full h-48 overflow-hidden bg-zinc-900 border-b border-white/10 group-hover:border-amber-500/20 transition-colors">
                              {event.eventBanner ? (
                                 <img 
                                    src={event.eventBanner} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                                 />
                              ) : (
                                 <div className="w-full h-full bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 flex items-center justify-center">
                                    <Music className="w-10 h-10 text-zinc-700" />
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                              
                              {/* Fecha sobrepuesta en el flyer */}
                              <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-right shadow-xl">
                                 <p className="text-xl font-black text-white leading-none">{format(event.computedDate, "dd")}</p>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{format(event.computedDate, "MMMM", { locale: es })}</p>
                              </div>

                              {/* Badges de tipo sobrepuestos */}
                              <div className="absolute top-3 left-3 flex flex-wrap items-start gap-1.5 z-10 max-w-[68%]">
                                 {eventTags.map((tag, idx) => (
                                    <span key={idx} className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg backdrop-blur-md border ${getTypeBadgeStyles(tag)} shadow-md`}>
                                       {tag}
                                    </span>
                                 ))}
                                 {event.isRecurring && (
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                                       <Repeat size={10} /> Todos los {getDayName(event.recurrenceDay)}
                                    </span>
                                 )}
                              </div>
                           </div>

                           <div className="p-6 space-y-4">
                              <h4 className="text-white font-black text-lg tracking-tighter uppercase leading-tight group-hover:text-amber-500 transition-colors line-clamp-2">
                                {event.title}
                              </h4>

                              <div className="space-y-2">
                                 {mapUrl ? (
                                    <a 
                                       href={mapUrl} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors group/loc"
                                    >
                                       <MapPin size={14} className="text-amber-500 shrink-0 group-hover/loc:scale-110 transition-transform" />
                                       <span className="text-xs font-medium tracking-tight truncate underline underline-offset-2 decoration-amber-500/40">{displayLocation}</span>
                                    </a>
                                 ) : (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                       <MapPin size={14} className="text-amber-500 shrink-0" />
                                       <span className="text-xs font-medium tracking-tight truncate">{displayLocation}</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* Acciones del Evento */}
                        <div className="p-6 pt-0">
                           {isExternalEvent(event) ? (
                              <SocioExternalEventModal event={event} />
                           ) : (
                              <SocioEventRegisterModal 
                                 event={event} 
                                 member={member} 
                                 registration={registration} 
                              />
                           )}
                        </div>
                     </div>
                  )
               })
            )}

            {/* Banner Tarjeta para ver Calendario Anual Completo */}
            <div className="col-span-full mt-4 p-8 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
               <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="relative z-10 space-y-1 text-center md:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                     Agenda Anual CAT
                  </span>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight pt-2">
                     ¿Querés consultar los eventos programados para el resto del año?
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xl">
                     Accedé al calendario completo de milongas, seminarios, conciertos y campeonatos del Centro Amigos del Tango.
                  </p>
               </div>
               <a 
                  href="/eventos" 
                  className="relative z-10 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:scale-105 shrink-0 flex items-center gap-2"
               >
                  Ver Calendario Anual Completo →
               </a>
            </div>
         </div>
      </div>
      )}

      {/* 5. Historial de Pagos y Ficha de Socio en Desplegables */}
      <section id="pagos" className="scroll-mt-24">
        <SocioAccordionSections member={member} isAlDia={isAlDia} />
      </section>

    </div>
  )
}
