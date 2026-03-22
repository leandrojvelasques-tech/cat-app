"use client"

import { createPayment } from "@/app/actions/cuotas"
import { CreditCard, Send, Plus } from "lucide-react"
import { useTransition } from "react"

export function RegisterFeeForm({ socioId, lastFee }: { socioId: string, lastFee?: any }) {
  const [isPending, startTransition] = useTransition()
  
  // Suggest next period based on last fee or current date
  const suggestMonth = lastFee ? (lastFee.periodMonth === 12 ? 1 : lastFee.periodMonth + 1) : new Date().getMonth() + 1
  const suggestYear = lastFee ? (lastFee.periodMonth === 12 ? lastFee.periodYear + 1 : lastFee.periodYear) : new Date().getFullYear()

  const handleFormAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createPayment(socioId, formData)
      } catch (e: any) {
        alert(e.message || "Error al registrar el pago")
      }
    })
  }

  return (
    <form action={handleFormAction} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-2">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Mes</label>
          <select 
            name="periodMonth" 
            defaultValue={suggestMonth}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={m} className="bg-zinc-900">
                {new Date(0, m - 1).toLocaleString('es', { month: 'long' }).toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Año</label>
          <input 
            name="periodYear" 
            type="number" 
            defaultValue={suggestYear}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Monto ($)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">$</span>
            <input 
              name="amountPaid" 
              type="number" 
              defaultValue={6000}
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono"
            />
          </div>
          <input name="amountDue" type="hidden" value={6000} />
          <input name="paymentMethod" type="hidden" value="EFECTIVO" />
        </div>

        <div className="lg:col-span-5">
           <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-white text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl active:scale-95"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={14} />
                Registrar Pago Rápido
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-[9px] text-zinc-600 italic">Este formulario registra un pago en <b>Efectivo</b> por el monto total. Para transferencias o pagos parciales, use 'Cobrar'.</p>
    </form>
  )
}
