"use client"

import { Brain, Clock, Trophy, CheckCircle2, Zap, ArrowRight } from "lucide-react"
import { getGameConfig } from "@/app/actions/juegos"

type GameConfig = Awaited<ReturnType<typeof getGameConfig>>

interface Props {
  gameConfig: GameConfig
  totalQuestions: number
  onStart: () => void
}

export function InstructionsScreen({ gameConfig, totalQuestions, onStart }: Props) {
  const rules = [
    {
      icon: Brain,
      title: "Preguntas de tango",
      description: `Vas a responder ${totalQuestions} preguntas sobre historia, orquestas, cantantes, códigos de milonga y más.`,
      color: "amber",
    },
    {
      icon: Clock,
      title: "Tiempo por pregunta",
      description: `Tenés entre ${gameConfig.timeEasy} y ${gameConfig.timeHard} segundos para responder cada pregunta según su dificultad. ¡No te duermas!`,
      color: "blue",
    },
    {
      icon: CheckCircle2,
      title: "Una sola oportunidad",
      description: "Seleccioná la opción que creas correcta. No se puede cambiar la respuesta.",
      color: "emerald",
    },
    {
      icon: Trophy,
      title: "Ranking en vivo",
      description: "Gana quien tenga más respuestas correctas. En caso de empate, el menor tiempo decide.",
      color: "yellow",
    },
  ]

  const colorMap: Record<string, { bg: string; border: string; icon: string; shadow: string }> = {
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-500", shadow: "shadow-amber-900/10" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400", shadow: "shadow-blue-900/10" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", shadow: "shadow-emerald-900/10" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-400", shadow: "shadow-yellow-900/10" },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      {/* Ambient */}
      <div className="absolute top-[15%] right-[20%] w-[400px] h-[400px] bg-amber-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/80">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm text-white/80">Acertijo 2.0</span>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
            <Zap size={12} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{totalQuestions} preguntas</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">¿Cómo se juega?</h2>
            <p className="text-zinc-500 text-sm">Leé las reglas y cuando estés listo, ¡dale para adelante!</p>
          </div>

          <div className="space-y-3">
            {rules.map((rule, i) => {
              const colors = colorMap[rule.color]
              const Icon = rule.icon
              return (
                <div
                  key={i}
                  className={`flex items-start gap-4 p-4 rounded-2xl border ${colors.bg} ${colors.border} ${colors.shadow} shadow-lg transition-all`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`p-2.5 rounded-xl ${colors.bg} shrink-0`}>
                    <Icon size={20} className={colors.icon} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white mb-1">{rule.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{rule.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {gameConfig.pointsIncorrect > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="text-xs text-red-400 font-medium">
                ⚠ Las respuestas incorrectas restan {gameConfig.pointsIncorrect} punto{gameConfig.pointsIncorrect > 1 ? "s" : ""}.
              </span>
            </div>
          )}

          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 rounded-2xl font-bold text-white text-base transition-all shadow-xl shadow-red-900/30 active:scale-[0.98] group"
          >
            <span>¡Estoy listo!</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  )
}
