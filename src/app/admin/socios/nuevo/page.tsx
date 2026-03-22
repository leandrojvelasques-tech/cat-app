import { createMember } from "@/app/actions/socios"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NuevoSocioPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/socios"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Nuevo Socio</h1>
          <p className="text-zinc-400 mt-1">Registre un nuevo miembro en el padrón institucional.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <form action={createMember} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nombre *</label>
              <input 
                name="firstName" 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Apellido *</label>
              <input 
                name="lastName" 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">DNI *</label>
              <input 
                name="dni" 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Estado Inicial</label>
              <select 
                name="status"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors font-light appearance-none"
              >
                <option value="ACTIVE">Activo</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
              <input 
                name="email" 
                type="email"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Teléfono</label>
              <input 
                name="phone" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
                placeholder="297 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Fecha de Alta</label>
              <input 
                name="joinDate" 
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors font-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Tipo de Socio</label>
              <select 
                name="type"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors font-light appearance-none"
              >
                <option value="ACTIVO">Socio Activo</option>
                <option value="HONORARIO">Socio Honorario</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Fecha de Nacimiento</label>
              <input 
                name="birthDate" 
                type="date"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors font-light"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Ciudad</label>
              <input 
                name="city" 
                defaultValue="Comodoro Rivadavia"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Comentarios / Notas</label>
            <textarea 
              name="notes" 
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
              placeholder="Alguna observación relevante..."
            />
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
            <input 
              id="wantsMailing"
              name="wantsMailing"
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded-md border-white/10 bg-black/20 text-amber-600 focus:ring-amber-500/50"
            />
            <label htmlFor="wantsMailing" className="text-sm text-zinc-300 cursor-pointer">
              Desea recibir Mailing con novedades sobre el Centro Amigos del Tango
            </label>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link 
              href="/admin/socios"
              className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-900/20"
            >
              <Save size={18} />
              Guardar Socio
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
