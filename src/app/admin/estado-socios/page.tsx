import { db } from "@/lib/db"
import { Users } from "lucide-react"
import Link from "next/link"
import { EstadoSociosFilters } from "./EstadoSociosFilters"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"

export default async function EstadoSociosPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string }>
}) {
  const { query = "", sort = "" } = await searchParams
  
  const now = new Date()
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  let membersData = []

  if (query) {
    // Search Mode: Find any member matching the query across the entire DB
    membersData = await db.member.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { memberNumber: { contains: query, mode: 'insensitive' } },
          ...(query.includes(' ') ? [
            {
              AND: [
                { firstName: { contains: query.split(' ')[0], mode: 'insensitive' } },
                { lastName: { contains: query.split(' ')[1], mode: 'insensitive' } }
              ]
            },
            {
              AND: [
                { lastName: { contains: query.split(' ')[0], mode: 'insensitive' } },
                { firstName: { contains: query.split(' ')[1], mode: 'insensitive' } }
              ]
            }
          ] : [])
        ]
      },
      include: {
        fees: {
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
        },
        eventRegistrations: true
      },
      orderBy: { memberNumber: "asc" },
      take: 50 // Limit to avoid massive renders on short queries
    } as any) as any[]
  } else {
    // Default Mode: Find members participating (paid at least one fee from Jan 2026)
    membersData = await db.member.findMany({
      where: {
        fees: {
          some: {
            paymentStatus: "PAID",
            periodYear: { gte: 2026 }
          }
        }
      },
      include: {
        fees: {
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
        },
        eventRegistrations: true
      },
      orderBy: { memberNumber: "asc" }
    } as any) as any[]
  }

  // We still calculate their dynamic status for display purposes
  const filteredMembers = membersData.map((member: any) => {
    return {
      ...member,
      calculatedStatus: calculateMemberStatus(member, now)
    }
  })

  // Calcular resumen
  const totalAlDia = filteredMembers.filter((m: any) => m.calculatedStatus === 'AL DIA').length
  const totalEnMora = filteredMembers.filter((m: any) => m.calculatedStatus === 'EN MORA').length
  const totalInactivos = filteredMembers.filter((m: any) => m.calculatedStatus === 'INACTIVO' || m.calculatedStatus === 'SUSPENDIDO' || m.calculatedStatus === 'BAJA').length

  // Ordenar
  filteredMembers.sort((a: any, b: any) => {
    if (sort === "apellido_asc") return a.lastName.localeCompare(b.lastName)
    if (sort === "apellido_desc") return b.lastName.localeCompare(a.lastName)
    if (sort === "estado_asc") return a.calculatedStatus.localeCompare(b.calculatedStatus)
    if (sort === "estado_desc") return b.calculatedStatus.localeCompare(a.calculatedStatus)
    
    if (sort === "pago_desc" || sort === "pago_asc") {
      const aDate = a.fees[0]?.paymentDate ? new Date(a.fees[0].paymentDate).getTime() : 0
      const bDate = b.fees[0]?.paymentDate ? new Date(b.fees[0].paymentDate).getTime() : 0
      if (sort === "pago_desc") return bDate - aDate
      if (sort === "pago_asc") return aDate - bDate
    }
    return 0
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            Estado de Socios
          </h1>
          <p className="text-zinc-500 mt-1">
            {query 
              ? `Resultados de búsqueda: ${filteredMembers.length} coincidencia(s)`
              : `Socios activos desde 2026: ${filteredMembers.length} persona(s)`}
          </p>
        </div>
        <div className="flex gap-3">
           <Link 
            href="/admin/cobrar"
            className="flex items-center gap-2 bg-gradient-to-tr from-amber-600 to-red-800 text-white px-5 py-2.5 rounded-2xl text-sm font-bold border border-white/5 transition-all shadow-lg shadow-amber-900/20"
          >
            Ir a Caja
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-900/20 border border-emerald-500/20 p-5 rounded-[24px] flex flex-col justify-center items-center">
          <span className="text-3xl font-black text-emerald-400">{totalAlDia}</span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-500/70 mt-1">Socios Al Día</span>
        </div>
        <div className="bg-amber-900/20 border border-amber-500/20 p-5 rounded-[24px] flex flex-col justify-center items-center">
          <span className="text-3xl font-black text-amber-400">{totalEnMora}</span>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500/70 mt-1">En Mora (90 días)</span>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-[24px] flex flex-col justify-center items-center">
          <span className="text-3xl font-black text-zinc-400">{totalInactivos}</span>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-500 mt-1">Inactivos (+90 días)</span>
        </div>
      </div>

      <EstadoSociosFilters />

      <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-5 pl-6 text-xs font-bold uppercase tracking-widest text-zinc-500">Socio</th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500 group">
                  <Link 
                    href={`/admin/estado-socios?query=${query}&sort=${sort === 'estado_asc' ? 'estado_desc' : 'estado_asc'}`}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    Estado Real
                    <span className="text-[10px]">
                      {sort === 'estado_asc' ? '▲' : sort === 'estado_desc' ? '▼' : '↕'}
                    </span>
                  </Link>
                </th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Último Pago</th>
                <th className="py-5 pr-6 text-right text-xs font-bold uppercase tracking-widest text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-zinc-500 italic">
                    {query ? "No se encontraron socios con esa búsqueda." : "No hay socios con pagos registrados desde Enero 2026."}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member: any) => {
                  const calculated = member.calculatedStatus
                  const lastFee = member.fees[0]
                  const lastPaidLabel = lastFee ? `${monthNames[lastFee.periodMonth-1]} ${lastFee.periodYear}` : 'Sin pagos'

                  return (
                    <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-zinc-300 font-black text-xs ring-1 ring-white/10 group-hover:ring-white/20 transition-all shadow-lg overflow-hidden">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <>{member.firstName[0]}{member.lastName[0]}</>
                            )}
                          </div>
                          <div>
                            <p className="text-zinc-100 font-bold group-hover:text-amber-400 transition-colors">{member.lastName}, {member.firstName}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Socio #{member.memberNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg border shadow-sm ${getStatusBadgeStyles(calculated)}`}>
                          {calculated}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 text-sm">{lastPaidLabel}</span>
                          {lastFee?.paymentDate && (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {new Date(lastFee.paymentDate).toLocaleDateString('es-AR')}
                            </span>
                          )}
                          {member.isFamilyDiscount && <span className="text-[9px] text-blue-400 font-black flex items-center gap-1 mt-1 uppercase tracking-tighter"><Users size={10}/> 50% PAREJA</span>}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin/socios/${member.id}`}
                            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                          >
                            Ver ficha
                          </Link>
                          <Link 
                            href={`/admin/socios/${member.id}/pagar?returnTo=/admin/estado-socios`}
                            className="inline-flex items-center gap-1.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-amber-500/20"
                          >
                            Cobrar
                          </Link>
                        </div>
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
