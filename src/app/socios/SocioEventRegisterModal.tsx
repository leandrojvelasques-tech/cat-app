"use client"

import { useState } from "react"
import { Calendar, X, Ticket, CheckCircle2, Upload, Loader2, DollarSign, ShieldCheck, CreditCard, BookOpen, Music, Tag, FileText } from "lucide-react"
import { registerSocioForEvent } from "@/app/actions/eventos"
import { getEffectiveEventPrices } from "@/lib/event-utils"
import Link from "next/link"

interface EventClassData {
  id: string
  title: string
  classDate?: Date | string | null
  startTime?: string | null
  endTime?: string | null
}

interface EventData {
  id: string
  title: string
  eventBanner?: string | null
  startDate: Date | string
  location?: string | null
  hasMilonga?: boolean
  hasClasses?: boolean
  comboTitle?: string | null
  priceSocioMilonga?: number | null
  priceNonSocioMilonga?: number | null
  priceSocioCombo?: number | null
  priceNonSocioCombo?: number | null
  priceSocioClassLoose?: number | null
  priceNonSocioClassLoose?: number | null
  hasEarlyBird?: boolean
  earlyBirdDeadline?: Date | string | null
  priceSocioEarlyBird?: number | null
  priceNonSocioEarlyBird?: number | null
  priceSocioComboEarlyBird?: number | null
  priceNonSocioComboEarlyBird?: number | null
  isFree?: boolean
  classes?: EventClassData[]
}

interface MemberData {
  id: string
  firstName: string
  lastName: string
  dni: string
  email?: string | null
}

interface RegistrationData {
  id: string
  eventId: string
  registrationType?: string
  paymentStatus: string
  paymentMethod?: string | null
  amountPaid: number
}

interface SocioEventRegisterModalProps {
  event: EventData
  member: MemberData
  registration?: RegistrationData | null
}

