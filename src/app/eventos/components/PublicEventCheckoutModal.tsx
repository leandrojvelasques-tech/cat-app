"use client"

import { useState } from "react"
import { Calendar, X, Ticket, CheckCircle2, Upload, Loader2, DollarSign, ShieldAlert, CreditCard, BookOpen, Music, ShoppingCart, User, Mail, Phone, Lock } from "lucide-react"
import { registerPublicAttendee } from "@/app/actions/registraciones"

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
  isFree?: boolean
}

interface PublicEventCheckoutModalProps {
  event: EventData
}

export function PublicEventCheckoutModal({ event }: PublicEventCheckoutModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(event.isFree ? 2 : 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Non-member Prices with fallbacks
  const milongaPrice = event.isFree ? 0 : (event.priceNonSocioMilonga || 0)
  const comboPrice = event.isFree ? 0 : (event.priceNonSocioCombo || 50000)
  const looseClassPrice = event.isFree ? 0 : (event.priceNonSocioClassLoose || 17000)

  // Selection states
  const [includeMilonga, setIncludeMilonga] = useState(event.hasMilonga ?? true)
  const [includeCombo, setIncludeCombo] = useState(event.hasClasses ?? false)
  const [includeLooseClass, setIncludeLooseClass] = useState(false)

  // Form Fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dni, setDni] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  // Calculate Total
  const calculateTotal = () => {
    if (event.isFree) return 0
    let total = 0
    if (includeMilonga && event.hasMilonga) total += milongaPrice
    if (includeCombo && event.hasClasses) total += comboPrice
    if (includeLooseClass && event.hasClasses && !includeCombo) total += looseClassPrice
    return total
  }

  const totalPrice = calculateTotal()

  const getSelectedTypeString = () => {
    const types: string[] = []
    if (includeCombo) types.push(event.comboTitle || "COMBO_CLASES")
    else if (includeLooseClass) types.push("CLASE_SUELTA")
    if (includeMilonga) types.push("MILONGA")
    return types.join(" + ") || "ENTRADA_GENERAL"
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("El archivo excede el tamaño máximo permitido de 5MB.")
        return
      }
      setFile(selectedFile)
      setErrorMessage(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!event.isFree && totalPrice === 0 && (event.hasMilonga || event.hasClasses)) {
      setErrorMessage("Por favor seleccioná al menos una opción para inscribirte.")
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("eventId", event.id)
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)
    formData.append("dni", dni)
    formData.append("email", email)
    formData.append("phone", phone)
    formData.append("registrationType", getSelectedTypeString())
    formData.append("amountPaid", totalPrice.toString())
    formData.append("paymentMethod", paymentMethod)
    if (file) {
      formData.append("paymentProof", file)
    }

    try {
      const res = await registerPublicAttendee(formData)
      if (res.success) {
        setSuccessMessage(res.message || "¡Inscripción realizada con éxito!")
        setTimeout(() => {
          setIsOpen(false)
          setSuccessMessage(null)
          setStep(1)
        }, 2200)
      } else {
        setErrorMessage(res.error || "No se pudo completar la inscripción.")
      }
    } catch (err) {
      setErrorMessage("Error de conexión al procesar la reserva.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:brightness-110 text-white font-extrabold px-6 py-4 rounded-2xl shadow-lg shadow-red-950/40 text-center text-xs tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-red-500/30"
      >
        <ShoppingCart size={16} /> Inscripción General (No Socios)
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-[36px] max-w-lg w-full max-h-[92vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Header */}
            {event.eventBanner && (
              <div className="relative w-full h-32 overflow-hidden border-b border-white/10 shrink-0 bg-zinc-950">
                <img src={event.eventBanner} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
              </div>
            )}

            <div className="flex justify-between items-center bg-zinc-900 p-6 border-b border-white/5 shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-md border border-red-500/20">
                  Reserva General / Público
                </span>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mt-1 line-clamp-1">
                  {event.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all border border-white/5 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent]">
                
                {successMessage ? (
                  <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{successMessage}</h4>
                    <p className="text-xs text-zinc-400">Recibirás los detalles de tu entrada e inscripción en tu correo electrónico.</p>
                  </div>
                ) : (
                  <>
                    {errorMessage && (
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs font-medium flex items-center gap-2">
                        <ShieldAlert size={16} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {step === 1 ? (
                      /* Paso 1: Carrito de Selección de Opciones */
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-3">
                            1. Seleccioná lo que deseas contratar / asistir
                          </h4>
                          
                          <div className="space-y-3">
                            {/* Option Combo Clases */}
                            {event.hasClasses && (
                              <label
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                                  includeCombo
                                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-lg"
                                    : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={includeCombo}
                                    onChange={(e) => {
                                      setIncludeCombo(e.target.checked)
                                      if (e.target.checked) setIncludeLooseClass(false)
                                    }}
                                    className="accent-cyan-500 w-4 h-4"
                                  />
                                  <div>
                                    <p className="text-xs font-bold uppercase text-white">{event.comboTitle || "Combo Capacitación Completo"}</p>
                                    <p className="text-[10px] text-zinc-400">Acceso a todas las clases y seminario</p>
                                  </div>
                                </div>
                                <span className="font-black text-sm text-cyan-400">${comboPrice.toLocaleString()}</span>
                              </label>
                            )}

                            {/* Option Clase Suelta */}
                            {event.hasClasses && !includeCombo && (
                              <label
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                                  includeLooseClass
                                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-lg"
                                    : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={includeLooseClass}
                                    onChange={(e) => setIncludeLooseClass(e.target.checked)}
                                    className="accent-cyan-500 w-4 h-4"
                                  />
                                  <div>
                                    <p className="text-xs font-bold uppercase text-white">Clase Suelta (Individual)</p>
                                    <p className="text-[10px] text-zinc-400">Valor por una clase a elección</p>
                                  </div>
                                </div>
                                <span className="font-black text-sm text-cyan-400">${looseClassPrice.toLocaleString()}</span>
                              </label>
                            )}

                            {/* Option Entrada Milonga */}
                            {event.hasMilonga && (
                              <label
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                                  includeMilonga
                                    ? "bg-red-500/10 border-red-500 text-white shadow-lg"
                                    : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={includeMilonga}
                                    onChange={(e) => setIncludeMilonga(e.target.checked)}
                                    className="accent-red-500 w-4 h-4"
                                  />
                                  <div>
                                    <p className="text-xs font-bold uppercase text-white">Entrada Milonga (Público General)</p>
                                    <p className="text-[10px] text-zinc-400">Acceso a la milonga y show</p>
                                  </div>
                                </div>
                                <span className="font-black text-sm text-red-400">${milongaPrice.toLocaleString()}</span>
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Total Summary */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                          <span className="text-xs text-zinc-400 font-medium">Total a Abonar:</span>
                          <span className="text-xl font-black text-white">${totalPrice.toLocaleString()}</span>
                        </div>

                        <button
                          type="button"
                          disabled={totalPrice === 0}
                          onClick={() => setStep(2)}
                          className="w-full bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 cursor-pointer"
                        >
                          Continuar con Mis Datos →
                        </button>
                      </div>
                    ) : (
                      /* Paso 2: Datos de contacto y Pago */
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                            2. Datos de Contacto y Pago
                          </h4>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-[10px] text-red-400 hover:underline font-bold"
                          >
                            ← Cambiar Selección
                          </button>
                        </div>

                        {/* Summary Pill */}
                        <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                          <span className="text-zinc-300 font-bold truncate max-w-[200px]">{getSelectedTypeString()}</span>
                          <span className="text-red-400 font-black text-sm">${totalPrice.toLocaleString()}</span>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold ml-1">Nombre *</label>
                            <input
                              required
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Ej: Juan"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold ml-1">Apellido *</label>
                            <input
                              required
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Ej: Pérez"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold ml-1">DNI *</label>
                            <input
                              required
                              type="text"
                              value={dni}
                              onChange={(e) => setDni(e.target.value)}
                              placeholder="Sin puntos"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold ml-1">Teléfono *</label>
                            <input
                              required
                              type="text"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Ej: 2974000000"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500"
                            />
                          </div>

                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold ml-1">Correo Electrónico *</label>
                            <input
                              required
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="ejemplo@correo.com"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        {/* Selector Método de Pago */}
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 ml-1">Modalidad de Pago</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("CASH")}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                paymentMethod === "CASH"
                                  ? "bg-red-500/10 border-red-500 text-white shadow-lg"
                                  : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                              }`}
                            >
                              <DollarSign size={18} className={paymentMethod === "CASH" ? "text-red-400" : "text-zinc-600"} />
                              <p className="text-xs font-bold uppercase mt-1">En Puerta</p>
                              <p className="text-[9px] text-zinc-500">Abonar al ingresar</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod("TRANSFER")}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                paymentMethod === "TRANSFER"
                                  ? "bg-red-500/10 border-red-500 text-white shadow-lg"
                                  : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
                              }`}
                            >
                              <CreditCard size={18} className={paymentMethod === "TRANSFER" ? "text-red-400" : "text-zinc-600"} />
                              <p className="text-xs font-bold uppercase mt-1">Transferencia</p>
                              <p className="text-[9px] text-zinc-500">Subir comprobante</p>
                            </button>
                          </div>
                        </div>

                        {/* Transfer details & Safe File Upload */}
                        {paymentMethod === "TRANSFER" && (
                          <div className="space-y-3 bg-black/60 p-4 rounded-2xl border border-white/10 animate-in fade-in duration-200">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-300 space-y-1 font-mono">
                              <p className="font-bold uppercase text-[10px] text-amber-400">Datos Bancarios CAT:</p>
                              <p>Alias: <strong>CENTRO.AMIGOS.TANGO</strong></p>
                              <p>Banco: Banco del Chubut</p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block">
                                Comprobante de Transferencia (Imágenes JPG, PNG, WEBP o PDF)
                              </label>
                              <div className="relative border border-dashed border-white/20 hover:border-red-500/50 rounded-xl p-4 text-center bg-black/40 transition-colors">
                                {file ? (
                                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                                    <span className="truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    <button type="button" onClick={() => { setFile(null); setFilePreview(null) }} className="text-red-400 hover:underline text-[10px] ml-2">Remover</button>
                                  </div>
                                ) : (
                                  <div>
                                    <Upload size={20} className="mx-auto text-zinc-500 mb-1" />
                                    <p className="text-xs font-bold text-zinc-300">Seleccionar Comprobante</p>
                                    <p className="text-[9px] text-zinc-500">Formatos seguros permitidos: JPG, PNG, WebP, PDF. Máximo 5MB.</p>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,application/pdf"
                                  onChange={handleFileChange}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Footer CTA */}
              {!successMessage && step === 2 && (
                <div className="p-6 bg-zinc-900 border-t border-white/5 shrink-0">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Ticket size={18} />
                        Confirmar Inscripción (${totalPrice.toLocaleString()})
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
