"use client"

import { useState, useRef } from "react"
import { Camera, User, X } from "lucide-react"

export function AvatarFormInput({ defaultValue }: { defaultValue: string | null }) {
  const [preview, setPreview] = useState<string | null>(defaultValue)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      alert("La imagen es demasiado pesada. Máximo 1MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white/5 bg-zinc-800 flex items-center justify-center shadow-2xl relative">
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
             <span className="text-[8px] text-white font-black uppercase tracking-widest">Cambiar Foto</span>
          </button>
        </div>

        {preview && (
          <button 
            type="button"
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Hidden input to be sent with the form */}
      <input type="hidden" name="avatarUrl" value={preview || ""} />
      
      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">Haga clic en la imagen para subir una foto</p>
    </div>
  )
}
