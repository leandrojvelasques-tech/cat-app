import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ArrowLeft, Wallet, Ticket, ShoppingBag, Users, CreditCard, Banknote, Smartphone, Clock } from "lucide-react"
import Link from "next/link"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v)

const PaymentMethodLabels: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADOPAGO: "Mercado Pago",
  A_COBRAR: "A Cobrar",
  PENDING: "Pendiente",
}

export default async function CajaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const event = await db.event.findUnique({ where: { id } })
  if (!event) notFound()

  // Fetch all event registrations with payment info  
  const registrations = await db.eventRegistration.findMany({
    where: { eventId: id },
    include: { member: { select: { id: true, firstName: true, lastName: true, memberNumber: true } } }
  }) as any[]

  // Fetch all buffet sales for this event
  const buffetSales = await db.buffetSale.findMany({
    where: { eventId: id },
    include: {
      items: { include: { product: true } },
      buyer: { select: { id: true, firstName: true, lastName: true, memberNumber: true } }
    }
  }) as any[]

  // Fetch membership fees paid on the same day(s) of the event
  const eventStart = new Date(event.startDate)
  const eventEnd = event.endDate ? new Date(event.endDate) : eventStart
  const dayStart = new Date(eventStart); dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(eventEnd); dayEnd.setHours(23, 59, 59, 999)

  const feesOnEvent = await db.membershipFee.findMany({
    where: { paymentDate: { gte: dayStart, lte: dayEnd } },
    include: { member: { select: { firstName: true, lastName: true, memberNumber: true } } }
  }) as any[]

  // ---- Compute Ticket totals ----
  const socioTickets = registrations.filter((r: any) => r.memberId !== null)
  const nonSocioTickets = registrations.filter((r: any) => r.memberId === null)
  const ticketTotal = registrations.reduce((s: number, r: any) => s + (r.amountPaid || 0), 0)
  const ticketSocioTotal = socioTickets.reduce((s: number, r: any) => s + (r.amountPaid || 0), 0)
  const ticketNonSocioTotal = nonSocioTickets.reduce((s: number, r: any) => s + (r.amountPaid || 0), 0)

  // ---- Compute Buffet totals ----
  const buffetPaidSales = buffetSales.filter((s: any) => s.paymentMethod !== "A_COBRAR")
  const buffetDebtSales = buffetSales.filter((s: any) => s.paymentMethod === "A_COBRAR")
  const buffetTotal = buffetPaidSales.reduce((s: number, sale: any) => s + sale.amountPaid, 0)

  // ---- Compute Fees totals ----
  const feesTotal = feesOnEvent.reduce((s: number, f: any) => s + f.amountPaid, 0)

  // ---- Grand total breakdown by payment method ----
  const grandTotal = ticketTotal + buffetTotal + feesTotal

  const byMethod: Record<string, number> = {}
  for (const r of registrations) {
    const m = r.paymentMethod || "PENDING"
    byMethod[m] = (byMethod[m] || 0) + r.amountPaid
  }
  for (const s of buffetPaidSales) {
    const m = s.paymentMethod || "CASH"
    byMethod[m] = (byMethod[m] || 0) + s.amountPaid
  }
  for (const f of feesOnEvent) {
    const m = f.paymentMethod || "CASH"
    byMethod[m] = (byMethod[m] || 0) + f.amountPaid
  }

  const methodIcons: Record<string, React.ReactNode> = {
    CASH: <Banknote size={18} />,
    TRANSFER: <CreditCard size={18} />,
    MERCADOPAGO: <Smartphone size={18} />,
    A_COBRAR: <Clock size={18} />,
    PENDING: <Clock size={18} />,
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/eventos/${id}`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
          <ArrowLeft size={18} className="text-zinc-400" />
        </Link>
        <div>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Rendición de Caja</p>
          <h1 className="text-2xl font-semibold text-white/90">{event.title}</h1>
          <p className="text-zinc-500 text-sm">
            {new Date(event.startDate).toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Total Recaudado</p>
          <p className="text-3xl font-black text-emerald-400">{formatCurrency(grandTotal)}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex items-center gap-4 backdrop-blur-md">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
            <Ticket size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Entradas</p>
            <p className="text-2xl font-black text-amber-400">{formatCurrency(ticketTotal)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{registrations.length} registros</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex items-center gap-4 backdrop-blur-md">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Buffet</p>
            <p className="text-2xl font-black text-purple-400">{formatCurrency(buffetTotal)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{buffetPaidSales.length} ventas cobradas</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex items-center gap-4 backdrop-blur-md">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Cuotas del Día</p>
            <p className="text-2xl font-black text-blue-400">{formatCurrency(feesTotal)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{feesOnEvent.length} pagos cobrados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Payment method breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-emerald-400" /> Desglose por Método de Pago
          </h2>
          <div className="flex flex-col divide-y divide-white/5">
            {Object.entries(byMethod).filter(([method]) => method !== "A_COBRAR" && method !== "PENDING").map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 text-zinc-300">
                  <span className="text-emerald-400">{methodIcons[method] ?? <CreditCard size={18} />}</span>
                  {PaymentMethodLabels[method] ?? method}
                </div>
                <span className="text-white font-bold">{formatCurrency(amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 mt-1">
              <span className="font-black text-white uppercase tracking-widest text-sm">Total Efectivo Ingresado</span>
              <span className="text-emerald-400 font-black text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Ticket breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Ticket size={16} className="text-amber-400" /> Detalle de Entradas
          </h2>
          <div className="flex flex-col divide-y divide-white/5">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="w-7 h-7 bg-emerald-400/10 text-emerald-400 rounded-xl flex items-center justify-center text-xs font-black">{socioTickets.length}</span>
                Socios
              </div>
              <span className="text-white font-bold">{formatCurrency(ticketSocioTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="w-7 h-7 bg-zinc-500/10 text-zinc-400 rounded-xl flex items-center justify-center text-xs font-black">{nonSocioTickets.length}</span>
                No Socios
              </div>
              <span className="text-white font-bold">{formatCurrency(ticketNonSocioTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-3 last:pb-0 font-black">
              <span className="text-zinc-400">Total Entradas</span>
              <span className="text-amber-400">{formatCurrency(ticketTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending debts - Buffet */}
      {buffetDebtSales.length > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-[28px] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2">
            <Clock size={16} /> Cuentas a Cobrar — Buffet ({buffetDebtSales.length})
          </h2>
          <div className="flex flex-col divide-y divide-white/5">
            {buffetDebtSales.map((s: any) => (
              <div key={s.id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0 gap-4">
                <div>
                  <p className="text-zinc-200 font-semibold">{s.buyerName || s.buyer?.firstName + " " + s.buyer?.lastName || "Sin nombre registrado"}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {s.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(" · ")}
                  </p>
                </div>
                <span className="text-orange-400 font-black whitespace-nowrap">{formatCurrency(s.amountTotal)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 mt-1 font-black">
              <span className="text-orange-400">Total Pendiente</span>
              <span className="text-orange-400">{formatCurrency(buffetDebtSales.reduce((s: number, x: any) => s + x.amountTotal, 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cuotas detail */}
      {feesOnEvent.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-400" /> Cuotas Cobradas en este Evento
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Socio</th>
                  <th className="py-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Período</th>
                  <th className="py-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Método</th>
                  <th className="py-3 text-right text-xs font-bold uppercase tracking-widest text-zinc-500">Importe</th>
                </tr>
              </thead>
              <tbody>
                {feesOnEvent.map((f: any) => (
                  <tr key={f.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 text-zinc-200 text-sm">{f.member.lastName}, {f.member.firstName}</td>
                    <td className="py-3 text-zinc-400 text-sm">{f.periodMonth}/{f.periodYear}</td>
                    <td className="py-3 text-zinc-400 text-sm">{PaymentMethodLabels[f.paymentMethod] ?? f.paymentMethod ?? "—"}</td>
                    <td className="py-3 text-right text-blue-400 font-bold text-sm">{formatCurrency(f.amountPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
