"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getNovedades, deleteNovedad, getNovedadMailingSummary, sendNovedadToEligibleMembers, sendNovedadPreview, toggleNovedadStatus } from "@/app/actions/novedades"
import { NovedadFormModal } from "./NovedadFormModal"
import { 
  Plus, 
  Calendar, 
  Newspaper, 
  Pencil, 
  Trash2, 
  Globe, 
  Lock, 
  ArrowLeft, 
  Sparkles,
  Eye,
  Send,
  Mail
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { NovedadDetailModal } from "@/components/NovedadDetailModal"

export default function AdminNovedadesPage() {
  const [novedades, setNovedades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNovedad, setEditingNovedad] = useState<any | null>(null)
  const [previewNovedad, setPreviewNovedad] = useState<any | null>(null)
  const [previewRecipientEmail, setPreviewRecipientEmail] = useState("")

  const loadData = async () => {
    setLoading(true)
    const data = await getNovedades(false) // Get all including draft
    setNovedades(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la novedad "${title}"?`)) return
    const res = await deleteNovedad(id)
    if (res.success) {
      toast.success("Novedad eliminada correctamente")
      loadData()
    } else {
      toast.error(res.error || "Error al eliminar")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleNovedadStatus(id, !currentStatus)
    if (res.success) {
      toast.success(!currentStatus ? "Novedad publicada" : "Novedad guardada como borrador")
      loadData()
    } else {
      toast.error(res.error || "Error al actualizar estado")
    }
  }

  const handleSendToMembers = async (id: string) => {
    const summary = await getNovedadMailingSummary(id)
    if (!summary.success) {
      toast.error(summary.error || "No se pudo preparar el envío")
      return
    }
    if (!summary.isPublished) {
      toast.error("Publicá la novedad antes de enviarla a socios.")
      return
    }
    const message = summary.sentCount > 0
      ? `Se enviará a ${summary.recipientCount} socios activos, al día o en mora con mailing habilitado. ${summary.sentCount} ya recibieron esta novedad y no se reenviará. ¿Confirmás el envío pendiente?`
      : `Se enviará el email de esta novedad a ${summary.recipientCount} socios activos, al día o en mora con mailing habilitado. ¿Confirmás el envío?`
    if (!confirm(message)) return

    const result = await sendNovedadToEligibleMembers(id)
    if (!result.success) {
      toast.error(result.error || "No se pudo enviar la novedad")
      return
    }
    toast.success(`Enviados: ${result.sentCount}. Ya enviados: ${result.skippedCount}. Fallidos: ${result.failedCount}.`)
    loadData()
  }

  const handleSendPreview = async (id: string) => {
    const recipientEmail = previewRecipientEmail.trim()
    if (!recipientEmail) {
      toast.error("Ingresá una dirección para enviar la prueba.")
      return
    }
    const result = await sendNovedadPreview(id, recipientEmail)
    if (result.success) toast.success(`Prueba enviada sólo a ${result.recipientEmail}.`)
    else toast.error(result.error || "No se pudo enviar la prueba.")
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/admin/comunicaciones"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="text-xs font-black uppercase tracking-widest text-amber-500">Comunicaciones</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            <Newspaper className="text-amber-500" />
            <span>Novedades CAT</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gestiona comunicados, noticias e informaciones especiales para la web y la plataforma de socios.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            onClick={() => {
              setEditingNovedad(null)
              setModalOpen(true)
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 px-6 py-3 text-sm font-black text-zinc-950 shadow-xl shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95"
          >
            <Plus size={18} />
            <span>Nueva Novedad</span>
          </button>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Email de prueba</span>
            <input
              type="email"
              value={previewRecipientEmail}
              onChange={(event) => setPreviewRecipientEmail(event.target.value)}
              placeholder="tu@email.com"
              className="w-52 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500"
            />
          </label>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Link
          href="/admin/comunicaciones"
          className="px-5 py-2.5 rounded-2xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent transition-all"
        >
          Centro de Comunicaciones
        </Link>
        <Link
          href="/admin/comunicaciones/novedades"
          className="px-5 py-2.5 rounded-2xl font-bold text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2"
        >
          <Newspaper size={16} />
          <span>Novedades ({novedades.length})</span>
        </Link>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Cargando novedades...</p>
        </div>
      ) : novedades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-3xl border border-white/10 p-8">
          <Newspaper size={56} className="text-zinc-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 uppercase italic">No hay novedades registradas</h3>
          <p className="text-sm text-zinc-400 max-w-md mb-6">
            Comienza creando la primera novedad o comunicado para informar a la comunidad y a los socios.
          </p>
          <button
            onClick={() => {
              setEditingNovedad(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all"
          >
            <Plus size={16} />
            <span>Crear Primera Novedad</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novedades.map((item) => (
            <div
              key={item.id}
              className="bg-[#18181b] border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all group"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 border-b border-white/5">
                    <Newspaper size={40} className="text-zinc-700" />
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                      item.isPublished
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                        : "bg-zinc-900/80 text-zinc-400 border-white/10"
                    }`}
                  >
                    {item.isPublished ? <Globe size={12} /> : <Lock size={12} />}
                    <span>{item.isPublished ? "Publicado" : "Borrador"}</span>
                  </span>
                </div>

                {/* Date badge */}
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{format(new Date(item.publishedAt), "dd/MM/yyyy", { locale: es })}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs font-medium text-amber-400/90 mt-1 line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewNovedad(item)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors flex items-center gap-1 text-xs font-bold"
                    title="Previsualizar"
                  >
                    <Eye size={14} />
                    <span>Ver</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendToMembers(item.id)}
                      disabled={!item.isPublished}
                      className="p-2 rounded-xl bg-sky-500/10 text-sky-300 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-35"
                      title={item.isPublished ? "Enviar a socios" : "Publicá la novedad antes de enviarla"}
                    >
                      <Send size={16} />
                    </button>
                    <button
                      onClick={() => handleSendPreview(item.id)}
                      disabled={!item.isPublished}
                      className="rounded-xl bg-amber-500/10 p-2 text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-35"
                      title="Enviar una prueba a una sola dirección"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(item.id, item.isPublished)}
                      className={`p-2 rounded-xl transition-colors ${
                        item.isPublished
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      }`}
                      title={item.isPublished ? "Despublicar (Ocultar)" : "Publicar"}
                    >
                      {item.isPublished ? <Globe size={16} /> : <Lock size={16} />}
                    </button>

                    <button
                      onClick={() => {
                        setEditingNovedad(item)
                        setModalOpen(true)
                      }}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <NovedadFormModal
          novedad={editingNovedad}
          onClose={() => {
            setModalOpen(false)
            setEditingNovedad(null)
          }}
          onSuccess={loadData}
        />
      )}

      {/* Detail Preview Modal */}
      {previewNovedad && (
        <NovedadDetailModal
          novedad={previewNovedad}
          onClose={() => setPreviewNovedad(null)}
        />
      )}

    </div>
  )
}
