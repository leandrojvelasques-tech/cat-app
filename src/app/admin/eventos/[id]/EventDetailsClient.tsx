"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { RegistrationModal } from "../RegistrationModal"

export function EventDetailsClient({ event }: { event: any }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-amber-900/20"
      >
        <Plus size={18} /> Registrar Inscripción
      </button>

      {showModal && (
        <RegistrationModal 
          event={event} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}