export function SocioEventRegisterModal({ event, member, registration }: SocioEventRegisterModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const defaultRegType = registration?.registrationType || (event.hasClasses ? "COMBO_CLASES" : "MILONGA")
  const [registrationType, setRegistrationType] = useState<string>(defaultRegType.startsWith("CLASE_SUELTA") ? "CLASE_SUELTA" : defaultRegType)
  const [selectedClassId, setSelectedClassId] = useState<string>(event.classes?.[0]?.id || "")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isRegistered = !!registration
  const prices = getEffectiveEventPrices(event)

  // Calculate current price based on selected registration type
  const getCurrentPrice = () => {
    if (registrationType === "COMBO_CLASES") {
      return prices.comboSocio
    }
    if (registrationType === "CLASE_SUELTA") {
      return prices.classLooseSocio
    }
    return prices.milongaSocio
  }

  const currentPrice = getCurrentPrice()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("El archivo excede el tamaño máximo permitido de 5MB.")
        return
      }
      setFile(selectedFile)
      setFileError(null)

      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setFilePreview(null)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMsg(null)
    setFileError(null)

    let finalRegType = registrationType
    if (registrationType === "CLASE_SUELTA") {
      const selectedCls = event.classes?.find(c => c.id === selectedClassId) || event.classes?.[0]
      if (selectedCls?.title) {
        finalRegType = `CLASE_SUELTA (${selectedCls.title})`
      }
    }

    const formData = new FormData()
    formData.append("registrationType", finalRegType)
    formData.append("paymentMethod", paymentMethod)
    if (file) {
      formData.append("paymentProof", file)
    }

    try {
      const res = await registerSocioForEvent(event.id, formData)
      if (res.success) {
        setSuccessMsg(res.message || "Reserva confirmada con éxito")
        setTimeout(() => {
          setIsOpen(false)
          setSuccessMsg(null)
        }, 1800)
      } else {
        alert(res.error || "Error al procesar la reserva")
      }
    } catch (err) {
      alert("Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2 w-full">
        {/* Detail Link */}
        <Link
          href={`/eventos/${event.id}`}
          className="flex-1 text-center bg-white/5 hover:bg-white/10 text-zinc-300 py-2.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all hover:text-white"
        >
          Ver Evento
        </Link>

        {/* Register / Reserve Button */}
        <button
          onClick={() => setIsOpen(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isRegistered && registration?.paymentStatus === "PENDING"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
              : isRegistered
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
          }`}
        >
          {isRegistered && registration?.paymentStatus === "PENDING" ? (
            <>
              ⏳ Pendiente de Validación
            </>
          ) : isRegistered ? (
            <>
              <CheckCircle2 size={13} /> Inscripto
            </>
          ) : (
            <>
              <Ticket size={13} /> Reservar
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-[36px] max-w-xl md:max-w-2xl w-full max-h-[92vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Header Sticky */}
            {event.eventBanner && (
              <div className="relative w-full h-36 md:h-44 overflow-hidden border-b border-white/10 shrink-0 bg-zinc-950">
                <img src={event.eventBanner} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
              </div>
            )}
            <div className="flex justify-between items-center bg-zinc-900 p-5 md:p-6 border-b border-white/5 z-10 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                    <ShieldCheck size={12} /> Tarifa Preferencial Socio
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter line-clamp-1">{event.title}</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all border border-white/5 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent]">
                
                {successMsg ? (
                  <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{successMsg}</h4>
                    <p className="text-xs text-zinc-400">Su lugar en el evento ha sido asegurado con su beneficio de socio.</p>
                  </div>
                ) : (
                  <>
                    {registration?.paymentStatus === "PENDING" && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 text-amber-300 animate-in fade-in duration-200">
                        <Tag className="shrink-0 mt-0.5 text-amber-400" size={18} />
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                            Comprobante Pendiente de Validación por Tesorería
                          </p>
                          <p className="text-[11px] text-zinc-300 font-light leading-relaxed">
                            Hemos recibido tu comprobante de pago. Nuestra área de Tesorería verificará la información y te enviaremos la confirmación oficial a tu correo electrónico.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Select Item to Reserve if Event has both classes and milonga */}
                    {(event.hasClasses || event.hasMilonga) && (
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Seleccione la Opción a Reservar</label>
                        <div className="grid grid-cols-1 gap-2.5">
                          {event.hasClasses && (
                            <>
                              <button
                                type="button"
                                onClick={() => setRegistrationType("COMBO_CLASES")}
                                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                  registrationType === "COMBO_CLASES"
                                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-lg"
                                    : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <BookOpen size={18} className={registrationType === "COMBO_CLASES" ? "text-cyan-400" : "text-zinc-500"} />
                                  <div>
                                    <p className="text-xs font-bold uppercase">{event.comboTitle || "Combo Completo Clases"}</p>
                                    <p className="text-[10px] text-zinc-500">Acceso a todas las capacitaciones del evento</p>
                                  </div>
                                </div>
                                <span className="font-black text-sm text-amber-400">${(event.priceSocioCombo || 33000).toLocaleString()}</span>
                              </button>

                              <div className="space-y-2">
                                <button
                                  type="button"
                                  onClick={() => setRegistrationType("CLASE_SUELTA")}
                                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                    registrationType === "CLASE_SUELTA"
                                      ? "bg-cyan-500/10 border-cyan-500 text-white shadow-lg"
                                      : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <BookOpen size={18} className={registrationType === "CLASE_SUELTA" ? "text-cyan-400" : "text-zinc-500"} />
                                    <div>
                                      <p className="text-xs font-bold uppercase">Clase Suelta</p>
                                      <p className="text-[10px] text-zinc-500">Valor por una clase individual</p>
                                    </div>
                                  </div>
                                  <span className="font-black text-sm text-amber-400">${(event.priceSocioClassLoose || 11000).toLocaleString()}</span>
                                </button>

                                {registrationType === "CLASE_SUELTA" && event.classes && event.classes.length > 0 && (
                                  <div className="pl-4 border-l-2 border-cyan-500/40 space-y-2 pt-1 animate-in fade-in duration-200">
                                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                                      Seleccioná cuál clase vas a realizar:
                                    </label>
                                    <div className="space-y-1.5">
                                      {event.classes.map((cls, idx) => (
                                        <label
                                          key={cls.id || idx}
                                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                            (selectedClassId === cls.id || (!selectedClassId && idx === 0))
                                              ? "bg-cyan-500/20 border-cyan-400 text-white font-bold"
                                              : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="radio"
                                              name="socioSelectedClass"
                                              checked={selectedClassId === cls.id || (!selectedClassId && idx === 0)}
                                              onChange={() => setSelectedClassId(cls.id)}
                                              className="accent-cyan-400"
                                            />
                                            <span>{cls.title}</span>
                                          </div>
                                          {(cls.startTime || cls.classDate) && (
                                            <span className="text-[9px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                              {cls.startTime ? `${cls.startTime} hs` : ''}
                                            </span>
                                          )}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {event.hasMilonga && (
                            <button
                              type="button"
                              onClick={() => setRegistrationType("MILONGA")}
                              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                registrationType === "MILONGA"
                                  ? "bg-red-500/10 border-red-500 text-white shadow-lg"
                                  : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Music size={18} className={registrationType === "MILONGA" ? "text-red-400" : "text-zinc-500"} />
                                <div>
                                  <p className="text-xs font-bold uppercase">Entrada Milonga</p>
                                  <p className="text-[10px] text-zinc-500">Acceso al baile y fiesta de milonga</p>
                                </div>
                              </div>
                              <span className="font-black text-sm text-amber-400">${(event.priceSocioMilonga || 0).toLocaleString()}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rate Breakdown */}
                    <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-medium">Socio Inscrito:</span>
                        <span className="text-white font-bold">{member.firstName} {member.lastName} (DNI {member.dni})</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-medium">Valor Total Reserva Socio:</span>
                        <span className="text-amber-400 font-black text-lg">${currentPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Modalidad de Pago</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("CASH")}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            paymentMethod === "CASH" 
                              ? "bg-amber-500/10 border-amber-500 text-white shadow-lg" 
                              : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          <DollarSign size={20} className={paymentMethod === "CASH" ? "text-amber-500" : "text-zinc-600"} />
                          <div className="mt-2">
                            <p className="text-xs font-bold uppercase">En Puerta</p>
                            <p className="text-[9px] text-zinc-500">Reservar y abonar el día del evento</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("TRANSFER")}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            paymentMethod === "TRANSFER" 
                              ? "bg-amber-500/10 border-amber-500 text-white shadow-lg" 
                              : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          <CreditCard size={20} className={paymentMethod === "TRANSFER" ? "text-amber-500" : "text-zinc-600"} />
                          <div className="mt-2">
                            <p className="text-xs font-bold uppercase">Transferencia</p>
                            <p className="text-[9px] text-zinc-500">Adjuntar comprobante de pago</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Transfer Proof Uploader if Transfer selected */}
                    {paymentMethod === "TRANSFER" && (
                      <div className="space-y-4 bg-black/60 p-5 rounded-2xl border border-white/10 animate-in fade-in duration-200">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-[11px] text-amber-300 space-y-1 font-mono">
                          <p className="font-bold uppercase text-[10px] text-amber-400">Datos Bancarios CAT:</p>
                          <p>Alias: <strong>CENTRO.AMIGOS.TANGO</strong></p>
                          <p>Banco: Banco del Chubut</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block">
                            Comprobante de Transferencia (JPG, PNG, WebP o PDF)
                          </label>
                          <div className="relative border-2 border-dashed border-white/20 hover:border-amber-500/50 rounded-2xl p-5 text-center bg-black/40 transition-colors">
                            {file ? (
                              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <div className="flex items-center gap-2 truncate">
                                  {file.type === "application/pdf" ? (
                                    <FileText size={20} className="text-amber-400 shrink-0" />
                                  ) : (
                                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                                  )}
                                  <span className="truncate text-white">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => { setFile(null); setFilePreview(null); setFileError(null) }} 
                                  className="text-red-400 hover:text-red-300 hover:underline text-[10px] ml-2 shrink-0 cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-2 py-2">
                                <Upload size={24} className="mx-auto text-amber-500" />
                                <p className="text-xs font-bold text-zinc-300">Toca aquí para seleccionar tu comprobante</p>
                                <p className="text-[10px] text-zinc-500">Imágenes (JPG, PNG, WebP) o documentos PDF hasta 5MB.</p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>

                          {fileError && (
                            <p className="text-xs text-red-400 font-medium">{fileError}</p>
                          )}

                          {filePreview && file?.type.startsWith("image/") && (
                            <div className="mt-3 relative w-full h-36 bg-zinc-950 rounded-xl overflow-hidden border border-white/10">
                              <img src={filePreview} alt="Comprobante" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Sticky Footer */}
              {!successMsg && (
                <div className="p-5 md:p-6 bg-zinc-900 border-t border-white/5 z-10 shrink-0">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 p-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Ticket size={18} />
                        {isRegistered ? "Actualizar Reserva" : "Confirmar Reserva Socio"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}

