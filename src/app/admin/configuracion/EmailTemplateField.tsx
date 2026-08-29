"use client"

import { useState } from "react"
import { Eye, X } from "lucide-react"

interface EmailTemplateFieldProps {
  name: string
  label: string
  value: string
  rows: number
  variables?: string
  accent?: "gold" | "green" | "wine" | "blue"
}

const samples: Record<string, string> = {
  "{nombre}": "María Rosa Zurlis",
  "{socio}": "594",
  "{username}": "maria.rosa@ejemplo.com",
  "{password}": "CAT-2026-demo",
  "{url_login}": "https://www.centroamigosdeltango.com/login",
  "{estado}": "Al día",
  "{evento}": "Noche de Milonga",
  "{opcion}": "Entrada socio",
  "{monto}": "$ 12.000",
  "{fecha}": "15/09/2026",
  "{lugar}": "Sede Central CAT",
}

const accents = {
  gold: "border-amber-500/20 bg-amber-500/[0.04] text-amber-400",
  green: "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400",
  wine: "border-rose-500/20 bg-rose-500/[0.04] text-rose-300",
  blue: "border-sky-500/20 bg-sky-500/[0.04] text-sky-300",
}

function previewText(value: string) {
  return Object.entries(samples).reduce((result, [variable, sample]) => result.replaceAll(variable, sample), value)
}

export function EmailTemplateField({ name, label, value, rows, variables, accent = "gold" }: EmailTemplateFieldProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const preview = previewText(value)

  return (
    <div className={`space-y-3 rounded-2xl border p-4 ${accents[accent]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor={name} className="text-xs font-black uppercase tracking-wider text-zinc-200">{label}</label>
          {variables && <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-zinc-500">Variables: {variables}</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-300 transition hover:border-amber-400/40 hover:bg-white/10 hover:text-white"
          title="Ver vista previa"
        >
          <Eye size={14} /> Ver
        </button>
      </div>

      <textarea
        id={name}
        name={name}
        defaultValue={value}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-relaxed text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
      />

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Vista previa de ${label}`}>
          <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-950 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Vista previa</p>
                <h3 className="mt-1 text-lg font-bold text-white">{label}</h3>
              </div>
              <button type="button" onClick={() => setIsPreviewOpen(false)} className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar vista previa">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto bg-zinc-900 p-4 sm:p-8">
              <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-xl">
                <div className="border-b-4 border-amber-500 bg-[#151b18] px-6 py-7 text-center">
                  <img src="/images/brand/logo-cat-white.jpg" alt="Centro Amigos del Tango" className="mx-auto h-14 w-auto rounded object-contain" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">Comodoro Rivadavia · Asociación Civil</p>
                </div>
                <div className="px-6 py-7 text-[15px] leading-7 text-zinc-700 sm:px-9">
                  {preview.split(/\n\s*\n/).map((paragraph, index) => (
                    <p key={index} className="mb-4 whitespace-pre-line last:mb-0">{paragraph}</p>
                  ))}
                </div>
                <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-5 text-center text-xs text-zinc-500">
                  <strong className="text-zinc-700">Centro Amigos del Tango</strong><br />Fomentando la pasión y la cultura del 2x4.
                </div>
              </div>
              <p className="mx-auto mt-4 max-w-xl text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">La vista previa utiliza datos ficticios.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
