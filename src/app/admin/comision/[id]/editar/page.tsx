import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { updateBoardMember, createAndLinkBoardUser } from "@/app/actions/comision"
import { ArrowLeft, Save, UserCheck, Key, ShieldCheck, Mail, Phone, Crown, Pencil } from "lucide-react"
import Link from "next/link"
import { AvatarFormInput } from "@/components/AvatarFormInput"
import { ResetMemberPasswordForm } from "@/app/admin/socios/components/ResetMemberPasswordForm"

export default async function EditarComisionPage(props: any) {
  const session = await auth()
  
  if (
    !session || 
    (session.user.role !== "ADMIN" && 
     session.user.role !== "BOARD" && 
     session.user.role !== "SUPERADMIN")
  ) {
    redirect("/admin")
  }

  const params = await props.params
  const id = params?.id
  
  if (!id) return notFound()

  const member = await db.member.findUnique({
    where: { id },
    include: {
      boardHistory: {
        orderBy: { createdAt: "desc" }
      },
      user: {
        select: {
          id: true,
          email: true,
          role: true
        }
      }
    }
  })

  if (!member || !member.isBoardMember) return notFound()

  // Obtener historial activo o el más reciente
  let activeHistory = member.boardHistory.find(h => h.periodEnd === null)
  if (!activeHistory && member.boardHistory.length > 0) {
    activeHistory = member.boardHistory[0]
  }

  const updateBoardMemberWithId = updateBoardMember.bind(null, id)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/comision"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Editar Miembro de Comisión</h1>
          <p className="text-zinc-400 mt-1">Gestione los detalles institucionales, de contacto y accesos del directivo.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <form action={updateBoardMemberWithId} className="flex flex-col gap-8">
          
          {/* Avatar Selection & General Info */}
          <div className="flex flex-col items-center pb-6 border-b border-white/5">
            <AvatarFormInput defaultValue={member.avatarUrl} />
            <h2 className="text-xl font-bold text-white mt-4">{member.lastName}, {member.firstName}</h2>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">
              Socio #{member.memberNumber} | DNI {member.dni}
            </span>
          </div>

          {/* Contact Data Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-cat-gold flex items-center gap-2 border-b border-white/5 pb-2">
              <Mail size={16} />
              <span>Datos del Socio (Perfil de Contacto)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
                <input 
                  type="email"
                  name="email" 
                  defaultValue={member.email || ""}
                  placeholder="Ej. directivo@cat.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cat-gold/50 transition-colors font-light text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                <input 
                  type="text"
                  name="phone" 
                  defaultValue={member.phone || ""}
                  placeholder="Ej. +54 9 11 1234-5678"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cat-gold/50 transition-colors font-light text-sm"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 italic">
              * Nota: Al modificar el correo y teléfono aquí, se actualizarán directamente en la ficha del Socio.
            </p>
          </div>

          {/* Board Position details */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-cat-gold flex items-center gap-2 border-b border-white/5 pb-2">
              <Crown size={16} />
              <span>Datos del Cargo & Gestión</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Cargo / Función *</label>
                <select 
                  name="position" 
                  defaultValue={member.position || ""}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-cat-gold/50 transition-colors font-light text-sm appearance-none cursor-pointer"
                >
                  <option value="">Seleccione un cargo...</option>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Año de Inicio *</label>
                  <input 
                    name="periodStart" 
                    type="number"
                    defaultValue={activeHistory?.periodStart || new Date().getFullYear()}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cat-gold/50 transition-colors font-light text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Año de Fin</label>
                  <input 
                    name="periodEnd" 
                    type="number"
                    defaultValue={activeHistory?.periodEnd || ""}
                    placeholder="Opcional"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cat-gold/50 transition-colors font-light text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Observaciones (Historial)</label>
              <textarea 
                name="notes" 
                defaultValue={activeHistory?.notes || ""}
                rows={3}
                placeholder="Detalles sobre el cargo o la gestión..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cat-gold/50 transition-colors font-light text-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <Link 
              href="/admin/comision"
              className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-cat-gold hover:bg-amber-500 text-zinc-950 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cat-gold/10"
            >
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* Portal Access Control Section */}
        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-300">Cuenta de Acceso al Panel</h3>
          </div>

          {member.user ? (
            <div className="space-y-4 bg-black/20 border border-white/5 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-black tracking-wider">Email de Acceso</p>
                  <p className="text-sm font-bold text-white mt-1">{member.user.email}</p>
                </div>
                <div className="flex gap-1.5 items-center bg-amber-600/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-lg text-xs">
                  <ShieldCheck size={14} />
                  <span className="uppercase font-bold tracking-wider">{member.user.role}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-400 mb-3 font-semibold">Cambiar contraseña de esta cuenta:</p>
                <ResetMemberPasswordForm memberId={member.id} hasPortalAccess={true} />
              </div>
            </div>
          ) : (
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-3 text-amber-500 text-xs font-semibold">
                <ShieldCheck size={18} className="shrink-0" />
                <p>Este directivo no posee una cuenta de acceso al Panel Administrativo vinculada.</p>
              </div>
              
              {member.email ? (
                <form action={createAndLinkBoardUser} className="space-y-3 pt-2">
                  <input type="hidden" name="memberId" value={member.id} />
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Email de Acceso (Heredado del socio)</label>
                    <input 
                      type="text" 
                      disabled
                      value={member.email}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Contraseña Temporal *</label>
                    <input 
                      type="password"
                      name="password"
                      required
                      placeholder="Ej. Clave123 (mínimo 6 caracteres)"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cat-gold/50 outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-amber-600/20 text-amber-500 hover:bg-amber-600 hover:text-white border border-amber-500/20 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <UserCheck size={14} />
                    Crear y Vincular Cuenta
                  </button>
                </form>
              ) : (
                <p className="text-xs text-zinc-600 italic">
                  Para poder crearle una cuenta de acceso, primero debe asignarle un Correo Electrónico al socio en los datos de arriba y guardar los cambios.
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
