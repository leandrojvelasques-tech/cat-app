"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createQuestion, updateQuestion } from "@/app/actions/juegos"
import { ArrowLeft, Save, CheckCircle } from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  { value: "milonga", label: "Milonga" },
  { value: "vientos", label: "Vientos de Tango" },
  { value: "tangos", label: "Tangos" },
  { value: "historia", label: "Historia del tango" },
  { value: "orquestas", label: "Orquestas típicas" },
  { value: "cantantes", label: "Cantantes" },
  { value: "compositores", label: "Compositores" },
  { value: "letristas", label: "Letristas" },
  { value: "instrumentos", label: "Instrumentos" },
  { value: "codigos", label: "Códigos de milonga" },
  { value: "danza", label: "Tango danza" },
  { value: "cultura", label: "Cultura tanguera" },
  { value: "curiosidades", label: "Curiosidades" },
  { value: "ciudades", label: "Ciudades y festivales" },
]

interface QuestionData {
  id?: string
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
  question?: QuestionData
  isEditing?: boolean
}

export function QuestionForm({ question, isEditing }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [statement, setStatement] = useState(question?.statement || "")
  const [optionA, setOptionA] = useState(question?.optionA || "")
  const [optionB, setOptionB] = useState(question?.optionB || "")
  const [optionC, setOptionC] = useState(question?.optionC || "")
  const [optionD, setOptionD] = useState(question?.optionD || "")
  const [correctOption, setCorrectOption] = useState(question?.correctOption || "A")
  const [category, setCategory] = useState(question?.category || "historia")
  const [difficulty, setDifficulty] = useState(question?.difficulty || "MEDIUM")
  const [isActive, setIsActive] = useState(question?.isActive ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        statement,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        category,
        difficulty,
        isActive,
      }

      if (isEditing && question?.id) {
        await updateQuestion(question.id, data)
      } else {
        await createQuestion(data)
      }

      setSaved(true)
      setTimeout(() => {
        router.push("/admin/juegos/acertijo/preguntas")
      }, 800)
    } catch {
      alert("Error al guardar la pregunta")
    } finally {
      setLoading(false)
    }
  }

  const optionFields = [
    { key: "A", value: optionA, setter: setOptionA },
    { key: "B", value: optionB, setter: setOptionB },
    { key: "C", value: optionC, setter: setOptionC },
    { key: "D", value: optionD, setter: setOptionD },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/juegos/acertijo/preguntas" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-white">
          {isEditing ? "Editar pregunta" : "Nueva pregunta"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Statement */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2 font-bold">Enunciado de la pregunta *</label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            required
            rows={3}
            placeholder="Ej: ¿En qué año se compuso el primer tango registrado?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-sm text-zinc-400 font-bold">Opciones de respuesta *</label>
          {optionFields.map(({ key, value, setter }) => (
            <div key={key} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCorrectOption(key)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all border ${
                  correctOption === key
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/30"
                    : "bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10"
                }`}
                title={correctOption === key ? "Respuesta correcta" : "Marcar como correcta"}
              >
                {correctOption === key ? <CheckCircle size={16} /> : key}
              </button>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                placeholder={`Opción ${key}`}
                className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                  correctOption === key
                    ? "border-emerald-500/30 focus:border-emerald-500/50"
                    : "border-white/10 focus:border-amber-500/50"
                }`}
              />
            </div>
          ))}
          <p className="text-xs text-zinc-600">
            Hacé clic en la letra para marcar la respuesta correcta. Actualmente: <span className="text-emerald-400 font-bold">{correctOption}</span>
          </p>
        </div>

        {/* Category + Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2 font-bold">Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-zinc-900 text-white">{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2 font-bold">Dificultad *</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
            >
              <option value="EASY" className="bg-zinc-900 text-white">Baja</option>
              <option value="MEDIUM" className="bg-zinc-900 text-white">Media</option>
              <option value="HARD" className="bg-zinc-900 text-white">Difícil</option>
            </select>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl">
          <div>
            <p className="text-sm font-bold text-white">Estado</p>
            <p className="text-xs text-zinc-500">Las preguntas inactivas no aparecen en el juego</p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isActive ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                isActive ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || saved}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 text-white shadow-lg shadow-red-900/20"
            } disabled:opacity-50`}
          >
            {saved ? (
              <>
                <CheckCircle size={16} />
                <span>¡Guardada!</span>
              </>
            ) : loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditing ? "Guardar cambios" : "Crear pregunta"}</span>
              </>
            )}
          </button>
          <Link
            href="/admin/juegos/acertijo/preguntas"
            className="px-6 py-3 text-zinc-500 hover:text-white text-sm font-bold transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
