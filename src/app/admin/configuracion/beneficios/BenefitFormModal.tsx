"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Sparkles, Gift, Tag, Layers, CheckCircle2, X } from "lucide-react"
import { createBenefit, updateBenefit, deleteBenefit, toggleBenefitStatus } from "@/app/actions/beneficios"

interface Benefit {
  id: string
  title: string
  description: string
  badge: string | null
  isActive: boolean
  order: number
}

export function BenefitManagementClient({ initialBenefits }: { initialBenefits: Benefit[] }) {
  const [benefits, setBenefits] = useState<Benefit[]>(initialBenefits)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const openCreateModal = () => {
    setEditingBenefit(null)
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  const openEditModal = (b: Benefit) => {
    setEditingBenefit(b)
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBenefit(null)
    setErrorMessage(null)
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleBenefitStatus(id, !currentStatus)
      if (res.success) {
        setBenefits(prev => prev.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b))
      }
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`¿Está seguro de eliminar el beneficio "${title}"?`)) return
    startTransition(async () => {
      const res = await deleteBenefit(id)
      if (res.success) {
        setBenefits(prev => prev.filter(b => b.id !== id))
      }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      if (editingBenefit) {
        const res = await updateBenefit(editingBenefit.id, formData)
        if (res.success) {
          closeModal()
          window.location.reload()
        } else {
          setErrorMessage(res.error || "Error al actualizar")
        }
      } else {
        const res = await createBenefit(formData)
        if (res.success) {
          closeModal()
          window.location.reload()
        } else {
          setErrorMessage(res.error || "Error al crear")
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Gift size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Listado de Beneficios para Socios</h2>
            <p className="text-xs text-zinc-400">Total registrados: {benefits.length} | Visibles para el socio: {benefits.filter(b => b.isActive).length}</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-lg shadow-amber-900/30 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={18} /> Nuevo Beneficio
        </button>
      </div>

      {/* Grid List of Benefits */}
      {benefits.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8">
          <Sparkles className="mx-auto text-zinc-600 mb-3" size={32} />
          <p className="text-zinc-400 font-bold text-sm">No hay beneficios cargados en la base de datos.</p>
          <p className="text-zinc-500 text-xs mt-1">Haga clic en "+ Nuevo Beneficio" para publicar la primera ventaja para los socios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((b) => (
            <div
              key={b.id}
              className={`bg-zinc-950/70 border rounded-3xl p-6 flex flex-col justify-between transition-all group relative overflow-hidden ${
                b.isActive ? "border-white/10 hover:border-amber-500/30 shadow-xl" : "border-white/5 opacity-60 bg-black/40"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {b.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${
                      b.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border-white/5"
                    }`}>
                      {b.isActive ? "Visible" : "Oculto"}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">Orden: #{b.order}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed whitespace-pre-line">
                    {b.description}
                  </p>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <button
                  onClick={() => handleToggleStatus(b.id, b.isActive)}
                  disabled={isPending}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    b.isActive
                      ? "text-zinc-400 hover:text-amber-400 bg-white/5 border-white/5 hover:border-white/10"
                      : "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20"
                  }`}
                  title={b.isActive ? "Ocultar beneficio" : "Hacer visible"}
                >
                  {b.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{b.isActive ? "Ocultar" : "Mostrar"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-white rounded-xl border border-amber-500/20 transition-all cursor-pointer"
                    title="Editar beneficio"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    disabled={isPending}
                    className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/20 transition-all cursor-pointer"
                    title="Eliminar beneficio"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal create/edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Gift size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingBenefit ? "Editar Beneficio de Socio" : "Nuevo Beneficio de Socio"}
                </h3>
              </div>

              <button
                onClick={closeModal}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Título del Beneficio *</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Ej: Descuento en Clases de Tango - Academia Swing"
                  defaultValue={editingBenefit?.title || ""}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Etiqueta / Badge</label>
                  <input
                    name="badge"
                    type="text"
                    placeholder="Ej: DESCUENTO, ACCESO GRATUITO"
                    defaultValue={editingBenefit?.badge || ""}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Orden de Aparición</label>
                  <input
                    name="order"
                    type="number"
                    defaultValue={editingBenefit?.order ?? 0}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Descripción y Condiciones *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describa en qué consiste el beneficio y sus condiciones de aplicación..."
                  defaultValue={editingBenefit?.description || ""}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 bg-black/30 p-3.5 border border-white/5 rounded-xl">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editingBenefit ? editingBenefit.isActive : true}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-zinc-300 cursor-pointer">
                  Publicar inmediatamente (Visible en la app del socio)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {isPending ? "Guardando..." : editingBenefit ? "Guardar Cambios" : "Crear Beneficio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
