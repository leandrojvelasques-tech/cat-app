"use client"

import { useState } from "react"
import { approveEnrollmentRequest, rejectEnrollmentRequest } from "@/app/actions/enrollment"
import { Check, X, FileText, User, Phone, Mail, Calendar, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface RequestData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  birthDate: Date
  address: string
  comment: string | null
  paymentProofUrl: string
  createdAt: Date
}

export function SolicitudesList({ initialSolicitudes }: { initialSolicitudes: RequestData[] }) {
  const [solicitudes, setSolicitudes] = useState<RequestData[]>(initialSolicitudes)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  async function handleApprove(id: string) {
    if (!confirm("¿Aprobar esta solicitud y dar de alta al socio? Se le enviará un email con sus credenciales de acceso.")) return
    setProcessingId(id)
    try {
      const res = await approveEnrollmentRequest(id)
      if (res.success) {
        toast.success("Socio dado de alta exitosamente.")
        setSolicitudes(solicitudes.filter(s => s.id !== id))
        router.refresh()
      } else {
        toast.error(res.error || "No se pudo procesar la aprobación.")
      }
    } catch (err) {
      toast.error("Ocurrió un error al conectar con el servidor.")
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id: string) {
    if (!confirm("¿Rechazar esta solicitud de inscripción?")) return
    setProcessingId(id)
    try {
      const res = await rejectEnrollmentRequest(id)
      if (res.success) {
        toast.success("Solicitud rechazada.")
        setSolicitudes(solicitudes.filter(s => s.id !== id))
        router.refresh()
      } else {
        toast.error(res.error || "No se pudo procesar el rechazo.")
      }
    } catch (err) {
      toast.error("Ocurrió un error al conectar con el servidor.")
    } finally {
      setProcessingId(null)
    }
  }

  if (solicitudes.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-16 text-center text-zinc-500 italic backdrop-blur-md">
        No hay solicitudes de inscripción pendientes en este momento.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {solicitudes.map((sol) => {
        const isProcessing = processingId === sol.id
        return (
          <div 
            key={sol.id} 
            className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-white/10 transition-colors"
          >
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {sol.lastName}, {sol.firstName}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">DNI: {sol.dni}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-zinc-600 shrink-0" />
                  <span className="truncate">{sol.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-zinc-600 shrink-0" />
                  <span>{sol.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-600 shrink-0" />
                  <span>Nacimiento: {new Date(sol.birthDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-xs text-zinc-400 bg-black/20 p-3 rounded-xl border border-white/5 space-y-1">
                <p><strong>Dirección:</strong> {sol.address}</p>
                {sol.comment && <p><strong>Comentarios:</strong> <span className="italic">"{sol.comment}"</span></p>}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
              {/* Comprobante Link / Modal Trigger */}
              <button 
                type="button"
                onClick={() => setPreviewUrl(sol.paymentProofUrl)} 
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 lg:flex-none cursor-pointer"
              >
                <FileText size={14} />
                <span>Ver Comprobante</span>
              </button>

              <div className="flex gap-2 flex-1 lg:flex-none">
                <button 
                  disabled={isProcessing}
                  onClick={() => handleReject(sol.id)}
                  className="flex items-center justify-center gap-1.5 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <X size={14} />}
                  <span>Rechazar</span>
                </button>
                
                <button 
                  disabled={isProcessing}
                  onClick={() => handleApprove(sol.id)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 shadow-lg shadow-emerald-950/20 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Check size={14} />}
                  <span>Aprobar Alta</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Modal Previsualizador de Comprobante Segura */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewUrl(null)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-zinc-950 p-4 px-6 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText size={16} className="text-amber-500" /> Vista Previa del Comprobante
              </span>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center bg-black/60 max-h-[75vh] overflow-auto">
              {previewUrl.startsWith("data:application/pdf") ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[500px] rounded-xl border border-white/10"
                  title="Comprobante PDF"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Comprobante de Pago"
                  className="max-w-full max-h-[65vh] object-contain rounded-xl border border-white/10 shadow-lg"
                />
              )}
            </div>
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-between items-center">
              <a
                href={previewUrl}
                download="comprobante-pago.png"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-medium"
              >
                Descargar Copia
              </a>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
