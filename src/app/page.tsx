import Link from "next/link"
import { LogIn } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-red-900/20 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl px-6">
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-600 to-red-800 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-red-900/30">
          <span className="text-3xl font-bold text-white">C</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight mb-6">
          Centro Amigos<br/><span className="font-semibold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">del Tango</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 font-light mb-12 max-w-lg">
          Sistema integral de gestión institucional. Acceda al portal para administrar el padrón o consulte su estado como socio.
        </p>
        
        <Link 
          href="/login" 
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium transition-all backdrop-blur-md overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-red-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">Ingresar al Sistema</span>
          <LogIn className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="absolute bottom-8 text-zinc-600 text-sm font-light">
        © {new Date().getFullYear()} Centro Amigos del Tango. Comodoro Rivadavia.
      </div>
    </div>
  )
}
