"use client"

import { useState, useEffect, useRef } from "react"
import { Brain, Clock, Users, Trophy } from "lucide-react"
import { getLiveStatus } from "@/app/actions/juegos"

export default function AcertijoTVPage() {
  const [liveStatus, setLiveStatus] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  
  useEffect(() => {
    async function poll() {
      const status = await getLiveStatus()
      setLiveStatus(status)
    }
    
    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (liveStatus?.status === "TIMER_ACTIVE" && liveStatus.timerEndAt) {
      const endAt = new Date(liveStatus.timerEndAt).getTime()
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000))
        setTimeLeft(remaining)
        if (remaining === 0) clearInterval(timer)
      }, 500)
      return () => clearInterval(timer)
    } else {
      setTimeLeft(0)
    }
  }, [liveStatus?.status, liveStatus?.timerEndAt])

  if (!liveStatus) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-bold">Cargando visualización...</div>

  const { status, currentQuestion, currentIndex, totalQuestions, connectedNames, ranking } = liveStatus

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col p-8 md:p-12">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-2xl shadow-red-900/40">
            <Brain size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">ACERTIJO <span className="text-amber-500">2.0</span></h1>
            <p className="text-zinc-500 font-bold tracking-[0.3em] text-sm uppercase">Centro Amigos del Tango</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Participantes</p>
            <p className="text-3xl font-black text-white">{liveStatus.connectedCount}</p>
          </div>
          {status !== "IDLE" && status !== "WAITING_FOR_START" && status !== "SHOWING_RESULTS" && (
            <div className="text-right">
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Progreso</p>
              <p className="text-3xl font-black text-white">{currentIndex + 1} / {totalQuestions}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex gap-12">
        {/* Left Side: Question or Status */}
        <div className="flex-[3] flex flex-col justify-center">
          {status === "IDLE" || status === "WAITING_FOR_START" ? (
            <div className="space-y-8 animate-in fade-in zoom-in duration-700">
              <h2 className="text-6xl md:text-7xl font-black text-white leading-tight">
                Esperando el inicio de la partida...
              </h2>
              <p className="text-2xl text-zinc-500 max-w-2xl leading-relaxed">
                Escaneá el código QR en pantalla o ingresá a la app para participar. ¡La trivia está por comenzar!
              </p>
              <div className="flex flex-wrap gap-4 mt-12">
                {connectedNames.map((name: string, i: number) => (
                  <div key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold text-white animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
          ) : status === "SHOWING_RESULTS" ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="text-center">
                <Trophy size={120} className="text-amber-500 mx-auto mb-6" />
                <h2 className="text-7xl font-black text-white mb-4">¡Podio Final!</h2>
                <p className="text-2xl text-zinc-500 uppercase tracking-widest font-bold">Felicitaciones a los ganadores</p>
              </div>
              
              <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto items-end pt-12">
                {/* 2nd Place */}
                {ranking[1] && (
                  <div className="space-y-4 text-center order-1">
                    <div className="text-3xl font-black text-zinc-400">2°</div>
                    <div className="bg-zinc-800/50 border-t-4 border-zinc-400 rounded-t-3xl p-8 h-48 flex flex-col justify-center">
                      <p className="text-2xl font-black text-white truncate mb-2">{ranking[1].name}</p>
                      <p className="text-3xl font-black text-zinc-400">{ranking[1].score} pts</p>
                    </div>
                  </div>
                )}
                
                {/* 1st Place */}
                {ranking[0] && (
                  <div className="space-y-4 text-center order-2">
                    <div className="text-5xl font-black text-amber-500 mb-2">1°</div>
                    <div className="bg-amber-500/10 border-t-4 border-amber-500 rounded-t-3xl p-8 h-64 flex flex-col justify-center shadow-2xl shadow-amber-500/10">
                      <p className="text-4xl font-black text-white truncate mb-2">{ranking[0].name}</p>
                      <p className="text-5xl font-black text-amber-500">{ranking[0].score} pts</p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {ranking[2] && (
                  <div className="space-y-4 text-center order-3">
                    <div className="text-3xl font-black text-amber-700">3°</div>
                    <div className="bg-amber-900/10 border-t-4 border-amber-700 rounded-t-3xl p-8 h-40 flex flex-col justify-center">
                      <p className="text-2xl font-black text-white truncate mb-2">{ranking[2].name}</p>
                      <p className="text-2xl font-black text-amber-700">{ranking[2].score} pts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Question */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-lg font-black text-amber-400 uppercase tracking-[0.2em]">
                    {currentQuestion?.category || "TANGO"}
                  </span>
                  {status === "TIMER_ACTIVE" && (
                    <div className={`flex items-center gap-3 px-6 py-1.5 rounded-xl border transition-all ${timeLeft <= 3 ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-white'}`}>
                      <Clock size={24} className={timeLeft <= 3 ? 'animate-pulse' : ''} />
                      <span className="text-3xl font-black tabular-nums">{timeLeft}s</span>
                    </div>
                  )}
                </div>
                
                <h2 className="text-6xl font-bold text-white leading-tight">
                  {status === "QUESTION_HIDDEN" ? "¿Listos para la siguiente?" : currentQuestion?.statement}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-6">
                {['A', 'B', 'C', 'D'].map((letter, i) => {
                  const optionText = currentQuestion?.[`option${letter}`]
                  return (
                    <div 
                      key={letter}
                      className={`p-8 rounded-3xl border-2 flex items-center gap-8 transition-all duration-500 ${
                        status === "QUESTION_HIDDEN" 
                          ? "bg-white/[0.02] border-white/5 opacity-20 scale-95" 
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black text-zinc-400">
                        {letter}
                      </div>
                      <span className="text-3xl font-bold text-white/90">{optionText || "???"}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Sidebar with Participants or mini-ranking */}
        <div className="flex-1 space-y-8 max-w-sm">
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 h-full flex flex-col">
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Users size={18} className="text-amber-500" />
              Ranking en vivo
            </h3>
            
            <div className="space-y-4 flex-1">
              {ranking.slice(0, 8).map((player: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-right-4" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-zinc-600 w-4">{i + 1}</span>
                    <span className="text-lg font-bold text-white truncate max-w-[150px]">{player.name}</span>
                  </div>
                  <span className="text-xl font-black text-amber-500">{player.score}</span>
                </div>
              ))}
              {ranking.length === 0 && (
                <div className="text-center py-12 space-y-4">
                   <div className="w-12 h-12 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                      <Trophy size={20} className="text-zinc-700" />
                   </div>
                   <p className="text-zinc-600 text-sm italic">Esperando puntos...</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">centroamigosdeltango.com.ar</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
