"use client"

import { useState } from "react"
import { Trash2, AlertCircle, X } from "lucide-react"
import { deactivateMember } from "@/app/actions/socios"

export function DeactivateMemberButton({ memberId }: { memberId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [reason, setReason] = useState("RESIGNED")
  const [notes, setNotes] = useState("")

  const handleDeactivate = async () => {
    setIsPending(true)
    try {
      await deactivateMember(memberId, reason, notes)
    } finally {
      setIsPending(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-red-500/20"
      >
        <Trash2 size={16} /> Dar de Baja
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <AlertCircle size={24} />
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-xl font-semibold mb-2">Confirmar Baja de Socio</h3>
            <p className="text-zinc-400 text-sm mb-6">
              El socio será transferido al **Archivo de Socios**. Podrás consultar su ficha allí, pero ya no aparecerá en el Directorio activo.
            </p>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Motivo de Baja</label>
                <select 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="RESIGNED">Renuncia Voluntaria</option>
                  <option value="DECEASED">Fallecimiento</option>
                  <option value="INACTIVE">Morosidad / Decisión Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Observaciones (Opcional)</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-red-500/50"
                  rows={3}
                  placeholder="Detalles sobre la baja..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-medium transition-colors border border-white/5"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeactivate}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
              >
                {isPending ? "Procesando..." : "Confirmar Baja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
