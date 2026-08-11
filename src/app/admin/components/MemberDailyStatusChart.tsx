"use client"

import { useState } from "react"

type DailyPoint = { day: number; count: number }

type MonthlySeries = {
  key: string
  label: string
  days: DailyPoint[]
}

interface MemberDailyStatusChartProps {
  series: MonthlySeries[]
}

export function MemberDailyStatusChart({ series }: MemberDailyStatusChartProps) {
  const [selectedKey, setSelectedKey] = useState(series.at(-1)?.key || "")

  if (series.length === 0) return null

  const selected = series.find(month => month.key === selectedKey) || series.at(-1)!
  const maxCount = Math.max(...selected.days.map(point => point.count), 1)
  const firstCount = selected.days[0]?.count || 0
  const lastCount = selected.days.at(-1)?.count || 0
  const variation = lastCount - firstCount

  const chartWidth = 920
  const chartHeight = 250
  const left = 44
  const right = 18
  const top = 18
  const bottom = 34
  const plotWidth = chartWidth - left - right
  const plotHeight = chartHeight - top - bottom
  const xFor = (index: number) => left + (selected.days.length === 1 ? plotWidth / 2 : (index / (selected.days.length - 1)) * plotWidth)
  const yFor = (count: number) => top + plotHeight - (count / maxCount) * plotHeight
  const points = selected.days.map((point, index) => `${xFor(index)},${yFor(point.count)}`).join(" ")
  const tickIndexes = Array.from(new Set([0, Math.floor((selected.days.length - 1) / 2), selected.days.length - 1]))
  const gridValues = [maxCount, Math.round(maxCount / 2), 0]

  return (
    <section className="rounded-[40px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-md md:p-8" aria-labelledby="daily-member-status-title">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-emerald-400" />
            <h2 id="daily-member-status-title" className="text-lg font-bold text-white">Evolución diaria de socios al día</h2>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Estado reconstruido por día de vencimiento</p>
        </div>

        <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Mes
          <select
            value={selected.key}
            onChange={event => setSelectedKey(event.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold normal-case tracking-normal text-white outline-none transition-colors focus:border-emerald-400/60"
            aria-label="Seleccionar mes para la evolución diaria"
          >
            {series.map(month => <option key={month.key} value={month.key}>{month.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/5 py-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Inicio del mes</p>
          <p className="mt-1 text-xl font-black text-white">{firstCount}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Último día</p>
          <p className="mt-1 text-xl font-black text-emerald-400">{lastCount}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Variación</p>
          <p className={`mt-1 text-xl font-black ${variation < 0 ? "text-amber-300" : "text-emerald-400"}`}>
            {variation > 0 ? "+" : ""}{variation}
          </p>
        </div>
      </div>

      <div className="mt-5 w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="block h-auto w-full" role="img" aria-label={`Evolución de socios al día durante ${selected.label}`}>
          {gridValues.map(value => {
            const y = yFor(value)
            return (
              <g key={value}>
                <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 5" />
                <text x={left - 10} y={y + 4} fill="#71717a" fontSize="11" textAnchor="end">{value}</text>
              </g>
            )
          })}

          <line x1={left} x2={chartWidth - right} y1={top + plotHeight} y2={top + plotHeight} stroke="rgba(255,255,255,0.16)" />
          <polyline points={points} fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {selected.days.map((point, index) => (
            <circle key={point.day} cx={xFor(index)} cy={yFor(point.count)} r="4.5" fill="#18181b" stroke="#34d399" strokeWidth="2">
              <title>Día {point.day}: {point.count} socios al día</title>
            </circle>
          ))}

          {tickIndexes.map(index => (
            <text key={selected.days[index].day} x={xFor(index)} y={chartHeight - 8} fill="#a1a1aa" fontSize="11" textAnchor="middle">Día {selected.days[index].day}</text>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">Pasá sobre cada punto para consultar la cantidad registrada ese día.</p>
    </section>
  )
}
