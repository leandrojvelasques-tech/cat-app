"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Brain, Clock, Users, Trophy, Target, AlertCircle } from "lucide-react"
import { getLiveStatus, submitAnswer, finishSession } from "@/app/actions/juegos"
import { ResultScreen } from "./ResultScreen"

interface Props {
  sessionId: string
}

export function LiveGameScreen({ sessionId }: Props) {
  const [liveStatus, setLiveStatus] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false)
  const lastQuestionId = useRef<string | null>(null)

  // Polling for game status
  useEffect(() => {
    async function poll() {
      const status = await getLiveStatus()
      setLiveStatus(status)
      
      if (status?.status === "SHOWING_RESULTS") {
        setIsFinished(true)
      }

      // Reset local answered state if question changed
      if (status?.currentQuestion?.id !== lastQuestionId.current) {
        setHasAnsweredCurrent(false)
        setSelectedOption(null)
        lastQuestionId.current = status?.currentQuestion?.id || null
      }
    }
    
    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [])

  // Timer logic
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

  const handleOptionSelect = async (option: string) => {
    if (hasAnsweredCurrent || liveStatus?.status !== "TIMER_ACTIVE") return

    setSelectedOption(option)
    setHasAnsweredCurrent(true)

    try {
      // timeTaken is just to track speed, although admin doesn't see it yet
      const timeTaken = liveStatus.timerEndAt ? (new Date(liveStatus.timerEndAt).getTime() - 10000) - Date.now() : 0 
      
      await submitAnswer({
        sessionId,
        questionId: liveStatus.currentQuestion.id,
        selectedOption: option,
        timeTaken: Math.abs(timeTaken),
      })
    } catch (err) {
      console.error("Error submitting answer", err)
    }
  }

  if (isFinished) {
    return <ResultScreen sessionId={sessionId} />
  }

  if (!liveStatus) return <div className="p-8 text-center text-zinc-500">Conectando...</div>

  const isLocked = liveStatus.status !== "TIMER_ACTIVE" || hasAnsweredCurrent
  const question = liveStatus.currentQuestion

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/90">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block leading-none mb-1">PARTIDA EN VIVO</span>
              {question && (
                <span className="text-xs font-black text-white">Pregunta {liveStatus.currentIndex + 1} de {liveStatus.totalQuestions}</span>
              )}
            </div>
          </div>

          {liveStatus.status === "TIMER_ACTIVE" && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${timeLeft <= 3 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
               <Clock size={14} className={timeLeft <= 3 ? 'animate-pulse' : ''} />
               <span className="text-sm font-black tabular-nums">{timeLeft}s</span>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
        {!question ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Users size={32} className="text-zinc-600 animate-pulse" />
             </div>
             <div className="space-y-2">
               <h2 className="text-2xl font-bold text-white">Esperando que empiece el juego</h2>
               <p className="text-zinc-500 text-sm">El administrador iniciará la partida pronto.</p>
             </div>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Question Card */}
            <div className="space-y-4">
              <span className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-black text-amber-400 uppercase tracking-widest">
                {question.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {question.statement}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optionText = (question as any)[`option${letter}`]
                const isSelected = selectedOption === letter
                
                return (
                  <button
                    key={letter}
                    onClick={() => handleOptionSelect(letter)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                      isSelected 
                        ? "bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-900/20 active:scale-100" 
                        : isLocked
                        ? "bg-white/[0.02] border-white/5 opacity-60 grayscale cursor-not-allowed"
                        : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 ${
                      isSelected ? "bg-amber-500 text-zinc-950" : "bg-white/10 text-zinc-500"
                    }`}>
                      {letter}
                    </div>
                    <span className="text-sm font-medium text-white/90 pr-8">{optionText}</span>
                    
                    {isSelected && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                         <Target size={20} className="text-amber-500" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Status Message */}
            <div className="mt-8 text-center text-zinc-500 flex flex-col items-center gap-3">
              {liveStatus.status === "WAITING_QUESTION" && !hasAnsweredCurrent && (
                <>
                  <AlertCircle size={20} className="text-amber-500/50" />
                  <p className="text-sm font-medium">Prestá atención al moderador... <br/><span className="text-zinc-600 italic">Habilitará el tiempo en breve.</span></p>
                </>
              )}
              {hasAnsweredCurrent && (
                <div className="flex flex-col items-center gap-2 animate-in zoom-in">
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Trophy size={16} />
                  </div>
                  <p className="text-sm font-bold text-zinc-400">¡Respuesta enviada!</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Esperando siguiente pregunta</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer Branding */}
      <footer className="relative z-10 py-6 text-center">
         <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">CENTRO AMIGOS DEL TANGO</p>
      </footer>
    </div>
  )
}
