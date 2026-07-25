import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { updateUser } from "@/app/actions/users"
import { ArrowLeft, Save, ShieldCheck, Mail, Crown, User } from "lucide-react"
import Link from "next/link"
import { ResetUserPasswordForm } from "./ResetUserPasswordForm"

export default async function EditarUsuarioPage(props: any) {
  const session = await auth()
  
  if (
    !session || 
    (session.user.role !== "ADMIN" && 
     session.user.role !== "SUPERADMIN")
  ) {
    redirect("/admin")
  }

  const params = await props.params
  const id = params?.id
  
  if (!id) return notFound()

  const user = await db.user.findUnique({
    where: { id },
    include: { member: true }
  })

  if (!user) return notFound()

  // Active members who are either not linked to any user, or linked to this user
  const eligibleMembers = await db.member.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: id }
      ],
      status: "ACTIVE"
    },
    orderBy: { lastName: "asc" }
  })

  const updateUserWithId = updateUser.bind(null, id)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-20 mt-10">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/configuracion"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Editar Usuario del Sistema</h1>
          <p className="text-zinc-400 mt-1">Gestione el perfil, rol del sistema, cargo y la vinculación con la ficha de socio.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <form action={updateUserWithId} className="flex flex-col gap-8">
          
          {/* User Icon & Header */}
          <div className="flex flex-col items-center pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
              <User size={36} />
            </div>
            <h2 className="text-xl font-bold text-white">{user.name || user.email.split("@")[0]}</h2>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">
              Usuario ID: {user.id}
            </span>
          </div>

          {/* General Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-cat-gold flex items-center gap-2 border-b border-white/5 pb-2">
              <User size={16} />
              <span>Datos del Usuario</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Nombre Completo *</label>
                <input 
                  type="text"
                  name="name" 
                  defaultValue={user.name || ""}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Correo Electrónico (Email) *</label>
                <input 
                  type="email"
                  name="email" 
                  defaultValue={user.email}
                  required
                  placeholder="Ej. usuario@centroamigosdeltango.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light text-sm"
                />
              </div>
            </div>
          </div>

          {/* Role and Position Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-cat-gold flex items-center gap-2 border-b border-white/5 pb-2">
              <Crown size={16} />
              <span>Rol y Cargo en la CD</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Rol de Sistema *</label>
                <select 
                  name="role" 
                  defaultValue={user.role}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors font-light text-sm appearance-none cursor-pointer"
                >
                  <option value="BOARD">Comisión Directiva (BOARD)</option>
                  <option value="ADMIN">Administrador Principal (ADMIN)</option>
                  {user.role === "SUPERADMIN" && (
                    <option value="SUPERADMIN">Super Admin (SUPERADMIN)</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Cargo / Función (Comisión Directiva)</label>
                <select 
                  name="position" 
                  defaultValue={user.position || ""}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors font-light text-sm appearance-none cursor-pointer"
                >
                  <option value="">Ninguno / Sin cargo asignado</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Vicepresidente">Vicepresidente</option>
                  <option value="Vice Presidente">Vice Presidente</option>
                  <option value="Secretario">Secretario</option>
                  <option value="Secretaria">Secretaria</option>
                  <option value="Tesorero">Tesorero</option>
                  <option value="Primer Vocal">Primer Vocal</option>
                  <option value="1er Vocal">1er Vocal</option>
                  <option value="Segundo Vocal">Segundo Vocal</option>
                  <option value="2do Vocal">2do Vocal</option>
                  <option value="Tercer Vocal">Tercer Vocal</option>
                  <option value="3er Vocal">3er Vocal</option>
                  <option value="1er Vocal Suplente">1er Vocal Suplente</option>
                  <option value="2do Vocal Suplente">2do Vocal Suplente</option>
                  <option value="Vocal">Vocal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Member Linking Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-cat-gold flex items-center gap-2 border-b border-white/5 pb-2">
              <ShieldCheck size={16} />
              <span>Vinculación con Ficha de Socio (Socio Link)</span>
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Socio Vinculado</label>
              <select 
                name="memberId" 
                defaultValue={user.member?.id || ""}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors font-light text-sm appearance-none cursor-pointer"
              >
                <option value="">Sin vincular / Desvincular de ficha de socio</option>
                {eligibleMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.lastName}, {m.firstName} (#{m.memberNumber}) - DNI {m.dni}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 italic mt-1">
                * Nota: Si vincula este usuario a un socio, los datos de Comisión Directiva (cargo y estado) se sincronizarán automáticamente con su ficha de socio.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link 
              href="/admin/configuracion"
              className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-300">Cambiar Contraseña de Acceso</h3>
          </div>
          <ResetUserPasswordForm userId={user.id} />
        </div>

      </div>
    </div>
  )
}
