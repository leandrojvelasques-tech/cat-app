import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { updateBuffetProduct } from "@/app/actions/buffet"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const TYPES = [
  { value: "BEBIDAS_CON_ALCOHOL", label: "Bebidas con Alcohol" },
  { value: "BEBIDAS_SIN_ALCOHOL", label: "Bebidas sin Alcohol" },
  { value: "COMIDA", label: "Comida" },
]

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.buffetProduct.findUnique({ where: { id } })
  if (!product) notFound()

  const action = updateBuffetProduct.bind(null, id)

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/buffet" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
          <ArrowLeft size={18} className="text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white/90">Editar Producto</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{product.name}</p>
        </div>
      </div>

      <form action={action} className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col gap-6 backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tipo de Producto *</label>
          <select name="type" required defaultValue={product.type} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all">
            {TYPES.map(t => <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nombre del Producto *</label>
          <input name="name" required defaultValue={product.name} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Marca</label>
            <input name="brand" defaultValue={product.brand ?? ""} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tamaño</label>
            <input name="size" defaultValue={product.size ?? ""} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Precio *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
            <input name="price" type="number" min="0" step="100" required defaultValue={product.price} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input name="active" id="active" type="checkbox" defaultChecked={product.active} className="w-5 h-5 rounded-lg accent-amber-500" />
          <label htmlFor="active" className="text-sm text-zinc-300">Producto activo (disponible para venta)</label>
        </div>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-amber-500/20 mt-2">
          Guardar Cambios
        </button>
      </form>
    </div>
  )
}
