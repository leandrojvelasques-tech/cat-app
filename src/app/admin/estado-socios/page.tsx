import { db } from "@/lib/db"
import { Users, UserPlus, CreditCard, List } from "lucide-react"
import Link from "next/link"
import { EstadoSociosFilters } from "./EstadoSociosFilters"
import { getPaymentStatus } from "@/lib/member-utils"
import { SolicitudesList } from "../solicitudes/SolicitudesList"
import { EstadoSociosTable } from "./EstadoSociosTable"
import { ApproveFeePaymentButton } from "../cuotas/ApproveFeePaymentButton"

export default async function EstadoSociosPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string }>
}) {
  const { query = "", sort = "num_desc" } = await searchParams
  
  const now = new Date()
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  // Buscar solicitudes pendientes
  const pendingRequests = await db.enrollmentRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }
  })

  // Buscar comprobantes de cuotas pendientes de aprobación
  const pendingFees = await db.membershipFee.findMany({
    where: { paymentStatus: "PENDING" },
    include: { member: true },
    orderBy: { paymentDate: "desc" }
  })

  let membersData = []
  const BAJA_STATUSES = ["BAJA", "DECEASED", "RESIGNED", "INACTIVE", "ARCHIVED", "DUPLICATE", "MOROSIDAD", "ADMINISTRATIVE"]

  if (query) {
    // Search Mode: Find any active member matching the query (excluding Honorarios)
    membersData = await db.member.findMany({
      where: {
        status: { notIn: BAJA_STATUSES },
        type: { not: "HONORARIO" },
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
        eventRegistrations: true,
        communications: {
          where: { type: "TEMPORARY_ACCESS" },
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: { sentAt: true, status: true },
        },
        user: { select: { email: true, firstLoginAt: true, lastLoginAt: true, loginCount: true, mustChangePassword: true } }
      },
      orderBy: { memberNumber: "asc" },
      take: 50 // Limit to avoid massive renders on short queries
    } as any) as any[]
  } else {
    // Default Mode: include every active member, including those already marked SUSPENDIDO.
    membersData = await db.member.findMany({
      where: {
        status: { notIn: BAJA_STATUSES },
        type: { not: "HONORARIO" },
      },
      include: {
        fees: {
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
        },
        eventRegistrations: true,
        user: { select: { email: true } }
      },
      orderBy: { memberNumber: "asc" }
    } as any) as any[]
  }

  // Use the persisted debt status so all suspended members remain visible.
  const filteredMembers = membersData
    .map((member: any) => ({
      ...member,
      calculatedStatus: getPaymentStatus(member, now)
    }))

  // Calcular resumen
  const totalAlDia = filteredMembers.filter((m: any) => m.calculatedStatus === 'AL DIA').length
  const totalEnMora = filteredMembers.filter((m: any) => m.calculatedStatus === 'EN MORA').length

  // Ordenar
  filteredMembers.sort((a: any, b: any) => {
    // Orden numérico por número de socio (los memberNumber son strings, se comparan como Number)
    if (sort === "num_desc") return Number(b.memberNumber) - Number(a.memberNumber)
    if (sort === "num_asc")  return Number(a.memberNumber) - Number(b.memberNumber)
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
    // Por defecto: más nuevo arriba
    return Number(b.memberNumber) - Number(a.memberNumber)
  })

  const serializedMembers = filteredMembers.map((member: any) => ({
    ...member,
    fees: member.fees.map((fee: any) => ({
      ...fee,
      paymentDate: fee.paymentDate ? fee.paymentDate.toISOString() : null,
      createdAt: fee.createdAt ? fee.createdAt.toISOString() : null,
      updatedAt: fee.updatedAt ? fee.updatedAt.toISOString() : null,
    })),
    user: member.user ? {
      ...member.user,
      firstLoginAt: member.user.firstLoginAt?.toISOString() || null,
      lastLoginAt: member.user.lastLoginAt?.toISOString() || null,
    } : null,
    communications: member.communications?.map((communication: any) => ({
      ...communication,
      sentAt: communication.sentAt.toISOString(),
    })) || []
  }))

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            Panel de Socios
          </h1>
          <p className="text-zinc-500 mt-1">
            {query 
              ? `Resultados de búsqueda: ${filteredMembers.length} coincidencia(s)`
              : `Socios activos desde 2026: ${filteredMembers.length} persona(s)`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
           <Link 
            href="/admin/socios/nuevo"
            className="flex items-center gap-2 bg-white text-zinc-950 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] shadow-lg"
          >
            <UserPlus size={16} /> Dar de Alta Socio
          </Link>
           <Link 
            href="/admin/cobrar"
            className="flex items-center gap-2 bg-gradient-to-tr from-amber-600 to-red-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/5 transition-all shadow-lg shadow-amber-900/20"
          >
            <CreditCard size={16} /> Cobrar Cuota
          </Link>
           <Link 
            href="/admin/socios"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/95 px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/5 transition-all"
          >
            <List size={16} /> Ver Directorio
          </Link>
        </div>
      </div>

      {/* Alert Banner: Fee Payment Approvals */}
      {pendingFees.length > 0 && (
        <div className="space-y-4 bg-amber-500/10 border border-amber-500/30 p-6 rounded-[32px] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>Comprobantes de Cuotas Pendientes de Aprobación ({pendingFees.length})</span>
            </h2>
            <Link href="/admin/cuotas" className="text-xs font-bold text-amber-400 hover:underline">
              Ir a Cobranzas →
            </Link>
          </div>
          <p className="text-xs text-zinc-300">
            Socios enviaron comprobantes de pago de cuotas desde el portal. Revisá los comprobantes y aprobá para acreditar en caja:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingFees.map((fee: any) => (
              <div key={fee.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-white">{fee.member.lastName}, {fee.member.firstName} (Socio N° #{fee.member.memberNumber})</p>
                  <p className="text-[10px] text-amber-500 font-medium">Cuota {fee.periodMonth}/{fee.periodYear} — ${fee.amountPaid.toLocaleString("es-AR")}</p>
                </div>
                <ApproveFeePaymentButton
                  feeId={fee.id}
                  amount={fee.amountPaid}
                  notes={fee.notes}
                  currentStatus={fee.paymentStatus}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="space-y-4 bg-amber-500/5 border border-amber-500/20 p-6 rounded-[32px] backdrop-blur-md">
          <h2 className="text-lg font-bold text-cat-gold flex items-center gap-2 font-serif">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Solicitudes de Inscripción Pendientes ({pendingRequests.length})</span>
          </h2>
          <SolicitudesList initialSolicitudes={pendingRequests} />
        </div>
      )}

      <EstadoSociosFilters />

      <EstadoSociosTable initialMembers={serializedMembers} />
    </div>
  )
}
