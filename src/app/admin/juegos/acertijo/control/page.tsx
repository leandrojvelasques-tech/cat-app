import { LiveControl } from "./LiveControl"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Control en Vivo - Acertijo 2.0 | Admin",
}

export default function LiveControlPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/juegos" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Control en Vivo</h1>
          <p className="text-zinc-500 text-sm">Gestioná la partida actual para todos los participantes</p>
        </div>
      </div>

      <LiveControl />
    </div>
  )
}
