import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { NuevoSocioForm } from "./NuevoSocioForm"

export default function NuevoSocioPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/socios"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Nuevo Socio</h1>
          <p className="text-zinc-400 mt-1">Registre un nuevo miembro en el padrón institucional.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <NuevoSocioForm />
      </div>
    </div>
  )
}
