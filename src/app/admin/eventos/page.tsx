import { db } from "@/lib/db"
import { Calendar, Plus, Users, Music, ShoppingBag, Share2, Tag } from "lucide-react"
import Link from "next/link"

export default async function EventosPage() {
  const events = await db.event.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } }
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Eventos y Milongas</h1>
          <p className="text-zinc-400 mt-1">Gestione milongas, capacitaciones y registros de asistentes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/buffet" 
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-amber-500/30 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg"
          >
            <ShoppingBag size={18} />
            Catálogo Buffet
          </Link>

          <Link 
            href="/admin/eventos/nuevo" 
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-amber-900/20"
          >
            <Plus size={18} />
            Nuevo Evento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-3xl border-dashed">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4 opacity-20" />
            <p className="text-zinc-500 font-medium">No hay eventos programados</p>
            <p className="text-zinc-600 text-sm mt-1 text-balance px-10">
              Comience creando una nueva milonga o capacitación para el CAT.
            </p>
          </div>
        ) : (
          events.map(event => {
            const dateStr = new Date(event.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
            const publicUrl = `https://centroamigosdeltango.com/eventos/${event.id}`
            const waShareText = `💃 *${event.title}* - Centro Amigos del Tango\n🗓️ Fecha: ${dateStr}\n📍 Lugar: ${event.location || 'Sede CAT'}\n\n👉 ¡Inscríbete y reserva tu entrada aquí!\n${publicUrl}`
            const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waShareText)}`

            return (
              <div key={event.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:bg-white/[0.08] transition-all hover:border-white/20 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${
                      event.type === "MILONGA" ? "bg-red-500/10 text-red-400" :
                      event.type === "WORKSHOP" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {event.type === "MILONGA" ? <Music size={24} /> : <Users size={24} />}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isRecurring && (
                        <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider">
                          🔄 RECURRENTE
                        </span>
                      )}
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        event.status === "OPEN" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-white/10"
                      }`}>
                        {event.status === "OPEN" ? "ABIERTO" : "FINALIZADO"}
                      </span>
                    </div>
                  </div>

                  {event.eventBanner && (
                    <div className="relative w-full aspect-[4/5] max-h-56 overflow-hidden rounded-2xl mb-4 border border-white/5 bg-zinc-800">
                      <img src={event.eventBanner} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="text-xl font-semibold text-white/90 mb-1 group-hover:text-amber-500 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{event.description || "Sin descripción"}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                      <Calendar size={14} className="text-amber-500" />
                      {dateStr}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`}
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-zinc-600" />
                        <span className="text-white font-medium">{event._count.registrations}</span> inscritos
                      </div>
                      {event.hasEarlyBird && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          <Tag size={12} />
                          <span>Venta Anticipada</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <a 
                    href={waShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
                  >
                    <Share2 size={14} />
                    Compartir en WhatsApp
                  </a>

                  <Link 
                    href={`/admin/eventos/${event.id}`}
                    className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors border border-white/5"
                  >
                    Gestionar Evento
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
