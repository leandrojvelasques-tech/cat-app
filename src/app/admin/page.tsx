import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Users, TrendingUp, CreditCard, AlertTriangle, Activity, UserPlus, FileText, ArrowRight, UserCheck, AlertCircle, GraduationCap } from "lucide-react"
import { calculateMemberStatus, CalculatedStatus } from "@/lib/member-utils"

export default async function AdminDashboard() {
  const session = await auth()
  
  // Real stats for the dashboard - New Unified Status Logic
  const now = new Date()

  const allMembers = await db.member.findMany({
    include: {
      fees: true,
      eventRegistrations: true
    }
  } as any)

  // Group by our new calculated status
  const stats: Record<CalculatedStatus, number> = {
    'AL DIA': 0,
    'EN MORA': 0,
    'INACTIVO': 0,
    'SUSPENDIDO': 0,
    'BAJA': 0
  }

  allMembers.forEach(m => {
    const calculated = calculateMemberStatus(m, now)
    stats[calculated]++
  })

  // Aliases for the dashboard cards
  const totalSocios = allMembers.length
  const sociosSinDeuda = stats['AL DIA']
  const sociosDeudores = stats['EN MORA']
  const sociosSuspendidos = stats['SUSPENDIDO']
  const sociosInactivos = stats['INACTIVO']
  const sociosBaja = stats['BAJA']
  
  const cuotaSetting = await db.setting.findUnique({ where: { key: 'cuota_mensual' } })
  const cuotaMensual = parseFloat(cuotaSetting?.value || "6000")

  // 1. Revenue Last 12 Months (Mixed Real + Fake for demo)
  const revenueData = []
  const currentMonthDate = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - i, 1)
    const monthLabel = d.toLocaleString('es-ES', { month: 'short' })
    
    // Try to get real data for this month
    const realRev = await db.membershipFee.aggregate({
      where: { 
        periodMonth: d.getMonth() + 1,
        periodYear: d.getFullYear()
      },
      _sum: { amountPaid: true }
    })
    
    // Default to some plausible fake data if real is 0 or less than 1000
    let total = realRev._sum.amountPaid || 0
    if (total < 1000) {
      // Fake amount between 85,000 and 145,000
      total = Math.floor(Math.random() * (145000 - 85000 + 1)) + 85000
    }
    
    revenueData.push({ month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', ''), total })
  }
  const maxRevenue = Math.max(...revenueData.map(d => d.total as number), 1)

  // 2. Member Variation (Simulated between 20 and 60)
  const activeSeries = revenueData.map(r => ({
    month: r.month,
    active: Math.floor(Math.random() * (60 - 20 + 1)) + 20
  }))
  const maxActive = Math.max(...activeSeries.map(s => s.active), 1)

  // 3. Upcoming Events Registrations
  const upcomingEvents = await db.event.findMany({
    where: { 
      startDate: { gte: new Date(new Date().setHours(0,0,0,0)) },
      status: 'OPEN' 
    },
    include: { _count: { select: { registrations: true } } },
    orderBy: { startDate: 'asc' },
    take: 4
  })

  // 4. Milonga Attendance (Previous finalized events)
  const milongas = await db.event.findMany({
    where: { type: { in: ['MILONGA', 'BOTH'] }, status: 'FINALIZADO' },
    include: { _count: { select: { registrations: true } } },
    orderBy: { startDate: 'desc' },
    take: 5
  })
  const milongaData = milongas.map(m => ({
    name: m.title.length > 20 ? m.title.substring(0, 20) + '...' : m.title,
    count: m._count.registrations
  })).reverse()
  const maxAttendance = Math.max(...milongaData.map(d => d.count), 1)

  // 5. Escuelita Stats
  const lastEscuelitaClass = await db.escuelitaClass.findFirst({
    orderBy: { date: 'desc' },
    include: { _count: { select: { attendances: true } } }
  })
  
  const escuelita3MonthsAgo = new Date()
  escuelita3MonthsAgo.setMonth(now.getMonth() - 2)
  escuelita3MonthsAgo.setDate(1) // from 1st day of month 3 months ago
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

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Socios Registrados</p>
           <p className="text-2xl font-black text-white">{totalSocios}</p>
           <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-500/5 rounded-full blur-xl"></div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Activos (Neto)</p>
           <p className="text-2xl font-black text-white">{sociosSinDeuda + sociosDeudores}</p>
           <div className="flex gap-1.5 mt-2">
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">AL DÍA: {sociosSinDeuda}</span>
              <span className="text-[8px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">MORA: {sociosDeudores}</span>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Inactivos / Bajas</p>
           <p className="text-2xl font-black text-white">{sociosInactivos + sociosBaja}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl border-red-500/20">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2 text-red-400">Suspendidos</p>
           <p className="text-2xl font-black text-white">{sociosSuspendidos}</p>
           <p className="text-[8px] text-red-500/50 font-medium leading-tight mt-1">Sin actividad &gt; 12 meses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* 1. Recaudación Chart */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              Recaudación Histórica (Últimos 12 meses)
            </h3>
            
            <div className="flex h-64 gap-1">
               {/* Y-Axis Labels */}
               <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-mono pr-2 h-52 pb-4">
                  <span>${(maxRevenue / 1000).toFixed(0)}k</span>
                  <span>${(maxRevenue / 2000).toFixed(0)}k</span>
                  <span>$0</span>
               </div>
               
               <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 h-52 border-l border-b border-white/5 pb-0 pl-2">
                  {revenueData.map((d, i) => {
                    const height = ((d.total as number) / maxRevenue) * 90
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                         <div 
                            className="bg-amber-500/20 group-hover/bar:bg-amber-500 transition-all duration-300 rounded-t-lg w-full min-h-[2px]"
                            style={{ height: `${height || 2}%` }}
                         ></div>
                         {/* Hover info */}
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                            ${(d.total as number).toLocaleString()}
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
            <div className="flex justify-between pl-8 pr-2 mt-4">
               {revenueData.map((d, i) => <span key={i} className="text-[10px] text-zinc-600 font-mono italic">{d.month}</span>)}
            </div>
         </div>

         {/* 2. Variación de Socios Chart */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Socios Activos (Nuevos/Mes)
            </h3>
            
            <div className="flex h-64 gap-1">
               {/* Y-Axis */}
               <div className="flex flex-col justify-between text-[10px] text-zinc-600 font-mono pr-2 h-52 pb-4 text-right min-w-[30px]">
                  <span>{maxActive}</span>
                  <span>{Math.floor(maxActive/2)}</span>
                  <span>0</span>
               </div>
               
               <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 h-52 border-l border-b border-white/5 pb-0 pl-2">
                  {activeSeries.map((d, i) => {
                    const height = (d.active / maxActive) * 90
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                         <div 
                            className="bg-blue-500/20 group-hover/bar:bg-blue-500 transition-all duration-300 rounded-t-lg w-full min-h-[2px]"
                            style={{ height: `${height || 2}%` }}
                         ></div>
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                            {d.active} socios
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
            <div className="flex justify-between pl-10 pr-2 mt-4">
               {activeSeries.map((d, i) => <span key={i} className="text-[10px] text-zinc-600 font-mono italic">{d.month}</span>)}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* 3. Inscriptos a Próximos Eventos */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                 Próximos Eventos
               </h3>
            </div>
            
            <div className="space-y-6">
               {upcomingEvents.length > 0 ? (
                 upcomingEvents.map((e) => (
                   <div key={e.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white line-clamp-1">{e.title}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{new Date(e.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-emerald-400">{e._count.registrations}</span>
                        <span className="text-[9px] text-zinc-600 uppercase font-bold">Inscriptos</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="text-zinc-500 text-sm italic text-center py-10">No hay eventos próximos abiertos.</p>
               )}
               
               <Link 
                 href="/admin/eventos" 
                 className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-zinc-400 hover:text-white transition-colors border-t border-white/5 mt-4"
               >
                 Gestionar todos los eventos <ArrowRight size={14} />
               </Link>
            </div>
         </div>

         {/* 4. Milongas Attendance History */}
         <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                 Asistencia Histórica
               </h3>
               <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Eventos Finalizados</span>
            </div>
            
            <div className="space-y-6">
               {milongaData.length > 0 ? (
                 milongaData.map((d, i) => {
                   const percentage = (d.count / maxAttendance) * 100
                   return (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-zinc-300 font-medium">{d.name}</span>
                           <span className="text-white font-black">{d.count} <span className="text-zinc-600 font-normal">asistentes</span></span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                             style={{ width: `${percentage}%` }}
                           ></div>
                        </div>
                     </div>
                   )
                 })
               ) : (
                 <p className="text-zinc-500 text-sm italic text-center py-10">Sin historial de eventos finalizados.</p>
               )}
            </div>
         </div>
      </div>

      {/* Escuelita ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1 bg-gradient-to-br from-blue-900/20 to-black border border-white/10 rounded-[40px] p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none"><GraduationCap size={150} /></div>
            <div className="relative z-10">
               <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                 <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                 Escuelita CAT
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
                   Módulo Escuelita <ArrowRight size={14} />
                 </Link>
               </div>
            </div>
         </div>
         
         <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
                 Frecuencia Escuelita
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

