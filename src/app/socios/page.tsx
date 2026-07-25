import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Calendar, MapPin, User, AlertCircle, Sparkles, ShieldCheck, Repeat, Music } from "lucide-react"
import { DigitalMemberCard } from "./DigitalMemberCard"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { EditProfileModal } from "./EditProfileModal"
import { SocioAccordionSections } from "./SocioAccordionSections"
import { SocioEventRegisterModal } from "./SocioEventRegisterModal"
import { getSocioEventRegistrations } from "@/app/actions/eventos"
import { getNextEventDate, getDayName } from "@/lib/event-utils"

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

  // Fetch all open events and compute next occurrence date for recurring ones
  const allEvents = await db.event.findMany({
    where: { status: "OPEN" },
    include: { classes: { orderBy: { order: "asc" } } }
  })

  const nextEvents = allEvents
    .map(evt => ({
      ...evt,
      computedDate: getNextEventDate(evt, now)
    }))
    .filter(evt => evt.computedDate >= new Date(now.setHours(0, 0, 0, 0)) || evt.isRecurring)
    .sort((a, b) => a.computedDate.getTime() - b.computedDate.getTime())
    .slice(0, 6)

  // Fetch member's event registrations
  const registrations = await getSocioEventRegistrations(member.id)

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. Header */}
      <div className="grid grid-cols-1 gap-10 items-center bg-white/5 p-8 md:p-10 rounded-[48px] border border-white/10 shadow-3xl relative overflow-hidden backdrop-blur-xl">
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
         </div>
      </div>

      {/* 2. Carnet Digital — bloque propio, full-width */}
      <DigitalMemberCard member={member} awards={[]} />

      {/* 2. Prioridad 1: Agenda de Milongas y Eventos (Full Width) */}
      <div className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[48px] backdrop-blur-md shadow-2xl space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                  <Calendar size={24} className="text-amber-500" /> Agenda de Milongas & Eventos
               </h2>
               <p className="text-xs text-zinc-400 mt-1">Reserve su lugar con beneficio exclusivo de Tarifa Socio</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-1.5">
               <ShieldCheck size={14} /> Beneficio Socio Activo
            </span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nextEvents.length === 0 ? (
               <div className="col-span-full py-16 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                  <Sparkles size={32} className="mx-auto text-zinc-600 mb-3" />
                  <p className="text-zinc-500 font-bold uppercase italic tracking-widest text-sm">No hay eventos programados en este momento</p>
                  <p className="text-zinc-600 text-xs mt-1">Pronto publicaremos nuevas milongas y actividades para socios.</p>
               </div>
            ) : (
               nextEvents.map(event => {
                  const registration = registrations.find(r => r.eventId === event.id)
                  const priceSocio = event.priceSocioMilonga || 0

                  // Helper visual para etiquetas configurables
                  const getTypeBadgeStyles = (typeStr: string) => {
                     const t = (typeStr || "").toUpperCase()
                     if (t === "MILONGA") return "bg-red-500/80 text-white border-red-400/30"
                     if (t === "CLASE") return "bg-cyan-500/80 text-white border-cyan-400/30"
                     if (t === "WORKSHOP" || t === "SEMINARIO") return "bg-purple-500/80 text-white border-purple-400/30"
                     if (t === "CAMPEONATO" || t === "COMPETENCIA") return "bg-amber-500/90 text-zinc-950 font-black border-amber-300/50"
                     if (t === "CONCIERTO") return "bg-emerald-500/80 text-white border-emerald-400/30"
                     return "bg-blue-500/80 text-white border-blue-400/30"
                  }

                  // Limpieza y formateo de la ubicación (priorizando la dirección escrita en Información General)
                  const rawLoc = event.location || event.milongaLocation || "Sede Central CAT"
                  const isUrl = rawLoc.startsWith("http://") || rawLoc.startsWith("https://")
                  const mapUrl = event.milongaMapsUrl || (isUrl ? rawLoc : null)
                  const displayLocation = isUrl ? "Sede Central CAT" : rawLoc

                  // Arreglo de múltiples etiquetas
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

                              {/* Badges de tipo sobrepuestos (Múltiples Etiquetas) */}
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
                                 {/* Ubicación del Evento */}
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
                           <SocioEventRegisterModal 
                              event={event} 
                              member={member} 
                              registration={registration} 
                           />
                        </div>
                     </div>
                  )
               })
            )}
         </div>
      </div>

      {/* 3. Prioridad 2: Accesos Informativos y Administrativos (Cuotas, Datos, Gestión) en Desplegables */}
      <SocioAccordionSections member={member} isAlDia={isAlDia} />

    </div>
  )
}
