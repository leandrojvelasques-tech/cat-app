"use client"

import { useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, KeyRound, Loader2, ShieldAlert, X } from "lucide-react"
import { sendTemporaryMemberAccess } from "@/app/actions/users"

interface SendMemberAccessButtonProps {
  memberId: string
  memberName: string
  memberEmail: string | null
  username: string | null
}

export function SendMemberAccessButton({
  memberId,
  memberName,
  memberEmail,
  username,
}: SendMemberAccessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const unavailableReason = !memberEmail
    ? "El socio no tiene un correo registrado"
    : null

  function closeModal() {
    if (isPending) return
    setIsOpen(false)
    setResult(null)
  }

  function handleSend() {
    setResult(null)
    startTransition(async () => {
      try {
        const response = await sendTemporaryMemberAccess(memberId)
        setResult({
          success: response.success,
          message: response.success
            ? "Los datos de acceso fueron enviados y quedaron registrados en el historial."
            : response.error || "No se pudo enviar el acceso.",
        })
      } catch {
        setResult({ success: false, message: "Ocurrió un error inesperado. No vuelvas a intentar hasta verificar el estado del socio." })
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={Boolean(unavailableReason)}
        title={unavailableReason || "Generar y enviar una nueva clave temporal"}
        className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-amber-500/20 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <KeyRound size={13} /> Enviar acceso
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`access-title-${memberId}`}
        >
          <div className="flex h-[min(90dvh,42rem)] max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <KeyRound size={19} />
                </div>
                <div>
                  <h2 id={`access-title-${memberId}`} className="font-bold text-white">Enviar nuevo acceso</h2>
                  <p className="text-xs text-zinc-500">Portal de Socios</p>
                </div>
              </div>
              <button type="button" onClick={closeModal} disabled={isPending} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-40" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
              <div className="rounded-2xl border border-white/5 bg-black/25 p-4 text-sm">
                <p className="font-bold text-zinc-100">{memberName}</p>
                <p className="mt-1 text-zinc-400">Destino: {memberEmail}</p>
                <p className="text-zinc-400">Usuario: {username || memberEmail}</p>
              </div>

              <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
                <ShieldAlert className="mt-0.5 shrink-0" size={17} />
                <p>La clave actual dejará de funcionar. Se generará una clave temporal y el socio deberá cambiarla en su próximo ingreso.</p>
              </div>

              {result && (
                <div className={`flex gap-3 rounded-2xl border p-4 text-xs leading-relaxed ${result.success ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
                  {result.success ? <CheckCircle2 className="shrink-0" size={17} /> : <ShieldAlert className="shrink-0" size={17} />}
                  <p>{result.message}</p>
                </div>
              )}

            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-white/5 p-6 pt-4">
              <button type="button" onClick={closeModal} disabled={isPending} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5 disabled:opacity-40">
                {result?.success ? "Cerrar" : "Cancelar"}
              </button>
              {!result?.success && (
                <button type="button" onClick={handleSend} disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">
                  {isPending ? <Loader2 className="animate-spin" size={15} /> : <KeyRound size={15} />}
                  {isPending ? "Enviando..." : result ? "Reintentar" : "Generar y enviar"}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
