import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { addBoardMember, removeBoardMember } from "@/app/actions/comision"
import { ArrowLeft, Crown, ShieldAlert, Trash2, UserCheck, Plus, Calendar, BadgeInfo, Pencil } from "lucide-react"
import Link from "next/link"

export default async function ComisionPage() {
  const session = await auth()
  
  if (
    !session || 
    (session.user.role !== "ADMIN" && 
     session.user.role !== "BOARD" && 
     session.user.role !== "SUPERADMIN")
  ) {
    redirect("/admin")
  }

  // 1. Integrantes actuales de la comisión directiva
  const currentBoard = await db.member.findMany({
    where: { isBoardMember: true },
    orderBy: { lastName: "asc" }
  })

  // 2. Socios elegibles para formar parte (activos y que no estén ya en la CD)
  const eligibleMembers = await db.member.findMany({
    where: { 
      isBoardMember: false,
      status: "ACTIVE"
    },
    orderBy: { lastName: "asc" }
  })

  // 3. Obtener el historial completo
  const boardHistory = await db.boardHistory.findMany({
    include: {
      member: {
        select: { firstName: true, lastName: true, avatarUrl: true, memberNumber: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/configuracion"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Comisión Directiva</h1>
          <p className="text-zinc-400 mt-1">Gestione los cargos institucionales vigentes y el historial de comisiones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Listado de Miembros Activos en la CD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Crown className="text-cat-gold" size={20} />
              <span>Miembros Activos de la CD</span>
            </h2>

            {currentBoard.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 italic">
                No hay miembros asignados a la comisión directiva actualmente.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentBoard.map((member) => (
                  <div 
                    key={member.id}
                    className="bg-black/20 border border-white/5 rounded-2xl p-4 flex justify-between items-center gap-4 hover:border-cat-gold/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/5 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-400 text-xs font-bold">{member.firstName[0]}{member.lastName[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-zinc-200 truncate group-hover:text-cat-gold transition-colors">
                          {member.lastName}, {member.firstName}
                        </span>
                        <span className="text-xs text-cat-gold font-medium mt-0.5">{member.position}</span>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">Socio #{member.memberNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link 
                        href={`/admin/comision/${member.id}/editar`}
                        className="p-2 bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-white rounded-xl border border-amber-500/10 transition-all"
                        title="Editar miembro de la Comisión Directiva"
                      >
                        <Pencil size={16} />
                      </Link>

                      <form action={async () => {
                        "use server"
                        await removeBoardMember(member.id)
                      }}>
                        <button 
                          type="submit"
                          className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/10 transition-all cursor-pointer"
                          title="Remover de la Comisión Directiva"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial Reciente */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Calendar className="text-zinc-400" size={20} />
              <span>Historial Reciente (Últimos Movimientos)</span>
            </h2>

            <div className="space-y-3">
              {boardHistory.map((hist) => (
                <div 
                  key={hist.id} 
                  className="bg-black/10 rounded-xl p-3 border border-white/5 flex justify-between items-center gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/5 bg-zinc-800 flex items-center justify-center text-[10px]">
                      {hist.member.avatarUrl ? (
                        <img src={hist.member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{hist.member.firstName[0]}{hist.member.lastName[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-300">{hist.member.lastName}, {hist.member.firstName} <span className="text-[10px] text-zinc-500 font-normal">#{hist.member.memberNumber}</span></p>
                      <p className="text-zinc-500 font-medium">{hist.position} ({hist.periodStart} - {hist.periodEnd || "Presente"})</p>
                    </div>
                  </div>
                  {hist.notes && (
                    <span className="text-[10px] text-zinc-600 italic truncate max-w-[200px]" title={hist.notes}>
                      {hist.notes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Formulario para Agregar Miembro a la CD */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Plus className="text-cat-gold" size={20} />
              <span>Asignar Integrante</span>
            </h2>

            <form action={addBoardMember} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Socio Activo *</label>
                <select 
                  name="memberId"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cat-gold/50 outline-none appearance-none"
                >
                  <option value="">Seleccione un socio...</option>
                  {eligibleMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.lastName}, {m.firstName} (#{m.memberNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Cargo / Función *</label>
                <select 
                  name="position"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cat-gold/50 outline-none appearance-none cursor-pointer"
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Año de Inicio *</label>
                  <input 
                    name="periodStart"
                    required
                    type="number"
                    defaultValue={new Date().getFullYear()}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cat-gold/50 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Año de Fin</label>
                  <input 
                    name="periodEnd"
                    type="number"
                    placeholder="Opcional"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cat-gold/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Observaciones</label>
                <textarea 
                  name="notes"
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cat-gold/50 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-cat-gold hover:bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-cat-gold/10 mt-4 cursor-pointer"
              >
                Agregar miembro
              </button>
            </form>
          </div>

          <div className="bg-amber-600/10 border border-amber-500/20 rounded-3xl p-5 flex gap-3 text-xs text-zinc-400">
            <BadgeInfo className="text-cat-gold shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">Acceso al Panel</p>
              <p>Al asignar un integrante a la Comisión Directiva, recuerde crearle una cuenta de usuario con rol **BOARD** o **ADMIN** para que pueda acceder y operar el Panel Administrativo.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
