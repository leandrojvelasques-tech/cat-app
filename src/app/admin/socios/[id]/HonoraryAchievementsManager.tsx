"use client"

import { useState, useTransition } from "react"
import { createHonoraryAchievement, deleteHonoraryAchievement, updateHonoraryAchievement } from "@/app/actions/honorary-achievements"
import { Pencil, Plus, Save, Trash2, X } from "lucide-react"

type Achievement = {
  id: string
  title: string
  description: string | null
  eventDate: Date | string | null
  sortOrder: number
}

function dateValue(value: Achievement["eventDate"]) {
  return value ? new Date(value).toISOString().split("T")[0] : ""
}

export function HonoraryAchievementsManager({ memberId, achievements }: { memberId: string; achievements: Achievement[] }) {
  const [isPending, startTransition] = useTransition()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function submit(action: (formData: FormData) => Promise<void>, form: HTMLFormElement) {
    setError(null)
    const data = new FormData(form)
    startTransition(async () => {
      try {
        await action(data)
        setIsAdding(false)
        setEditingId(null)
        form.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar el reconocimiento.")
      }
    })
  }

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-white/5 to-white/[0.02] border border-amber-500/20 rounded-[40px] p-8 md:p-10 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Currículum honorario</p>
          <h3 className="text-2xl font-black text-white mt-1">Reconocimientos destacados</h3>
          <p className="text-sm text-zinc-400 mt-2">Estos antecedentes podrán aparecer en el mural público de socios honorarios.</p>
        </div>
        {!isAdding && <button type="button" onClick={() => setIsAdding(true)} className="inline-flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-400"><Plus size={16} /> Agregar antecedente</button>}
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>}

      {isAdding && <AchievementForm memberId={memberId} onCancel={() => setIsAdding(false)} onSubmit={(form) => submit((payload) => createHonoraryAchievement(memberId, payload), form)} isPending={isPending} />}

      <div className="space-y-3">
        {achievements.length === 0 && !isAdding ? <p className="py-8 text-center text-sm italic text-zinc-500 border border-dashed border-white/10 rounded-2xl">Todavía no hay reconocimientos cargados.</p> : achievements.map((achievement) => editingId === achievement.id ? <AchievementForm key={achievement.id} memberId={memberId} achievement={achievement} onCancel={() => setEditingId(null)} onSubmit={(form) => submit((payload) => updateHonoraryAchievement(achievement.id, memberId, payload), form)} isPending={isPending} /> : <div key={achievement.id} className="flex flex-col md:flex-row md:items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h4 className="font-bold text-white">{achievement.title}</h4>{achievement.eventDate && <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">{new Date(achievement.eventDate).getFullYear()}</span>}</div>{achievement.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{achievement.description}</p>}</div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => setEditingId(achievement.id)} className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white" aria-label="Editar reconocimiento"><Pencil size={15} /></button><button type="button" disabled={isPending} onClick={() => startTransition(async () => { try { await deleteHonoraryAchievement(achievement.id, memberId) } catch (err) { setError(err instanceof Error ? err.message : "No se pudo eliminar el reconocimiento.") } })} className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-red-400" aria-label="Eliminar reconocimiento"><Trash2 size={15} /></button></div></div>)}
      </div>
    </section>
  )
}

function AchievementForm({ achievement, onCancel, onSubmit, isPending }: { memberId: string; achievement?: Achievement; onCancel: () => void; onSubmit: (form: HTMLFormElement) => void; isPending: boolean }) {
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(event.currentTarget) }} className="mb-5 space-y-4 rounded-2xl border border-amber-500/20 bg-black/20 p-5"><div className="grid grid-cols-1 md:grid-cols-[1fr_180px_100px] gap-4"><input name="title" defaultValue={achievement?.title || ""} placeholder="Título del antecedente" required className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none" /><input name="eventDate" type="date" defaultValue={dateValue(achievement?.eventDate || null)} className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:outline-none" /><input name="sortOrder" type="number" min="0" defaultValue={achievement?.sortOrder || 0} placeholder="Orden" className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:outline-none" /></div><textarea name="description" defaultValue={achievement?.description || ""} rows={3} placeholder="Descripción opcional: obra, institución, categoría o contexto" className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none" /><div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"><X size={15} /> Cancelar</button><button disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-zinc-950 hover:bg-amber-400"><Save size={15} /> {isPending ? "Guardando..." : "Guardar"}</button></div></form>
}
