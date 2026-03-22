import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { CheckCircle2, Calendar, Medal, Trophy, AlertCircle, History, MapPin, User, ArrowRight, Star } from "lucide-react"
import { DigitalMemberCard } from "./DigitalMemberCard"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function PortalSocioPage() {
  const session = await auth()
  if (!session || !session.user) redirect("/login")

  const userWithMember = (await db.user.findUnique({
    where: { id: session.user.id },
    include: { 
      member: { 
        include: { 
          fees: { orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }] },
          championshipResults: { include: { championship: true } },
          boardHistory: { orderBy: { periodStart: 'desc' } }
        } 
      } 
    }
  })) as any

  // If the admin logs into the portal accidentally or a user has no member record yet
  if (!userWithMember?.member) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-white">Padrón de Socio no Encontrado</h2>
        <p className="text-zinc-500">Comuníquese con administración para vincular su cuenta.</p>
      </div>
    )
  }

  const member = userWithMember.member
  const now = new Date()
  const calculatedStatus = calculateMemberStatus(member as any, now)
  const isAlDia = calculatedStatus === 'AL DIA'

  // Upcoming events
  const nextEvents = await db.event.findMany({
    where: { startDate: { gte: now }, status: "OPEN" },
    orderBy: { startDate: "asc" },
    take: 3
  })

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Welcome & Digital Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white/5 p-10 rounded-[48px] border border-white/10 shadow-3xl relative overflow-hidden backdrop-blur-xl">
         <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] -mr-32 -mt-32" />
         
         <div className="relative z-10">
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
              Hola, <span className="text-amber-500 font-black">{member.firstName}</span>
           </h1>
           <p className="text-zinc-400 text-lg mb-8 max-w-sm">
              Bienvenido a su portal personal. Aquí tiene su carnet digital y su historial de logros en la institución.
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

         <DigitalMemberCard member={member} awards={member.championshipResults} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Awards Hall of Fame */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[40px] backdrop-blur-md">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2 mb-8 italic">
                 <Trophy size={14} /> Vientos de Tango
              </h2>
              <div className="flex flex-col gap-4">
                 {member.championshipResults.length === 0 ? (
                   <div className="py-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <Star size={24} className="mx-auto text-white/10 mb-2" />
                      <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest italic">Aún sin logros registrados</p>
                      <p className="text-[9px] text-zinc-800 mt-2 px-6">Participe en nuestros campeonatos para ver sus logros aquí.</p>
                   </div>
                 ) : (
                   member.championshipResults.map((award: any) => (
                     <div key={award.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
                           award.place === 1 ? "bg-amber-500/20 border-amber-500/30 text-amber-500 shadow-amber-500/10" : 
                           award.place === 2 ? "bg-zinc-700/20 border-zinc-700/30 text-zinc-300 shadow-zinc-900" :
                           "bg-orange-900/20 border-orange-900/30 text-orange-800 shadow-orange-900/20"
                        }`}>
                           <Medal size={24} />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm tracking-tight">{award.category}</p>
                           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">Edición {award.championship.year}</p>
                           <p className="text-[10px] text-zinc-400 font-black uppercase mt-1">
                              {award.place === 1 ? "🥇 CAMAPEON" : award.place === 2 ? "🥈 2DO PUESTO" : "🥉 3ER PUESTO"}
                           </p>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* Institution Commitment / Board History */}
           {member.boardHistory?.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-md">
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2 mb-6 italic">
                    <Star size={14} /> Gestión Institucional
                 </h2>
                 <div className="space-y-4">
                    {member.boardHistory.map((history: any) => (
                       <div key={history.id} className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                             <CheckCircle2 size={20} />
                          </div>
                          <div>
                             <p className="text-white font-bold text-sm uppercase">{history.position}</p>
                             <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">
                                Período {history.periodStart}{history.periodEnd ? ` - ${history.periodEnd}` : ''}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Personal Info Box */}
           <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-md">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 mb-6 italic">
                 <User size={14} /> Mis Datos
              </h2>
              <div className="space-y-4">
                 {[
                    { label: "DNI", value: member.dni },
                    { label: "Email", value: member.email || "No registrado" },
                    { label: "Teléfono", value: member.phone || "No registrado" },
                    { label: "Dirección", value: member.address || "No registrado" }
                 ].map((item, i) => (
                    <div key={i} className="flex flex-col border-b border-white/5 pb-3">
                       <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">{item.label}</span>
                       <span className="text-white font-medium text-sm mt-1">{item.value}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Events & Payments */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Agenda / Upcoming Events */}
           <div className="bg-white/5 border border-white/10 p-10 rounded-[48px] backdrop-blur-md shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <Calendar size={24} className="text-zinc-600" /> Agenda de Milongas
                 </h2>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 shadow-inner px-4 py-1.5 rounded-full border border-white/5">Próximos Eventos</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {nextEvents.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-50">
                       <p className="text-zinc-500 font-bold uppercase italic tracking-widest">No hay eventos programados</p>
                    </div>
                 ) : (
                    nextEvents.map(event => (
                       <div key={event.id} className="relative group bg-zinc-950/50 rounded-[32px] overflow-hidden border border-white/5 hover:border-amber-500/20 transition-all p-6">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
                          <div className="flex flex-col h-full">
                             <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                                   event.type === 'MILONGA' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                   {event.type}
                                </span>
                                <div className="text-right">
                                   <p className="text-2xl font-black text-white leading-none">{format(new Date(event.startDate), "dd")}</p>
                                   <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{format(new Date(event.startDate), "MMMM", { locale: es })}</p>
                                </div>
                             </div>
                             <h4 className="text-white font-black text-lg mb-4 tracking-tighter uppercase leading-tight group-hover:text-amber-500 transition-colors line-clamp-2">
                               {event.title}
                             </h4>
                             <div className="mt-auto space-y-2">
                                <div className="flex items-center gap-2 text-zinc-500">
                                   <MapPin size={12} />
                                   <span className="text-[10px] font-bold uppercase tracking-tight">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                   <User size={12} />
                                   <span className="text-[10px] font-bold uppercase tracking-tight">DJ {event.tangoDJ || "A confirmar"}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Cuotas / Payments History */}
           <div className="bg-zinc-900/40 border border-white/10 p-10 rounded-[48px]">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <History size={24} className="text-zinc-600" /> Historial de Cuotas
                 </h2>
                 {!isAlDia && (
                   <span className="bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-red-500/20 animate-bounce">PAGO PENDIENTE</span>
                 )}
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {member.fees.length === 0 ? (
                    <p className="text-center py-20 text-zinc-700 font-bold uppercase tracking-widest italic opacity-50">Sin pagos registrados en el sistema</p>
                 ) : (
                    member.fees.map((fee: any) => (
                       <div key={fee.id} className="flex justify-between items-center p-6 rounded-[28px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                          <div className="flex items-center gap-5">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                                fee.paymentStatus === 'PAID' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                             }`}>
                                <CheckCircle2 size={24} />
                             </div>
                             <div>
                                <p className="text-white font-black text-lg tracking-tight uppercase italic">{format(new Date(2024, fee.periodMonth-1, 1), 'MMMM', { locale: es })} {fee.periodYear}</p>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Pagado el {format(new Date(fee.paymentDate), 'dd/MM/yyyy')}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black text-white tracking-widest mt-1">${fee.amountPaid.toLocaleString()}</p>
                             <div className="flex items-center gap-2 justify-end mt-1">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                                   fee.paymentStatus === 'PAID' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                   {fee.paymentStatus === 'PAID' ? "CONFIRMADO" : "PENDIENTE"}
                                </span>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="text-center md:text-left">
                    <p className="text-zinc-400 text-xs mb-1">¿Necesita asistencia con su cuenta?</p>
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">Comuníquese via WhatsApp a Secretaría</p>
                 </div>
                 <button className="bg-white text-zinc-950 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-white/5 flex items-center gap-2 group">
                    Descargar último recibo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
