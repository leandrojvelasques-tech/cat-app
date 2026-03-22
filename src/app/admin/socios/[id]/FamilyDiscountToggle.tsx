"use client"

import { useState } from "react"
import { Users, Check } from "lucide-react"
import { updateMemberDiscount } from "@/app/actions/socios"
import { useRouter } from "next/navigation"

interface Props {
  memberId: string
  isFamilyDiscount: boolean
  partnerId: string | null
  otherMembers: { id: string, firstName: string, lastName: string, memberNumber: number }[]
}

export function FamilyDiscountToggle({ memberId, isFamilyDiscount, partnerId, otherMembers }: Props) {
  const [enabled, setEnabled] = useState(isFamilyDiscount)
  const [selectedPartner, setSelectedPartner] = useState(partnerId || "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateMemberDiscount(memberId, enabled, selectedPartner || undefined)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/90">
          <Users size={18} className="text-blue-400" />
          <span className="text-sm font-medium">Descuento Familiar (50%)</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)} 
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {enabled && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Vincular con otro socio:</p>
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
          >
            <option value="">Seleccionar socio...</option>
            {otherMembers.map(m => (
              <option key={m.id} value={m.id}>
                #{m.memberNumber} - {m.lastName}, {m.firstName}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
          saved 
            ? "bg-emerald-500 text-white" 
            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
        }`}
      >
        {loading ? "Guardando..." : saved ? (
          <span className="flex items-center justify-center gap-2"><Check size={14} /> Guardado</span>
        ) : "Actualizar Beneficio"}
      </button>
    </div>
  )
}
