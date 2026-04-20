import { getSessionHistory } from "@/app/actions/juegos"
import Link from "next/link"
import { ArrowLeft, Clock, Target, User } from "lucide-react"

export default async function PartidasPage() {
  const sessions = await getSessionHistory(100)

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return min > 0 ? `${min}:${sec.toString().padStart(2, "0")}` : `${sec}s`
  }

  const formatDate = (d: Date | null) => {
    if (!d) return "-"
    return new Date(d).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/juegos" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Historial de Partidas</h1>
          <p className="text-zinc-500 text-sm">{sessions.length} partidas completadas</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
          <Target size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No hay partidas registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <User size={16} className="text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">
                      {session.player.firstName} {session.player.lastName}
                      {session.player.nickname && <span className="text-zinc-500 ml-1">"{session.player.nickname}"</span>}
                    </p>
                    <p className="text-[10px] text-zinc-600">{formatDate(session.completedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-xs font-black text-emerald-400">{session.totalCorrect}</p>
                    <p className="text-[9px] text-zinc-600">correctas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-red-400">{session.totalIncorrect}</p>
                    <p className="text-[9px] text-zinc-600">incorrectas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-mono text-zinc-400">{formatTime(session.totalTime)}</p>
                    <p className="text-[9px] text-zinc-600">tiempo</p>
                  </div>
                  <div className="text-center pl-2 border-l border-white/5">
                    <p className="text-lg font-black text-amber-400">{session.score}</p>
                    <p className="text-[9px] text-zinc-600">pts</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
