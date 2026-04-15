import { db } from "@/lib/db"
import Link from "next/link"
import { GraduationCap, Users, CalendarDays, Plus, ListChecks, History } from "lucide-react"

export default async function EscuelitaDashboard() {
  const classes = await db.escuelitaClass.findMany({
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: { attendances: true }
      }
    }
  })

  // Get total unique students
  const totalStudents = await db.escuelitaStudent.count()

  const lastClass = classes[0]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white/90">Escuelita CAT</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase">Comunidad</span>
          </div>
          <p className="text-zinc-500 mt-1">Gestión de clases gratuitas de tango, asistencia y estadísticas.</p>
        </div>
        <Link
          href="/admin/escuelita/clases/nueva"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/30 active:scale-95"
        >
          <Plus size={18} /> Registrar Clase
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-white/5 disabled:opacity-0"><Users size={120} /></div>
          <div className="relative">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2"><GraduationCap size={16} className="text-blue-500"/> Última Clase</h3>
            <p className="text-4xl font-bold text-white mt-4">{lastClass?._count.attendances || 0}</p>
            <p className="text-xs text-zinc-500 mt-1">Asistentes el {lastClass ? new Date(lastClass.date).toLocaleDateString('es-ES') : "N/A"}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Users size={16} className="text-emerald-500"/> Alumnos Únicos</h3>
          <p className="text-4xl font-bold text-white mt-4">{totalStudents}</p>
          <p className="text-xs text-zinc-500 mt-1">Personas que pasaron por la escuelita</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2"><History size={16} className="text-amber-500"/> Clases Dictadas</h3>
          <p className="text-4xl font-bold text-white mt-4">{classes.length}</p>
          <p className="text-xs text-zinc-500 mt-1">En el historial</p>
        </div>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
           <h2 className="font-semibold text-white/90 flex items-center gap-2"><ListChecks size={18} className="text-blue-500"/> Historial de Clases</h2>
        </div>
        <div className="overflow-x-auto">
          {classes.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <CalendarDays size={32} className="text-zinc-700 opacity-20" />
               <div className="text-sm font-medium text-zinc-600">No hay clases registradas.</div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Fecha</th>
                  <th className="px-6 py-4 font-bold">Profesores a Cargo</th>
                  <th className="px-6 py-4 font-bold text-center">Asistentes</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {classes.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center border border-blue-500/20">
                          <span className="text-[10px] uppercase font-bold text-blue-500">{new Date(c.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                          <span className="text-sm font-black text-white">{new Date(c.date).getDate()}</span>
                        </div>
                        <div className="text-sm font-medium text-zinc-300">
                          {new Date(c.date).toLocaleDateString('es-ES', { weekday: 'long' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-white/90">{c.teachers}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-blue-400">{c._count.attendances}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link 
                         href={`/admin/escuelita/clases/${c.id}`} 
                         className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                       >
                         Ver Detalle
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
