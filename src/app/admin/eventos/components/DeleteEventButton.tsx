"use client"

import { useTransition } from "react"
import { deleteEvent } from "@/app/actions/eventos"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteEventButtonProps {
  eventId: string
  className?: string
}

export function DeleteEventButton({ eventId, className = "" }: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const confirmed = window.confirm(
      "¿Está seguro de que desea eliminar este evento y todos sus registros asociados (inscripciones, buffet y rendiciones)? Esta acción es irreversible."
    )

    if (confirmed) {
      startTransition(async () => {
        const result = await deleteEvent(eventId)
        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success("Evento eliminado correctamente")
        }
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Trash2 size={16} className={isPending ? "animate-pulse" : ""} />
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  )
}
