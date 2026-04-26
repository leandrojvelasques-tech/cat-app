import { getGameMetrics, getGameConfig } from "@/app/actions/juegos"
import Link from "next/link"
import { Brain, Users, Target, Clock, Trophy, ListChecks, Settings, Gamepad2, ArrowRight, BarChart3, ChevronRight, Play } from "lucide-react"
import { ToggleGameButton } from "./ToggleGameButton"
import { GameSettingsForm } from "./GameSettingsForm"
import { CopyGameLink } from "./CopyGameLink"

export default async function AdminJuegosPage() {
  const [metrics, gameConfig] = await Promise.all([
    getGameMetrics(),
    getGameConfig(),
  ])

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-red-800 shadow-lg shadow-red-900/20">
              <Gamepad2 size={20} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Juegos</h1>
          </div>
          <p className="text-zinc-500 text-sm">Administrá los juegos del Centro Amigos del Tango</p>
        </div>
      </div>

      {/* Acertijo 2.0 Game Card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-xl shadow-red-900/30 shrink-0">
                <Brain size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Acertijo 2.0</h2>
                <p className="text-sm text-zinc-500">Trivia de tango para milongas y eventos</p>
              </div>
            </div>
              <div className="flex flex-col gap-2 justify-center items-end">
                <ToggleGameButton isActive={gameConfig.isActive} />
                <p className="text-[10px] text-zinc-500 font-medium text-right mt-1">
                  {gameConfig.isActive 
                    ? "✓ El juego está habilitado para jugar" 
                    : "🔒 El juego está deshabilitado"}
                </p>
              </div>
            </div>
          </div>

          {/* Modos de Juego */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-zinc-950/50">
            {/* Modo Individual */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Juego Individual</h3>
                    <p className="text-xs text-blue-400 font-medium">Auto-guiado</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Los jugadores pueden entrar en cualquier momento, jugar a su propio ritmo y ver su puntaje al final. <strong className="text-white">No requiere que el administrador inicie ni modere la partida.</strong>
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Link para compartir:</p>
                  <CopyGameLink mode="solo" />
                </div>
              </div>
            </div>

            {/* Modo Grupal (En Vivo) */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Juego Grupal</h3>
                      <p className="text-xs text-amber-500 font-medium">En Vivo (Moderado)</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Todos los jugadores responden al mismo tiempo. <strong className="text-white">Requiere que el administrador inicie y avance las preguntas</strong> desde el panel de control.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">1. Compartir este link con los jugadores:</p>
                    <CopyGameLink mode="live" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">2. Moderar la partida:</p>
                    <Link
                      href="/admin/juegos/acertijo/control"
                      className="flex items-center justify-center gap-2 w-full p-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
                    >
                      <Play size={16} fill="currentColor" />
                      IR AL PANEL DE CONTROL
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
          <div className="bg-zinc-950 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-amber-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Jugadores</span>
            </div>
            <p className="text-2xl font-black text-white">{metrics.totalPlayers}</p>
          </div>
          <div className="bg-zinc-950 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-emerald-400" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Partidas</span>
            </div>
            <p className="text-2xl font-black text-white">{metrics.totalSessions}</p>
          </div>
          <div className="bg-zinc-950 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={14} className="text-blue-400" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Prom. Correctas</span>
            </div>
            <p className="text-2xl font-black text-white">{Number(metrics.avgCorrect).toFixed(1)}</p>
          </div>
          <div className="bg-zinc-950 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-purple-400" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tiempo Prom.</span>
            </div>
            <p className="text-2xl font-black text-white">{formatTime(metrics.avgTime)}</p>
          </div>
        </div>

        {/* Question Stats */}
        <div className="p-6 border-t border-white/5">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1 font-bold uppercase tracking-wider">Preguntas totales</p>
              <p className="text-xl font-black text-white">{metrics.totalQuestions}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">{metrics.activeQuestions} activas</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1 font-bold uppercase tracking-wider">Score Promedio</p>
              <p className="text-xl font-black text-white">{Number(metrics.avgScore).toFixed(0)}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">puntos por partida</p>
            </div>
          </div>

          {/* Most/Least answered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.mostCorrectQuestion && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
                  ✅ Pregunta más acertada ({Math.round(metrics.mostCorrectQuestion.rate * 100)}%)
                </p>
                <p className="text-xs text-zinc-300 line-clamp-2">{metrics.mostCorrectQuestion.statement}</p>
              </div>
            )}
            {metrics.leastCorrectQuestion && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2">
                  ❌ Pregunta más fallada ({Math.round(metrics.leastCorrectQuestion.rate * 100)}%)
                </p>
                <p className="text-xs text-zinc-300 line-clamp-2">{metrics.leastCorrectQuestion.statement}</p>
              </div>
            )}
          </div>
        </div>

        <GameSettingsForm config={gameConfig} />

        {/* Quick Links */}
        <div className="border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5">
          <Link
            href="/admin/juegos/acertijo/preguntas"
            className="flex items-center gap-3 p-4 bg-zinc-950 hover:bg-white/[0.03] transition-colors group"
          >
            <ListChecks size={18} className="text-amber-500" />
            <span className="text-sm font-bold text-white">Gestionar preguntas</span>
            <ChevronRight size={14} className="text-zinc-600 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/admin/juegos/acertijo/ranking"
            className="flex items-center gap-3 p-4 bg-zinc-950 hover:bg-white/[0.03] transition-colors group"
          >
            <Trophy size={18} className="text-yellow-500" />
            <span className="text-sm font-bold text-white">Ver ranking</span>
            <ChevronRight size={14} className="text-zinc-600 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/admin/juegos/acertijo/partidas"
            className="flex items-center gap-3 p-4 bg-zinc-950 hover:bg-white/[0.03] transition-colors group"
          >
            <BarChart3 size={18} className="text-blue-400" />
            <span className="text-sm font-bold text-white">Historial partidas</span>
            <ChevronRight size={14} className="text-zinc-600 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
