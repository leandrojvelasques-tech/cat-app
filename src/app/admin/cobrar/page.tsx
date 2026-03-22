import CobrarWizard from "./CobrarWizard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CobrarPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors text-zinc-500 hover:text-white"
        >
           <ArrowLeft size={24} />
        </Link>
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Caja / Cobros Rápidos</h1>
           <p className="text-zinc-500 font-medium">Nueva transacción de caja Amigos del Tango.</p>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] p-6 md:p-12 min-h-[600px] backdrop-blur-3xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-red-800 to-amber-600 opacity-20"></div>
         <CobrarWizard />
      </div>
    </div>
  )
}
