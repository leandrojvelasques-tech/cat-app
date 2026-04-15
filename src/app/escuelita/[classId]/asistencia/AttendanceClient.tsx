"use client"

import { useState } from "react"
import { submitAttendance } from "@/app/actions/escuelita"
import { CheckCircle2, UserCircle2, Mail, Phone, Fingerprint, Loader2 } from "lucide-react"

export function AttendanceClient({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFullForm, setShowFullForm] = useState(false)
  const [savedDni, setSavedDni] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const result = await submitAttendance(formData)
      
      if (result?._action === "REQUIRE_FULL_FORM") {
        setSavedDni(result.dni)
        setShowFullForm(true)
      } else if (result?.success) {
        setSuccess(result.message)
        setShowFullForm(false)
        setSavedDni("")
        // Reset form visually by doing nothing or by resetting target in standard HTML
        const form = document.getElementById("attendance-form") as HTMLFormElement
        if (form) form.reset()
      } else if (result?.success === false) {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al registrar la asistencia.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in-95 duration-500">
         <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
           <CheckCircle2 size={32} className="text-emerald-500" />
         </div>
         <h3 className="text-xl font-bold text-white">¡Asistencia Confirmada!</h3>
         <p className="text-sm text-emerald-400 font-medium text-center">{success}</p>
         <button 
           onClick={() => setSuccess(null)}
           className="mt-4 bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/10"
         >
           Siguiente Alumno
         </button>
      </div>
    )
  }

  return (
    <form id="attendance-form" action={handleSubmit} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      
      {!showFullForm ? (
        <div className="space-y-3 animate-in fade-in duration-300">
           <div className="relative">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
               <Fingerprint size={18} className="text-zinc-500" />
             </div>
             <input 
               type="text" 
               name="dni" 
               required
               placeholder="Ingresa tu DNI"
               className="w-full bg-black/40 border-2 border-white/10 focus:border-blue-500/50 rounded-2xl pl-12 pr-4 py-4 text-white font-medium outline-none transition-colors"
             />
           </div>
           
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {loading ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : "Registrar Asistencia"}
           </button>
           
           <p className="text-xs text-zinc-500 text-center px-4 mt-2">
             Si ya viniste antes, tu DNI te registrará automáticamente.
           </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
           <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-sm text-blue-400 flex items-start gap-3">
             <UserCircle2 size={24} className="shrink-0 text-blue-500" />
             <p>Es tu primera vez. Por favor completa estos datos para finalizar tu registro con el DNI <strong className="text-white">{savedDni}</strong>.</p>
           </div>
           
           <input type="hidden" name="dni" value={savedDni} />
           
           <div className="grid grid-cols-2 gap-3">
             <input 
               type="text" name="firstName" required placeholder="Nombre" 
               className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none w-full text-sm"
             />
             <input 
               type="text" name="lastName" required placeholder="Apellido" 
               className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none w-full text-sm"
             />
           </div>
           
           <div className="space-y-3">
             <div className="relative">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Mail size={16} className="text-zinc-500" />
               </div>
               <input 
                 type="email" name="email" placeholder="Email (Opcional)" 
                 className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-colors"
               />
             </div>
             
             <div className="relative">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Phone size={16} className="text-zinc-500" />
               </div>
               <input 
                 type="tel" name="phone" placeholder="Teléfono (Opcional)" 
                 className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-colors"
               />
             </div>
           </div>

           <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowFullForm(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors border border-white/5"
              >
                Volver
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Completar Registro"}
              </button>
           </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 text-center mt-4">
          {error}
        </div>
      )}
    </form>
  )
}
