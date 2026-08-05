import { db } from "@/lib/db"
import { 
  CreditCard, 
  ChevronRight,
  Info,
  Download
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CobranzasFilters } from "./CobranzasFilters"
import { PaymentDetailModal } from "./PaymentDetailModal"
import { ApproveFeePaymentButton } from "./ApproveFeePaymentButton"
import { extractPaymentProofUrl } from "@/lib/proof-utils"

export default async function CobranzasPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; query?: string; type?: string; eventId?: string; eventType?: string; paymentMethod?: string }>
}) {
  const { month, year, query = "", type = "all", eventId = "", eventType = "all", paymentMethod = "all" } = await searchParams
  
  const now = new Date()
  const currentMonth = month ? parseInt(month) : now.getMonth() + 1
  const currentYear = year ? parseInt(year) : now.getFullYear()

  // 1. Fetch Paid Membership Fees
  const fees = await db.membershipFee.findMany({
    where: {
      paymentStatus: 'PAID',
      AND: [
        month ? { periodMonth: parseInt(month) } : {},
        year ? { periodYear: parseInt(year) } : {},
        query ? {
          member: {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ]
          }
        } : {},
        type === 'fee' || type === 'all' ? {} : { id: 'none' }
      ]
    },
    include: {
      member: true,
      recordedBy: true
    },
    orderBy: { paymentDate: 'desc' }
  })

  // 1b. Fetch Pending Membership Fees for Approval
  const pendingFees = await db.membershipFee.findMany({
    where: {
      paymentStatus: 'PENDING'
    },
    include: {
      member: true
    },
    orderBy: { paymentDate: 'desc' }
  })

  // 2. Fetch Event Registrations
  const registrations = await db.eventRegistration.findMany({
    where: {
      AND: [
        month ? { createdAt: { gte: new Date(currentYear, currentMonth - 1, 1), lt: new Date(currentYear, currentMonth, 1) } } : {},
        eventId ? { eventId } : {},
        eventType !== 'all' ? { registrationType: eventType } : {},
        query ? {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { member: { firstName: { contains: query, mode: 'insensitive' } } },
            { member: { lastName: { contains: query, mode: 'insensitive' } } },
            { event: { title: { contains: query, mode: 'insensitive' } } }
          ]
        } : {},
        type === 'event' || type === 'all' ? {} : { id: 'none' }
      ],
      paymentStatus: 'PAID'
    },
    include: {
      member: true,
      event: true,
      recordedBy: true
    },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Unify and Map Data
  const unifiedHistory = [
    ...fees.map(f => {
      const proofUrl = extractPaymentProofUrl(f)
      return {
        id: f.id,
        paymentId: f.id,
        type: 'CUOTA',
        date: f.paymentDate,            // Fecha de registro
        realDate: f.realPaymentDate ?? f.paymentDate,  // Fecha real de pago
        amount: f.amountPaid,
        method: f.paymentMethod || 'EFECTIVO',
        proofUrl,
        reason: `Cuota Social - ${format(new Date(f.periodYear, f.periodMonth - 1, 1), 'MMMM yyyy', { locale: es })}`,
        payerName: `${f.member.lastName}, ${f.member.firstName}`,
        memberId: f.member.id,
        isMember: true,
        recordedBy: f.recordedBy?.name || 'Sistema',
        fullData: f
      }
    }),
    ...registrations.map(r => {
      const proofUrl = extractPaymentProofUrl(r)
      return {
        id: r.id,
        paymentId: r.id,
        type: 'EVENTO',
        date: r.createdAt,              // Fecha de registro
        realDate: r.realPaymentDate ?? r.createdAt,    // Fecha real de pago
        amount: r.amountPaid,
        method: r.paymentMethod || 'EFECTIVO',
        proofUrl,
        reason: `Entrada: ${r.event.title} (${r.registrationType})`,
        payerName: r.member ? `${r.member.lastName}, ${r.member.firstName}` : `${r.lastName}, ${r.firstName}`,
        memberId: r.member?.id || null,
        isMember: !!r.member,
        recordedBy: r.recordedBy?.name || 'Sistema',
        fullData: r
      }
    })
  ].sort((a, b) => b.realDate.getTime() - a.realDate.getTime())

  // Apply Payment Method filter if set
  const filteredHistory = unifiedHistory.filter(item => {
    if (paymentMethod === 'all') return true
    const itemMethod = (item.method || 'EFECTIVO').toUpperCase()
    if (paymentMethod === 'TRANSFERENCIA') {
      return itemMethod.includes('TRANSFER') || itemMethod.includes('MERCADO') || itemMethod.includes('MP')
    }
    if (paymentMethod === 'EFECTIVO') {
      return itemMethod.includes('EFECTIVO') || itemMethod.includes('CASH') || itemMethod === ''
    }
    return itemMethod.includes(paymentMethod.toUpperCase())
  })

  const historyToDisplay = filteredHistory

  const events = await db.event.findMany({
    orderBy: { startDate: 'desc' },
    select: { id: true, title: true, startDate: true }
  })

  // Build CSV export URL preserving current filters
  const csvParams = new URLSearchParams()
  if (month) csvParams.set('month', month)
  if (year) csvParams.set('year', year)
  if (query) csvParams.set('query', query)
  if (type !== 'all') csvParams.set('type', type)
  if (eventId) csvParams.set('eventId', eventId)
  if (eventType !== 'all') csvParams.set('eventType', eventType)
  if (paymentMethod !== 'all') csvParams.set('paymentMethod', paymentMethod)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Historial de Caja</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Registro unificado de todos los ingresos de la institución</p>
        </div>
        <Link
          href={`/api/export/cobranzas?${csvParams.toString()}`}
          className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          prefetch={false}
        >
          <Download size={14} /> Exportar CSV
        </Link>
      </div>

      {/* Pending Fee Payments Alert */}
      {pendingFees.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl backdrop-blur-md space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider">
              Comprobantes de Cuotas Pendientes de Aprobación ({pendingFees.length})
            </h3>
          </div>
          <p className="text-xs text-zinc-300">
            Los siguientes comprobantes fueron subidos por los socios y están a la espera de validación de Tesorería para acreditarse en caja y emitir el recibo digital:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {pendingFees.map(fee => (
              <div key={fee.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-white">{fee.member.lastName}, {fee.member.firstName} (Socio #{fee.member.memberNumber})</p>
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

      <CobranzasFilters 
        currentMonth={currentMonth} 
        currentYear={currentYear} 
        currentQuery={query}
        currentType={type}
        currentEventType={eventType}
        currentEventId={eventId}
        currentPaymentMethod={paymentMethod}
        events={events}
      />

      {/* Unified History table */}
      <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10">
                <th className="py-6 pl-10 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fecha de Pago</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fecha de Registro</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pagador</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Categoría</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Forma de Pago</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Concepto</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Monto</th>
                <th className="py-6 pr-10 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historyToDisplay.map((item: any) => {
                const methodUpper = (item.method || 'EFECTIVO').toUpperCase()
                const isTransfer = methodUpper.includes('TRANSFER') || methodUpper.includes('MERCADO') || methodUpper.includes('MP')
                
                return (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* Fecha Real de Pago */}
                    <td className="py-5 pl-10 pr-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{format(item.realDate, "dd/MM/yyyy", { locale: es })}</span>
                        <span className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest mt-0.5">Fecha de Pago</span>
                      </div>
                    </td>
                    {/* Fecha de Registro en el sistema */}
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 font-medium text-sm">{format(item.date, "dd/MM/yyyy", { locale: es })}</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{format(item.date, "HH:mm")} hs</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-col">
                        {item.isMember ? (
                          <Link href={`/admin/socios/${item.memberId}`} className="text-amber-500 hover:text-amber-400 font-black text-xs uppercase tracking-tight transition-colors flex items-center gap-1 group/link">
                            {item.payerName} <ChevronRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        ) : (
                          <span className="text-zinc-300 font-black text-xs uppercase tracking-tight">{item.payerName}</span>
                        )}
                        <span className={`text-[9px] font-black tracking-widest mt-1 ${item.isMember ? 'text-zinc-600' : 'text-zinc-500 italic'}`}>
                          {item.isMember ? 'SOCIO ACTIVO' : 'NO SOCIO'}
                        </span>
                      </div>
                    </td>
                    {/* Categoría */}
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        item.type === 'CUOTA' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    {/* Forma de Pago */}
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${
                        isTransfer 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        <CreditCard size={10} />
                        {isTransfer ? 'TRANSFERENCIA' : 'EFECTIVO'}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      {/* No truncation — text wraps so full event names are always readable */}
                      <p className="text-zinc-300 text-[11px] font-medium leading-snug break-words max-w-[230px]">{item.reason}</p>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-white font-black tracking-widest text-sm">${item.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-5 pr-10 text-right">
                      <PaymentDetailModal payment={item} />
                    </td>
                  </tr>
                )
              })}
              {historyToDisplay.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-32 text-center text-zinc-600 italic">
                    <Info size={40} className="mx-auto mb-4 opacity-10" />
                    <p className="uppercase font-black tracking-widest text-xs">No se encontraron movimientos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
