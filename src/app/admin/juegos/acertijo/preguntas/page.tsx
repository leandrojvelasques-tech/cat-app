import { getQuestions, getQuestionCategories } from "@/app/actions/juegos"
import Link from "next/link"
import { Plus, ArrowLeft, Search } from "lucide-react"
import { QuestionList } from "./QuestionList"
import { BulkImport } from "./BulkImport"


export default async function PreguntasPage(props: {
  searchParams: Promise<{ category?: string; difficulty?: string; active?: string; search?: string }>
}) {
  const searchParams = await props.searchParams
  const category = searchParams?.category
  const difficulty = searchParams?.difficulty
  const activeFilter = searchParams?.active
  const search = searchParams?.search

  const filters: {
    category?: string
    difficulty?: string
    isActive?: boolean
    search?: string
  } = {}
  if (category) filters.category = category
  if (difficulty) filters.difficulty = difficulty
  if (activeFilter === "true") filters.isActive = true
  if (activeFilter === "false") filters.isActive = false
  if (search) filters.search = search

  const [questions, categories] = await Promise.all([
    getQuestions(filters),
    getQuestionCategories(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/juegos" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Preguntas</h1>
            <p className="text-zinc-500 text-sm">{questions.length} preguntas cargadas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BulkImport />
          <Link
            href="/admin/juegos/acertijo/preguntas/nueva"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 rounded-xl font-bold text-sm text-white transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            <Plus size={16} />
            Nueva pregunta
          </Link>
        </div>

      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar preguntas..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 pl-9 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
          />
        </form>
        <select
          defaultValue={category || ""}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          defaultValue={difficulty || ""}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
        >
          <option value="">Toda dificultad</option>
          <option value="EASY">Fácil</option>
          <option value="MEDIUM">Media</option>
          <option value="HARD">Difícil</option>
        </select>
      </div>

      {/* Questions List */}
      <QuestionList questions={questions} />
    </div>
  )
}
