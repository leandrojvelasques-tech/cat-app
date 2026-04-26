"use client"

import { useState, useEffect } from "react"
import { Trophy, Clock, CheckCircle2, XCircle, Star, RotateCcw, Medal, ArrowRight } from "lucide-react"
import { getSessionResult, getPlayerRank } from "@/app/actions/juegos"
import Link from "next/link"

interface Props {
  sessionId: string
  mode?: "individual" | "live"
}

export function ResultScreen({ sessionId, mode = "individual" }: Props) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getSessionResult>> | null>(null)
  const [rank, setRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    async function load() {
      const [res, playerRank] = await Promise.all([
        getSessionResult(sessionId),
        getPlayerRank(sessionId),
      ])
      setResult(res)
      setRank(playerRank)
      setLoading(false)
    }
    load()
  }, [sessionId])

  // Animate score counter
  useEffect(() => {
    if (!result) return
    const target = result.score
    const duration = 1500
    const start = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [result])

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Calculando resultados...</p>
        </div>
      </div>
    )
  }

  const totalQuestions = result.totalCorrect + result.totalIncorrect
  const accuracy = totalQuestions > 0 ? (result.totalCorrect / totalQuestions) * 100 : 0
  const timeInSeconds = Math.floor(result.totalTime / 1000)
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60

  // Motivational message
  const getMessage = () => {
    if (accuracy >= 90) return { text: "¡Sos un maestro del tango! 🎭", sub: "Increíble conocimiento tanguero" }
    if (accuracy >= 70) return { text: "¡Muy bien, tanguero! 💃", sub: "Sabés bastante de tango" }
    if (accuracy >= 50) return { text: "¡Buen intento! 🎵", sub: "Seguí aprendiendo de tango" }
    return { text: "¡No te rindas! 🎶", sub: "El tango se aprende bailando y preguntando" }
  }

  const message = getMessage()

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      {/* Ambient */}
      <div className="absolute top-[5%] left-[30%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-red-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Confetti-like decoration */}
      {accuracy >= 70 && (
        <>
          <div className="absolute top-[10%] left-[10%] w-3 h-3 bg-amber-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }} />
          <div className="absolute top-[15%] right-[15%] w-2 h-2 bg-red-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.5s" }} />
          <div className="absolute top-[8%] left-[60%] w-2.5 h-2.5 bg-amber-300 rounded-full opacity-15 animate-bounce" style={{ animationDelay: "0.7s", animationDuration: "3s" }} />
          <div className="absolute top-[20%] right-[30%] w-2 h-2 bg-yellow-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "1s", animationDuration: "2.2s" }} />
        </>
      )}

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Trophy / Medal */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-2xl shadow-amber-900/40">
              {accuracy >= 70 ? (
                <Trophy size={44} className="text-white" />
              ) : (
                <Star size={44} className="text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{message.text}</h2>
              <p className="text-zinc-500 text-sm">{message.sub}</p>
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className="text-7xl font-black bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent tabular-nums">
              {animatedScore}
            </div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mt-1">Puntos</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
              <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{result.totalCorrect}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Correctas</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
              <XCircle size={20} className="text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{result.totalIncorrect}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Incorrectas</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
              <Clock size={20} className="text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}s`}
              </p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tiempo</p>
            </div>
          </div>

          {/* Accuracy bar */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400">Precisión</span>
              <span className="text-sm font-black text-white">{Math.round(accuracy)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-500 to-red-600"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          {/* Rank */}
          {rank && (
            <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <Medal size={24} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">
                  Posición #{rank} en el ranking
                </p>
                <p className="text-xs text-zinc-500">
                  {rank <= 3 ? "¡Estás en el podio! 🏆" : "¡Seguí intentando para subir!"}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/juegos/acertijo/ranking"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 rounded-2xl font-bold text-white text-base transition-all shadow-xl shadow-red-900/30 active:scale-[0.98] group"
            >
              <Trophy size={18} />
              <span>Ver Ranking</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={mode === "live" ? "/juegos/acertijo/vivo" : "/juegos/acertijo"}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98]"
            >
              <RotateCcw size={16} />
              <span>{mode === "live" ? "Esperar próxima partida" : "Jugar de nuevo"}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
