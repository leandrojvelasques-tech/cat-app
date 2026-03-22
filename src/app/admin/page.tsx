import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Users, TrendingUp, CreditCard, AlertTriangle, Activity, UserPlus, FileText, ArrowRight, UserCheck, AlertCircle } from "lucide-react"
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

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  
  // 1. Revenue 2025
  const revenue2025 = await db.membershipFee.groupBy({
    by: ['periodMonth'],
    where: { periodYear: 2025 },
    _sum: { amountPaid: true },
    orderBy: { periodMonth: 'asc' }
  })
  const revenueData = months.map((m, i) => {
    const rev = revenue2025.find(r => r.periodMonth === i + 1)
    return { month: m, total: rev?._sum.amountPaid || 0 }
  })
  const maxRevenue = Math.max(...revenueData.map(d => d.total as number), 1)

  // 2. Member Variation 2025
  // We'll calculate cumulative active members at end of each month
  const activeSeries = []
  for(let m=1; m<=12; m++) {
    const joined = await db.member.count({ 
      where: { joinDate: { lte: new Date(2025, m, 0) } } 
    })
    const left = await db.member.count({ 
      where: { deactivatedAt: { lte: new Date(2025, m, 0) }, status: 'RESIGNED' } 
    })
    activeSeries.push({ month: months[m-1], active: joined - left })
  }
  const maxActive = Math.max(...activeSeries.map(s => s.active), 1)

  // 3. Milonga Attendance (Last 4 + Main)
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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Dashboard Administrativo</h1>
          <p className="text-zinc-400 mt-1 uppercase text-[10px] tracking-[0.2em] font-black">Centro Amigos del Tango - Producción v2.1</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-zinc-500 text-xs font-bold mb-1">Última Sincronización</p>
           <p className="text-emerald-500 font-mono text-sm">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Inactivos</p>
           <p className="text-2xl font-black text-white">{sociosInactivos}</p>
           <p className="text-[8px] text-zinc-500 font-medium leading-tight mt-1">Con actividad reciente</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl border-red-500/20">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2 text-red-400">Suspendidos</p>
           <p className="text-2xl font-black text-white">{sociosSuspendidos}</p>
           <p className="text-[8px] text-red-500/50 font-medium leading-tight mt-1">Sin actividad &gt; 12 meses</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group shadow-xl opacity-60">
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-2">Bajas / Archivo</p>
           <p className="text-2xl font-black text-white">{sociosBaja}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* 1. Recaudación Chart */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              Recaudación Mensual (Cuotas 2025)
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
               {months.map(m => <span key={m} className="text-[10px] text-zinc-600 font-mono italic">{m}</span>)}
            </div>
         </div>

         {/* 2. Variación de Socios Chart */}
         <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Variación Socios Activos (Neto)
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
               {months.map(m => <span key={m} className="text-[10px] text-zinc-600 font-mono italic">{m}</span>)}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* 3. Milongas Attendance */}
         <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                 Asistencia Milongas (Vecinal km3)
               </h3>
               <span className="text-[10px] text-zinc-500 font-mono">ÚLTIMOS 5 EVENTOS</span>
            </div>
            
            <div className="space-y-6">
               {milongaData.map((d, i) => {
                 const percentage = (d.count / maxAttendance) * 100
                 return (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-zinc-300 font-medium">{d.name}</span>
                         <span className="text-white font-black">{d.count} <span className="text-zinc-600 font-normal">asistentes</span></span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000"
                           style={{ width: `${percentage}%` }}
                         ></div>
                      </div>
                   </div>
                 )
               })}
            </div>
         </div>

         <div className="bg-gradient-to-br from-amber-600/10 to-red-800/10 border border-white/5 rounded-[40px] p-8 backdrop-blur-md flex flex-col justify-between">
            <div>
               <h3 className="text-lg font-bold mb-6 text-white/90 uppercase tracking-tighter">Acceso Rápido</h3>
               <div className="space-y-3">
                  <Link 
                    href="/admin/cobrar"
                    className="w-full bg-white text-zinc-950 py-4 rounded-2xl transition-all text-xs font-black uppercase tracking-widest block text-center shadow-lg hover:scale-[1.03] active:scale-95"
                  >
                    NUEVO COBRO
                  </Link>
                  <button className="w-full bg-white/5 hover:bg-white/10 text-white/70 py-3 rounded-xl border border-white/5 transition-all text-xs font-bold">
                     NOTIFICAR MOROSOS
                  </button>
               </div>
            </div>
            
            <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-white/5">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Base de Datos</span>
               </div>
               <p className="text-[10px] text-zinc-600 leading-relaxed italic">
                  Sincronizado con km3 y Planilla Real Socios.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
