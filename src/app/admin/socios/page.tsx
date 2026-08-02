import { db } from "@/lib/db"
import { UserPlus, UserCheck, UserX, Clock, Users } from "lucide-react"
import Link from "next/link"
import { SociosFilters } from "./SociosFilters"
import { calculateMemberStatus, getStatusBadgeStyles, getMemberBajaReason, getBajaReasonStyles, formatDNI } from "@/lib/member-utils"
import { SendMemberAccessButton } from "./components/SendMemberAccessButton"

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string; view?: string; sort?: string }>
}) {
  const { query = "", status = "", view = "active", sort = "num_desc" } = await searchParams
  
  const now = new Date()
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  const BAJA_STATUS_KEYS = ["DECEASED", "RESIGNED", "INACTIVE", "ARCHIVED", "DUPLICATE", "MOROSIDAD", "ADMINISTRATIVE"]

  const viewFilter = view === "honorary"
    ? { type: "HONORARIO", status: { notIn: BAJA_STATUS_KEYS } }
    : view === "archive" 
    ? (status ? (status === "INACTIVE" ? { status: { in: ["INACTIVE", "ARCHIVED", "ADMINISTRATIVE"] } } : { status }) : { status: { in: BAJA_STATUS_KEYS } })
    : view === "all"
    ? (status ? { status } : {})
    : { status: { notIn: BAJA_STATUS_KEYS }, type: { not: "HONORARIO" } }

  // Fetch members according to view
  const membersData = await db.member.findMany({
    where: {
      AND: [
        viewFilter,
        query ? {
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
        } : {}
      ]
    },
    include: {
      fees: {
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
      },
      eventRegistrations: true,
      user: { select: { email: true } }
    }
  } as any) as any[]

  // Apply final filtering based on dynamic status logic
  const filteredMembers = membersData.filter((member: any) => {
    const calculated = calculateMemberStatus(member, now)
    
    if (view === "all") {
      if (status === "ACTIVE") return calculated === 'AL DIA'
      if (status === "DEBTOR") return calculated === 'EN MORA'
      if (status === "INACTIVE") return calculated === 'INACTIVO'
      if (status === "SUSPENDED") return calculated === 'SUSPENDIDO'
      if (status === "BAJA") return calculated === 'BAJA'
      return true
    }

    // If we are in "Archive" view, show terminal states
    if (view === "archive") {
       return calculated === 'BAJA'
    }

    // Filter by specific status if requested
    if (status === "ACTIVE") return calculated === 'AL DIA'
    if (status === "DEBTOR") return calculated === 'EN MORA'
    if (status === "INACTIVE") return calculated === 'INACTIVO'
    if (status === "SUSPENDED") return calculated === 'SUSPENDIDO'

    // By default, in "active" view, exclude all BAJA statuses completely
    return calculated !== 'BAJA'
  }).sort((a: any, b: any) => {
    const numA = Number(a.memberNumber) || 0
    const numB = Number(b.memberNumber) || 0

    if (sort === "num_asc") {
      return numA - numB
    }
    if (sort === "name_asc") {
      return a.lastName.localeCompare(b.lastName)
    }
    if (sort === "name_desc") {
      return b.lastName.localeCompare(a.lastName)
    }
    // Default: num_desc (el más nuevo arriba)
    return numB - numA
  })

  // Obtener cantidad de solicitudes pendientes
  const pendingCount = await db.enrollmentRequest.count({
    where: { status: "PENDING" }
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            {view === "all" ? "Padrón Completo de Socios" : view === "honorary" ? "Padrón de Socios Honorarios" : view === "archive" ? "Archivo de Socios" : "Directorio de Socios"}
          </h1>
          <p className="text-zinc-500 mt-1">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'socio encontrado' : 'socios encontrados'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
                  const bajaReason = getMemberBajaReason(member)

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
                            <p className="text-zinc-100 font-bold uppercase group-hover:text-amber-400 transition-colors">{member.lastName}, {member.firstName}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">Socio #{member.memberNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-400 text-sm font-mono">{formatDNI(member.dni)}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 text-sm">{lastPaidLabel}</span>
                          {member.isFamilyDiscount && <span className="text-[9px] text-blue-400 font-black flex items-center gap-1 mt-1 uppercase tracking-tighter"><Users size={10}/> 50% PAREJA</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg border shadow-sm ${getStatusBadgeStyles(calculated)}`}>
                            {calculated}
                          </span>
                          {calculated === 'BAJA' && bajaReason && (
                            <span className={`px-2 py-0.5 text-[8px] uppercase font-bold rounded-md border ${getBajaReasonStyles(bajaReason)}`}>
                              {bajaReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <SendMemberAccessButton
                            memberId={member.id}
                            memberName={`${member.firstName} ${member.lastName}`}
                            memberEmail={member.email}
                            username={member.user?.email || null}
                          />
                          <Link
                            href={`/admin/socios/${member.id}`}
                            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                          >
                            Ver ficha
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
