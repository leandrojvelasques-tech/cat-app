"use client"

import { useState } from "react"
import { Brain, ArrowRight, User, Mail, Phone, Sparkles, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { registerPlayer, getRandomQuestions, createSession, getGameConfig } from "@/app/actions/juegos"
import { InstructionsScreen } from "./InstructionsScreen"
import { GameScreen } from "./GameScreen"
import { ResultScreen } from "./ResultScreen"
import { LiveGameScreen } from "./LiveGameScreen"


type GameConfig = Awaited<ReturnType<typeof getGameConfig>>

interface Props {
  gameConfig: GameConfig
  mode?: "solo" | "live"
}

type GamePhase = "welcome" | "instructions" | "playing" | "result" | "playing_live"


export function AcertijoWelcome({ gameConfig, mode = "solo" }: Props) {
  const [phase, setPhase] = useState<GamePhase>("welcome")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Game state
  const [sessionId, setSessionId] = useState("")
  const [questions, setQuestions] = useState<Array<{
    id: string
    statement: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    category: string
    difficulty: string
  }>>([])

  const handleStart = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ingresá tu nombre y apellido para continuar")
      return
    }
    setError("")
    setLoading(true)

    try {
      const player = await registerPlayer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      })

      const qs = await getRandomQuestions({
        easy: gameConfig.questionsEasy,
        medium: gameConfig.questionsMedium,
        hard: gameConfig.questionsHard
      })
      const session = await createSession(player.id, gameConfig.id)

      setQuestions(qs)
      setSessionId(session.id)
      
      if (mode === "live") {
        setPhase("playing_live")
      } else {
        setPhase("instructions")
      }

    } catch {
      setError("Hubo un error. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (phase === "instructions") {
    return (
      <InstructionsScreen
        gameConfig={gameConfig}
        totalQuestions={questions.length}
        onStart={() => setPhase("playing")}
      />
    )
  }

  if (phase === "playing") {
    return (
      <GameScreen
        questions={questions}
        sessionId={sessionId}
        gameConfig={gameConfig}
        onFinish={() => setPhase("result")}
      />
    )
  }

  if (phase === "playing_live") {
    return (
      <LiveGameScreen sessionId={sessionId} />
    )
  }


  if (phase === "result") {
    return <ResultScreen sessionId={sessionId} />
  }

  // Welcome + Registration
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      {/* Ambient */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] bg-red-900/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[60%] left-[50%] w-[250px] h-[250px] bg-amber-400/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/80">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/juegos" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronLeft size={20} className="text-zinc-400" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm text-white/80">Acertijo 2.0</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-2xl shadow-red-900/40 mb-6 animate-[pulse_3s_ease-in-out_infinite]">
              <Brain size={44} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">Acertijo</span>{" "}
              <span className="text-white">2.0</span>
            </h1>
            <p className="text-zinc-400 text-base font-light max-w-sm mx-auto leading-relaxed">
              ¿Cuánto sabés de tango? Respondé preguntas sobre historia, orquestas, cantantes y mucho más.
            </p>
          </div>

          {/* Registration Form */}
          <div className="space-y-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Identificación</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Nombre *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 pl-9 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Apellido *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">
                  Apodo <span className="text-zinc-700">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="¿Cómo te dicen?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">
                    Email <span className="text-zinc-700">(opc.)</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 pl-9 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">
                    Teléfono <span className="text-zinc-700">(opc.)</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Celular"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 pl-9 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 rounded-2xl font-bold text-white text-base transition-all shadow-xl shadow-red-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Comenzar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-zinc-700 text-xs">Centro Amigos del Tango · Comodoro Rivadavia</p>
      </footer>
    </div>
  )
}
