"use client"

import { useState, useTransition } from "react"
import { updatePaymentStatus } from "@/app/actions/registraciones"
import { CheckCircle2, FileText, Loader2, X, ShieldCheck, Download, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface ApproveRegistrationButtonProps {
  registrationId: string
  eventId: string
  amount: number
  paymentProof?: string | null
  currentStatus: string
}

export function ApproveRegistrationButton({
  registrationId,
  eventId,
  amount,
  paymentProof,
  currentStatus
}: ApproveRegistrationButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await updatePaymentStatus(registrationId, eventId, "PAID", amount)
        toast.success("Pago / Inscripción aprobada exitosamente")
        setIsPreviewOpen(false)
      } catch (err) {
        toast.error("Error al actualizar el estado de la inscripción")
      }
    })
  }

  const isPdf = paymentProof?.startsWith("data:application/pdf")

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {paymentProof && (
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            title="Previsualizar comprobante de forma segura"
          >
            <FileText size={12} className="text-amber-400" />
            <span>Ver Comprobante</span>
          </button>
        )}

        {currentStatus !== "PAID" ? (
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            <span>Aprobar Pago</span>
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <CheckCircle2 size={11} /> APROBADO
          </span>
        )}
      </div>

      {/* Safe Modal Previewer */}
      {isPreviewOpen && paymentProof && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-4xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-zinc-950 p-4 px-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Vista Previa Segura de Comprobante
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={paymentProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  title="Abrir comprobante en nueva pestaña"
                >
                  <ExternalLink size={13} />
                  <span>Pantalla Completa</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body - Isolated Image Rendering */}
            <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-black/60 overflow-y-auto flex-1 min-h-[350px]">
              {isPdf ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <object
                    data={paymentProof}
                    type="application/pdf"
                    className="w-full h-[58vh] min-h-[400px] rounded-xl border border-white/10"
                  >
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3">
                      <FileText size={40} className="text-amber-400" />
                      <p className="text-xs text-zinc-300 font-medium">Comprobante enviado en formato documento PDF</p>
                      <a
                        href={paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        <ExternalLink size={14} /> Abrir PDF en Ventana Nueva
                      </a>
                    </div>
                  </object>
                </div>
              ) : (
                <img
                  src={paymentProof}
                  alt="Comprobante de pago"
                  className="max-w-full max-h-[62vh] object-contain rounded-xl border border-white/10 shadow-lg"
                />
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-between items-center">
              <a
                href={paymentProof}
                download="comprobante.png"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-medium"
              >
                <Download size={14} /> Descargar Copia
              </a>

              {currentStatus !== "PAID" && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Aprobar y Confirmar Reserva
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
