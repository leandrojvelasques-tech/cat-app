import { db } from "@/lib/db"
import { createPayment } from "@/app/actions/cuotas"
import Link from "next/link"
import { ArrowLeft, CreditCard } from "lucide-react"

export default async function PagarCuotaPage(props: any) {
  const params = await props.params
  const id = params?.id || props?.params?.id
  
  if (!id) return null

  const member = await db.member.findUnique({ where: { id } })
  if (!member) return null

  // Use a stable amount for V1, or query Settings
  const baseAmount = 6000
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // create bound action
  const createPaymentWithId = createPayment.bind(null, member.id)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href={`/admin/socios/${member.id}`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-3xl font-semibold tracking-tight text-white/90">Registrar Pago</h1>
           <p className="text-zinc-400 mt-1">Socio: {member.firstName} {member.lastName}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <form action={createPaymentWithId} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Mes (Período)</label>
              <select 
                name="periodMonth"
                defaultValue={currentMonth}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 appearance-none"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('es', { month: 'long' }).toUpperCase()}</option>
                ))}
              </select>
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
                defaultValue={baseAmount}
                className="w-full bg-black/20 border border-white/10 text-zinc-400 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Monto Abonado ($)</label>
              <input 
                name="amountPaid"
                type="number"
                defaultValue={baseAmount}
                className="w-full bg-black/20 border border-amber-500/50 rounded-xl px-4 py-3 text-amber-500 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Medio de Pago</label>
              <select 
                name="paymentMethod"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500/50 appearance-none"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="MERCADOPAGO">Mercado Pago</option>
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
              href={`/admin/socios/${member.id}`}
              className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
             >
              Cancelar
             </Link>
             <button 
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-900/20"
             >
              <CreditCard size={18} />
              Confirmar Pago
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
