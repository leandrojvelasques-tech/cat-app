import { useState } from "react"
import { Eye, X, User, Calendar, CreditCard, Clock, Info, ShieldCheck, Tag, FileText, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { extractPaymentProofUrl } from "@/lib/proof-utils"

interface PaymentDetailModalProps {
  payment: any
  trigger?: React.ReactNode
}

export function PaymentDetailModal({ payment, trigger }: PaymentDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const data = payment.fullData
  const proofUrl = extractPaymentProofUrl(payment)

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10 group"
          title="Ver detalles"
        >
          <Eye size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto no-scrollbar">
          <div className="bg-zinc-900 border border-white/10 p-8 md:p-10 rounded-[48px] max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-8 animate-in zoom-in-95 duration-200 relative my-auto md:my-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-3 inline-block ${
                  payment.type === 'CUOTA' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  Comprobante #{payment?.id?.slice(0,8).toUpperCase() || "N/A"}
                </span>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Detalle de Pago</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all shadow-inner"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 italic">
                      <User size={12} /> Pagador
                   </p>
                   <p className="text-white font-black text-lg uppercase tracking-tight italic leading-tight">{payment?.payerName || "Desconocido"}</p>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{payment?.isMember ? 'Socio Activo' : 'No Socio / Visitante'}</p>
                </div>

                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 italic">
                      <Tag size={12} /> Motivo del Cobro
                   </p>
                   <p className="text-zinc-300 font-medium text-sm leading-relaxed">{payment?.reason || "No especificado"}</p>
                </div>

                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 italic">
                      <Info size={12} /> Grabado por
                   </p>
                   <p className="text-white font-bold text-sm uppercase flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" /> {payment?.recordedBy || "Sistema"}
                   </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 space-y-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 italic">
                      <Calendar size={12} /> Fecha y Hora
                   </p>
                   {payment?.date ? (
                     <>
                        <p className="text-white font-black text-sm uppercase">
                          {format(new Date(payment.date), "eeee dd 'de' MMMM", { locale: es })}
                        </p>
                        <p className="text-xs text-zinc-500 font-bold">{format(new Date(payment.date), "HH:mm")} hs</p>
                     </>
                   ) : (
                     <p className="text-zinc-500 text-sm italic">Fecha no disponible</p>
                   )}
                </div>

                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2 italic">
                      <CreditCard size={12} /> Medio de Pago
                   </p>
                   <p className="text-white font-black text-sm uppercase tracking-widest">{payment?.method || "EFECTIVO"}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1 italic">Total Ingresado</p>
                   <p className="text-3xl font-black text-amber-500 tracking-tighter italic">${payment?.amount?.toLocaleString() || "0"}</p>
                </div>
              </div>
            </div>

            {/* Proof of Payment Section */}
            {proofUrl && (
              <div className="pt-8 border-t border-white/10 relative z-10 space-y-4">
                 <div className="flex justify-between items-center mb-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 italic">
                      <FileText size={12} className="text-amber-400" /> Comprobante de Pago Adjunto
                   </p>
                   <a 
                     href={proofUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
                   >
                     <ExternalLink size={12} /> Ver en Pantalla Completa
                   </a>
                 </div>
                 
                 <div className="bg-black/60 rounded-[32px] border border-white/10 overflow-hidden group/img relative min-h-[220px] p-4 flex items-center justify-center">
                    {(() => {
                      const isPdf = proofUrl.startsWith("data:application/pdf") || proofUrl.toLowerCase().endsWith(".pdf")

                      if (isPdf) {
                        return (
                          <div className="w-full flex flex-col items-center gap-3 p-4">
                            <FileText size={40} className="text-amber-400" />
                            <p className="text-xs text-zinc-300 font-medium">Documento PDF adjunto</p>
                            <a 
                              href={proofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                              <ExternalLink size={14} /> Abrir PDF Completo
                            </a>
                          </div>
                        )
                      }

                      if (!imgError) {
                        return (
                          <img 
                            src={proofUrl} 
                            alt="Comprobante de pago" 
                            className="max-w-full max-h-[400px] object-contain rounded-2xl border border-white/10 shadow-lg cursor-zoom-in hover:scale-[1.01] transition-transform duration-300" 
                            onError={() => setImgError(true)}
                          />
                        )
                      }

                      return (
                        <div className="p-8 text-center flex flex-col items-center gap-3">
                           <FileText size={36} className="text-amber-400" />
                           <p className="text-zinc-400 text-xs font-medium">Comprobante externo o link adjunto</p>
                           <a 
                             href={proofUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                           >
                             <ExternalLink size={14} /> Abrir Archivo Adjunto
                           </a>
                        </div>
                      )
                    })()}
                 </div>
              </div>
            )}

            <div className="pt-4 text-center">
               <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] italic">Centro Amigos del Tango • Sistema de Gestión</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
