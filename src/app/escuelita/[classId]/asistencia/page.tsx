import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { AttendanceClient } from "./AttendanceClient"
import Image from "next/image"

export default async function PublicAttendancePage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  
  const escuelitaClass = await db.escuelitaClass.findUnique({
    where: { id: classId }
  })

  if (!escuelitaClass) notFound()

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative z-10 shadow-2xl shadow-blue-900/10">
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-4">
             <span className="text-2xl font-black text-blue-500">C</span>
           </div>
           <h1 className="text-2xl font-bold text-white text-center">Escuelita CAT</h1>
           <p className="text-sm text-zinc-500 mt-1 text-center">Registro de asistencia a clase gratuita</p>
           <div className="mt-4 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-zinc-300">
             {new Date(escuelitaClass.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
           </div>
        </div>

        <AttendanceClient classId={classId} />
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Centro Amigos del Tango</p>
           <p className="text-xs text-zinc-500 mt-1">Prof: {escuelitaClass.teachers}</p>
        </div>
      </div>
    </div>
  )
}
