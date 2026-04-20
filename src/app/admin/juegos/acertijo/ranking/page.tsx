import { getRanking } from "@/app/actions/juegos"
import Link from "next/link"
import { ArrowLeft, Trophy, Clock, Star } from "lucide-react"

export default async function AdminRankingPage() {
  const ranking = await getRanking(100)

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
          <h1 className="text-2xl font-black tracking-tight text-white">Ranking General</h1>
          <p className="text-zinc-500 text-sm">{ranking.length} participaciones registradas</p>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
          <Trophy size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No hay resultados aún</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Jugador</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Correctas</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tiempo</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      {i < 3 ? (
                        <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                      ) : (
                        <span className="text-zinc-500 font-bold">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{entry.player.firstName} {entry.player.lastName}</p>
                      {entry.player.nickname && (
                        <p className="text-[10px] text-zinc-500">"{entry.player.nickname}"</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-amber-400">{entry.score}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-zinc-300">{entry.totalCorrect}/{entry.totalCorrect + entry.totalIncorrect}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-zinc-400 font-mono text-xs">{formatTime(entry.totalTime)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-zinc-600 text-xs">{formatDate(entry.completedAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
