"use client"

import { useState, useMemo } from "react"
import { 
  ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Wine, Beer, 
  Utensils, X, CheckCircle, Wallet, LogOut, Banknote, AlertCircle, Edit2
} from "lucide-react"
import Link from "next/link"
import { registerBuffetSale, openBuffetCashRegister, addBuffetWithdrawal, closeBuffetCashRegister } from "@/app/actions/buffet"

interface Product { id: string; name: string; brand: string | null; size: string | null; price: number; type: string }
interface Member { id: string; firstName: string; lastName: string; memberNumber: string }
interface Withdrawal { id: string; amount: number; reason: string; createdAt: Date }
interface CashRegister { 
  id: string; 
  status: string; 
  openingBalance: number; 
  closingBalance?: number | null; 
  withdrawals: Withdrawal[] 
}
interface Event { id: string; title: string; buffetCashRegister?: CashRegister | null }

interface CartItem extends Product { quantity: number; customPrice?: number }

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  BEBIDAS_CON_ALCOHOL: { label: "Con Alcohol", icon: <Wine size={14} />, color: "text-purple-400 border-purple-400/30 bg-purple-400/5" },
  BEBIDAS_SIN_ALCOHOL: { label: "Sin Alcohol", icon: <Beer size={14} />, color: "text-blue-400 border-blue-400/30 bg-blue-400/5" },
  COMIDA: { label: "Comida", icon: <Utensils size={14} />, color: "text-amber-400 border-amber-400/30 bg-amber-400/5" },
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "💵 Efectivo" },
  { value: "MERCADOPAGO", label: "💙 Mercado Pago" },
  { value: "TRANSFER", label: "🏦 Transferencia" },
  { value: "A_COBRAR", label: "📋 A Cobrar" },
]

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v)

