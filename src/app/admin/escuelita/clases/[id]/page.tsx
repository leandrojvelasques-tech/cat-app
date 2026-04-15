import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Users, Copy, QrCode, Image as ImageIcon, Camera, ArrowLeft } from "lucide-react"
import { uploadClassPhoto } from "@/app/actions/escuelita"

export default async function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const escuelitaClass = await db.escuelitaClass.findUnique({
    where: { id },
    include: {
      attendances: {
        include: { student: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!escuelitaClass) notFound()

  // Host URL to create full copy-pasteable link
  const publicAttendanceLink = `/escuelita/${escuelitaClass.id}/asistencia`

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/escuelita" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white/90">Clase del {new Date(escuelitaClass.date).toLocaleDateString('es-ES')}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase">Escuelita</span>
            </div>
            <p className="text-zinc-500 mt-1 flex items-center gap-2">
              <Users size={14} className="text-zinc-500" /> Profesores: <span className="text-zinc-300 font-medium">{escuelitaClass.teachers}</span>
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          <Link 
            href={publicAttendanceLink}
            target="_blank"
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2.5 rounded-xl font-medium transition-all text-sm border border-blue-500/30"
          >
            <QrCode size={16} /> Abrir Toma de Asistencia
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h2 className="font-semibold text-white/90">Asistentes ({escuelitaClass.attendances.length})</h2>
               <div className="text-xs text-zinc-500 uppercase font-black tracking-widest">Orden de llegada</div>
            </div>
            
            <div className="overflow-x-auto">
              {escuelitaClass.attendances.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                   <Users size={32} className="text-zinc-700 opacity-20" />
                   <div className="text-sm font-medium text-zinc-600">Nadie ha registrado asistencia aún.</div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                      <th className="px-6 py-4 font-bold">DNI</th>
                      <th className="px-6 py-4 font-bold">Nombre Completo</th>
                      <th className="px-6 py-4 font-bold text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {escuelitaClass.attendances.map(a => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                           <span className="text-xs font-mono text-zinc-400">{a.student.dni}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-sm font-semibold text-white/90 uppercase">{a.student.lastName}, {a.student.firstName}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex flex-col items-end">
                              {a.student.phone && <span className="text-xs text-zinc-300">{a.student.phone}</span>}
                              {a.student.email && <span className="text-[10px] text-zinc-500">{a.student.email}</span>}
                              {!a.student.phone && !a.student.email && <span className="text-xs text-zinc-600">-</span>}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info & Photo */}
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="font-semibold text-blue-500 text-sm uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
              <Camera size={14}/> Foto Grupal Requerida
            </h2>
            
            <div className="mt-4">
               {escuelitaClass.photoUrl ? (
                 <div className="space-y-3">
                   <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 relative group">
                     <img src={escuelitaClass.photoUrl} alt="Clase de Escuelita" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <span className="text-white text-xs font-bold uppercase tracking-widest">Cambiar Foto</span>
                     </div>
                   </div>
                   <form action={uploadClassPhoto} className="flex gap-2">
                     <input type="hidden" name="classId" value={escuelitaClass.id} />
                     <input type="url" name="photoUrl" placeholder="Nueva URL de imagen..." required className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500/50 outline-none" />
                     <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">Actualizar</button>
                   </form>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="w-full aspect-video bg-white/5 rounded-xl border border-white/10 border-dashed flex flex-col items-center justify-center text-zinc-500 gap-2">
                      <ImageIcon size={24} className="opacity-50" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Sin foto cargada</span>
                   </div>
                   <form action={uploadClassPhoto} className="space-y-2">
                     <input type="hidden" name="classId" value={escuelitaClass.id} />
                     <input type="url" name="photoUrl" placeholder="https://ejemplo.com/foto.jpg" required className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none" />
                     <button type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600/90 hover:bg-blue-500 text-white px-3 py-2.5 rounded-lg text-xs font-semibold transition-all">
                       <Camera size={14} /> Guardar Foto
                     </button>
                   </form>
                   <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                     Esta foto es importante para adjuntar en los reportes mensuales de actividades para la municipalidad. Pega la URL de Drive o Imgur aquí.
                   </p>
                 </div>
               )}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
