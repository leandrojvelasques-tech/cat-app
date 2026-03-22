import { db } from "@/lib/db"
import { CreditCard, Search, Calendar, UserCheck, UserX, AlertCircle, DollarSign, Filter, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"
import { CobranzasFilters } from "./CobranzasFilters"

async function getSetting(key: string, defaultValue: string = "") {
  const setting = await db.setting.findUnique({ where: { key } })
  return setting?.value || defaultValue
}

export default async function CobranzasPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; query?: string; filter?: string }>
}) {
  const { month, year, query = "", filter = "all" } = await searchParams
  
  const now = new Date()
  const currentMonth = month ? parseInt(month) : now.getMonth() + 1
  const currentYear = year ? parseInt(year) : now.getFullYear()
  
  const cuotaMensual = parseFloat(await getSetting("cuota_mensual", "6000"))
  
  // Get all members with their entire history
  const membersData = await db.member.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { dni: { contains: query } },
          ]
        } : {},
      ]
    },
    include: {
      fees: true,
      eventRegistrations: true
    },
    orderBy: { memberNumber: 'asc' }
  } as any) as any[]

  // Recalculate collection metrics specifically for the selected month
  const currentMonthFees = await db.membershipFee.findMany({
    where: { periodMonth: currentMonth, periodYear: currentYear }
  })
  
  const totalCollected = currentMonthFees.reduce((acc, fee) => acc + fee.amountPaid, 0)
  
  // Dynamic Global Statuses for counters
  let countAlDiaTotal = 0
  let countDeudoresTotal = 0
  let countInactivosTotal = 0
  let countSuspendidosTotal = 0
  let countBajaTotal = 0

  membersData.forEach(m => {
    const status = calculateMemberStatus(m, now)
    if (status === 'AL DIA') countAlDiaTotal++
    else if (status === 'EN MORA') countDeudoresTotal++
    else if (status === 'INACTIVO') countInactivosTotal++
    else if (status === 'SUSPENDIDO') countSuspendidosTotal++
    else if (status === 'BAJA') countBajaTotal++
  })

  // Apply payment status filter for the list (contextual to the selected month)
  const filteredMembers = membersData.filter(member => {
    // If we are looking for non-archived pool:
    const status = calculateMemberStatus(member, now)
    if (status === 'BAJA') return false

    const hasPaidSelectedMonth = member.fees.some((f: any) => f.periodMonth === currentMonth && f.periodYear === currentYear && f.paymentStatus === 'PAID')
    
    if (filter === 'paid') return hasPaidSelectedMonth
    if (filter === 'debtor') return !hasPaidSelectedMonth
    return true
  })

  const totalPossible = (countAlDiaTotal + countDeudoresTotal) * cuotaMensual

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <CobranzasFilters 
        currentMonth={currentMonth} 
        currentYear={currentYear} 
        currentQuery={query} 
      />

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest">Recaudación</span>
          </div>
          <p className="text-2xl font-black text-white">${totalCollected.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Cobrado este mes</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <UserCheck size={20} />
            </div>
            <Link 
               href="?filter=paid" 
               className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest hover:text-emerald-400 transition-colors"
            >
              Ver Pagados
            </Link>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-white">{countAlDiaTotal}</p>
            <span className="text-xs text-zinc-500 font-bold">Socios</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Al día con la cuota</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <Link 
               href="?filter=debtor" 
               className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest hover:text-amber-400 transition-colors"
            >
              Ver Deudores
            </Link>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-white">{countDeudoresTotal}</p>
            <span className="text-xs text-zinc-500 font-bold">Socios</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">En mora (&lt; 3 meses)</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
              <UserX size={20} />
            </div>
            <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Suspendidos</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-white">{countSuspendidosTotal}</p>
            <span className="text-xs text-zinc-500 font-bold">Socios</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Sin actividad &gt; 12 meses</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1">
             {/* Search input is now inside CobranzasFilters for interactivity */}
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
              <Link href="/admin/cuotas" className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Todos</Link>
              <Link href="?filter=paid" className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'paid' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Pagados</Link>
              <Link href="?filter=debtor" className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'debtor' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Deudores</Link>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10">
                <th className="py-5 pl-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Socio</th>
                <th className="py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Estado Real</th>
                <th className="py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Estado Mes</th>
                <th className="py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Cuota Est.</th>
                <th className="py-5 pr-8 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member: any) => {
                const monthFee = member.fees.find((f: any) => f.periodMonth === currentMonth && f.periodYear === currentYear)
                const isPaid = monthFee?.paymentStatus === 'PAID'
                const calculatedStatus = calculateMemberStatus(member, now)
                
                return (
                  <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-6 pl-8">
                      <div className="flex flex-col">
                        <span className="text-zinc-100 font-bold group-hover:text-amber-400 transition-colors uppercase tracking-tight">{member.lastName}, {member.firstName}</span>
                        <span className="text-[10px] text-zinc-600 font-black tracking-widest">#{member.memberNumber} | {member.dni}</span>
                      </div>
                    </td>
                    <td className="py-6">
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border shadow-sm ${getStatusBadgeStyles(calculatedStatus)}`}>
                         {calculatedStatus}
                       </span>
                    </td>
                    <td className="py-6">
                       {isPaid ? (
                         <div className="flex items-center gap-2 text-emerald-400">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[10px] font-black uppercase tracking-widest">PAGO REGISTRADO</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-zinc-600">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                           <span className="text-[10px] font-black uppercase tracking-widest">PENDIENTE</span>
                         </div>
                       )}
                    </td>
                    <td className="py-6">
                      <span className="text-white font-mono text-sm">${(member.isFamilyDiscount ? cuotaMensual/2 : cuotaMensual).toLocaleString()}</span>
                    </td>
                    <td className="py-6 pr-8 text-right">
                       <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin/cobrar?socioId=${member.id}`}
                            className="bg-white text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200 active:scale-95 shadow-lg"
                          >
                            COBRAR
                          </Link>
                          <Link 
                            href={`/admin/socios/${member.id}`}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            VER
                          </Link>
                       </div>
                    </td>
                  </tr>
                )
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-600 italic">
                    No se encontraron socios con los filtros actuales.
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
