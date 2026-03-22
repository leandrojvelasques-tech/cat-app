"use client"
import { useState } from "react"
import { Plus, Trophy, X, Users, Search } from "lucide-react"
import { addChampionshipResult } from "@/app/actions/vientos-de-tango"

export function AddResultForm({ 
  championshipId, 
  year, 
  members 
}: { 
  championshipId: string
  year: number
  members: any[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const categories = ["TANGO PISTA", "MILONGA", "VALS", "TANGO ESCENARIO"]
  
  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberNumber.toString().includes(searchTerm)
  ).slice(0, 5)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    await addChampionshipResult({
      championshipId,
      category: formData.get("category") as string,
      place: parseInt(formData.get("place") as string),
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      partnerName: formData.get("partnerName") as string,
      memberId: formData.get("memberId") as string || undefined,
    })
    
    setIsPending(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
      >
        <Plus size={14} /> Agregar Podio {year}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 p-8 rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
               <Trophy size={20} />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">Vientos de Tango {year}</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Categoría</label>
              <select name="category" required className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                {categories.map(c => <option key={c} value={c} className="bg-zinc-950">{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Puesto</label>
              <select name="place" required className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                <option value="1" className="bg-zinc-950">1° Puesto (Campeón)</option>
                <option value="2" className="bg-zinc-950">2° Puesto</option>
                <option value="3" className="bg-zinc-950">3° Puesto</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Pareja (Nombre Completo)</label>
            <div className="flex gap-4">
               <input name="firstName" placeholder="Nombre" required className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700" />
               <input name="lastName" placeholder="Apellido" required className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Nombre del Acompañante/Pareja</label>
            <input name="partnerName" placeholder="Opcional" className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700" />
          </div>

          <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-amber-500" />
              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Vincular con Socio Actual (Opcional)</p>
            </div>
            
            <div className="relative mb-4">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
               <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Buscar socio..." 
                 className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white" 
               />
               <input type="hidden" name="memberId" id="memberIdInput" />
            </div>

            {searchTerm && (
              <div className="flex flex-col gap-1">
                {filteredMembers.map(m => (
                  <button 
                    key={m.id}
                    type="button"
                    onClick={() => {
                        setSearchTerm(`${m.firstName} ${m.lastName}`)
                        const input = document.getElementById('memberIdInput') as HTMLInputElement
                        if (input) input.value = m.id
                    }}
                    className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-xs transition-all"
                  >
                    <span className="text-zinc-200">{m.lastName}, {m.firstName}</span>
                    <span className="text-[10px] text-zinc-500 font-black uppercase">Socio #{m.memberNumber}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            disabled={isPending}
            className="bg-white text-zinc-950 p-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4"
          >
            {isPending ? "Grabando..." : "Guardar Logro"}
          </button>
        </form>
      </div>
    </div>
  )
}
