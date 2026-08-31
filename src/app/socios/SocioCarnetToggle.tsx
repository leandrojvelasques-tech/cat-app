"use client"

import { useState } from "react"
import { CreditCard, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import {
  AttendedMilonga,
  DigitalMemberCard,
  DigitalMemberCardMember,
  MemberAward,
} from "./DigitalMemberCard"

interface SocioCarnetToggleProps {
  member: DigitalMemberCardMember
  awards: MemberAward[]
  attendedMilongas: AttendedMilonga[]
  calculatedStatus?: string
}

export function SocioCarnetToggle({ member, awards, attendedMilongas, calculatedStatus }: SocioCarnetToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-5 rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold leading-tight text-white md:text-2xl">
              Carnet digital CAT
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-cat-gold" />
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Presente su carnet para acceder a los beneficios y milongas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-5 py-3 text-xs font-semibold text-amber-400 shadow-md transition-all hover:from-amber-500/30 hover:to-amber-500/20 active:scale-[0.98] sm:w-auto"
        >
          <Sparkles size={16} />
          {isOpen ? "Ocultar carnet" : "Ver mi carnet"}
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
