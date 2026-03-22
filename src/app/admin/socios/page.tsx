import { db } from "@/lib/db"
import { UserPlus, UserCheck, UserX, Clock, Users } from "lucide-react"
import Link from "next/link"
import { SociosFilters } from "./SociosFilters"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string; view?: string }>
}) {
  const { query = "", status = "", view = "active" } = await searchParams
  
  const now = new Date()
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  // Fetch all members with their entire history for accurate calculation
  const membersData = await db.member.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { dni: { contains: query } },
                { email: { contains: query } },
              ],
            }
          : {},
      ],
    },
    include: {
      fees: {
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
      },
      eventRegistrations: true
    },
    orderBy: { memberNumber: "asc" },
  } as any) as any[]

  // Apply final filtering based on our new dynamic status logic
  const filteredMembers = membersData.filter((member: any) => {
    const calculated = calculateMemberStatus(member, now)
    
    // If we are in "Archive" view, only show terminal states
    if (view === "archive") {
       return calculated === 'BAJA'
    }

    // Filter by specific status if requested
    if (status === "ACTIVE") return calculated === 'AL DIA'
    if (status === "DEBTOR") return calculated === 'EN MORA'
    if (status === "INACTIVE") return calculated === 'INACTIVO'
    if (status === "SUSPENDED") return calculated === 'SUSPENDIDO'

    // By default, in "active" view, we show everyone EXCEPT those manually archived or calculated as BAJA
    return calculated !== 'BAJA'
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            {view === "archive" ? "Archivo de Socios" : "Directorio de Socios"}
          </h1>
          <p className="text-zinc-500 mt-1">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'socio encontrado' : 'socios encontrados'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/socios/nuevo"
            className="flex items-center gap-2 bg-white text-zinc-950 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/5"
          >
            <UserPlus size={18} /> Nuevo Socio
          </Link>
          {view !== "archive" && (
             <Link 
              href="/admin/socios?view=archive"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-2xl text-sm font-bold border border-white/5 transition-all"
            >
              Ver Archivo
            </Link>
          )}
          {view === "archive" && (
             <Link 
              href="/admin/socios"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-2xl text-sm font-bold border border-white/5 transition-all"
            >
              Volver al Directorio
            </Link>
          )}
        </div>
      </div>

      <SociosFilters />

      <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-5 pl-6 text-xs font-bold uppercase tracking-widest text-zinc-500">Socio</th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">DNI</th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Último Pago</th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Estado</th>
                <th className="py-5 pr-6 text-right text-xs font-bold uppercase tracking-widest text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-500 italic">
                    No se encontraron socios con esos filtros.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member: any) => {
                  const calculated = calculateMemberStatus(member, now)
                  const lastFee = member.fees[0]
                  const lastPaidLabel = lastFee ? `${monthNames[lastFee.periodMonth-1]} ${lastFee.periodYear}` : 'Sin pagos'

                  return (
                    <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-zinc-300 font-black text-xs ring-1 ring-white/10 group-hover:ring-white/20 transition-all shadow-lg">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <p className="text-zinc-100 font-bold group-hover:text-amber-400 transition-colors">{member.lastName}, {member.firstName}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Socio #{member.memberNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-400 text-sm font-mono">{member.dni}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 text-sm">{lastPaidLabel}</span>
                          {member.isFamilyDiscount && <span className="text-[9px] text-blue-400 font-black flex items-center gap-1 mt-1 uppercase tracking-tighter"><Users size={10}/> 50% PAREJA</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg border shadow-sm ${getStatusBadgeStyles(calculated)}`}>
                          {calculated}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <Link 
                          href={`/admin/socios/${member.id}`}
                          className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                        >
                          Ver ficha
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
