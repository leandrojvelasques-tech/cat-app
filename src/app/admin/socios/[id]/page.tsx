import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Edit, CheckCircle2, Mail, Users, AlertCircle, History, MapPin, Phone, User, CreditCard, Clock, Trophy, Medal, Star, X } from "lucide-react"
import { notFound } from "next/navigation"
import { DeactivateMemberButton } from "./DeactivateButton"
import { WelcomeMessageButton } from "./WelcomeMessageButton"
import { FamilyDiscountToggle } from "./FamilyDiscountToggle"
import { RegisterFeeForm } from "./RegisterFeeForm"
import { AddBoardHistoryForm } from "./AddBoardHistoryForm"
import { deleteBoardHistory } from "@/app/actions/board-history"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { calculateMemberStatus, getStatusBadgeStyles } from "@/lib/member-utils"

import { AvatarUpload } from "../components/AvatarUpload"

export default async function FichaSocioPage(props: any) {
  const params = await props.params
  const id = params?.id || props?.params?.id
  
  if (!id) {
    return notFound()
  }

  const member = await db.member.findUnique({
    where: { id },
    include: { 
      fees: { orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }], include: { recordedBy: true } },
      communications: { orderBy: { sentAt: "desc" } },
      partner: true,
      eventRegistrations: true,
      championshipResults: { include: { championship: true } },
      boardHistory: { orderBy: { periodStart: "desc" } }
    }
  }) as any

  if (!member) return notFound()

  const otherMembers = await db.member.findMany({
    where: { id: { not: id }, status: { notIn: ["INACTIVE", "DECEASED", "RESIGNED"] } },
    select: { id: true, firstName: true, lastName: true, memberNumber: true },
    orderBy: { lastName: 'asc' }
  }) as any[]

  const now = new Date()
  const calculatedStatus = calculateMemberStatus(member, now)
  const baseFeeAmount = 6000
  const feeAmount = member.isFamilyDiscount ? baseFeeAmount / 2 : baseFeeAmount
  
  // Dynamic Debt Calculation (matching business logic)
  const START_DATE = new Date(2025, 0, 1)
  const joinDate = member.joinDate ? new Date(member.joinDate) : START_DATE
  const trackFrom = joinDate > START_DATE ? joinDate : START_DATE
  const monthsExpected = (now.getFullYear() - trackFrom.getFullYear()) * 12 + (now.getMonth() - trackFrom.getMonth()) + 1
  const paidMonthsCount = member.fees.filter((f: any) => f.paymentStatus === "PAID").length
  const unpaidMonths = Math.max(0, monthsExpected - paidMonthsCount)
  const totalDebt = unpaidMonths * feeAmount

  const isInactive = calculatedStatus === 'BAJA'

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-8 relative z-10">
          <Link 
            href="/admin/socios"
            className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-white/5"
          >
            <ArrowLeft size={20} />
          </Link>
          
          <AvatarUpload memberId={member.id} currentAvatar={member.avatarUrl} />

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                {member.lastName}, {member.firstName}
              </h1>
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm ${getStatusBadgeStyles(calculatedStatus)}`}>
                {calculatedStatus}
              </span>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Socio #{member.memberNumber}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center relative z-10">
          <WelcomeMessageButton member={member} feeAmount={feeAmount} />
          <Link href={`/admin/socios/${member.id}/editar`} className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-2xl text-xs font-bold border border-white/5 transition-all">
            Editar
          </Link>
          <DeactivateMemberButton memberId={member.id} />
        </div>
        
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Key Stats and Tools */}
        <div className="space-y-8">
          {/* Debt Summary */}
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Estado de Deuda</p>
              <div className="flex items-baseline gap-2">
                 <p className={`text-4xl font-black ${totalDebt > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                   ${totalDebt.toLocaleString()}
                 </p>
                 <span className="text-zinc-600 font-mono text-xs italic">ARS</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                {unpaidMonths === 0 ? "Cuotas al día" : `Debe ${unpaidMonths} cuotas de $${feeAmount.toLocaleString()}`}
              </p>
              
              {totalDebt > 0 && (
                <Link 
                  href={`/admin/cobrar?socioId=${member.id}`}
                  className="mt-6 flex items-center justify-center gap-2 w-full bg-white text-black py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.03] transition-all shadow-lg shadow-white/5"
                >
                  Cobrar ahora
                </Link>
              )}
            </div>
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all ${totalDebt > 0 ? "bg-amber-500 group-hover:bg-amber-400" : "bg-emerald-500"}`}></div>
          </div>

          {/* Family Discount Toggle */}
          <FamilyDiscountToggle 
            memberId={member.id} 
            isFamilyDiscount={member.isFamilyDiscount} 
            partnerId={member.partnerId || null}
            otherMembers={otherMembers}
          />

          {/* Activity Mini Stats */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
             <div className="flex items-center gap-2 mb-4 text-zinc-500">
               <CheckCircle2 size={16} />
               <h3 className="text-xs font-black uppercase tracking-widest">Resumen Histórico</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                   <p className="text-zinc-600 text-[8px] font-black uppercase mb-1 tracking-wider">Cuotas Pagas</p>
                   <p className="text-xl font-black text-white">{paidMonthsCount}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                   <p className="text-zinc-600 text-[8px] font-black uppercase mb-1 tracking-wider">Asistencias</p>
                   <p className="text-xl font-black text-white">{(member as any).eventRegistrations?.length || 0}</p>
                </div>
             </div>
          </div>

          {/* Awards / Logros */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
             <div className="flex items-center gap-2 mb-4 text-amber-500">
               <Trophy size={16} />
               <h3 className="text-xs font-black uppercase tracking-widest italic">Logros Vientos de Tango</h3>
             </div>
             
             <div className="space-y-3">
                {member.championshipResults.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic text-center py-4 bg-black/20 rounded-xl border border-dashed border-white/5 uppercase font-black tracking-widest">Sin logros registrados</p>
                ) : (
                  member.championshipResults.map((award: any) => (
                    <div key={award.id} className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                         award.place === 1 ? "bg-amber-500/20 border-amber-500/30 text-amber-500" : 
                         award.place === 2 ? "bg-zinc-300/20 border-zinc-300/30 text-zinc-300" :
                         "bg-orange-800/20 border-orange-800/30 text-orange-800"
                       }`}>
                          <Medal size={16} />
                       </div>
                       <div className="flex-1">
                          <p className="text-white font-bold text-[11px] tracking-tight">{award.category} {award.championship.year}</p>
                          <p className="text-[9px] text-zinc-500 font-black uppercase">
                             {award.place === 1 ? "🥇 Campeón" : award.place === 2 ? "🥈 2do Puesto" : "🥉 3er Puesto"}
                          </p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Board History / Gestión */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Star size={16} />
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Gestión Institucional</h3>
                </div>
                <AddBoardHistoryForm memberId={member.id} name={member.firstName} />
             </div>
             
             <div className="space-y-3">
                {member.boardHistory.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic text-center py-4 bg-black/20 rounded-xl border border-dashed border-white/5 uppercase font-black tracking-widest">Sin historial de gestión</p>
                ) : (
                  member.boardHistory.map((history: any) => (
                    <div key={history.id} className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                       <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                          <Star size={16} />
                       </div>
                       <div className="flex-1">
                          <p className="text-white font-bold text-[11px] tracking-tight uppercase">{history.position}</p>
                          <p className="text-[9px] text-zinc-500 font-black uppercase">
                             {history.periodStart}{history.periodEnd ? ` - ${history.periodEnd}` : ''}
                          </p>
                       </div>
                       <form action={async () => { "use server"; await deleteBoardHistory(history.id, member.id) }}>
                          <button className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                             <X size={14} />
                          </button>
                       </form>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Detailed Info and Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <div className="w-1 h-6 bg-white/20 rounded-full"></div>
              Información del Socio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <div className="group">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">DNI</p>
                <p className="text-lg text-zinc-200 font-medium font-mono tracking-tight">{member.dni}</p>
              </div>
              <div className="group">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">Teléfono</p>
                <p className="text-lg text-zinc-200 font-medium">{member.phone || '-'}</p>
              </div>
              <div className="group lg:col-span-2">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">Email</p>
                <p className="text-lg text-zinc-200 font-medium">{member.email || '-'}</p>
              </div>
              <div className="group">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">Fecha de Nacimiento</p>
                <p className="text-lg text-zinc-200 font-medium">
                  {member.birthDate ? format(new Date(member.birthDate), "d 'de' MMMM", { locale: es }) : '-'}
                </p>
              </div>
              <div className="group">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">Socio desde</p>
                <p className="text-lg text-zinc-200 font-medium">
                  {format(new Date(member.joinDate), "MMMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Pay Form */}
          {!isInactive && (
            <div className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-white/5 rounded-[40px] p-10 backdrop-blur-md">
               <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter italic">Registrar Pago Rápido</h3>
               <RegisterFeeForm socioId={member.id} lastFee={member.fees?.[0]} />
            </div>
          )}

          {/* Payment History and Comm History Tabs */}
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-md shadow-2xl">
             <div className="flex gap-8 mb-8 border-b border-white/5">
                <button className="pb-4 text-xs font-black uppercase tracking-widest text-white border-b-2 border-white">Historial de Cuotas</button>
             </div>
             
             <div className="space-y-4">
                {(member as any).fees?.length === 0 ? (
                  <p className="text-center py-10 text-zinc-600 italic">No hay pagos registrados aún.</p>
                ) : (
                  (member as any).fees?.map((fee: any) => (
                    <div key={fee.id} className="flex justify-between items-center bg-black/20 p-5 rounded-[24px] border border-white/5 hover:border-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${fee.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                             <CreditCard size={18} />
                          </div>
                          <div>
                             <p className="text-zinc-200 font-bold uppercase tracking-tight">
                                {format(new Date(2024, fee.periodMonth-1, 1), 'MMMM', { locale: es })} {fee.periodYear}
                             </p>
                             <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                                Registrado el {format(new Date(fee.paymentDate), 'dd/MM/yyyy')}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-white font-black">${fee.amountPaid.toLocaleString()}</p>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${fee.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                             {fee.paymentStatus === 'PAID' ? 'COBRADO' : 'PENDIENTE'}
                          </span>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
