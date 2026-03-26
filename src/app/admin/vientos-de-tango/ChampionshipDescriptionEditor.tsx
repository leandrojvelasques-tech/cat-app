"use client"

import { useState, useTransition } from "react"
import { FileText, Edit2, Check, X } from "lucide-react"
import { updateChampionshipDescription } from "@/app/actions/vientos-de-tango"

interface Props {
  championshipId: string
  initialDescription: string
}

export function ChampionshipDescriptionEditor({ championshipId, initialDescription }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialDescription)
  const [saved, setSaved] = useState(initialDescription)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      await updateChampionshipDescription(championshipId, value)
      setSaved(value)
      setIsEditing(false)
    })
  }

  const handleCancel = () => {
    setValue(saved)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <FileText size={12} /> Descripción del Campeonato
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          placeholder="Descripción de la edición, sede, fecha, contexto histórico..."
          className="w-full bg-black/40 border border-amber-500/30 rounded-2xl px-4 py-3 text-zinc-300 text-sm focus:outline-none focus:border-amber-500/60 resize-none placeholder:text-zinc-700"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
          >
            <Check size={12} /> {isPending ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group/desc relative">
      {saved ? (
        <div className="flex items-start justify-between gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <FileText size={14} className="text-zinc-600 mt-0.5 shrink-0" />
            <p className="text-zinc-400 text-sm leading-relaxed">{saved}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover/desc:opacity-100 p-1.5 text-zinc-600 hover:text-amber-500 transition-all rounded-lg hover:bg-white/5"
          >
            <Edit2 size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center gap-2 text-zinc-700 hover:text-zinc-400 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-2xl border border-dashed border-white/5 hover:border-white/10 transition-all"
        >
          <FileText size={12} />
          + Agregar descripción del campeonato
        </button>
      )}
    </div>
  )
}
