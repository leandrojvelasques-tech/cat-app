"use client"

import { useState, useRef } from "react"
import { Camera, X, Check, Loader2, User } from "lucide-react"
import { updateMemberAvatar } from "@/app/actions/socios"
import { useRouter } from "next/navigation"

export function AvatarUpload({ memberId, currentAvatar }: { memberId: string, currentAvatar: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
      await updateMemberAvatar(memberId, preview)
      router.refresh()
      setIsOpen(false)
    } catch (e) {
      alert("Error al subir imagen")
    } finally {
      setIsUploading(false)
    }
  }

  async function removeAvatar() {
    setIsUploading(true)
    try {
      await updateMemberAvatar(memberId, null)
      setPreview(null)
      router.refresh()
      setIsOpen(false)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative group">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white/5 bg-zinc-800 flex items-center justify-center shadow-2xl transition-all group-hover:scale-105 relative">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="text-zinc-600" size={48} />
          )}
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity"
          >
             <Camera className="text-white mb-1" size={24} />
             <span className="text-[8px] text-white font-black uppercase tracking-widest">Añadir Foto</span>
          </button>
       </div>

       {isOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] max-w-sm w-full shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-white uppercase italic">Vista Previa</h3>
                   <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                </div>

                <div className="aspect-square w-full rounded-3xl bg-black overflow-hidden border border-white/5">
                   {preview ? (
                     <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-zinc-700">
                        <User size={64} />
                        <p className="text-[10px] uppercase font-black tracking-widest italic">Sin Foto</p>
                     </div>
                   )}
                </div>

                <div className="space-y-4">
                   <div className="flex gap-4">
                      {preview && currentAvatar && (
                        <button 
                          onClick={removeAvatar}
                          disabled={isUploading}
                          className="flex-1 bg-red-500/10 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-500/10"
                        >
                          Eliminar
                        </button>
                      )}
                      <button 
                        onClick={saveAvatar}
                        disabled={isUploading || !preview}
                        className="flex-1 bg-amber-500 text-zinc-950 p-4 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-50"
                      >
                         {isUploading ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Foto"}
                      </button>
                   </div>
                   
                   <p className="text-[10px] text-zinc-600 text-center uppercase tracking-tighter">Haga clic en 'Guardar' para confirmar los cambios.</p>
                </div>
            </div>
         </div>
       )}
    </div>
  )
}