export function BuffetPOS({ event, products, members }: { event: Event; products: Product[]; members: Member[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [showWithdrawal, setShowWithdrawal] = useState(false)
  const [showClosing, setShowClosing] = useState(false)
  
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [buyerName, setBuyerName] = useState("")
  const [buyerId, setBuyerId] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Cash Register State
  const [openingAmount, setOpeningAmount] = useState(0)
  const [withdrawalAmount, setWithdrawalAmount] = useState(0)
  const [withdrawalReason, setWithdrawalReason] = useState("")
  const [closingObservations, setClosingObservations] = useState("")

  const grouped = useMemo(() => products.reduce((acc: Record<string, Product[]>, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {}), [products])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1, customPrice: product.price }]
    })
  }

  const updateItemPrice = (productId: string, newPrice: number) => {
    setCart(prev => prev.map(i => i.id === productId ? { ...i, customPrice: newPrice } : i))
  }

  const decreaseCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId)
      if (!existing) return prev
      if (existing.quantity <= 1) return prev.filter(i => i.id !== productId)
      return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.id !== productId))
  
  const subtotal = cart.reduce((sum, i) => sum + (i.customPrice ?? i.price) * i.quantity, 0)
  
  const isRegisterOpen = event.buffetCashRegister?.status === "OPEN"

  const handleOpenRegister = async () => {
    setLoading(true)
    await openBuffetCashRegister(event.id, openingAmount)
    setLoading(false)
  }

  const handleWithdrawal = async () => {
    if (!event.buffetCashRegister) return
    setLoading(true)
    await addBuffetWithdrawal(event.buffetCashRegister.id, event.id, withdrawalAmount, withdrawalReason)
    setShowWithdrawal(false)
    setWithdrawalAmount(0)
    setWithdrawalReason("")
    setLoading(false)
  }

  const handleCloseRegister = async () => {
    if (!event.buffetCashRegister) return
    setLoading(true)
    // El balance de cierre es lo que el usuario cuenta en efectivo
    // (Caja Inicial + Ventas Efectivo - Retiros)
    await closeBuffetCashRegister(event.buffetCashRegister.id, event.id, subtotal, closingObservations)
    setShowClosing(false)
    setLoading(false)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    await registerBuffetSale({
      eventId: event.id,
      items: cart.map(i => ({ productId: i.id, quantity: i.quantity, priceAtSale: i.customPrice ?? i.price })),
      amountTotal: subtotal,
      amountPaid: paymentMethod === "A_COBRAR" ? 0 : subtotal,
      paymentMethod,
      buyerName: paymentMethod === "A_COBRAR" ? buyerName : undefined,
      buyerId: paymentMethod === "A_COBRAR" ? buyerId || undefined : undefined,
    })
    setCart([])
    setShowCheckout(false)
    setPaymentMethod("CASH")
    setBuyerName("")
    setBuyerId("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    setLoading(false)
  }

  // Si la caja no está abierta, mostramos pantalla de inicio
  if (!isRegisterOpen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl animate-in zoom-in-95 duration-500 shadow-2xl">
          <div className="flex flex-col items-center text-center gap-6">
             <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                <Wallet size={40} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Apertura de Buffet</h1>
                <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">Ingresá el saldo inicial de caja para comenzar las ventas de hoy.</p>
             </div>
             
             <div className="w-full space-y-4">
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</div>
                   <input 
                      type="number" 
                      value={openingAmount || ""}
                      onChange={(e) => setOpeningAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Monto Inicial (Ej: 20000)"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-zinc-800"
                   />
                </div>
                
                <button 
                  onClick={handleOpenRegister}
                  disabled={loading}
                  className="w-full bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-amber-900/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Iniciando..." : "Abrir Caja del Buffet"}
                </button>
                
                <Link href={`/admin/eventos/${event.id}`} className="block text-zinc-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest pt-4">
                   ← Volver al Evento
                </Link>
             </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header POS */}
      <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[28px] border border-white/10 backdrop-blur-md">
        <Link href={`/admin/eventos/${event.id}`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
          <ArrowLeft size={18} className="text-zinc-400" />
        </Link>
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Buffet / {event.title}</p>
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold text-white/90 italic uppercase tracking-tight">Punto de Venta</h1>
             <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest">Caja Abierta</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowWithdrawal(true)}
             className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all text-xs font-bold uppercase tracking-tight"
           >
              <Banknote size={14} /> Salida
           </button>
           <button 
             onClick={() => setShowClosing(true)}
             className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-white/10 transition-all text-xs font-bold uppercase tracking-tight"
           >
              <LogOut size={14} /> Cerrar Buffet
           </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-2xl">
          <CheckCircle size={20} />
          <span className="font-semibold">Venta registrada correctamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {Object.entries(grouped).map(([type, items]) => {
            const meta = TYPE_META[type] ?? { label: type, icon: null, color: "text-zinc-400 border-zinc-400/30 bg-zinc-400/5" }
            return (
              <div key={type}>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest mb-3 ${meta.color}`}>
                  {meta.icon} {meta.label}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(items as Product[]).map(p => {
                    const inCart = cart.find(i => i.id === p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:shadow-amber-500/5 active:scale-95 overflow-hidden"
                      >
                        {inCart && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center z-10">
                            {inCart.quantity}
                          </span>
                        )}
                        <p className="text-white font-semibold text-sm leading-tight relative z-10">{p.name}</p>
                        {p.brand && <p className="text-zinc-500 text-xs mt-0.5 relative z-10">{p.brand}{p.size ? ` · ${p.size}` : ""}</p>}
                        <p className="text-amber-400 font-bold text-sm mt-2 relative z-10">{formatCurrency(p.price)}</p>
                        <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                           <Plus size={40} className="text-amber-500" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Cart panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                 <ShoppingCart size={18} />
              </div>
              <span className="font-bold text-white uppercase tracking-tight">Pedido Actual</span>
              <span className="ml-auto text-xs font-black text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">{cart.length}</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-20 text-center text-zinc-600 text-sm">
                <ShoppingCart size={40} className="mx-auto mb-4 opacity-10" />
                <p className="uppercase font-black tracking-widest text-[10px]">Seleccioná productos</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group/item">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 text-sm font-bold truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="flex items-center gap-1 group/price relative">
                              <input 
                                type="number"
                                value={item.customPrice}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-16 bg-transparent border-b border-transparent focus:border-amber-500/50 text-[10px] text-zinc-500 font-bold focus:outline-none transition-all"
                              />
                              <Edit2 size={8} className="text-zinc-700 opacity-0 group-hover/price:opacity-100" />
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/5">
                        <button onClick={() => decreaseCart(item.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-zinc-400 hover:text-white">
                          <Minus size={12} />
                        </button>
                        <span className="text-white text-xs font-black w-6 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-zinc-400 hover:text-white">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-amber-400 text-sm font-black w-20 text-right">{formatCurrency((item.customPrice ?? item.price) * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Pedido</span>
                    <span className="text-white text-2xl font-black italic">{formatCurrency(subtotal)}</span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-amber-900/30"
                  >
                    Cobrar Ahora
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODALS SECTION */}
      
      {/* 1. Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 rounded-[40px] w-full max-w-md p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
            <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Finalizar Venta</h2>
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Elegí el método de pago</p>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-2">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Monto a Cobrar</span>
              <span className="text-white text-5xl font-black italic">{formatCurrency(subtotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPaymentMethod(m.value)}
                  className={`py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${paymentMethod === m.value ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" : "bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === "A_COBRAR" && (
              <div className="flex flex-col gap-4 bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-orange-400">
                   <AlertCircle size={14} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Venta en Cuenta Corriente</p>
                </div>
                <select
                  value={buyerId}
                  onChange={e => {
                    setBuyerId(e.target.value)
                    const m = members.find(x => x.id === e.target.value)
                    if (m) setBuyerName(`${m.firstName} ${m.lastName}`)
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="" className="bg-zinc-900">Buscar Socio...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-zinc-900">
                      {m.lastName}, {m.firstName} (#{m.memberNumber})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="O escribir nombre manual..."
                  value={buyerName}
                  onChange={e => { setBuyerName(e.target.value); setBuyerId("") }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleCheckout}
                disabled={loading || (paymentMethod === "A_COBRAR" && !buyerName)}
                className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl disabled:opacity-30"
              >
                {loading ? "Registrando..." : "Confirmar Cobranza"}
              </button>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full py-3 text-zinc-600 hover:text-zinc-400 font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Cancelar Operación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Withdrawal Modal */}
      {showWithdrawal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-zinc-900 border border-white/10 rounded-[40px] w-full max-w-md p-10 flex flex-col gap-6">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Salida de Caja</h2>
              <div className="space-y-4">
                 <input 
                    type="number"
                    placeholder="Monto"
                    value={withdrawalAmount || ""}
                    onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xl font-black text-white"
                 />
                 <input 
                    type="text"
                    placeholder="Motivo (Ej: Compra de Hielo)"
                    value={withdrawalReason}
                    onChange={(e) => setWithdrawalReason(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white"
                 />
                 <button 
                   onClick={handleWithdrawal}
                   disabled={loading || !withdrawalAmount || !withdrawalReason}
                   className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-30"
                 >
                    Registrar Retiro
                 </button>
                 <button onClick={() => setShowWithdrawal(false)} className="w-full text-zinc-600 text-[10px] font-bold uppercase">Cerrar</button>
              </div>
           </div>
        </div>
      )}

      {/* 3. Closing Modal */}
      {showClosing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-zinc-900 border border-white/10 rounded-[40px] w-full max-w-lg p-10 flex flex-col gap-8">
              <div className="text-center">
                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Cierre de Buffet</h2>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Resumen de movimientos del evento</p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-zinc-500 text-xs font-bold uppercase">Caja Inicial</span>
                    <span className="text-white font-black">{formatCurrency(event.buffetCashRegister?.openingBalance || 0)}</span>
                 </div>
                 <div className="flex justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <span className="text-red-500/70 text-xs font-bold uppercase">Retiros / Gastos</span>
                    <span className="text-red-400 font-black">-{formatCurrency(event.buffetCashRegister?.withdrawals.reduce((a,b) => a + b.amount, 0) || 0)}</span>
                 </div>
                 <div className="flex justify-between p-6 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20">
                    <div className="flex flex-col">
                       <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Efectivo Final a Entregar</span>
                       <span className="text-[10px] text-emerald-500/50 uppercase font-bold">Caja Inicial + Ventas - Gastos</span>
                    </div>
                    <span className="text-white text-3xl font-black italic">{formatCurrency((event.buffetCashRegister?.openingBalance || 0) - (event.buffetCashRegister?.withdrawals.reduce((a,b) => a + b.amount, 0) || 0))}</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <textarea 
                    placeholder="Observaciones finales..."
                    value={closingObservations}
                    onChange={(e) => setClosingObservations(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white h-24"
                 />
                 <button 
                   onClick={handleCloseRegister}
                   disabled={loading}
                   className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                 >
                    Confirmar Cierre y Enviar a Cobranzas
                 </button>
                 <button onClick={() => setShowClosing(false)} className="w-full text-zinc-600 text-[10px] font-bold uppercase">Volver</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
