import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowRight, GraduationCap, CreditCard, CalendarDays, Users, UserCheck, Wallet, ShoppingBag } from "lucide-react"
import { calculateMemberStatus, getPaymentStatus, getSocietaryStatus, PaymentStatus } from "@/lib/member-utils"
import { PendingApprovalsSection } from "./components/PendingApprovalsSection"
import { MemberDailyStatusChart } from "./components/MemberDailyStatusChart"
import { MemberPortalAccessChart } from "./components/MemberPortalAccessChart"
import { finalizePastEvents } from "@/lib/event-status"

export default async function AdminDashboard() {
  const session = await auth()
  const isCollaborator = session?.user?.role === "COLLABORATOR"

  if (isCollaborator) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Panel de Colaborador</h1>
          <p className="text-zinc-400 mt-1 uppercase text-[10px] tracking-[0.2em] font-black">Centro Amigos del Tango - Accesos Rápidos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/admin/escuelita"
            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-cat-gold/30 transition-all group flex flex-col justify-between min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-cat-gold flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap size={24} />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white group-hover:text-cat-gold transition-colors">Escuela del CAT</h3>
              <p className="text-zinc-400 text-xs mt-1.5 font-light">Administre las clases de la escuela, registre alumnos y controle las asistencias diarias.</p>
            </div>
          </Link>

          <Link 
            href="/admin/cobrar"
            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-cat-gold/30 transition-all group flex flex-col justify-between min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-cat-gold flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard size={24} />
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white group-hover:text-cat-gold transition-colors">Registrar Cobros</h3>
              <p className="text-zinc-400 text-xs mt-1.5 font-light">Registre ingresos rápidos para las milongas, venta de entradas o buffet del día.</p>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  // Real stats for the dashboard - New Unified Status Logic
  const now = new Date()
  await finalizePastEvents(now)

  const allMembers = await db.member.findMany({
    include: {
      fees: true,
      eventRegistrations: true
    }
  })

  // El dashboard usa la misma separación societaria/deuda que el Panel de Socios.
  const stats: Record<PaymentStatus, number> = {
    'AL DIA': 0,
    'EN MORA': 0,
    'SUSPENDIDO': 0,
  }

  allMembers.forEach(m => {
    if (getSocietaryStatus(m) === 'ACTIVO') {
      stats[getPaymentStatus(m, now)]++
    }
  })

  const sociosSinDeuda = stats['AL DIA']
  const sociosDeudores = stats['EN MORA']
  const sociosSuspendidos = stats['SUSPENDIDO']

  // 1. GESTIONES PENDIENTES DE APROBACIÓN (Centralizadas)
  const pendingEnrollments = await db.enrollmentRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }
  })

  const pendingFeePayments = await db.membershipFee.findMany({
    where: { paymentStatus: "PENDING" },
    include: { member: true },
    orderBy: { createdAt: "desc" }
  })

  const pendingEventRegistrations = await db.eventRegistration.findMany({
    where: { paymentStatus: "PENDING" },
    include: { event: true },
    orderBy: { createdAt: "desc" }
  })

  // 2. SERIES HISTÓRICAS (ESTRICTAMENTE DESDE JULIO DE 2026 EN ADELANTE)
  const startYear = 2026
  const startMonth = 6 // 6 = Julio (0-indexed)

  const revenueData: { month: string; total: number }[] = []
  const activeSeries: { month: string; active: number }[] = []
  const dailyStatusSeries: {
    key: string
    label: string
    days: { day: number; count: number }[]
  }[] = []
  const portalAccessSeries: {
    key: string
    label: string
    uniqueMembers: number
    days: { day: number; count: number }[]
  }[] = []

  const iterDate = new Date(startYear, startMonth, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth(), 1)
  if (endDate < iterDate) {
    endDate.setTime(iterDate.getTime())
  }

  while (iterDate <= endDate) {
    const y = iterDate.getFullYear()
    const m = iterDate.getMonth()
    const monthNum = m + 1
    const monthLabel = iterDate.toLocaleString('es-ES', { month: 'short' })
    const label = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', '')

    const startOfMonth = new Date(y, m, 1)
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999)

    // Recaudación cuotas
    const feeRev = await db.membershipFee.aggregate({
      where: {
        periodYear: y,
        periodMonth: monthNum,
        paymentStatus: "PAID"
      },
      _sum: { amountPaid: true }
    })

    // Recaudación eventos en ese mes
    const eventRev = await db.eventRegistration.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amountPaid: true }
    })

    // Recaudación buffet en ese mes
    const buffetRev = await db.buffetSale.aggregate({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amountPaid: true }
    })

    const monthTotal = (feeRev._sum.amountPaid || 0) + (eventRev._sum.amountPaid || 0) + (buffetRev._sum.amountPaid || 0)
    revenueData.push({ month: label, total: monthTotal })

    // Socios activos al cierre del mes
    const activeMembersInMonth = allMembers.filter(m => {
      const memberJoin = new Date(m.createdAt || m.joinDate)
      return memberJoin <= endOfMonth && (m.status === "ACTIVE" || m.status === "AL DIA" || m.status === "EN MORA")
    }).length

    activeSeries.push({ month: label, active: activeMembersInMonth })

    const daysInMonth = y === now.getFullYear() && m === now.getMonth()
      ? now.getDate()
      : new Date(y, m + 1, 0).getDate()
    const dailyCounts: { day: number; count: number }[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const asOf = new Date(y, m, day, 23, 59, 59, 999)
      const count = allMembers.filter(member => {
        const memberJoin = new Date(member.joinDate || member.createdAt)
        if (memberJoin > asOf || getSocietaryStatus(member) !== "ACTIVO") return false
        return calculateMemberStatus(member, asOf) === "AL DIA"
      }).length

      dailyCounts.push({ day, count })
    }

    dailyStatusSeries.push({
      key: `${y}-${String(monthNum).padStart(2, "0")}`,
      label: `${label} ${y}`,
      days: dailyCounts,
    })

    const loginEvents = await db.memberLoginEvent.findMany({
      where: {
        loggedAt: { gte: startOfMonth, lte: endOfMonth },
        user: { member: { isNot: null } },
      },
      select: { userId: true, loggedAt: true },
    })
    const uniqueMembersByDay = new Map<number, Set<string>>()
    loginEvents.forEach(event => {
      const day = new Date(event.loggedAt).getDate()
      const members = uniqueMembersByDay.get(day) || new Set<string>()
      members.add(event.userId)
      uniqueMembersByDay.set(day, members)
    })
    portalAccessSeries.push({
      key: `${y}-${String(monthNum).padStart(2, "0")}`,
      label: `${label} ${y}`,
      uniqueMembers: new Set(loginEvents.map(event => event.userId)).size,
      days: Array.from({ length: daysInMonth }, (_, index) => ({
        day: index + 1,
        count: uniqueMembersByDay.get(index + 1)?.size || 0,
      })),
    })

    iterDate.setMonth(iterDate.getMonth() + 1)
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.total as number), 1000)
  const maxActive = Math.max(...activeSeries.map(s => s.active), 1)

  // 3. Próximos Eventos
  const lastFinishedEvent = await db.event.findFirst({
    where: { status: 'FINALIZADO' },
    include: {
      registrations: { include: { member: { select: { id: true } } } },
      buffetSales: { include: { items: { include: { product: { select: { name: true } } } } } }
    },
    orderBy: [{ endDate: 'desc' }, { startDate: 'desc' }]
  })

  const eventRegistrations = lastFinishedEvent?.registrations || []
  const eventAttendees = eventRegistrations.filter(registration => registration.attended)
  const eventTicketRevenue = eventRegistrations
    .filter(registration => registration.paymentStatus === 'PAID')
    .reduce((total, registration) => total + registration.amountPaid, 0)
  const eventBuffetRevenue = lastFinishedEvent?.buffetSales
    .reduce((total, sale) => total + sale.amountPaid, 0) || 0
  const buffetConsumption = Object.entries((lastFinishedEvent?.buffetSales || []).reduce<Record<string, number>>((summary, sale) => {
    sale.items.forEach(item => {
      summary[item.product.name] = (summary[item.product.name] || 0) + item.quantity
    })
    return summary
  }, {})).sort(([, quantityA], [, quantityB]) => quantityB - quantityA)

  // 5. Escuelita Stats
  const lastEscuelitaClass = await db.escuelitaClass.findFirst({
    orderBy: { date: 'desc' },
    include: { _count: { select: { attendances: true } } }
  })
  
  const escuelita3MonthsAgo = new Date()
  escuelita3MonthsAgo.setMonth(now.getMonth() - 2)
  escuelita3MonthsAgo.setDate(1)
  const recentEscuelitaClasses = await db.escuelitaClass.findMany({
    where: { date: { gte: escuelita3MonthsAgo } },
    include: { _count: { select: { attendances: true } } },
    orderBy: { date: 'asc' }
  })
  const maxEscuelita = Math.max(...recentEscuelitaClasses.map(c => c._count.attendances), 1, 10)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Dashboard Administrativo</h1>
          <p className="text-zinc-400 mt-1 uppercase text-[10px] tracking-[0.2em] font-black">Centro Amigos del Tango - Vista General</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-zinc-500 text-xs font-bold mb-1">Última Sincronización</p>
           <p className="text-emerald-500 font-mono text-sm">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* SECCIÓN CENTRALIZADA DE GESTIONES PENDIENTES DE APROBACIÓN */}
      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md relative overflow-hidden group shadow-xl">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Socios al día</p>
           <p className="text-xl sm:text-2xl font-black text-emerald-400">{sociosSinDeuda}</p>
           <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-500/5 rounded-full blur-xl"></div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md relative overflow-hidden group shadow-xl">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Socios en mora</p>
           <p className="text-xl sm:text-2xl font-black text-amber-300">{sociosDeudores}</p>
           <div className="hidden flex gap-1.5 mt-2">
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">AL DÍA: {sociosSinDeuda}</span>
              <span className="text-[8px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">MORA: {sociosDeudores}</span>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md relative overflow-hidden group shadow-xl">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2 text-red-400">Socios suspendidos</p>
           <p className="text-xl sm:text-2xl font-black text-red-400">{sociosSuspendidos}</p>
        </div>

        <div className="hidden bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl border-red-500/20">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2 text-red-400">Suspendidos</p>
           <p className="text-2xl font-black text-white">{sociosSuspendidos}</p>
           <p className="text-[8px] text-red-500/50 font-medium leading-tight mt-1">Más de 3 cuotas impagas</p>
        </div>
      </div>

      <PendingApprovalsSection
        enrollmentRequests={pendingEnrollments}
        feePayments={pendingFeePayments}
        eventRegistrations={pendingEventRegistrations}
      />

      <MemberDailyStatusChart series={dailyStatusSeries} />
      <MemberPortalAccessChart series={portalAccessSeries} />

      {/* GRÁFICOS INICIANDO ESTRICTAMENTE DESDE JULIO 2026 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* 1. Recaudación Histórica (Julio 2026 en adelante) */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              Recaudación Histórica
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-6">Desde Julio 2026 en adelante</p>
            
            <div className="flex h-64 gap-1">
               {/* Y-Axis Labels */}
               <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-mono pr-2 h-52 pb-4">
                  <span>${(maxRevenue / 1000).toFixed(0)}k</span>
                  <span>${(maxRevenue / 2000).toFixed(0)}k</span>
                  <span>$0</span>
               </div>
               
               <div className="flex-1 flex items-end justify-between gap-2 h-52 border-l border-b border-white/5 pb-0 pl-2">
                  {revenueData.map((d, i) => {
                    const height = ((d.total as number) / maxRevenue) * 90
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                         <div 
                            className="bg-amber-500/30 group-hover/bar:bg-amber-500 transition-all duration-300 rounded-t-lg w-full min-h-[4px]"
                            style={{ height: `${height || 4}%` }}
                         ></div>
                         {/* Hover info */}
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl whitespace-nowrap">
                            ${(d.total as number).toLocaleString("es-AR")}
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
            <div className="flex justify-between pl-8 pr-2 mt-4">
               {revenueData.map((d, i) => <span key={i} className="text-[10px] text-zinc-400 font-mono font-bold uppercase">{d.month}</span>)}
            </div>
         </div>

         {/* 2. Socios Activos (Julio 2026 en adelante) */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Socios Activos
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-6">Desde Julio 2026 en adelante</p>
            
            <div className="flex h-64 gap-1">
               {/* Y-Axis */}
               <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-mono pr-2 h-52 pb-4 text-right min-w-[30px]">
                  <span>{maxActive}</span>
                  <span>{Math.floor(maxActive/2)}</span>
                  <span>0</span>
               </div>
               
               <div className="flex-1 flex items-end justify-between gap-2 h-52 border-l border-b border-white/5 pb-0 pl-2">
                  {activeSeries.map((d, i) => {
                    const height = (d.active / maxActive) * 90
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                         <div 
                            className="bg-blue-500/30 group-hover/bar:bg-blue-500 transition-all duration-300 rounded-t-lg w-full min-h-[4px]"
                            style={{ height: `${height || 4}%` }}
                         ></div>
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl whitespace-nowrap">
                            {d.active} socios
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
            <div className="flex justify-between pl-10 pr-2 mt-4">
               {activeSeries.map((d, i) => <span key={i} className="text-[10px] text-zinc-400 font-mono font-bold uppercase">{d.month}</span>)}
            </div>
         </div>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-[40px] p-5 sm:p-8 backdrop-blur-md shadow-2xl">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
            <div>
               <p className="text-[10px] text-amber-400 font-mono uppercase tracking-[0.2em] mb-2">Último evento finalizado</p>
               <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {lastFinishedEvent?.title || "Sin eventos finalizados"}
               </h2>
               {lastFinishedEvent && (
                  <p className="text-sm text-zinc-400 mt-2 flex items-center gap-2">
                     <CalendarDays size={14} className="text-amber-400" />
                     {new Date(lastFinishedEvent.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                     {lastFinishedEvent.endDate && ` — ${new Date(lastFinishedEvent.endDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`}
                  </p>
               )}
            </div>
            {lastFinishedEvent && <Link href={`/admin/eventos/${lastFinishedEvent.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-white transition-colors">Ver detalle <ArrowRight size={14} /></Link>}
         </div>

         {lastFinishedEvent ? (
            <>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                     { label: "Inscriptos", value: eventRegistrations.length, icon: Users, color: "text-sky-400" },
                     { label: "Presentes", value: eventAttendees.length, icon: UserCheck, color: "text-emerald-400" },
                     { label: "Socios inscriptos", value: eventRegistrations.filter(registration => Boolean(registration.memberId)).length, icon: Users, color: "text-amber-400" },
                     { label: "No socios inscriptos", value: eventRegistrations.filter(registration => !registration.memberId).length, icon: Users, color: "text-purple-400" }
                  ].map(({ label, value, icon: Icon, color }) => (
                     <div key={label} className="bg-black/20 border border-white/5 rounded-2xl p-4">
                        <Icon size={16} className={`${color} mb-3`} />
                        <p className="text-2xl font-black text-white">{value}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
                     </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-4">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                        <Wallet size={16} className="text-emerald-400 mb-3" />
                        <p className="text-xl font-black text-white">${eventTicketRevenue.toLocaleString('es-AR')}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Entradas recaudadas</p>
                     </div>
                     <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                        <ShoppingBag size={16} className="text-orange-400 mb-3" />
                        <p className="text-xl font-black text-white">${eventBuffetRevenue.toLocaleString('es-AR')}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Buffet recaudado</p>
                     </div>
                  </div>
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                     <div className="flex items-center gap-2 mb-3"><ShoppingBag size={16} className="text-orange-400" /><p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Consumo del evento</p></div>
                     {buffetConsumption.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                           {buffetConsumption.slice(0, 8).map(([product, quantity]) => <div key={product} className="flex justify-between gap-3 text-xs"><span className="text-zinc-300 truncate">{product}</span><span className="font-black text-white">{quantity}</span></div>)}
                        </div>
                     ) : <p className="text-xs text-zinc-600 italic">Sin consumos registrados.</p>}
                  </div>
               </div>
            </>
         ) : <p className="text-sm text-zinc-500 italic">Todavía no hay un evento finalizado para mostrar.</p>}
      </section>

      {/* Escuelita ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1 bg-gradient-to-br from-blue-900/20 to-black border border-white/10 rounded-[40px] p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none"><GraduationCap size={150} /></div>
            <div className="relative z-10">
               <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                 <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                 Escuela del CAT
               </h3>
               <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-6">Última Clase Registrada</p>
               
               <p className="text-6xl font-black text-white">{lastEscuelitaClass?._count.attendances || 0}</p>
               <p className="text-sm font-medium text-blue-400 mt-2">
                 {lastEscuelitaClass ? new Date(lastEscuelitaClass.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long'}) : "No hay datos"}
               </p>
               <div className="mt-8">
                 <Link 
                   href="/admin/escuelita" 
                   className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-blue-500/30"
                 >
                   Módulo Escuela del CAT <ArrowRight size={14} />
                 </Link>
               </div>
            </div>
         </div>
         
         <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
                 Asistencia Escuela del CAT
               </h3>
               <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Últimos 3 meses</span>
            </div>
            
            <div className="flex h-40 gap-1 mt-6">
               <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-mono pr-2 h-36 pb-4 text-right min-w-[30px]">
                  <span>{maxEscuelita}</span>
                  <span>{Math.floor(maxEscuelita/2)}</span>
                  <span>0</span>
               </div>
               
               <div className="flex-1 flex items-end gap-1 h-36 border-l border-b border-white/5 pb-0 pl-2">
                  {recentEscuelitaClasses.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 italic">No hay clases aún</div>
                  ) : (
                    recentEscuelitaClasses.map((c, i) => {
                      const height = (c._count.attendances / maxEscuelita) * 90
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                           <div 
                              className="bg-cyan-500/20 group-hover/bar:bg-cyan-500 transition-all duration-300 rounded-t-lg w-full min-h-[4px]"
                              style={{ height: `${height || 2}%` }}
                           ></div>
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl whitespace-nowrap">
                              {c._count.attendances} asists.
                              <br/>
                              <span className="font-normal">{new Date(c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                           </div>
                        </div>
                      )
                    })
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
