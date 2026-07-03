"use client"

import { useState } from "react"
import { createPayment } from "@/app/actions/cuotas"
import Link from "next/link"
import { CreditCard } from "lucide-react"

export function PagarCuotaForm({ 
  memberId, 
  baseAmount, 
  currentMonth, 
  currentYear,
  returnTo
}: { 
  memberId: string, 
  baseAmount: number, 
  currentMonth: number, 
  currentYear: number,
  returnTo?: string
}) {
  const [selectedMonths, setSelectedMonths] = useState<number[]>([currentMonth])
  const [amountDue, setAmountDue] = useState(baseAmount)
  const [amountPaid, setAmountPaid] = useState(baseAmount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const toggleMonth = (m: number) => {
    let newSelected: number[]
    if (selectedMonths.includes(m)) {
      if (selectedMonths.length === 1) return // Prevent deselecting the last one
      newSelected = selectedMonths.filter(x => x !== m)
    } else {
      newSelected = [...selectedMonths, m].sort((a, b) => a - b)
    }
    
    setSelectedMonths(newSelected)
    setAmountDue(newSelected.length * baseAmount)
    setAmountPaid(newSelected.length * baseAmount)
  }

  const createPaymentWithId = createPayment.bind(null, memberId)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Avoid double submissions
    if (isSubmitting) {
      e.preventDefault()
      return
    }
    setIsSubmitting(true)
  }

  return (
    <form action={createPaymentWithId} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Hidden input to pass array of months to the backend */}
      <input type="hidden" name="periodMonths" value={JSON.stringify(selectedMonths)} />
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-zinc-300">Meses a pagar</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {monthNames.map((name, index) => {
              const m = index + 1
              const isSelected = selectedMonths.includes(m)
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => toggleMonth(m)}
                  className={`py-2 px-1 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                    isSelected 
                      ? "bg-amber-600/20 text-amber-500 border-amber-500/50 shadow-inner" 
                      : "bg-black/20 text-zinc-500 border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {name.substring(0, 3)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Año</label>
          <input 
            name="periodYear"
            type="number"
            defaultValue={currentYear}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Monto Exigible ($)</label>
          <input 
            name="amountDue"
            type="number"
            value={amountDue}
            readOnly
            className="w-full bg-black/40 border border-white/5 text-zinc-500 rounded-xl px-4 py-3 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Monto Abonado ($)</label>
          <input 
            name="amountPaid"
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            className="w-full bg-black/20 border border-amber-500/50 rounded-xl px-4 py-3 text-amber-500 font-medium focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Medio de Pago</label>
          <select 
            name="paymentMethod"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 appearance-none"
          >
            <option value="EFECTIVO" className="bg-zinc-900">Efectivo</option>
            <option value="TRANSFERENCIA" className="bg-zinc-900">Transferencia Bancaria</option>
            <option value="MERCADOPAGO" className="bg-zinc-900">Mercado Pago</option>
          </select>
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Observaciones</label>
          <textarea 
            name="notes"
            rows={3}
            placeholder="Nro de comprobante, etc..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50"
          ></textarea>
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Archivo Adjunto (Comprobante)</label>
          <input 
            name="paymentProof"
            type="file"
            accept="image/*,.pdf"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
          />
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
          <Link 
          href={returnTo || `/admin/socios/${memberId}`}
          className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
          Cancelar
          </Link>
          <button 
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
            isSubmitting 
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 text-white shadow-lg shadow-red-900/20"
          }`}
          >
          <CreditCard size={18} />
          {isSubmitting ? "Procesando..." : "Confirmar Pago"}
          </button>
      </div>
    </form>
  )
}
