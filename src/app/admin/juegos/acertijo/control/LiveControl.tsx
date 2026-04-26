"use client"

import { useState, useEffect } from "react"
import { Brain, Play, FastForward, Clock, RotateCcw, Users, Trophy, ChevronRight, CheckCircle2, AlertCircle, Settings2, Share2, Eye } from "lucide-react"
import Link from "next/link"
import { startLiveSession, nextLiveQuestion, startLiveTimer, resetLiveGame, getLiveStatus, getQuestions, revealLiveQuestion, beginLiveGame, revealLiveResults } from "@/app/actions/juegos"
import { toast } from "sonner"

interface Question {
  id: string
  statement: string
  category: string
  difficulty: string
}

export function LiveControl() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [timerVal, setTimerVal] = useState(10)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  
  // Polling for admin metrics
  useEffect(() => {
    async function refresh() {
      const s = await getLiveStatus()
      setStatus(s)
      setLoading(false)
    }
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [])

  // Timer logic for admin
  useEffect(() => {
    if (!status?.timerEndAt) {
      setTimeLeft(null)
      return
    }

    const timer = setInterval(() => {
      const end = new Date(status.timerEndAt).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, Math.floor((end - now) / 1000))
      setTimeLeft(diff)
      if (diff === 0) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [status?.timerEndAt])

  useEffect(() => {
    async function loadQs() {
      const qs = await getQuestions({ isActive: true })
      setAllQuestions(qs)
    }
    loadQs()
  }, [])

  const handleStartSession = async () => {
    try {
      await startLiveSession(selectedIds.length > 0 ? selectedIds : undefined, timerVal)
      toast.success("Sesión configurada. Esperando jugadores.")
    } catch {
      toast.error("Error al configurar la sesión")
    }
  }

  const handleBeginGame = async () => {
    try {
      await beginLiveGame()
      toast.success("¡Juego iniciado!")
    } catch {
      toast.error("Error al iniciar el juego")
    }
  }

  const handleRevealResults = async () => {
    try {
      await revealLiveResults()
      toast.success("Resultados revelados!")
    } catch {
      toast.error("Error al revelar resultados")
    }
  }

  const handleNext = async () => {
    try {
      await nextLiveQuestion()
      toast.success("Siguiente pregunta enviada")
    } catch {
      toast.error("Error al pasar la pregunta")
    }
  }

  const handleReveal = async () => {
    try {
      await revealLiveQuestion()
      toast.success("Pregunta revelada a los jugadores")
    } catch {
      toast.error("Error al revelar")
    }
  }

  const handleStartTimer = async () => {
    try {
      await startLiveTimer()
      toast.success("¡Tiempo iniciado!")
    } catch {
      toast.error("Error al iniciar el tiempo")
    }
  }

  const handleReset = async () => {
    if (!confirm("¿Estás seguro de reiniciar el juego? Se perderá el progreso actual.")) return
    try {
      await resetLiveGame()
      toast.success("Juego reiniciado")
    } catch {
      toast.error("Error al reiniciar")
    }
  }

  const getGameUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/juegos/acertijo/vivo`
    }
    return ""
  }

  const handleCopyLink = () => {
    const url = getGameUrl()
    navigator.clipboard.writeText(url)
    toast.success("¡Link copiado al portapapeles!")
  }

  const handleShareWhatsapp = () => {
    const url = getGameUrl()
    const text = `¡Empezó el Acertijo 2.0 del Centro Amigos del Tango! 💃🎶\n\nEntrá acá para jugar con nosotros:\n${url}`
    const wbUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(wbUrl, '_blank')
  }

  if (loading) return <div className="p-8 text-center text-zinc-500">Cargando control...</div>

  // SETUP PHASE
  if (!status || status.status === "IDLE") {
    return (
      <div className="space-y-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="text-amber-500" />
            Acceso para Participantes
          </h2>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Link de la partida</p>
              <p className="text-sm font-mono text-amber-500/80 truncate">{getGameUrl()}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
              >
                Copiar
              </button>
              <button 
                onClick={handleShareWhatsapp}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={14} />
                WhatsApp
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Tiempo de respuesta (segundos)
              </label>
              <input 
                type="number" 
                value={timerVal}
                onChange={(e) => setTimerVal(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none"
              />
              
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-xs text-amber-200/60 leading-relaxed italic">
                  * En esta modalidad, todos los participantes ven la misma pregunta al mismo tiempo. El tiempo empieza cuando vos lo activás.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                  Seleccionar Preguntas ({selectedIds.length})
                </label>
                <button 
                  onClick={() => {
                    const random = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10).map(q => q.id)
                    setSelectedIds(random)
                  }}
                  className="text-xs text-amber-500 font-bold hover:underline"
                >
                  Seleccionar 10 al azar
                </button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {allQuestions.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (selectedIds.includes(q.id)) {
                        setSelectedIds(prev => prev.filter(id => id !== q.id))
                      } else {
                        setSelectedIds(prev => [...prev, q.id])
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedIds.includes(q.id) 
                        ? "bg-amber-500/20 border-amber-500/50 text-white" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {q.statement}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full mt-8 py-4 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 rounded-2xl font-black text-white shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Settings2 size={20} />
            CONFIGURAR PARTIDA EN VIVO
          </button>
        </div>
      </div>
    )
  }

  // WAITING FOR START PHASE (Admin sees players connecting)
  if (status.status === "WAITING_FOR_START") {
    return (
      <div className="space-y-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users size={40} className="text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Sala de Espera</h2>
          <p className="text-zinc-500 mb-8 font-medium">Los jugadores se están uniendo a la partida...</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Jugadores Conectados ({status.connectedCount})</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {status.connectedNames.map((name: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white animate-in zoom-in">
                  {name}
                </span>
              ))}
              {status.connectedCount === 0 && <p className="text-zinc-600 italic text-sm">Esperando al primer valiente...</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-zinc-400 font-bold rounded-2xl border border-white/10 transition-all"
            >
              Cancelar / Volver
            </button>
            <button
              onClick={handleBeginGame}
              disabled={status.connectedCount === 0}
              className="flex-[2] py-4 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Play fill="currentColor" />
              EMPEZAR JUEGO AHORA
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ACTIVE GAME PHASE
  return (
    <div className="space-y-6">
      {/* Quick Share Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Users size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none mb-1">Enlace de Invitación</p>
            <p className="text-[10px] text-emerald-500/60 font-medium uppercase tracking-wider">Compartí este link para que se unan</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button onClick={handleCopyLink} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all">
             Copiar Link
           </button>
           <button onClick={handleShareWhatsapp} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
             <Share2 size={14} />
             Enviar WhatsApp
           </button>
           <Link 
             href="/juegos/acertijo/tv" 
             target="_blank"
             className="flex-1 sm:flex-none px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
           >
             <Eye size={14} />
             Abrir Pantalla TV
           </Link>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
             {/* Background glow based on status */}
             <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none opacity-20 ${
               status.status === 'TIMER_ACTIVE' ? 'bg-red-500' : 'bg-emerald-500'
             }`} />

             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                     Pregunta {status.currentIndex + 1} de {status.totalQuestions}
                   </span>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     status.status === 'TIMER_ACTIVE' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                   }`}>
                     {status.status === 'QUESTION_HIDDEN' ? 'PREGUNTA OCULTA' : status.status === 'TIMER_ACTIVE' ? 'CRONÓMETRO ACTIVO' : 'ESPERANDO ACCIÓN'}
                   </span>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{status.connectedCount} en línea</span>
                       <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">JUGADORES CONECTADOS</span>
                    </div>
                    <button onClick={handleReset} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                        <RotateCcw size={18} />
                    </button>
                 </div>
               </div>

               {status.currentQuestion ? (
                 <div className={`space-y-6 transition-opacity duration-500 ${status.status === 'QUESTION_HIDDEN' ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                   <div className="flex justify-between items-start gap-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight flex-1">
                        {status.currentQuestion.statement}
                      </h2>
                      {timeLeft !== null && (
                         <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${timeLeft < 4 ? 'border-red-500 text-red-500 animate-pulse' : 'border-emerald-500 text-emerald-500'}`}>
                            <span className="text-2xl font-black">{timeLeft}</span>
                            <span className="text-[8px] font-bold uppercase">seg</span>
                         </div>
                      )}
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                     {(status?.currentQuestion?.options || []).map((opt: string, i: number) => {
                       const letter = ['A', 'B', 'C', 'D'][i]
                       const stats = status?.answerStats || {}
                       const count = stats[letter] || 0
                       const total = Object.values(stats as Record<string, number>).reduce((a, b) => a + b, 0)
                       const percent = total > 0 ? (count / total) * 100 : 0
                       
                       return (
                        <div key={i} className="relative p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                           {/* Progress Bar Background */}
                           <div 
                              className="absolute inset-y-0 left-0 bg-emerald-500/10 transition-all duration-1000" 
                              style={{ width: `${percent}%` }}
                           />
                           <div className="relative flex justify-between items-center gap-3">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-black">{letter}</span>
                                <span className="text-sm font-medium text-zinc-300">{opt}</span>
                              </div>
                              <span className="text-xs font-black text-emerald-500">{count}</span>
                           </div>
                        </div>
                       )
                     })}
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-12">
                    <Trophy size={48} className="text-amber-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white">¡Partida Finalizada!</h3>
                    <p className="text-zinc-500 mt-2">Ya podés anunciar los resultados finales.</p>
                 </div>
               )}

                <div className="flex flex-col sm:flex-row gap-4 mt-12">
                  {status.status === 'QUESTION_HIDDEN' && (
                     <button
                       onClick={handleReveal}
                       className="flex-1 py-4 bg-white text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-white/10 transition-all active:scale-95"
                     >
                       <Eye size={20} />
                       REVELAR PREGUNTA
                     </button>
                  )}

                  {status.status === 'WAITING_QUESTION' && (
                     <button
                       onClick={handleStartTimer}
                       className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 transition-all active:scale-95"
                     >
                       <Clock size={20} />
                       INICIAR {status.timerDuration} SEG.
                     </button>
                  )}

                  {status.status === 'GAME_OVER' && (
                     <button
                       onClick={handleRevealResults}
                       className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                     >
                       <Trophy size={20} />
                       MOSTRAR RESULTADOS / GANADOR
                     </button>
                  )}
                  
                  {(status.status === 'TIMER_ACTIVE' || status.status === 'GAME_OVER' || !status.currentQuestion) ? null : (
                     <button
                       disabled={status.status === 'TIMER_ACTIVE'}
                       onClick={handleNext}
                       className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl flex items-center justify-center gap-3 border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                     >
                       <span>Siguiente Pregunta</span>
                       <FastForward size={20} />
                     </button>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Participants & Ranking */}
        <div className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
             <h3 className="text-sm font-black text-white/50 mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Users size={14} className="text-emerald-500" />
               Conectados ({status?.connectedCount || 0})
             </h3>
             <div className="flex flex-wrap gap-2 mb-8">
                {(status?.connectedNames || []).map((name: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-zinc-400">
                    {name}
                  </span>
                ))}
                {(status?.connectedCount || 0) === 0 && <p className="text-xs text-zinc-600 italic">No hay nadie conectado...</p>}
             </div>

             <h3 className="text-sm font-black text-white/50 mb-6 flex items-center gap-2 uppercase tracking-widest">
               <Trophy size={14} className="text-amber-500" />
               Top 10 en Vivo
             </h3>
             <div className="space-y-3">
               {status.ranking && status.ranking.length > 0 ? (
                 status.ranking.map((player: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                     <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-zinc-600">#{i + 1}</span>
                       <span className="text-sm font-bold text-white">{player.name}</span>
                     </div>
                     <span className="text-sm font-black text-amber-500">{player.score}</span>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-zinc-600 text-center py-4">Esperando resultados...</p>
               )}
             </div>
          </div>

          <div className="bg-amber-600/10 border border-amber-600/20 rounded-3xl p-6">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2">Instrucciones Admin</h4>
            <ul className="text-[11px] text-zinc-400 space-y-2 leading-relaxed">
              <li className="flex gap-2"><div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> Leé la pregunta en voz alta antes de iniciar el tiempo para que todos esten listos.</li>
              <li className="flex gap-2"><div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> Una vez iniciado el tiempo, los participantes tienen {status.timerDuration}s para marcar su opción.</li>
              <li className="flex gap-2"><div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> Los participantes no ven si acertaron hasta el final.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
