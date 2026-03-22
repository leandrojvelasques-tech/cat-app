"use client"

import { useState } from "react"
import { MessageSquarePlus, Copy, X, Mail, Check } from "lucide-react"
import { sendCommunication } from "@/app/actions/socios"

interface WelcomeMessageButtonProps {
  member: {
    id: string
    firstName: string
    lastName: string
    memberNumber: number
    phone?: string | null
    email?: string | null
    address?: string | null
    city?: string | null
  }
  feeAmount: number
}

export function WelcomeMessageButton({ member, feeAmount }: WelcomeMessageButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const welcomeMessage = `¡Bienvenido/a ${member.firstName} al Centro Amigos del Tango! 💃🕺

Es un gran placer darte la bienvenida como socio/a de nuestra querida casa de tango.
Tu ficha ha sido procesada con éxito y ya formas parte de nuestra comunidad oficial.

📌 Tu número de socio es: #${member.memberNumber}

💳 Información Administrativa:
- El pago de la cuota social corresponde a los meses calendario (del 1 al 10 de cada mes).
- Valor actual de la cuota (2025): $${feeAmount.toLocaleString()}

📞 Nuestros medios de contacto:
- WhatsApp/Tel: ${member.phone || "No registrado"}
- Email: ${member.email || "No registrado"}
- Sede Social: ${member.address || "No registrado"}, ${member.city || ""}

💬 Te invitamos a participar de nuestras milongas, clases y seminarios.
¡Nos vemos pronto en la pista!`

  const handleCopy = () => {
    navigator.clipboard.writeText(welcomeMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmail = async () => {
    if (!member.email) return
    setSendingEmail(true)
    try {
      await sendCommunication({
        memberId: member.id,
        type: "WELCOME",
        subject: "¡Bienvenido/a al Centro Amigos del Tango!",
        content: welcomeMessage,
        channel: "EMAIL"
      })
      setEmailSent(true)
      setTimeout(() => {
        setEmailSent(false)
        setIsOpen(false)
      }, 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-indigo-500/20"
      >
        <MessageSquarePlus size={16} /> Mensaje de Bienvenida
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white/90">Mensaje de Bienvenida</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {welcomeMessage}
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all border border-white/10"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  
                  <button
                    onClick={handleEmail}
                    disabled={!member.email || sendingEmail || emailSent}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
                      emailSent 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                    }`}
                  >
                    {sendingEmail ? (
                       <span className="animate-pulse">Enviando...</span>
                    ) : emailSent ? (
                      <><Check size={16} /> Enviado!</>
                    ) : (
                      <><Mail size={16} /> Enviar por Email</>
                    )}
                  </button>
                </div>
              </div>
              
              {!member.email && (
                <p className="text-[10px] text-red-400 text-center">
                  ⚠️ El socio no tiene un email registrado para el envío automático.
                </p>
              )}
              
              <p className="text-[10px] text-zinc-500 text-center">
                El envío por email registrará la comunicación en el historial del socio y activará la automatización (n8n).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
