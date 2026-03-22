"use client"
import { useState } from "react"
import { Plus, Star, X } from "lucide-react"
import { addBoardHistory } from "@/app/actions/board-history"

export function AddBoardHistoryForm({ memberId, name }: { memberId: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    await addBoardHistory({
      memberId,
      position: formData.get("position") as string,
      periodStart: formData.get("periodStart") as string,
      periodEnd: formData.get("periodEnd") as string,
      notes: formData.get("notes") as string,
    })
    
    setIsPending(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/10"
      >
        <Plus size={14} /> Cargar Gestión
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 p-8 rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
               <Star size={20} />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">Gestión de {name}</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Cargo / Función</label>
            <input name="position" placeholder="Presidente, Secretario, Vocal..." required className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Año Inicio</label>
              <input name="periodStart" placeholder="Ej: 2012" required className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Año Fin</label>
              <input name="periodEnd" placeholder="Ej: 2023 (opcional)" className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 pl-4">Notas / Observaciones</label>
            <textarea name="notes" placeholder="Múltiples gestiones, etc..." className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700 h-24 resize-none" />
          </div>

          <button 
            disabled={isPending}
            className="bg-blue-500 text-white p-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4"
          >
            {isPending ? "Grabando..." : "Guardar Historial de Gestión"}
          </button>
        </form>
      </div>
    </div>
  )
}
