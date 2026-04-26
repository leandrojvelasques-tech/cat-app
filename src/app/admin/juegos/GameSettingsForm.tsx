"use client"

import { useState } from "react"
import { Settings, Save, Loader2 } from "lucide-react"
import { updateGameConfig } from "@/app/actions/juegos"
import { toast } from "sonner"

export function GameSettingsForm({ config }: { config: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    questionsEasy: config.questionsEasy || 5,
    questionsMedium: config.questionsMedium || 5,
    questionsHard: config.questionsHard || 5,
    timeEasy: config.timeEasy || 10,
    timeMedium: config.timeMedium || 12,
    timeHard: config.timeHard || 15,
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateGameConfig({
        isActive: config.isActive,
        pointsCorrect: config.pointsCorrect,
        pointsIncorrect: config.pointsIncorrect,
        totalTimeLimit: config.totalTimeLimit,
        ...formData
      })
      toast.success("Configuración actualizada")
    } catch (error) {
      toast.error("Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border-t border-white/5 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={16} className="text-amber-500" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configuración del Juego</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fácil */}
        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest text-center">Fácil</h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Cantidad de preguntas</label>
              <input 
                type="number" 
                value={formData.questionsEasy}
                onChange={e => setFormData({...formData, questionsEasy: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Tiempo (segundos)</label>
              <input 
                type="number" 
                value={formData.timeEasy}
                onChange={e => setFormData({...formData, timeEasy: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Medio */}
        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="text-xs font-black text-yellow-400 uppercase tracking-widest text-center">Intermedio</h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Cantidad de preguntas</label>
              <input 
                type="number" 
                value={formData.questionsMedium}
                onChange={e => setFormData({...formData, questionsMedium: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Tiempo (segundos)</label>
              <input 
                type="number" 
                value={formData.timeMedium}
                onChange={e => setFormData({...formData, timeMedium: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Difícil */}
        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="text-xs font-black text-red-400 uppercase tracking-widest text-center">Difícil</h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Cantidad de preguntas</label>
              <input 
                type="number" 
                value={formData.questionsHard}
                onChange={e => setFormData({...formData, questionsHard: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Tiempo (segundos)</label>
              <input 
                type="number" 
                value={formData.timeHard}
                onChange={e => setFormData({...formData, timeHard: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar Configuración
        </button>
      </div>
    </div>
  )
}
