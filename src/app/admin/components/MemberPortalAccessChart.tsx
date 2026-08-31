"use client"

import { useState } from "react"

type DailyPoint = { day: number; count: number }
type MonthlySeries = { key: string; label: string; uniqueMembers: number; days: DailyPoint[] }

export function MemberPortalAccessChart({ series }: { series: MonthlySeries[] }) {
  const [selectedKey, setSelectedKey] = useState(series.at(-1)?.key || "")
  if (series.length === 0) return null

  const selected = series.find(month => month.key === selectedKey) || series.at(-1)!
  const maxCount = Math.max(...selected.days.map(point => point.count), 1)
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
    <section className="rounded-[40px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-md md:p-8" aria-labelledby="portal-access-title">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-cat-gold" />
            <h2 id="portal-access-title" className="text-lg font-bold text-white">Accesos de socios al portal</h2>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Personas únicas que ingresaron por día</p>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="text-right text-xs font-bold text-cat-gold">{selected.uniqueMembers} socios ingresaron</p>
          <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Mes
            <select value={selected.key} onChange={event => setSelectedKey(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold normal-case tracking-normal text-white outline-none transition-colors focus:border-cat-gold/60" aria-label="Seleccionar mes para los accesos al portal">
              {series.map(month => <option key={month.key} value={month.key}>{month.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="block h-auto w-full" role="img" aria-label={`Accesos únicos de socios al portal durante ${selected.label}`}>
          {gridValues.map(value => {
            const y = yFor(value)
            return <g key={value}><line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 5" /><text x={left - 10} y={y + 4} fill="#71717a" fontSize="11" textAnchor="end">{value}</text></g>
          })}
          <line x1={left} x2={chartWidth - right} y1={top + plotHeight} y2={top + plotHeight} stroke="rgba(255,255,255,0.16)" />
          <polyline points={points} fill="none" stroke="#f2a81d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {selected.days.map((point, index) => <circle key={point.day} cx={xFor(index)} cy={yFor(point.count)} r="4.5" fill="#18181b" stroke="#f2a81d" strokeWidth="2"><title>Día {point.day}: {point.count} socio(s) ingresaron</title></circle>)}
          {tickIndexes.map(index => <text key={selected.days[index].day} x={xFor(index)} y={chartHeight - 8} fill="#a1a1aa" fontSize="11" textAnchor="middle">Día {selected.days[index].day}</text>)}
        </svg>
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">Cada socio se cuenta una sola vez por día. Pasá sobre cada punto para ver el detalle.</p>
    </section>
  )
}
