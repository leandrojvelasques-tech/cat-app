"use client"

import { useState } from "react"
import { Upload, FileDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { importQuestions } from "@/app/actions/juegos"
import { toast } from "sonner"

export function BulkImport() {
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n")
        const headers = lines[0].split(",")
        
        const questions = lines.slice(1)
          .filter(line => line.trim().length > 0)
          .map(line => {
            const values = line.split(",")
            return {
              statement: values[0]?.trim(),
              optionA: values[1]?.trim(),
              optionB: values[2]?.trim(),
              optionC: values[3]?.trim(),
              optionD: values[4]?.trim(),
              correctOption: values[5]?.trim(),
              category: values[6]?.trim() || "General",
              difficulty: values[7]?.trim() || "MEDIUM"
            }
          })

        if (questions.length === 0) throw new Error("Archivo vacío o formato inválido")

        const result = await importQuestions(questions)
        toast.success(`¡Éxito! Se importaron ${result.count} preguntas.`)
        setShow(false)
      } catch (err: any) {
        toast.error("Error al importar: Asegurate que el formato sea correcto (CSV con comas)")
      } finally {
        setLoading(false)
      }
    }
    
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const headers = "statement,optionA,optionB,optionC,optionD,correctOption,category,difficulty\n"
    const example = "¿Quién compuso La Cumparsita?,Gerardo Matos Rodríguez,Aníbal Troilo,Astor Piazzolla,Carlos Gardel,A,Historia,EASY"
    const blob = new Blob([headers + example], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_preguntas_cat.csv"
    a.click()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-sm text-white transition-all"
      >
        <Upload size={16} className="text-zinc-400" />
        Importar CSV
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Upload size={14} className="text-amber-500" />
            Carga Masiva
          </h3>
          
          <p className="text-[11px] text-zinc-500 mb-6 leading-relaxed">
            Subí un archivo CSV con las preguntas. Podés descargar la plantilla para ver el formato requerido.
          </p>

          <div className="space-y-3">
            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl text-amber-500 text-xs font-bold transition-all"
            >
              <FileDown size={14} />
              Descargar Plantilla
            </button>

            <label className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
              loading ? "bg-zinc-800 text-zinc-500" : "bg-white text-zinc-950 hover:bg-zinc-200"
            }`}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {loading ? "IMPORTANDO..." : "ELEGIR ARCHIVO"}
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                disabled={loading} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
