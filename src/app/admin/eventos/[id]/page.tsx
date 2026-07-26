import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Music, Users, Headphones, User, ArrowLeft, Plus, DollarSign, Clock, LayoutDashboard, Copy, Trash2, CheckCircle2, XCircle, Edit, ShoppingBag, Wallet, BookOpen, ExternalLink } from "lucide-react"
import Link from "next/link"
import { RegistrationModal } from "../components/RegistrationModal"
import { EventDetailsClient } from "./EventDetailsClient"
import { DeleteEventButton } from "../components/DeleteEventButton"
import { ApproveRegistrationButton } from "../components/ApproveRegistrationButton"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await db.event.findUnique({
    where: { id },
    include: { 
      classes: {
        orderBy: { order: 'asc' }
      },
      registrations: {
        orderBy: { createdAt: 'desc' },
        include: { member: true }
      },
      buffetCashRegister: true
    }
  })

  if (!event) notFound()

  const pendingApprovalsCount = event.registrations.filter(r => r.paymentStatus !== "PAID" || !!r.paymentProof).length

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {pendingApprovalsCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Se requiere aprobación</h4>
              <p className="text-xs text-zinc-300">Hay <strong>{pendingApprovalsCount}</strong> inscripción(es) o comprobante(s) pendiente(s) de aprobación para este evento.</p>
            </div>
          </div>
        </div>
      )}

      {event.eventBanner && (
        <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-4 group">
          <img 
            src={event.eventBanner} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  event.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-white/10"
                }`}>
                  {event.status === "OPEN" ? "ABIERTO" : "FINALIZADO"}
                </span>
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-widest">{new Date(event.startDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg">{event.title}</h1>
              <p className="text-zinc-300 mt-2 flex items-center gap-4 text-sm font-medium">
                 <span className="flex items-center gap-1.5"><User size={14} className="text-amber-500" /> {event.organizer}</span>
                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-zinc-400" /> {event.location}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <Link 
                  href={`/admin/eventos/${event.id}/editar`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-white/10"
               >
                  <Edit size={16} /> Editar
               </Link>
               <Link
                  href={`/admin/eventos/${event.id}/buffet`}
                  className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-md text-purple-300 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-purple-500/20"
               >
                  <ShoppingBag size={16} /> Buffet
               </Link>
               <Link
                  href={`/admin/eventos/${event.id}/caja`}
                  className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md text-emerald-300 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-emerald-500/20"
               >
                  <Wallet size={16} /> Rendición de Caja
               </Link>
               <EventDetailsClient event={event} />
               <DeleteEventButton 
                  eventId={event.id}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20 backdrop-blur-md"
               />
            </div>
          </div>
        </div>
      )}

      {!event.eventBanner && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/eventos" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-semibold tracking-tight text-white/90">{event.title}</h1>
                 <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                    event.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-white/10"
                  }`}>
                    {event.status === "OPEN" ? "ABIERTO" : "FINALIZADO"}
                  </span>
              </div>
              <p className="text-zinc-500 mt-1 flex items-center gap-4 text-sm">
                 <span className="flex items-center gap-1.5"><User size={14} className="text-amber-500/50" /> {event.organizer}</span>
                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-zinc-600" /> {event.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Link 
                href={`/admin/eventos/${event.id}/editar`}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-white/5"
             >
                <Edit size={16} /> Editar
             </Link>
             <Link
                href={`/admin/eventos/${event.id}/buffet`}
                className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-purple-500/20"
             >
                <ShoppingBag size={16} /> Buffet
             </Link>
             <Link
                href={`/admin/eventos/${event.id}/caja`}
                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-emerald-500/20"
             >
                <Wallet size={16} /> Rendición de Caja
             </Link>
             <EventDetailsClient event={event} />
             <DeleteEventButton 
                eventId={event.id}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
             />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* List of Classes if present */}
          {event.hasClasses && event.classes && event.classes.length > 0 && (
            <section className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h2 className="font-semibold text-cyan-400 text-sm uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={16} /> Temario de Capacitación ({event.classes.length} clases)
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {event.classes.map((cls, idx) => (
                  <div key={cls.id || idx} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white">{cls.title}</h4>
                        {(cls.startTime || cls.endTime) && (
                          <span className="text-[10px] text-cyan-400/80 font-medium">
                            {cls.startTime} {cls.endTime ? `a ${cls.endTime}` : ''} hs
                          </span>
                        )}
                      </div>
                      {cls.description && <p className="text-xs text-zinc-400">{cls.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* List of Attendees */}
          <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h2 className="font-semibold text-white/90">Asistencia / Inscriptos</h2>
               <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
                  <span className="text-zinc-600">Total: <span className="text-white">{event.registrations.length}</span></span>
                  <span className="text-emerald-500/50">Recaudación: <span className="text-emerald-400">${event.registrations.reduce((acc, r) => acc + r.amountPaid, 0).toLocaleString()}</span></span>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              {event.registrations.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                   <Users size={32} className="text-zinc-700 opacity-20" />
                   <div className="text-sm font-medium text-zinc-600">No hay entradas cobradas aún.</div>
                   <Link href={`/admin/cobrar?eventId=${event.id}`} className="mt-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all">
                      Cobrar Primera Entrada
                   </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                      <th className="px-6 py-4 font-bold">Asistente</th>
                      <th className="px-6 py-4 font-bold">Tipo</th>
                      <th className="px-6 py-4 font-bold">Pago</th>
                      <th className="px-6 py-4 font-bold text-center">Acción / Comprobante</th>
                      <th className="px-6 py-4 font-bold text-right">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {event.registrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${reg.memberId ? "bg-amber-600/10 text-amber-500" : "bg-zinc-800 text-zinc-500"}`}>
                                 {reg.firstName[0]}{reg.lastName[0]}
                              </div>
                              <div>
                                 <div className="text-sm font-semibold text-white/90">{reg.firstName} {reg.lastName}</div>
                                 <div className="text-[10px] text-zinc-500 uppercase font-medium">{reg.dni || "S/DNI"} {reg.memberId && "• SOCIO"}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            {reg.registrationType || "MILONGA"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                 {reg.paymentStatus === 'PAID' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-amber-500" />}
                                 <span className="text-xs font-bold text-white/80">${reg.amountPaid.toLocaleString()}</span>
                              </div>
                              <span className="text-[9px] text-zinc-600 uppercase font-medium">{reg.paymentMethod || "Efectivo"}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ApproveRegistrationButton
                            registrationId={reg.id}
                            eventId={event.id}
                            amount={reg.amountPaid}
                            paymentProof={reg.paymentProof}
                            currentStatus={reg.paymentStatus}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[10px] text-zinc-500 font-bold">{new Date(reg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <h2 className="font-semibold text-amber-500 text-sm uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2"><LayoutDashboard size={14}/> Detalles de Milonga</h2>
              
              <div className="space-y-4">
                 {event.milongaStart && (
                   <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-4">
                      <Music className="text-red-400 shrink-0" size={18} />
                      <div>
                         <div className="text-xs font-bold text-red-500/80 uppercase">Horario</div>
                         <div className="text-sm font-medium text-white/90">
                            {new Date(event.milongaStart).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {event.milongaEndTime && ` a ${event.milongaEndTime}`}
                         </div>
                         {event.tangoDJ && (
                           <div className="text-[10px] text-red-400/60 mt-1 flex items-center gap-1">
                              <Headphones size={10} /> DJ: {event.tangoDJ}
                           </div>
                         )}
                         {event.milongaMapsUrl && (
                           <a href={event.milongaMapsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-red-400 hover:underline mt-2 flex items-center gap-1 font-bold">
                             <ExternalLink size={10} /> Google Maps
                           </a>
                         )}
                      </div>
                   </div>
                 )}

                 <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-start gap-4">
                    <ShoppingBag className="text-purple-400 shrink-0" size={18} />
                    <div>
                       <div className="text-xs font-bold text-purple-500/80 uppercase">Buffet</div>
                       <div className="text-sm font-medium text-white/90">
                          {event.buffetCashRegister?.status === 'OPEN' ? "ABIERTO" : "CERRADO / SIN INICIAR"}
                       </div>
                       {event.buffetCashRegister && (
                         <div className="text-[10px] text-purple-400/60 mt-1">
                            Caja inicial: ${event.buffetCashRegister.openingBalance.toLocaleString()}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </section>

           <section className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <h2 className="font-semibold text-emerald-500 text-sm uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2"><DollarSign size={14}/> Tarifario Configurado</h2>
               <div className="mt-4 space-y-4 text-xs">
                  {event.hasMilonga && (
                    <div className="space-y-2 border-b border-white/5 pb-3">
                      <p className="text-[10px] font-bold text-red-400 uppercase">Milonga</p>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Socio:</span>
                        <span className="text-white font-bold">${(event.priceSocioMilonga || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">No Socio:</span>
                        <span className="text-white font-bold">${(event.priceNonSocioMilonga || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {event.hasClasses && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-cyan-400 uppercase">Capacitación ({event.comboTitle || "Combo"})</p>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Combo Socio:</span>
                        <span className="text-amber-400 font-bold">${(event.priceSocioCombo || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Combo No Socio:</span>
                        <span className="text-white font-bold">${(event.priceNonSocioCombo || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Clase Suelta Socio:</span>
                        <span className="text-amber-400 font-bold">${(event.priceSocioClassLoose || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Clase Suelta No Socio:</span>
                        <span className="text-white font-bold">${(event.priceNonSocioClassLoose || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
               </div>
           </section>
        </div>
      </div>
    </div>
  )
}
