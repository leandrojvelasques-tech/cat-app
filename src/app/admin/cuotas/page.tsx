import { db } from "@/lib/db"
import { 
  CreditCard, 
  Search, 
  Calendar, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  DollarSign, 
  Filter, 
  TrendingUp, 
  AlertTriangle,
  History,
  Eye,
  ChevronRight,
  Info,
  Download
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CobranzasFilters } from "./CobranzasFilters"
import { PaymentDetailModal } from "./PaymentDetailModal"

export default async function CobranzasPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; query?: string; type?: string; eventId?: string; eventType?: string }>
}) {
  const { month, year, query = "", type = "all", eventId = "", eventType = "all" } = await searchParams
  
  const now = new Date()
  const currentMonth = month ? parseInt(month) : now.getMonth() + 1
  const currentYear = year ? parseInt(year) : now.getFullYear()

  // 1. Fetch Membership Fees
  const fees = await db.membershipFee.findMany({
    where: {
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
    ...fees.map(f => ({
      id: f.id,
      paymentId: f.id,
      type: 'CUOTA',
      date: f.paymentDate,
      amount: f.amountPaid,
      method: f.paymentMethod || 'EFECTIVO',
      reason: `Cuota Social - ${format(new Date(f.periodYear, f.periodMonth - 1, 1), 'MMMM yyyy', { locale: es })}`,
      payerName: `${f.member.lastName}, ${f.member.firstName}`,
      memberId: f.member.id,
      isMember: true,
      recordedBy: f.recordedBy?.name || 'Sistema',
      fullData: f
    })),
    ...registrations.map(r => ({
      id: r.id,
      paymentId: r.id,
      type: 'EVENTO',
      date: r.createdAt,
      amount: r.amountPaid,
      method: r.paymentMethod || 'EFECTIVO',
      reason: `Entrada: ${r.event.title} (${r.registrationType})`,
      payerName: r.member ? `${r.member.lastName}, ${r.member.firstName}` : `${r.lastName}, ${r.firstName}`,
      memberId: r.member?.id || null,
      isMember: !!r.member,
      recordedBy: r.recordedBy?.name || 'Sistema',
      fullData: r
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const totalCollected = unifiedHistory.reduce((acc, curr) => acc + curr.amount, 0)
  const feeCount = fees.length
  const eventCount = registrations.length

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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Historial de Cobranzas</h1>
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

      <CobranzasFilters 
        currentMonth={currentMonth} 
        currentYear={currentYear} 
        currentQuery={query}
        currentType={type}
        currentEventType={eventType}
        currentEventId={eventId}
        events={events}
      />

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest">Total Recaudado</span>
          </div>
          <p className="text-3xl font-black text-white">${totalCollected.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Período seleccionado</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-emerald-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <UserCheck size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{feeCount}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Cuotas de Socios</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-amber-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{eventCount}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Entradas a Eventos</p>
        </div>
      </div>

      {/* Unified History table */}
      <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10">
                <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fecha / Hora</th>
                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pagador</th>
                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Categoría</th>
                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Concepto</th>
                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Monto</th>
                <th className="py-6 pr-10 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {unifiedHistory.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-5 pl-10">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{format(item.date, "dd/MM/yyyy", { locale: es })}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{format(item.date, "HH:mm")} hs</span>
                    </div>
                  </td>
                  <td className="py-5">
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
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      item.type === 'CUOTA' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-5 pr-4">
                    {/* No truncation — text wraps so full event names are always readable */}
                    <p className="text-zinc-300 text-[11px] font-medium leading-snug break-words max-w-[230px]">{item.reason}</p>
                  </td>
                  <td className="py-5">
                    <span className="text-white font-black tracking-widest text-sm">${item.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-5 pr-10 text-right">
                    <PaymentDetailModal payment={item} />
                  </td>
                </tr>
              ))}
              {unifiedHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-32 text-center text-zinc-600 italic">
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
