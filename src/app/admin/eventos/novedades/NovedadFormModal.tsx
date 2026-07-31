"use client"

import { useState } from "react"
import { createNovedad, updateNovedad } from "@/app/actions/novedades"
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Save, Calendar, Globe, Lock } from "lucide-react"
import { toast } from "sonner"

interface Novedad {
  id?: string
  title: string
  subtitle?: string | null
  content: string
  imageUrl?: string | null
  publishedAt: Date | string
  isPublished: boolean
}

interface NovedadFormModalProps {
  novedad?: Novedad | null
  onClose: () => void
  onSuccess: () => void
}

export function NovedadFormModal({ novedad, onClose, onSuccess }: NovedadFormModalProps) {
  const isEditing = !!novedad?.id

  const [title, setTitle] = useState(novedad?.title || "")
  const [subtitle, setSubtitle] = useState(novedad?.subtitle || "")
  const [content, setContent] = useState(novedad?.content || "")
  const [imageUrlInput, setImageUrlInput] = useState(novedad?.imageUrl && !novedad.imageUrl.startsWith("data:") ? novedad.imageUrl : "")
  const [imagePreview, setImagePreview] = useState<string | null>(novedad?.imageUrl || null)
  const [isPublished, setIsPublished] = useState(novedad?.isPublished ?? true)
  const [loading, setLoading] = useState(false)

  // Default publication date to today (format YYYY-MM-DDTHH:mm)
  const initialDate = novedad?.publishedAt
    ? new Date(novedad.publishedAt).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16)

  const [publishedAt, setPublishedAt] = useState(initialDate)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (val: string) => {
    setImageUrlInput(val)
    if (val.trim()) {
      setImagePreview(val.trim())
    } else if (!novedad?.imageUrl) {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error("Por favor completa el título y el contenido.")
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("isPublished", isPublished ? "true" : "false")
    if (novedad?.imageUrl) {
      formData.set("existingImage", novedad.imageUrl)
    }

    let result
    if (isEditing && novedad.id) {
      result = await updateNovedad(novedad.id, formData)
    } else {
      result = await createNovedad(formData)
    }

    setLoading(false)

    if (result.success) {
      toast.success(isEditing ? "Novedad actualizada con éxito" : "Novedad creada con éxito")
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || "Ocurrió un error al guardar")
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
              {isEditing ? "Editar Novedad" : "Nueva Novedad"}
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Publica una noticia, aviso o comunicado especial del CAT
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Título */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
              Título de la Novedad *
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Gran Milonga Aniversario del CAT"
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-sm"
            />
          </div>

          {/* Subtítulo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Subtítulo / Bajada (Opcional)
            </label>
            <input
              type="text"
              name="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej: Sumate a una noche inolvidable con la orquesta invitada"
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-sm"
            />
          </div>

          {/* Fecha de Publicación y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Fecha de Publicación
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Visibilidad / Estado
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-sm transition-all ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700"
                }`}
              >
                {isPublished ? (
                  <>
                    <Globe size={16} />
                    <span>Publicado (Visible en Frontend y Socios)</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Borrador (Oculto)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Imagen (Subida o URL) */}
          <div className="space-y-3 p-4 bg-black/30 border border-white/5 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ImageIcon size={16} />
              <span>Imagen de la Novedad</span>
            </label>

            {imagePreview && (
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 mb-3">
                <img src={imagePreview} alt="Previsualización" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setImageUrlInput("")
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Subir archivo de imagen</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-zinc-950 hover:file:bg-amber-400 file:cursor-pointer cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1 font-medium">O pegar URL de imagen</label>
                <div className="relative">
                  <input
                    type="url"
                    name="imageUrl"
                    value={imageUrlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cuerpo / Contenido */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
              Contenido de la Novedad *
            </label>
            <textarea
              name="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí la información completa de la novedad..."
              required
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-sm leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Publicar Novedad"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
