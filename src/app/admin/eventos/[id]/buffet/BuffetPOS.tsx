"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Wine, Beer, Utensils, X, CheckCircle } from "lucide-react"
import Link from "next/link"
import { registerBuffetSale } from "@/app/actions/buffet"

interface Product { id: string; name: string; brand: string | null; size: string | null; price: number; type: string }
interface Member { id: string; firstName: string; lastName: string; memberNumber: string }
interface Event { id: string; title: string }

interface CartItem extends Product { quantity: number }

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
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [buyerName, setBuyerName] = useState("")
  const [buyerId, setBuyerId] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const grouped = products.reduce((acc: Record<string, Product[]>, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
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
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    await registerBuffetSale({
      eventId: event.id,
      items: cart.map(i => ({ productId: i.id, quantity: i.quantity, priceAtSale: i.price })),
      amountTotal: total,
      amountPaid: paymentMethod === "A_COBRAR" ? 0 : total,
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[28px] border border-white/10 backdrop-blur-md">
        <Link href={`/admin/eventos/${event.id}`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
          <ArrowLeft size={18} className="text-zinc-400" />
        </Link>
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Buffet / Punto de Venta</p>
          <h1 className="text-xl font-semibold text-white/90">{event.title}</h1>
        </div>
        <span className="text-xs text-zinc-500">{products.length} productos disponibles</span>
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
                        className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:shadow-amber-500/5 active:scale-95"
                      >
                        {inCart && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                            {inCart.quantity}
                          </span>
                        )}
                        <p className="text-white font-semibold text-sm leading-tight">{p.name}</p>
                        {p.brand && <p className="text-zinc-500 text-xs mt-0.5">{p.brand}{p.size ? ` · ${p.size}` : ""}</p>}
                        <p className="text-amber-400 font-bold text-sm mt-2">{formatCurrency(p.price)}</p>
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
          <div className="sticky top-6 bg-white/5 border border-white/10 rounded-[28px] backdrop-blur-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
              <ShoppingCart size={18} className="text-amber-400" />
              <span className="font-bold text-white">Pedido Actual</span>
              <span className="ml-auto text-xs text-zinc-500">{cart.length} productos</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-sm">
                <ShoppingCart size={32} className="mx-auto mb-3 opacity-30" />
                Seleccioná productos
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 text-sm font-medium truncate">{item.name}</p>
                        <p className="text-zinc-500 text-xs">{formatCurrency(item.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => decreaseCart(item.id)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                          <Minus size={11} className="text-zinc-400" />
                        </button>
                        <span className="text-white text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                          <Plus size={11} className="text-zinc-400" />
                        </button>
                      </div>
                      <span className="text-amber-400 text-sm font-bold w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Total</span>
                    <span className="text-white text-xl font-black">{formatCurrency(total)}</span>
                  </div>
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    Cobrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[32px] w-full max-w-md p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Confirmar Cobro</h2>
              <button onClick={() => setShowCheckout(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-zinc-400">Total a cobrar</span>
              <span className="text-amber-400 text-2xl font-black">{formatCurrency(total)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Método de Pago</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${paymentMethod === m.value ? "bg-amber-500 text-black border-amber-500" : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "A_COBRAR" && (
              <div className="flex flex-col gap-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">Datos del Deudor</p>
                <select
                  value={buyerId}
                  onChange={e => {
                    setBuyerId(e.target.value)
                    const m = members.find(x => x.id === e.target.value)
                    if (m) setBuyerName(`${m.firstName} ${m.lastName}`)
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="" className="bg-zinc-900">Seleccionar Socio (opcional)</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-zinc-900">
                      {m.lastName}, {m.firstName} (#{m.memberNumber})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="O ingresá un nombre manualmente"
                  value={buyerName}
                  onChange={e => { setBuyerName(e.target.value); setBuyerId("") }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || (paymentMethod === "A_COBRAR" && !buyerName)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-95"
              >
                {loading ? "Procesando..." : "Confirmar Venta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
