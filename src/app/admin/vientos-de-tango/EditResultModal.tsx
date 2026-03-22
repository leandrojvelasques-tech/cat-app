"use client"

import { useState } from "react"
import { Edit, X, Trophy, User, Check, Search } from "lucide-react"
import { updateChampionshipResult } from "@/app/actions/vientos-de-tango"

interface Championship {
  id: string
  year: number
}

interface Member {
  id: string
  firstName: string
  lastName: string
  memberNumber: string
}

interface Result {
  id: string
  category: string
  place: number
  firstName: string
  lastName: string
  partnerName: string | null
  memberId: string | null
  championshipId: string
}

export function EditResultModal({ 
  result, 
  members, 
  allChampionships 
}: { 
  result: Result, 
  members: Member[],
  allChampionships: Championship[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    championshipId: result.championshipId,
    category: result.category,
    place: result.place,
    firstName: result.firstName,
    lastName: result.lastName,
    partnerName: result.partnerName || "",
    memberId: result.memberId || ""
  })

  const [searchTerm, setSearchTerm] = useState("")

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberNumber.toString().includes(searchTerm)
  ).slice(0, 5)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateChampionshipResult(result.id, {
        ...formData,
        memberId: formData.memberId || null
      })
      setIsOpen(false)
    } catch (e) {
      alert("Error al actualizar")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5"
        title="Editar Podio"
      >
        <Edit size={16} />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
           <div>
             <h2 className="text-2xl font-black text-white flex items-center gap-3 italic uppercase">
               <Trophy size={24} className="text-amber-500" />
               Editar Podio
             </h2>
           </div>
           <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
              <X size={24} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block ml-4">Año / Edición</label>
                <select 
                  value={formData.championshipId}
                  onChange={e => setFormData({...formData, championshipId: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none appearance-none"
                >
                  {allChampionships.sort((a, b) => b.year - a.year).map(c => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">Edición {c.year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block ml-4">Categoría</label>
                <input 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value.toUpperCase()})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block ml-4">Puesto</label>
                <select 
                  value={formData.place}
                  onChange={e => setFormData({...formData, place: parseInt(e.target.value)})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none appearance-none"
                >
                  <option value={1} className="bg-zinc-900">1º Puesto (Campeón)</option>
                  <option value={2} className="bg-zinc-900">2º Puesto</option>
                  <option value={3} className="bg-zinc-900">3º Puesto</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block ml-4">Nombre</label>
                <input 
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block ml-4">Apellido</label>
                <input 
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block ml-4">Pareja (Nombre Completo)</label>
                <input 
                  value={formData.partnerName}
                  onChange={e => setFormData({...formData, partnerName: e.target.value})}
                  placeholder="Opcional..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                />
              </div>
           </div>

           {/* LINKING SECTION */}
           <div className="bg-amber-500/5 p-6 rounded-[32px] border border-amber-500/10">
              <label className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-4 block">Asociar con Socio del CAT</label>
              
              <div className="relative mb-4">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                 <input 
                   type="text"
                   placeholder="Buscar socio por nombre o #..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-amber-500/50"
                 />
              </div>

              <div className="space-y-2">
                 {searchTerm && filteredMembers.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, memberId: m.id})
                        setSearchTerm("")
                      }}
                      className={`w-full flex justify-between items-center p-3 rounded-xl transition-all ${
                        formData.memberId === m.id ? 'bg-amber-500 text-zinc-950' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                       <span className="font-bold">{m.lastName}, {m.firstName}</span>
                       <span className="text-[10px] uppercase font-black italic opacity-60">Socio #{m.memberNumber}</span>
                    </button>
                 ))}
                 {!searchTerm && formData.memberId && (
                   <div className="flex justify-between items-center p-4 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <Check size={18} />
                        <span className="font-bold text-xs uppercase italic">Vinculado a: {members.find(m => m.id === formData.memberId)?.lastName}, {members.find(m => m.id === formData.memberId)?.firstName}</span>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, memberId: ""})} className="text-[10px] font-black underline hover:text-white transition-colors">DESVINCULAR</button>
                   </div>
                 )}
              </div>
           </div>

           <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-white/5 text-white/50 p-4 rounded-2xl font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-amber-500 text-zinc-950 p-4 rounded-2xl font-black hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
           </div>
        </form>
      </div>
    </div>
  )
}
