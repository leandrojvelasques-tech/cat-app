import { Calendar, Users } from "lucide-react"
import Link from "next/link"
import { createClass } from "@/app/actions/escuelita"

export default function NuevaClaseEscuelita() {
  const defaultDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format for input

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3">
           <Link href="/admin/escuelita" className="text-zinc-500 hover:text-white transition-colors">Escuelita</Link>
           <span className="text-zinc-700">/</span>
           <span className="text-white">Nueva Clase</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white/90 mt-2">Registrar Clase</h1>
        <p className="text-zinc-400 mt-1">Abre el registro de asistencia para una clase asignando quién está a cargo.</p>
      </div>

      <form action={createClass} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> Fecha de la clase
          </label>
          <input 
            type="date"
            name="date"
            required
            defaultValue={defaultDate}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Users size={14} /> Profesores a cargo
          </label>
          <input 
            type="text"
            name="teachers"
            required
            placeholder="Ej: Nestor Acosta y Liliana Iribarren"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-colors"
          />
          <p className="text-[10px] text-zinc-600 font-medium">Ingresa el/los nombre/s de los profesores que dictan esta clase. Sirve para el reporte municipal.</p>
        </div>

        <div className="pt-4 border-t border-white/5 flex gap-4">
          <Link 
            href="/admin/escuelita" 
            className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-medium transition-colors text-center border border-white/5 hover:border-white/10"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/40 text-center"
          >
            Abrir Clase
          </button>
        </div>
      </form>
    </div>
  )
}
