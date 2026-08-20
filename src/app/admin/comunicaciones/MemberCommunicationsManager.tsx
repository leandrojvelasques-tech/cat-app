"use client"

import { useState, useTransition } from "react"
import { FileText, Eye, EyeOff, Plus, Trash2, Upload, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { createMemberCommunication, deleteMemberCommunication, toggleMemberCommunication } from "@/app/actions/member-communications"

type Communication = {
  id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  status: string
  publishedAt: Date | null
  createdAt: Date
}

export function MemberCommunicationsManager({ initialCommunications }: { initialCommunications: Communication[] }) {
  const [communications, setCommunications] = useState(initialCommunications)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const refreshFromServer = () => window.location.reload()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const result = await createMemberCommunication(data)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Comunicación guardada como borrador")
      setIsModalOpen(false)
      refreshFromServer()
    })
  }

  const handleToggle = (communication: Communication) => {
    startTransition(async () => {
      const publish = communication.status !== "PUBLISHED"
      const result = await toggleMemberCommunication(communication.id, publish)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(publish ? "Comunicación publicada para los socios" : "Comunicación retirada de la vista de socios")
      setCommunications((current) => current.map((item) => item.id === communication.id ? { ...item, status: publish ? "PUBLISHED" : "DRAFT", publishedAt: publish ? new Date() : null } : item))
    })
  }

  const handleDelete = (communication: Communication) => {
    if (!confirm(`¿Eliminar la comunicación “${communication.title}”?`)) return
    startTransition(async () => {
      const result = await deleteMemberCommunication(communication.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Comunicación eliminada")
      setCommunications((current) => current.filter((item) => item.id !== communication.id))
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400 font-black">Registro institucional</p>
          <p className="text-sm text-zinc-400 mt-1">{communications.filter((item) => item.status === "PUBLISHED").length} publicadas · {communications.filter((item) => item.status !== "PUBLISHED").length} borradores</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-lg shadow-amber-900/20">
          <Plus size={17} /> Nueva comunicación
        </button>
      </div>

      {communications.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8">
          <FileText className="mx-auto text-zinc-600 mb-3" size={36} />
          <p className="text-zinc-300 font-bold">Todavía no hay comunicaciones cargadas.</p>
          <p className="text-zinc-500 text-xs mt-1">La primera se guardará como borrador para revisión de la Comisión Directiva.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {communications.map((communication) => (
            <article key={communication.id} className="bg-zinc-950/70 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black border ${communication.status === "PUBLISHED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-400 bg-white/5 border-white/10"}`}>
                    {communication.status === "PUBLISHED" ? <Eye size={12} /> : <EyeOff size={12} />}
                    {communication.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                  </span>
                  <h2 className="text-xl font-black text-white mt-3 leading-tight">{communication.title}</h2>
                  <p className="text-xs text-zinc-500 mt-2">Cargada el {format(new Date(communication.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                </div>
                <a href={communication.fileUrl} target="_blank" rel="noreferrer" className="shrink-0 p-3 rounded-2xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20" title="Abrir archivo">
                  <FileText size={20} />
                </a>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{communication.description}</p>
              <div className="flex items-center gap-2 pt-4 border-t border-white/5 text-xs text-zinc-500 truncate"><FileText size={14} className="text-amber-500 shrink-0" /> {communication.fileName}</div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button disabled={isPending} onClick={() => handleToggle(communication)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold disabled:opacity-50">
                  {communication.status === "PUBLISHED" ? <EyeOff size={14} /> : <Eye size={14} />}
                  {communication.status === "PUBLISHED" ? "Retirar" : "Publicar para socios"}
                </button>
                <button disabled={isPending} onClick={() => handleDelete(communication)} className="p-2 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50" title="Eliminar comunicación"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div><p className="text-xs uppercase tracking-widest text-amber-400 font-black">Nueva entrada</p><h2 className="text-xl font-black text-white mt-1">Comunicación a socios</h2></div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10" title="Cerrar"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label htmlFor="communication-title" className="block text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Título *</label><input id="communication-title" name="title" required maxLength={160} placeholder="Ej.: Gestión ante la Municipalidad" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none" /></div>
              <div><label htmlFor="communication-description" className="block text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Descripción *</label><textarea id="communication-description" name="description" required maxLength={5000} rows={6} placeholder="Explique brevemente qué se hizo y por qué es importante para los socios." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed" /></div>
              <div><label htmlFor="communication-file" className="block text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Archivo adjunto *</label><label htmlFor="communication-file" className="flex items-center gap-3 bg-black/50 border border-dashed border-white/15 hover:border-amber-500/50 rounded-xl px-4 py-4 text-sm text-zinc-400 cursor-pointer"><Upload size={18} className="text-amber-500" /><span>Seleccionar PDF, DOCX o imagen · máximo 10 MB</span></label><input id="communication-file" name="file" required type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.webp" className="sr-only" /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white text-xs font-bold">Cancelar</button><button type="submit" disabled={isPending} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider disabled:opacity-50">{isPending ? "Guardando..." : "Guardar borrador"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
