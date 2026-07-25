"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Save, Phone, Mail, Loader2, Edit3, Lock } from "lucide-react"
import { updateMemberProfile } from "@/app/actions/socios"
import { AvatarFormInput } from "@/components/AvatarFormInput"

interface EditProfileModalProps {
  member: {
    id: string
    email: string | null
    phone: string | null
    avatarUrl: string | null
  }
}

export function EditProfileModal({ member }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Necesario para evitar errores de SSR con createPortal
  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await updateMemberProfile(member.id, formData)
      if (result.success) {
        setIsOpen(false)
      }
    } catch (error) {
      alert("Error al actualizar el perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const modalOverlay = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false)
      }}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-[40px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Header Sticky */}
        <div className="flex justify-between items-center bg-zinc-900 p-6 md:p-8 border-b border-white/5 z-10 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Editar Perfil</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Actualice sus datos de contacto y foto</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all shadow-inner border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent]">
            {/* Avatar section */}
            <div className="flex justify-center flex-col items-center">
               <AvatarFormInput defaultValue={member.avatarUrl} />
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    name="email"
                    type="email"
                    defaultValue={member.email || ""}
                    placeholder="tu@email.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Teléfono Móvil</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    name="phone"
                    type="tel"
                    defaultValue={member.phone || ""}
                    placeholder="+54 297 ..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Nueva Contraseña (Opcional)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    name="password"
                    type="password"
                    placeholder="Dejar vacío para no cambiar..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer with Save Button */}
          <div className="p-6 bg-zinc-900 border-t border-white/5 z-10 shrink-0 space-y-3">
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 p-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-600 text-center uppercase font-black tracking-tighter italic">
               Solo puede editar sus datos de contacto y foto.
            </p>
          </div>
        </form>
      </div>
    </div>
  ) : null

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
      >
        <Edit3 size={14} />
        Editar Perfil
      </button>

      {/* Portal: renderiza el overlay en document.body para escapar de cualquier stacking context (backdrop-blur, transform, etc.) */}
      {mounted && createPortal(modalOverlay, document.body)}
    </>
  )
}
