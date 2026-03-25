"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, X, Check, Loader2, User } from "lucide-react"
import { updateMemberAvatar } from "@/app/actions/socios"
import { useRouter } from "next/navigation"

export function AvatarUpload({ memberId, currentAvatar }: { memberId: string, currentAvatar: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Sync preview with currentAvatar when it changes from server
  useEffect(() => {
    setPreview(currentAvatar)
  }, [currentAvatar])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit size to 1MB
    if (file.size > 1024 * 1024) {
      alert("La imagen es demasiado pesada. Máximo 1MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setPreview(base64)
      setIsOpen(true)
    }
    reader.readAsDataURL(file)
  }

  async function saveAvatar() {
    if (!preview) return
    setIsUploading(true)
    try {
      const result = await updateMemberAvatar(memberId, preview)
      if (result.success) {
        router.refresh()
        setIsOpen(false)
      }
    } catch (e) {
      alert("Error al subir imagen")
    } finally {
      setIsUploading(false)
    }
  }

  async function removeAvatar() {
    if (!confirm("¿Eliminar foto de perfil?")) return
    setIsUploading(true)
    try {
      await updateMemberAvatar(memberId, null)
      router.refresh()
      setIsOpen(false)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative shrink-0">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-[32px] overflow-hidden border-4 border-white/5 bg-zinc-800 flex items-center justify-center shadow-2xl transition-all group-hover:scale-105 relative">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="text-zinc-600" size={40} />
          )}
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity"
          >
             <Camera className="text-white mb-1" size={24} />
             <span className="text-[8px] text-white font-black uppercase tracking-widest">Cambiar</span>
          </button>
       </div>

       {isOpen && (
         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-zinc-900 border border-white/10 p-6 md:p-10 rounded-[40px] max-w-sm w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Nueva Foto</h3>
                   <button onClick={() => {
                     setIsOpen(false);
                     setPreview(currentAvatar);
                   }} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                     <X size={24} />
                   </button>
                </div>

                <div className="aspect-square w-full rounded-[40px] bg-black overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-amber-500/5">
                   {preview ? (
                     <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-800">
                        <User size={80} />
                        <p className="text-[10px] uppercase font-black tracking-widest italic">Seleccione archivo</p>
                     </div>
                   )}
                </div>

                <div className="space-y-4">
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={saveAvatar}
                        disabled={isUploading || !preview}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 p-5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                         {isUploading ? <Loader2 className="animate-spin mx-auto" /> : "Confirmar y Guardar"}
                      </button>
                      
                      {currentAvatar && (
                        <button 
                          onClick={removeAvatar}
                          disabled={isUploading}
                          className="w-full bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 p-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-red-500/20"
                        >
                          Eliminar foto actual
                        </button>
                      )}
                   </div>
                   
                   <p className="text-[10px] text-zinc-600 text-center uppercase font-bold tracking-tight px-4 leading-tight">
                      La foto se guardará permanentemente en la ficha del socio.
                   </p>
                </div>
            </div>
         </div>
       )}
    </div>
  )
}
