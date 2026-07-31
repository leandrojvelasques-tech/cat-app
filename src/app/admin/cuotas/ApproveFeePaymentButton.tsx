"use client"

import { useState, useTransition } from "react"
import { approvePendingFeePayment, rejectPendingFeePayment } from "@/app/actions/cuotas"
import { CheckCircle2, FileText, Loader2, X, ShieldCheck, Download, XCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface ApproveFeePaymentButtonProps {
  feeId: string
  amount: number
  notes?: string | null
  currentStatus: string
}

export function ApproveFeePaymentButton({
  feeId,
  amount,
  notes,
  currentStatus
}: ApproveFeePaymentButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Extract proof URL from notes if present
  let proofUrl = ""
  if (notes) {
    const match = notes.match(/\[COMPROBANTE SOCIO VERIFICACIÓN: (.*?)\]/) || notes.match(/\[COMPROBANTE: (.*?)\]/)
    if (match) proofUrl = match[1]
  }

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approvePendingFeePayment(feeId)
        toast.success("Pago de cuota aprobado exitosamente")
        setIsPreviewOpen(false)
      } catch (err) {
        toast.error("Error al aprobar el pago de cuota")
      }
    })
  }

  const handleReject = () => {
    if (!confirm("¿Está seguro de rechazar este comprobante de pago?")) return
    startTransition(async () => {
      try {
        await rejectPendingFeePayment(feeId)
        toast.success("Comprobante rechazado")
        setIsPreviewOpen(false)
      } catch (err) {
        toast.error("Error al rechazar el comprobante")
      }
    })
  }

  const isPdf = proofUrl.startsWith("data:application/pdf") || proofUrl.toLowerCase().endsWith(".pdf")
  const isImage = !isPdf && (
    proofUrl.startsWith("data:image/") ||
    proofUrl.startsWith("/uploads/") ||
    proofUrl.endsWith(".png") ||
    proofUrl.endsWith(".jpg") ||
    proofUrl.endsWith(".jpeg") ||
    proofUrl.endsWith(".webp")
  )

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {proofUrl && (
          <button
            type="button"
            onClick={() => {
              setImgError(false)
              setIsPreviewOpen(true)
            }}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            title="Previsualizar comprobante de forma segura"
          >
            <FileText size={12} className="text-amber-400" />
            <span>Ver Comprobante</span>
          </button>
        )}

        {currentStatus !== "PAID" ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              <span>Aprobar Pago</span>
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending}
              className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
              title="Rechazar comprobante"
            >
              <XCircle size={14} />
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <CheckCircle2 size={11} /> APROBADO
          </span>
        )}
      </div>

      {/* Modal Previewer */}
      {isPreviewOpen && proofUrl && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-zinc-950 p-4 px-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Comprobante de Pago de Cuota — Verificación
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-black/60 max-h-[70vh] overflow-auto">
              {isPdf ? (
                <div className="w-full text-center space-y-4">
                  <object
                    data={proofUrl}
                    type="application/pdf"
                    className="w-full h-[450px] rounded-xl border border-white/10 hidden md:block"
                  >
                    <p className="text-xs text-zinc-400">Su navegador no soporta vista previa directa de PDF.</p>
                  </object>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3">
                    <FileText size={40} className="text-amber-400" />
                    <p className="text-xs text-zinc-300 font-medium">Comprobante enviado en formato documento PDF</p>
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                    >
                      <ExternalLink size={14} /> Abrir PDF en Ventana Nueva
                    </a>
                  </div>
                </div>
              ) : (isImage && !imgError) ? (
                <img
                  src={proofUrl}
                  alt="Comprobante de pago"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl border border-white/10 shadow-lg"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-4">
                  <FileText size={48} className="text-amber-400" />
                  <p className="text-zinc-300 text-xs font-medium max-w-sm">
                    No se puede previsualizar directamente en pantalla o el formato es un enlace externo.
                  </p>
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    <ExternalLink size={14} /> Abrir / Descargar Comprobante
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-between items-center gap-4 flex-wrap">
              <a
                href={proofUrl}
                download="comprobante-cuota"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-medium"
              >
                <Download size={14} /> Descargar Archivo
              </a>

              {currentStatus !== "PAID" && (
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isPending}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold px-4 py-2 rounded-xl text-xs uppercase transition-all cursor-pointer"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Aprobar Pago e Imputar Cuota
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
