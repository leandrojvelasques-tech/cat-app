"use client"

import { useState } from "react"
import { X, Save, Phone, Mail, Loader2, Edit3 } from "lucide-react"
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
      >
        <Edit3 size={14} />
        Editar Perfil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 p-8 md:p-10 rounded-[48px] max-w-md w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Editar Perfil</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Actualice sus datos de contacto</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar section */}
              <div className="flex justify-center flex-col items-center">
                 <AvatarFormInput defaultValue={member.avatarUrl} />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      name="email"
                      type="email"
                      defaultValue={member.email || ""}
                      placeholder="tu@email.com"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Teléfono Móvil</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input 
                      name="phone"
                      type="tel"
                      defaultValue={member.phone || ""}
                      placeholder="+54 297 ..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 p-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Cambios
                    </>
                  )}
                </button>
                <p className="text-[9px] text-zinc-600 text-center mt-6 uppercase font-bold tracking-tight px-4 flex items-center gap-2 justify-center">
                  <Save size={10} /> Solo puede editar sus datos de contacto y foto.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
