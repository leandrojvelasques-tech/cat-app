import { getRanking } from "@/app/actions/juegos"
import Link from "next/link"
import { Trophy, ArrowLeft, Medal, Clock, Star, Brain } from "lucide-react"

export const metadata = {
  title: "Ranking Acertijo 2.0 | Centro Amigos del Tango",
  description: "Ranking de jugadores del Acertijo 2.0 - Centro Amigos del Tango",
}

export default async function RankingPage() {
  const ranking = await getRanking(100)

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return min > 0 ? `${min}:${sec.toString().padStart(2, "0")}` : `${sec}s`
  }

  const podiumColors = [
    { bg: "from-yellow-500 to-amber-600", text: "text-yellow-300", border: "border-yellow-500/30", medal: "🥇", shadow: "shadow-yellow-900/30" },
    { bg: "from-zinc-300 to-zinc-400", text: "text-zinc-300", border: "border-zinc-400/30", medal: "🥈", shadow: "shadow-zinc-500/20" },
    { bg: "from-amber-700 to-orange-800", text: "text-amber-600", border: "border-amber-700/30", medal: "🥉", shadow: "shadow-amber-900/20" },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-[350px] h-[350px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-zinc-950/80">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/juegos/acertijo" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm text-white/80">Ranking</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Ranking Acertijo 2.0</h1>
          <p className="text-zinc-500 text-sm">Los mejores tangueros del juego</p>
        </div>

        {ranking.length === 0 ? (
          <div className="text-center py-16">
            <Brain size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">Aún no hay participantes</p>
            <p className="text-zinc-600 text-sm mt-1">¡Sé el primero en jugar!</p>
            <Link
              href="/juegos/acertijo"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-amber-600 to-red-800 rounded-xl font-bold text-sm text-white"
            >
              <Brain size={16} />
              Jugar ahora
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Podium - Top 3 */}
            {ranking.length >= 1 && (
              <div className="grid grid-cols-3 gap-3 mb-8 items-end">
                {[1, 0, 2].map((podiumIndex) => {
                  const entry = ranking[podiumIndex]
                  if (!entry) return <div key={podiumIndex} />
                  const colors = podiumColors[podiumIndex]
                  const isFirst = podiumIndex === 0

                  return (
                    <div key={entry.id} className={`text-center ${isFirst ? "order-2" : podiumIndex === 1 ? "order-1" : "order-3"}`}>
                      <div className={`bg-white/[0.03] border ${colors.border} rounded-2xl p-4 ${isFirst ? "pb-6" : "pb-4"} ${colors.shadow} shadow-lg`}>
                        <span className="text-3xl mb-2 block">{colors.medal}</span>
                        <p className="font-bold text-sm text-white truncate">
                          {entry.player.nickname || `${entry.player.firstName} ${entry.player.lastName.charAt(0)}.`}
                        </p>
                        <p className={`text-2xl font-black mt-1 bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
                          {entry.score}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Clock size={10} className="text-zinc-500" />
                          <span className="text-[10px] text-zinc-500 font-mono">{formatTime(entry.totalTime)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Rest of ranking */}
            <div className="space-y-2">
              {ranking.slice(3).map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-zinc-500">{i + 4}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">
                      {entry.player.nickname || `${entry.player.firstName} ${entry.player.lastName}`}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Star size={9} /> {entry.totalCorrect} correctas
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock size={9} /> {formatTime(entry.totalTime)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-amber-400">{entry.score}</p>
                    <p className="text-[10px] text-zinc-600 font-bold">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to game */}
        <div className="mt-10 text-center">
          <Link
            href="/juegos/acertijo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm text-white transition-all"
          >
            <Brain size={16} />
            Volver al juego
          </Link>
        </div>
      </main>
    </div>
  )
}
