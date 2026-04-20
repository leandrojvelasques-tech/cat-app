"use client"

import { useState } from "react"
import { toggleQuestionActive, deleteQuestion } from "@/app/actions/juegos"
import Link from "next/link"
import { Pencil, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: string
  statement: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  category: string
  difficulty: string
  isActive: boolean
}

interface Props {
  questions: Question[]
}

const difficultyLabels: Record<string, { text: string; color: string }> = {
  EASY: { text: "Fácil", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  MEDIUM: { text: "Media", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  HARD: { text: "Difícil", color: "text-red-400 bg-red-500/10 border-red-500/20" },
}

export function QuestionList({ questions: initialQuestions }: Props) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleToggle = async (id: string, current: boolean) => {
    await toggleQuestionActive(id, !current)
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isActive: !current } : q))
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return
    setDeletingId(id)
    await deleteQuestion(id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    setDeletingId(null)
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
        <p className="text-zinc-500 font-medium">No hay preguntas cargadas</p>
        <p className="text-zinc-600 text-sm mt-1">Creá tu primera pregunta para empezar</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {questions.map((q) => {
        const diff = difficultyLabels[q.difficulty] || difficultyLabels.MEDIUM
        const isExpanded = expandedId === q.id

        return (
          <div
            key={q.id}
            className={`bg-white/[0.02] border rounded-2xl transition-all ${
              q.isActive ? "border-white/10" : "border-white/5 opacity-60"
            }`}
          >
            {/* Main row */}
            <div className="flex items-start gap-3 p-4">
              <button
                onClick={() => handleToggle(q.id, q.isActive)}
                className="mt-0.5 shrink-0"
                title={q.isActive ? "Desactivar" : "Activar"}
              >
                {q.isActive ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : (
                  <XCircle size={18} className="text-zinc-600" />
                )}
              </button>

              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                  {q.statement}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-400 uppercase">
                    {q.category}
                  </span>
                  <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${diff.color}`}>
                    {diff.text}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/admin/juegos/acertijo/preguntas/${q.id}`}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-white/5 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                  {(["A", "B", "C", "D"] as const).map((key) => {
                    const isCorrect = q.correctOption === key
                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                            : "bg-white/[0.02] border-white/5 text-zinc-400"
                        }`}
                      >
                        <span className={`font-black text-xs shrink-0 w-5 h-5 flex items-center justify-center rounded ${
                          isCorrect ? "bg-emerald-500 text-white" : "bg-white/10 text-zinc-500"
                        }`}>
                          {key}
                        </span>
                        <span className="leading-snug">{q[`option${key}` as keyof Question]}</span>
                        {isCorrect && <CheckCircle size={14} className="text-emerald-400 shrink-0 ml-auto mt-0.5" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
