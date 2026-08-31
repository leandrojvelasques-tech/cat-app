"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, ShieldAlert, CreditCard, Upload, X, Loader2, CheckSquare, Square, Info } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { submitSocioPaymentProof } from "@/app/actions/socio-billing"

export interface DebtMonth {
  year: number
  month: number
  amount: number
  isAdvance?: boolean
  isSuspensionRegularization?: boolean
}

interface SocioDuesPaymentSectionProps {
  memberId: string
  debtMonths: DebtMonth[]
  totalDebt: number
  calculatedStatus: "AL DIA" | "EN MORA" | "SUSPENDIDO" | "INACTIVO" | "BAJA" | "HONORARIO"
}

export function SocioDuesPaymentSection({
  memberId,
  debtMonths,
  totalDebt,
  calculatedStatus
}: SocioDuesPaymentSectionProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    debtMonths.map(d => `${d.year}-${d.month}`)
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const toggleMonth = (key: string) => {
    const monthIndex = debtMonths.findIndex(d => `${d.year}-${d.month}` === key)
    if (monthIndex < 0) return

    setSelectedKeys(prev =>
      prev.includes(key)
        ? prev.filter(selectedKey => {
            const selectedIndex = debtMonths.findIndex(d => `${d.year}-${d.month}` === selectedKey)
            return selectedIndex < monthIndex
          })
        : monthIndex === 0 || debtMonths
            .slice(0, monthIndex)
            .every(d => prev.includes(`${d.year}-${d.month}`))
          ? [...prev, key]
          : prev
    )
  }

  const toggleSelectAll = () => {
    if (selectedKeys.length === debtMonths.length) {
      setSelectedKeys([])
    } else {
      setSelectedKeys(debtMonths.map(d => `${d.year}-${d.month}`))
    }
  }

  const selectedDebtMonths = debtMonths.filter(d =>
    selectedKeys.includes(`${d.year}-${d.month}`)
  )

  const selectedTotalAmount = selectedDebtMonths.reduce((sum, item) => sum + item.amount, 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFilePreview(null)
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDebtMonths.length === 0) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append("memberId", memberId)
      formData.append("selectedMonths", JSON.stringify(selectedDebtMonths))
      formData.append("paymentMethod", paymentMethod)
      formData.append("notes", notes)
      if (file) {
        formData.append("paymentProof", file)
      }

      const res = await submitSocioPaymentProof(formData)
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Pago enviado con éxito." })
        setTimeout(() => {
          setIsModalOpen(false)
          setFile(null)
          setFilePreview(null)
          setNotes("")
        }, 2000)
      } else {
        setFeedback({ type: "error", message: res.error || "Error al enviar el comprobante." })
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Ocurrió un error inesperado." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMonthName = (m: number, y: number) => {
    const d = new Date(y, m - 1, 1)
    return format(d, "MMMM yyyy", { locale: es })
  }

  const isMora = calculatedStatus === "EN MORA"
  const isSuspendido = calculatedStatus === "SUSPENDIDO"
  const isAlDia = calculatedStatus === "AL DIA" || calculatedStatus === "HONORARIO"
  const suspensionAmount = debtMonths[0]?.isSuspensionRegularization ? debtMonths[0].amount : 0
  const currentPeriod = new Date()
  const currentPeriodLabel = getMonthName(currentPeriod.getMonth() + 1, currentPeriod.getFullYear())

  return (
    <div className="space-y-6">
      {/* 1. CARTEL DE ESTADO Y ADVERTENCIA PROMINENTE */}
      {isAlDia && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 md:p-8 flex items-start gap-5 shadow-xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Socio Al Día
            </span>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mt-2">
              ¡Felicitaciones! Su cuota social se encuentra al día
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1 font-medium">
              Gracias por formar parte del Centro Amigos del Tango y apoyar el desarrollo de nuestras actividades.
            </p>
          </div>
        </div>
      )}

      {isMora && (
        <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-zinc-950 border border-amber-500/40 rounded-3xl p-6 md:p-8 flex items-start gap-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg">
            <Info size={26} className="animate-pulse" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 shadow-sm">
                Socio en Mora ({debtMonths.length} {debtMonths.length === 1 ? "cuota pendiente" : "cuotas pendientes"})
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-amber-200 tracking-tight leading-snug">
              Tranquilo, todavía vas a poder seguir disfrutando de los beneficios de los socios Centro Amigos del Tango
            </h3>
            <p className="text-xs text-amber-300/80 font-medium">
              Te sugerimos regularizar las cuotas adeudadas seleccionando los meses a continuación.
            </p>
          </div>
        </div>
      )}

      {isSuspendido && (
        <div className="bg-gradient-to-r from-red-950/90 via-red-900/50 to-zinc-950 border border-red-500/50 rounded-3xl p-6 md:p-8 flex items-start gap-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldAlert size={26} className="animate-bounce" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-300 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/40 shadow-sm">
                Socio Suspendido (3+ cuotas adeudadas)
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug">
              Para reactivar tu condición de socio, realizá un único pago de regularización por ${suspensionAmount.toLocaleString("es-AR")} —equivalente a tres cuotas al valor vigente—.
            </h3>
            <p className="text-xs text-red-200/80 font-medium">
              El pago se registrará en {currentPeriodLabel}; no se imputará a meses anteriores. Una vez aprobado por Tesorería, quedarás al día en el mes corriente y se reactivarán tus beneficios.
            </p>
          </div>
        </div>
      )}

      {/* 2. LISTA DE CUOTAS PENDIENTES CON SELECCIÓN */}
      {debtMonths.length > 0 && (
        <div className="bg-zinc-950/60 border border-white/10 rounded-[32px] p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                <CreditCard size={20} className="text-amber-500" /> Cuotas Adeudadas ({debtMonths.length})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Seleccione las cuotas que desea abonar y presione "Pagar" para adjuntar el comprobante
              </p>
            </div>
            
            <button
              onClick={toggleSelectAll}
              type="button"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 transition-all"
            >
              {selectedKeys.length === debtMonths.length ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectedKeys.length === debtMonths.length ? "Desmarcar Todas" : "Seleccionar Todas"}
            </button>
          </div>

          {/* Grilla de meses adeudados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {debtMonths.map(debt => {
              const key = `${debt.year}-${debt.month}`
              const debtIndex = debtMonths.findIndex(item => `${item.year}-${item.month}` === key)
              const isSelected = selectedKeys.includes(key)
              const canSelect = debtIndex === 0 || debtMonths
                .slice(0, debtIndex)
                .every(item => selectedKeys.includes(`${item.year}-${item.month}`))

              return (
                <div
                  key={key}
                  onClick={() => toggleMonth(key)}
                  aria-disabled={!canSelect && !isSelected}
                  title={!canSelect && !isSelected ? "Primero debe seleccionar las cuotas anteriores" : undefined}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 text-white"
                      : canSelect
                      ? "bg-white/[0.02] border-white/10 hover:border-white/20 text-zinc-400 cursor-pointer"
                      : "bg-white/[0.02] border-white/5 text-zinc-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                      isSelected ? "bg-amber-500 border-amber-400 text-zinc-950" : "border-white/20 bg-zinc-900"
                    }`}>
                      {isSelected && <CheckCircle2 size={16} className="font-black" />}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase italic text-white">
                        {debt.isSuspensionRegularization ? `Regularización · ${getMonthName(debt.month, debt.year)}` : `Mes ${getMonthName(debt.month, debt.year)}`}
                      </p>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                        {debt.isSuspensionRegularization ? "Pago único para levantar la suspensión" : debt.isAdvance ? "Adelanto de cuota social" : "Cuota social pendiente"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-black tracking-wider text-amber-400">
                      ${debt.amount.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Subtotal y Botón Pagar */}
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs text-zinc-400">Total seleccionado ({selectedDebtMonths.length} cuotas):</p>
              <p className="text-2xl md:text-3xl font-black text-white tracking-widest italic">
                ${selectedTotalAmount.toLocaleString("es-AR")}
              </p>
            </div>

            <button
              disabled={selectedDebtMonths.length === 0}
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black uppercase italic tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <CreditCard size={20} />
              Pagar Cuotas Seleccionadas
            </button>
          </div>
        </div>
      )}

      {/* 3. MODAL DE PAGO Y SUBIDA DE COMPROBANTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 rounded-[36px] w-full max-w-xl p-6 md:p-8 space-y-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Encabezado */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Tesorería CAT
                </span>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-2">
                  Regularizar Cuotas Sociales
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Datos Bancarios */}
            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-amber-500/20 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Datos para Transferencia Bancaria</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px]">Titular:</span>
                  <p className="font-bold text-white">Centro Amigos del Tango</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px]">Alias MercadoPago / CBU:</span>
                  <p className="font-bold text-amber-400 select-all">CENTRO.AMIGOS.TANGO</p>
                </div>
              </div>
            </div>

            {/* Resumen de Selección */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-400">Cuotas seleccionadas a pagar:</p>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                {selectedDebtMonths.map(d => (
                  <span key={`${d.year}-${d.month}`} className="text-xs bg-white/5 border border-white/10 text-white font-medium px-3 py-1 rounded-xl">
                    {getMonthName(d.month, d.year)}: ${d.amount.toLocaleString("es-AR")}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-zinc-400">Total a Adjuntar:</span>
                <span className="text-xl font-black text-amber-400">${selectedTotalAmount.toLocaleString("es-AR")}</span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* Método de pago */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Método de Pago Utilizado</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-white text-sm focus:border-amber-500 outline-none"
                >
                  <option value="TRANSFER">Transferencia Bancaria / MercadoPago</option>
                  <option value="CASH">Efectivo en Sede Central</option>
                  <option value="DEPOSIT">Depósito Bancario</option>
                </select>
              </div>

              {/* Subir Comprobante */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  Adjuntar Comprobante de Pago (JPG, PNG o PDF)
                </label>
                <div className="relative border-2 border-dashed border-white/20 hover:border-amber-500/50 rounded-2xl p-4 text-center transition-colors bg-zinc-950/40">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                      <Upload size={24} className="text-amber-500" />
                      <p className="text-xs font-bold text-zinc-300">Toca aquí para seleccionar tu comprobante</p>
                      <p className="text-[10px] text-zinc-500">Imágenes o archivos PDF hasta 5MB</p>
                    </div>
                  )}
                </div>

                {filePreview && file?.type.startsWith("image/") && (
                  <div className="mt-3 relative w-full h-32 bg-zinc-950 rounded-xl overflow-hidden border border-white/10">
                    <img src={filePreview} alt="Comprobante" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Notas opcionales */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Notas / Observaciones (Opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Transferencia realizada desde cuenta de Banco Nación a nombre de Juan Pérez"
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-white text-xs focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Mensajes de Feedback */}
              {feedback && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}>
                  {feedback.message}
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase rounded-xl transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    "Enviar Comprobante a Tesorería"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
