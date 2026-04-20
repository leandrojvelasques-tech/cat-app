"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Brain, Clock } from "lucide-react"
import { submitAnswer, finishSession } from "@/app/actions/juegos"

interface Question {
  id: string
  statement: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  category: string
  difficulty: string
}

interface Props {
  questions: Question[]
  sessionId: string
  timePerQuestion: number
  onFinish: () => void
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const
const OPTION_COLORS = {
  default: "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20",
  selected: "bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30",
  correct: "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30",
  incorrect: "bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30",
  dimmed: "bg-white/[0.02] border-white/5 opacity-50",
}

const LETTER_COLORS = {
  default: "bg-white/10 text-zinc-400",
  selected: "bg-amber-500 text-zinc-950",
  correct: "bg-emerald-500 text-white",
  incorrect: "bg-red-500 text-white",
  dimmed: "bg-white/5 text-zinc-600",
  correctReveal: "bg-emerald-500 text-white",
}

export function GameScreen({ questions, sessionId, timePerQuestion, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [timeLeft, setTimeLeft] = useState(timePerQuestion)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const questionStartTime = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex) / totalQuestions) * 100

  const handleTimeUp = useCallback(async () => {
    if (isSubmitting || feedback) return
    setIsSubmitting(true)

    try {
      const timeTaken = timePerQuestion * 1000
      const result = await submitAnswer({
        sessionId,
        questionId: question.id,
        selectedOption: "X", // No answer
        timeTaken,
      })
      setCorrectAnswer(null)
      setFeedback("incorrect")

      // Auto advance
      setTimeout(async () => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1)
          setSelectedOption(null)
          setFeedback(null)
          setCorrectAnswer(null)
          setTimeLeft(timePerQuestion)
          questionStartTime.current = Date.now()
          setIsSubmitting(false)
        } else {
          await finishSession(sessionId)
          onFinish()
        }
      }, 1200)
    } catch {
      setIsSubmitting(false)
    }
  }, [isSubmitting, feedback, sessionId, question?.id, currentIndex, totalQuestions, timePerQuestion, onFinish])

  // Timer
  useEffect(() => {
    if (feedback) return // Stop timer when showing feedback

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex, feedback, handleTimeUp])

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(timePerQuestion)
    questionStartTime.current = Date.now()
  }, [currentIndex, timePerQuestion])

  const handleOptionSelect = async (option: string) => {
    if (selectedOption || feedback || isSubmitting) return

    setSelectedOption(option)
    setIsSubmitting(true)

    // Stop timer
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const timeTaken = Date.now() - questionStartTime.current
      const result = await submitAnswer({
        sessionId,
        questionId: question.id,
        selectedOption: option,
        timeTaken,
      })

      setFeedback(result.isCorrect ? "correct" : "incorrect")
      if (!result.isCorrect) {
        // We need to find the correct answer — since it is hidden, we just show the feedback
        // The server returns isCorrect but not the correct option. We'll rely on visual feedback.
      }

      // Auto advance after feedback
      setTimeout(async () => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1)
          setSelectedOption(null)
          setFeedback(null)
          setCorrectAnswer(null)
          setIsSubmitting(false)
        } else {
          await finishSession(sessionId)
          onFinish()
        }
      }, 1500)
    } catch {
      setIsSubmitting(false)
    }
  }

  const getOptionStyle = (key: string) => {
    if (!feedback) {
      if (selectedOption === key) return OPTION_COLORS.selected
      return OPTION_COLORS.default
    }

    if (selectedOption === key) {
      return feedback === "correct" ? OPTION_COLORS.correct : OPTION_COLORS.incorrect
    }
    return OPTION_COLORS.dimmed
  }

  const getLetterStyle = (key: string) => {
    if (!feedback) {
      if (selectedOption === key) return LETTER_COLORS.selected
      return LETTER_COLORS.default
    }

    if (selectedOption === key) {
      return feedback === "correct" ? LETTER_COLORS.correct : LETTER_COLORS.incorrect
    }
    return LETTER_COLORS.dimmed
  }

  // Timer color
  const timerColor = timeLeft <= 5 ? "text-red-400" : timeLeft <= 10 ? "text-amber-400" : "text-white"
  const timerBg = timeLeft <= 5 ? "bg-red-500/10 border-red-500/20" : timeLeft <= 10 ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"
  const timerProgress = (timeLeft / timePerQuestion) * 100
  const timerStroke = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "#f59e0b"

  const categoryLabels: Record<string, string> = {
    historia: "Historia",
    orquestas: "Orquestas",
    cantantes: "Cantantes",
    compositores: "Compositores",
    letristas: "Letristas",
    instrumentos: "Instrumentos",
    codigos: "Códigos de milonga",
    danza: "Tango Danza",
    cultura: "Cultura tanguera",
    ciudades: "Ciudades y festivales",
    curiosidades: "Curiosidades",
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex flex-col">
      {/* Subtle ambient */}
      <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with progress */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/90">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center">
                <Brain size={14} className="text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400">Pregunta</span>
                <span className="text-xs font-black text-white ml-1.5">
                  {currentIndex + 1}/{totalQuestions}
                </span>
              </div>
            </div>

            {/* Circular Timer */}
            <div className="relative flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={timerStroke}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerProgress / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className={`absolute text-sm font-black ${timerColor}`}>{timeLeft}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="relative z-10 flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            {categoryLabels[question.category] || question.category}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
            question.difficulty === "EASY"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : question.difficulty === "HARD"
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
          }`}>
            {question.difficulty === "EASY" ? "Fácil" : question.difficulty === "HARD" ? "Difícil" : "Media"}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-6">
          {question.statement}
        </h2>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {OPTION_KEYS.map((key) => {
            const optionText = question[`option${key}` as keyof Question] as string
            return (
              <button
                key={key}
                onClick={() => handleOptionSelect(key)}
                disabled={!!feedback || isSubmitting}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 active:scale-[0.98] ${getOptionStyle(key)}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 ${getLetterStyle(key)}`}>
                  {key}
                </div>
                <span className="text-sm md:text-base font-medium text-white/90 leading-snug">{optionText}</span>
                {feedback && selectedOption === key && (
                  <div className="ml-auto shrink-0">
                    {feedback === "correct" ? (
                      <span className="text-emerald-400 text-lg">✓</span>
                    ) : (
                      <span className="text-red-400 text-lg">✗</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${
            feedback === "correct"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            {feedback === "correct" ? "¡Correcto! 🎉" : "Incorrecto 😔"}
          </div>
        )}
      </main>
    </div>
  )
}
