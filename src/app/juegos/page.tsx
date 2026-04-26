import Link from "next/link"
import { Gamepad2, Brain, ArrowRight, Sparkles } from "lucide-react"
import { getGameConfig } from "@/app/actions/juegos"

export const metadata = {
  title: "Juegos | Centro Amigos del Tango",
  description: "Juegos interactivos del Centro Amigos del Tango. Divertite aprendiendo sobre tango en nuestras milongas y eventos.",
}

export default async function JuegosPage() {
  const game = await getGameConfig()

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[5%] left-[15%] w-[600px] h-[600px] bg-amber-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-red-900/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:shadow-red-900/50 transition-shadow">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white/90 leading-tight">Centro Amigos</span>
              <span className="text-[10px] text-amber-500 uppercase font-black tracking-[0.15em] leading-none">del Tango</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Gamepad2 size={16} className="text-amber-500" />
            <span className="text-sm font-bold text-white/80">Juegos</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 mb-6">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Entretenimiento tanguero</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-light text-white tracking-tight mb-4">
            <span className="font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-red-600 bg-clip-text text-transparent">Juegos</span>
            <br />
            <span className="text-2xl md:text-3xl text-zinc-400 font-light">del Centro Amigos del Tango</span>
          </h1>
          <p className="text-zinc-500 max-w-lg mx-auto text-base md:text-lg font-light">
            Poné a prueba tus conocimientos de tango mientras disfrutás de nuestras milongas y eventos.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid gap-6 max-w-2xl mx-auto">
          {/* Acertijo 2.0 Card */}
          <Link
            href={game.isActive ? "/juegos/acertijo" : "#"}
            className={`group relative block rounded-3xl border overflow-hidden transition-all duration-500 ${
              game.isActive
                ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-900/20 cursor-pointer"
                : "border-white/5 opacity-60 cursor-not-allowed"
            }`}
          >
            {/* Card background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-6 md:p-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-xl shadow-red-900/30 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Brain size={32} className="text-white md:w-10 md:h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Acertijo 2.0</h2>
                    {game.isActive ? (
                      <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                        Disponible
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-zinc-500/15 border border-zinc-500/30 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed mb-4">
                    ¿Cuánto sabés de tango? Respondé preguntas sobre historia, orquestas, cantantes, códigos de milonga y mucho más. Competí con otros asistentes y demostrá quién es el verdadero tanguero.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["Historia", "Orquestas", "Cantantes", "Milonga", "Cultura"].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {game.isActive && (
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm group-hover:gap-3 transition-all">
                      <span>Jugar ahora</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Placeholder for future games */}
          <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
            <Gamepad2 size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm font-medium">Más juegos próximamente...</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-white/5 py-6 text-center">
        <p className="text-zinc-600 text-xs">
          © {new Date().getFullYear()} Centro Amigos del Tango · Comodoro Rivadavia
        </p>
      </footer>
    </div>
  )
}
