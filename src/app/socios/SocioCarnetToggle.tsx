"use client"

import { useState } from "react"
import { CreditCard, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { DigitalMemberCard, AttendedMilonga } from "./DigitalMemberCard"

interface SocioCarnetToggleProps {
  member: any
  awards: any[]
  attendedMilongas: AttendedMilonga[]
  calculatedStatus?: string
}

export function SocioCarnetToggle({ member, awards, attendedMilongas, calculatedStatus }: SocioCarnetToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
              Carnet Digital CAT
            </h2>
            <p className="text-xs text-zinc-400">
              Presente su carnet interactivo para acceder a los beneficios y milongas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
        >
          <Sparkles size={16} />
          {isOpen ? "Ocultar Carnet" : "Ver mi Carnet Digital"}
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 pt-2">
          <DigitalMemberCard 
            member={member} 
            awards={awards} 
            attendedMilongas={attendedMilongas} 
            calculatedStatus={calculatedStatus}
          />
        </div>
      )}
    </div>
  )
}
