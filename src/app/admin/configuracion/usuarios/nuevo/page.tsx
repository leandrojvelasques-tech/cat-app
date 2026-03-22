import { createUser } from "@/app/actions/user"
import Link from "next/link"
import { ArrowLeft, Save, UserPlus } from "lucide-react"

export default function NuevoUsuarioPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/configuracion"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-3xl font-semibold tracking-tight text-white/90">Agregar Usuario</h1>
           <p className="text-zinc-400 mt-1">Crea un nuevo acceso al sistema para la Comisión Directiva.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <form action={createUser} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
              <input 
                name="name"
                required
                placeholder="Ej. Juan Pérez"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Correo Electrónico (Email)</label>
              <input 
                name="email"
                type="email"
                required
                placeholder="juan@centroamigosdeltango.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Rol del Sistema</label>
              <select 
                name="role"
                defaultValue="BOARD"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
              >
                <option value="BOARD">Comisión Directiva</option>
                <option value="ADMIN">Administrador Principal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Cargo (Opcional)</label>
              <input 
                name="position"
                placeholder="Ej. Vocal Titular"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-400 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Contraseña Temporal</label>
              <input 
                name="password"
                type="password"
                required
                placeholder="Escribe una contraseña segura"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
              />
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
             <Link 
              href="/admin/configuracion"
              className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
             >
              Cancelar
             </Link>
             <button 
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-900/20"
             >
              <UserPlus size={18} />
              Crear Usuario
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
