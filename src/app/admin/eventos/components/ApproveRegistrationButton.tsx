"use client"

import { useTransition } from "react"
import { updatePaymentStatus } from "@/app/actions/registraciones"
import { CheckCircle2, FileText, Loader2 } from "lucide-react"
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

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await updatePaymentStatus(registrationId, eventId, "PAID", amount)
        toast.success("Pago / Inscripción aprobada exitosamente")
      } catch (err) {
        toast.error("Error al actualizar el estado de la inscripción")
      }
    })
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {paymentProof && (
        <a
          href={paymentProof}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
          title="Ver comprobante adjunto"
        >
          <FileText size={12} className="text-amber-400" />
          <span>Comprobante</span>
        </a>
      )}

      {currentStatus !== "PAID" ? (
        <button
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
  )
}
