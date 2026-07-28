"use client"

import { useState, useEffect } from "react"
import { createMember, checkMemberDuplicate, getNextMemberNumberInfo } from "@/app/actions/socios"
import { Save, AlertTriangle, ExternalLink, Hash, CheckCircle2, User } from "lucide-react"
import Link from "next/link"
import { formatDNI, cleanDNI } from "@/lib/member-utils"

export function NuevoSocioForm() {
  const [nextNumber, setNextNumber] = useState<string>("...")
  const [dniValue, setDniValue] = useState("")
  const [emailValue, setEmailValue] = useState("")
  const [firstNameValue, setFirstNameValue] = useState("")
  const [lastNameValue, setLastNameValue] = useState("")

  const [dupDniMember, setDupDniMember] = useState<any>(null)
  const [dupEmailMember, setDupEmailMember] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Fetch next member number on mount
  useEffect(() => {
    getNextMemberNumberInfo().then(setNextNumber).catch(() => setNextNumber("592"))
  }, [])

  // Debounced duplication check for DNI and Email
  useEffect(() => {
    const cleanedDni = cleanDNI(dniValue)
    const trimmedEmail = emailValue.trim()

    if (!cleanedDni && !trimmedEmail) {
      setDupDniMember(null)
      setDupEmailMember(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsChecking(true)
      try {
        const { duplicateDniMember, duplicateEmailMember } = await checkMemberDuplicate(cleanedDni, trimmedEmail)
        setDupDniMember(duplicateDniMember)
        setDupEmailMember(duplicateEmailMember)
      } catch (e) {
        console.error("Error al verificar duplicados:", e)
      } finally {
        setIsChecking(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [dniValue, emailValue])

  const hasDuplicates = Boolean(dupDniMember || dupEmailMember)

  return (
    <form action={createMember} className="flex flex-col gap-6">
      {/* Badge showing the next assigned member number */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
            <Hash size={20} />
          </div>
          <div>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Número de Socio a Asignar</p>
            <p className="text-xl text-white font-black font-mono">Socio #{nextNumber}</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 size={12} /> Correlativo Automático
        </span>
      </div>

      {/* ALERT BANNERS IF DUPLICATES DETECTED */}
      {dupDniMember && (
        <div className="bg-amber-500/15 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-200 font-bold text-sm">
                ⚠️ DNI Registrado Previamente
              </p>
              <p className="text-zinc-300 text-xs mt-0.5">
                El DNI <strong className="font-mono text-white">{formatDNI(dupDniMember.dni)}</strong> pertenece al{" "}
                <strong className="text-amber-400">Socio #{dupDniMember.memberNumber} ({dupDniMember.lastName}, {dupDniMember.firstName})</strong>.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/socios/${dupDniMember.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-amber-500/30 shrink-0"
          >
            Ver Ficha <ExternalLink size={14} />
          </Link>
        </div>
      )}

      {dupEmailMember && (
        <div className="bg-amber-500/15 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-200 font-bold text-sm">
                ⚠️ Correo Electrónico Registrado
              </p>
              <p className="text-zinc-300 text-xs mt-0.5">
                El email <strong className="text-white">{dupEmailMember.email}</strong> ya pertenece al{" "}
                <strong className="text-amber-400">Socio #{dupEmailMember.memberNumber} ({dupEmailMember.lastName}, {dupEmailMember.firstName})</strong>.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/socios/${dupEmailMember.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-amber-500/30 shrink-0"
          >
            Ver Ficha <ExternalLink size={14} />
          </Link>
        </div>
      )}

      {/* FORM FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex justify-between">
            <span>Nombre *</span>
            <span className="text-[10px] text-zinc-500 uppercase">Imprenta Mayúscula</span>
          </label>
          <input
            name="firstName"
            required
            value={firstNameValue}
            onChange={(e) => setFirstNameValue(e.target.value.toUpperCase())}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors uppercase font-medium"
            placeholder="JUAN CARLOS"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex justify-between">
            <span>Apellido *</span>
            <span className="text-[10px] text-zinc-500 uppercase">Imprenta Mayúscula</span>
          </label>
          <input
            name="lastName"
            required
            value={lastNameValue}
            onChange={(e) => setLastNameValue(e.target.value.toUpperCase())}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors uppercase font-medium"
            placeholder="PÉREZ"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex justify-between">
            <span>DNI *</span>
            {dniValue && (
              <span className="text-xs text-amber-400 font-mono">
                {formatDNI(dniValue)}
              </span>
            )}
          </label>
          <input
            name="dni"
            required
            value={dniValue}
            onChange={(e) => setDniValue(e.target.value)}
            className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none transition-colors font-mono ${
              dupDniMember ? "border-amber-500/80 focus:border-amber-500" : "border-white/10 focus:border-amber-500/50"
            }`}
            placeholder="Ej: 31092126 o 31.092.126"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Estado Inicial</label>
          <select
            name="status"
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors font-light appearance-none"
          >
            <option value="ACTIVE" className="bg-zinc-900 text-white">Activo</option>
            <option value="PENDING" className="bg-zinc-900 text-white">Pendiente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
          <input
            name="email"
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none transition-colors font-light ${
              dupEmailMember ? "border-amber-500/80 focus:border-amber-500" : "border-white/10 focus:border-amber-500/50"
            }`}
            placeholder="juan@ejemplo.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Teléfono</label>
          <input
            name="phone"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
            placeholder="2966232707"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Fecha de Alta</label>
          <input
            name="joinDate"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors font-light"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Tipo de Socio</label>
          <select
            name="type"
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors font-light appearance-none"
          >
            <option value="ACTIVO" className="bg-zinc-900 text-white">Socio Activo</option>
            <option value="HONORARIO" className="bg-zinc-900 text-white">Socio Honorario</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Fecha de Nacimiento</label>
          <input
            name="birthDate"
            type="date"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors font-light"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Ciudad</label>
          <input
            name="city"
            defaultValue="Comodoro Rivadavia"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Comentarios / Notas</label>
        <textarea
          name="notes"
          rows={3}
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors font-light"
          placeholder="Alguna observación relevante..."
        />
      </div>

      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
        <input
          id="wantsMailing"
          name="wantsMailing"
          type="checkbox"
          defaultChecked
          className="w-5 h-5 rounded-md border-white/10 bg-black/20 text-amber-600 focus:ring-amber-500/50"
        />
        <label htmlFor="wantsMailing" className="text-sm text-zinc-300 cursor-pointer">
          Desea recibir Mailing con novedades sobre el Centro Amigos del Tango
        </label>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {isChecking ? "Verificando unicidad..." : hasDuplicates ? "⚠️ Resuelve las advertencias antes de continuar" : ""}
        </span>
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/socios"
            className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={hasDuplicates}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all shadow-lg ${
              hasDuplicates
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5 shadow-none"
                : "bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 text-white shadow-red-900/20"
            }`}
          >
            <Save size={18} />
            Guardar Socio #{nextNumber}
          </button>
        </div>
      </div>
    </form>
  )
}
