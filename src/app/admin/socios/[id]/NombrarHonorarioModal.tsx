"use client"

import { useState } from "react"
import { nombrarSocioHonorario } from "@/app/actions/socios"
import { Award, X, Check, ShieldAlert } from "lucide-react"

export function NombrarHonorarioModal({ memberId, isHonorario }: { memberId: string, isHonorario: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [honorarioDate, setHonorarioDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError("Por favor indique el motivo de la designación.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await nombrarSocioHonorario(memberId, reason, honorarioDate)
      setIsOpen(false)
      setReason("")
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al registrar el nombramiento.")
    } finally {
      setLoading(false)
    }
  }

  if (isHonorario) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 px-4 py-2.5 rounded-2xl">
        <Award className="text-amber-400 shrink-0" size={18} />
        <div>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Categoría Honoraria Activa</p>
          <p className="text-[10px] text-zinc-400">Exento del cobro de cuotas mensuales</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 hover:from-amber-500/30 hover:to-yellow-600/30 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-900/10"
      >
        <Award size={16} /> Nombrar Socio Honorario
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Elevar a Socio Honorario</h3>
                  <p className="text-xs text-zinc-400">El socio dejará de abonar cuotas sin caer en morosidad.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Fecha de Resolución / Nombramiento</label>
                <input
                  type="date"
                  value={honorarioDate}
                  onChange={(e) => setHonorarioDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Motivo / Justificación *
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describa los méritos o razones institucionales por las cuales se otorga la categoría de Socio Honorario..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                >
                  <Check size={16} /> {loading ? "Registrando..." : "Confirmar Nombramiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
