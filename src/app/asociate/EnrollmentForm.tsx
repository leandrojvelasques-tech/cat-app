"use client"

import { useState } from "react"
import { submitEnrollmentRequest } from "@/app/actions/enrollment"
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export function EnrollmentForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [fileName, setFileName] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await submitEnrollmentRequest(formData)
      if (res.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setErrorMsg(res.error || "Ocurrió un error al enviar la solicitud.")
      }
    } catch (err) {
      setStatus("error")
      setErrorMsg("Ocurrió un fallo en la conexión. Por favor reintentá.")
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12 px-4 space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white font-serif">¡Solicitud Enviada con Éxito!</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            Hemos recibido tus datos y el comprobante de pago de tu primera cuota. Te enviamos un email de confirmación.
          </p>
        </div>
        <div className="bg-[#1b2621]/40 border border-white/5 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 text-xs text-zinc-300">
          <p className="font-bold text-cat-gold text-center uppercase tracking-wider mb-2">Próximos Pasos</p>
          <p><strong>1. Verificación:</strong> Tesorería revisará el pago en las próximas 24-48 hs hábiles.</p>
          <p><strong>2. Alta oficial:</strong> Te asignaremos tu N° de socio y crearemos tu cuenta del portal.</p>
          <p><strong>3. Notificación de credenciales:</strong> Recibirás un email con tu usuario y clave temporal.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
          <div>
            <p className="font-bold">No se pudo procesar la solicitud</p>
            <p className="text-xs opacity-90 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre *</label>
          <input 
            name="firstName" 
            required 
            type="text"
            disabled={status === "submitting"}
            placeholder="Juan" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Apellido *</label>
          <input 
            name="lastName" 
            required 
            type="text"
            disabled={status === "submitting"}
            placeholder="Pérez" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email *</label>
          <input 
            name="email" 
            required 
            type="email"
            disabled={status === "submitting"}
            placeholder="juan@ejemplo.com" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Celular (con código de área) *</label>
          <input 
            name="phone" 
            required 
            type="tel"
            disabled={status === "submitting"}
            placeholder="297 1234567" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">DNI *</label>
          <input 
            name="dni" 
            required 
            type="text"
            disabled={status === "submitting"}
            placeholder="12345678" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Fecha de Nacimiento *</label>
          <input 
            name="birthDate" 
            required 
            type="date"
            disabled={status === "submitting"}
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Domicilio Completo *</label>
          <input 
            name="address" 
            required 
            type="text"
            disabled={status === "submitting"}
            placeholder="Calle 123, Comodoro Rivadavia" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Comentario Adicional (Opcional)</label>
          <textarea 
            name="comment" 
            rows={3}
            disabled={status === "submitting"}
            placeholder="¿Cómo nos conociste? ¿Tenés experiencia previa bailando tango?" 
            className="bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-cat-gold focus:border-cat-gold outline-none transition-all placeholder:text-zinc-600 font-light"
          />
        </div>
      </div>

      {/* Upload Comprobante */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Adjuntar recibo de cuota 1 *</label>
        
        <input 
          id="paymentProof"
          name="paymentProof"
          required
          type="file"
          accept="image/*,application/pdf"
          disabled={status === "submitting"}
          onChange={(e) => {
            const file = e.target.files?.[0]
            setFileName(file ? file.name : "")
          }}
          className="hidden"
        />

        <div 
          onClick={() => {
            if (status !== "submitting") {
              document.getElementById("paymentProof")?.click()
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
            fileName 
              ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10" 
              : "border-cat-gold/30 bg-black/20 hover:bg-cat-gold/5"
          }`}
        >
          <Upload className={`w-8 h-8 ${fileName ? "text-emerald-400" : "text-cat-gold"}`} />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-white">
              {fileName ? `Archivo seleccionado: ${fileName}` : "Subir comprobante de transferencia"}
            </p>
            <p className="text-xs text-zinc-500">Imágenes (PNG, JPG) o PDF. Máximo 5MB.</p>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4.5 bg-gradient-to-r from-cat-gold to-cat-bronze text-zinc-950 font-bold rounded-xl text-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-cat-gold/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            <span>Enviando Solicitud...</span>
          </>
        ) : (
          <span>Enviar Solicitud de Inscripción</span>
        )}
      </button>
    </form>
  )
}
