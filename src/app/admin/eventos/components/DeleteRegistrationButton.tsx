"use client"

import { useState, useTransition } from "react"
import { deleteRegistration } from "@/app/actions/registraciones"
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"

interface DeleteRegistrationButtonProps {
  registrationId: string
  eventId: string
  attendeeName: string
}

export function DeleteRegistrationButton({
  registrationId,
  eventId,
  attendeeName
}: DeleteRegistrationButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteRegistration(registrationId, eventId)
        toast.success(`Inscripción de ${attendeeName} eliminada exitosamente`)
        setIsOpen(false)
      } catch (err) {
        toast.error("Error al eliminar la inscripción")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
        title="Eliminar inscripto"
      >
        <Trash2 size={15} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  ¿Eliminar Inscripto?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Esta acción borrará la registración de manera permanente.
                </p>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
              <p className="text-xs text-zinc-300 font-bold">
                Asistente: <span className="text-white">{attendeeName}</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg cursor-pointer"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
