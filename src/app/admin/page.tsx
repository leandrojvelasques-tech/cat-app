import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowRight, GraduationCap, CreditCard } from "lucide-react"
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

    </div>
  )
}
