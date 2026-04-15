import { db } from "@/lib/db"
import Link from "next/link"
import { ShoppingBag, Plus, Wine, Beer, Utensils } from "lucide-react"
import { BuffetProductActions } from "./BuffetProductActions"

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  BEBIDAS_CON_ALCOHOL: { label: "Bebidas con Alcohol", icon: <Wine size={14} />, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  BEBIDAS_SIN_ALCOHOL: { label: "Bebidas sin Alcohol", icon: <Beer size={14} />, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  COMIDA: { label: "Comida", icon: <Utensils size={14} />, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v)

export default async function BuffetPage() {
  const products = await db.buffetProduct.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] })

  const grouped = products.reduce((acc: Record<string, typeof products>, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90 flex items-center gap-3">
            <ShoppingBag className="text-amber-400" />
            Catálogo de Buffet
          </h1>
          <p className="text-zinc-500 mt-1">{products.length} productos registrados</p>
        </div>
        <Link
          href="/admin/buffet/nuevo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20"
        >
          <Plus size={18} /> Nuevo Producto
        </Link>
      </div>

      {/* Products by category */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
          <p>No hay productos cargados. Agregá el primero.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => {
          const meta = TYPE_LABELS[type] ?? { label: type, icon: null, color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" }
          return (
            <div key={type}>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest mb-4 ${meta.color}`}>
                {meta.icon} {meta.label}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="py-4 pl-6 text-xs font-bold uppercase tracking-widest text-zinc-500">Producto</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Marca</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Tamaño</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Precio</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Estado</th>
                      <th className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-widest text-zinc-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(items as typeof products).map((p) => (
                      <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 pl-6 font-semibold text-zinc-100">{p.name}</td>
                        <td className="py-4 text-zinc-400 text-sm">{p.brand || "—"}</td>
                        <td className="py-4 text-zinc-400 text-sm">{p.size || "—"}</td>
                        <td className="py-4 text-emerald-400 font-bold">{formatCurrency(p.price)}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${p.active ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"}`}>
                            {p.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <BuffetProductActions product={p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
