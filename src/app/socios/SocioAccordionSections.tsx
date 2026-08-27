"use client"

import { useState } from "react"
import { History, User, ChevronDown, ChevronUp, CheckCircle2, Star, ArrowRight, Shield } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SocioAccordionSectionsProps {
  member: {
    dni: string
    email: string | null
    phone: string | null
    address: string | null
    fees: Array<{
      id: string
      periodYear: number
      periodMonth: number
      amountPaid: number
      paymentDate: string
      paymentStatus: string
    }>
    boardHistory?: Array<{
      id: string
      position: string
      periodStart: number
      periodEnd: number | null
    }>
  }
  isAlDia: boolean
}

export function SocioAccordionSections({ member, isAlDia }: SocioAccordionSectionsProps) {
  const [openSection, setOpenSection] = useState<"FEES" | "DATA" | "BOARD" | null>(null)

  const toggleSection = (section: "FEES" | "DATA" | "BOARD") => {
    setOpenSection(prev => prev === section ? null : section)
  }

  return (
    <div className="space-y-6 pt-4">
      {/* 1. Historial de Cuotas / Estado de Pagos (Desplegable) */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-[32px] overflow-hidden transition-all">
        <button 
          onClick={() => toggleSection("FEES")}
          className="w-full p-6 md:p-8 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <History size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold leading-tight text-white md:text-2xl">
                Historial de cuotas
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                {member.fees.length} pagos registrados {isAlDia ? "• Estado: Al Día" : "• Pago pendiente"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!isAlDia && (
              <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/20">
                PAGO PENDIENTE
              </span>
            )}
            <div className="p-2 bg-white/5 rounded-full text-zinc-400 group-hover:text-white transition-colors">
              {openSection === "FEES" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </button>

        {openSection === "FEES" && (
          <div className="p-6 md:p-8 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent] mt-4">
              {member.fees.length === 0 ? (
                <p className="text-center py-10 text-zinc-600 font-bold uppercase tracking-widest italic text-xs">
                  Sin pagos registrados en el sistema
                </p>
              ) : (
                member.fees.map((fee) => (
                  <div key={fee.id} className="flex justify-between items-center p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        fee.paymentStatus === 'PAID' 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : fee.paymentStatus === 'PENDING'
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm uppercase italic">
                          {format(new Date(2024, fee.periodMonth-1, 1), 'MMMM', { locale: es })} {fee.periodYear}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          {fee.paymentStatus === 'PENDING' ? "Comprobante en verificación" : `Pagado el ${format(new Date(fee.paymentDate), 'dd/MM/yyyy')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-white tracking-widest">${fee.amountPaid.toLocaleString()}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                        fee.paymentStatus === 'PAID' 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : fee.paymentStatus === 'PENDING'
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {fee.paymentStatus === 'PAID' ? "CONFIRMADO" : fee.paymentStatus === 'PENDING' ? "EN VERIFICACIÓN" : "PENDIENTE"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div>
                <p className="text-zinc-400 text-xs font-medium">¿Necesita asistencia con su estado de cuenta?</p>
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-0.5">Comuníquese vía WhatsApp a Secretaría</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Mis Datos Personales (Desplegable) */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-[32px] overflow-hidden transition-all">
        <button 
          onClick={() => toggleSection("DATA")}
          className="w-full p-6 md:p-8 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 text-zinc-400 flex items-center justify-center shrink-0">
              <User size={22} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold leading-tight text-white md:text-2xl">
                Mis datos de ficha
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                DNI {member.dni} • {member.email || "Sin Email"}
              </p>
            </div>
          </div>
          <div className="p-2 bg-white/5 rounded-full text-zinc-400 group-hover:text-white transition-colors shrink-0">
            {openSection === "DATA" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {openSection === "DATA" && (
          <div className="p-6 md:p-8 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { label: "DNI / Documento", value: member.dni },
                { label: "Correo Electrónico", value: member.email || "No registrado" },
                { label: "Teléfono Móvil", value: member.phone || "No registrado" },
                { label: "Dirección", value: member.address || "No registrada" }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500">{item.label}</span>
                  <p className="text-white font-medium text-sm mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Gestión Institucional / Historial de Comisión Directiva (si aplica) */}
      {member.boardHistory && member.boardHistory.length > 0 && (
        <div className="bg-zinc-900/40 border border-white/10 rounded-[32px] overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection("BOARD")}
            className="w-full p-6 md:p-8 flex justify-between items-center text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold leading-tight text-white md:text-2xl">
                  Gestión institucional
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {member.boardHistory[0].position} ({member.boardHistory[0].periodStart}{member.boardHistory[0].periodEnd ? ` - ${member.boardHistory[0].periodEnd}` : ' - Presente'})
                </p>
              </div>
            </div>
            <div className="p-2 bg-white/5 rounded-full text-zinc-400 group-hover:text-white transition-colors shrink-0">
              {openSection === "BOARD" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {openSection === "BOARD" && (
            <div className="p-6 md:p-8 pt-0 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="space-y-3 mt-4">
                {member.boardHistory.map((history) => (
                  <div key={history.id} className="flex gap-4 items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm uppercase">{history.position}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                        Período {history.periodStart}{history.periodEnd ? ` - ${history.periodEnd}` : ' - Presente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
