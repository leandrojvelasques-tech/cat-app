"use client"

import { useState, useActionState, useEffect } from "react"
import { createEvent, updateEvent } from "@/app/actions/eventos"
import { Calendar, Music, MapPin, DollarSign, ArrowLeft, Save, Globe, Lock, Plus, User, Headphones, BookOpen, Trash2, Clock, Link as LinkIcon, Repeat, Mail, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DAYS_OF_WEEK } from "@/lib/event-utils"

interface EventClassItem {
  id?: string
  title: string
  description?: string
  classDate?: string
  startTime?: string
  endTime?: string
}

interface EventFormProps {
  initialData?: any
  isEditing?: boolean
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true)
  const [isFree, setIsFree] = useState(initialData?.isFree ?? false)
  const [sendAttendeeConfirmation, setSendAttendeeConfirmation] = useState(initialData?.sendAttendeeConfirmation ?? true)
  const [hasMilonga, setHasMilonga] = useState(initialData?.hasMilonga ?? true)
  const [hasClasses, setHasClasses] = useState(initialData?.hasClasses ?? false)
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.eventBanner || null)

  const parseInitialTags = (rawType: string | undefined): string[] => {
    if (!rawType) return ["MILONGA"]
    const parts = rawType.split(",").map(t => t.trim()).filter(Boolean)
    return parts.length > 0 ? parts : ["MILONGA"]
  }

  const [selectedTags, setSelectedTags] = useState<string[]>(parseInitialTags(initialData?.type))
  const [customTagInput, setCustomTagInput] = useState("")

  const toggleTag = (tag: string) => {
    const formattedTag = tag.toUpperCase().trim()
    if (!formattedTag) return
    setSelectedTags((prev) => 
      prev.includes(formattedTag)
        ? prev.filter((t) => t !== formattedTag)
        : [...prev, formattedTag]
    )
  }

  const addCustomTag = () => {
    if (!customTagInput.trim()) return
    const formatted = customTagInput.toUpperCase().trim()
    if (!selectedTags.includes(formatted)) {
      setSelectedTags((prev) => [...prev, formatted])
    }
    setCustomTagInput("")
  }

  const initialClasses: EventClassItem[] = initialData?.classes?.map((c: any) => ({
    id: c.id,
    title: c.title || "",
    description: c.description || "",
    classDate: c.classDate ? new Date(c.classDate).toISOString().split("T")[0] : "",
    startTime: c.startTime || "",
    endTime: c.endTime || ""
  })) || []

  const [classes, setClasses] = useState<EventClassItem[]>(initialClasses)

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatDateForInput = (date: any) => {
    if (!date) return ""
    const d = new Date(date)
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateTimeForInput = (date: any) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toISOString().slice(0, 16)
  }

  const addClassItem = () => {
    setClasses((prev) => [
      ...prev,
      {
        title: `Clase ${prev.length + 1}`,
        description: "",
        classDate: "",
        startTime: "15:00",
        endTime: "16:15"
      }
    ])
  }

  const updateClassItem = (index: number, field: keyof EventClassItem, value: string) => {
    setClasses((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const removeClassItem = (index: number) => {
    setClasses((prev) => prev.filter((_, idx) => idx !== index))
  }

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateEvent.bind(null, initialData.id) : createEvent,
    null
  )

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href={isEditing ? `/admin/eventos/${initialData.id}` : "/admin/eventos"} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white/90">
              {isEditing ? "Editar Evento" : "Programar Nuevo Evento"}
            </h1>
            <p className="text-zinc-400 mt-1">Gestión modular de Milonga, Capacitaciones (clases) y buffet.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                 <Calendar className="text-amber-500" size={20} />
                 <h2 className="text-lg font-medium">Información General</h2>
               </div>
               
               <div className="flex flex-wrap items-center gap-2">
                 <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                   <button type="button" onClick={() => setIsFree(!isFree)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isFree ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40" : "text-zinc-400 hover:text-white"}`}>
                     <Sparkles size={13} /> {isFree ? "100% GRATUITO ($0)" : "EVENTO CON COSTO"}
                   </button>
                   <input type="hidden" name="isFree" value={isFree ? "on" : "off"} />
                 </div>

                 <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button type="button" onClick={() => setIsPublic(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPublic ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-zinc-500 hover:text-zinc-300"}`}><Globe size={14} /> WEB PÚBLICA</button>
                    <button type="button" onClick={() => setIsPublic(false)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isPublic ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}><Lock size={14} /> INTERNO</button>
                    <input type="hidden" name="isPublic" value={isPublic ? "on" : "off"} />
                 </div>
               </div>
            </div>

            {isFree && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400 shrink-0" />
                  <span><strong>Evento Gratuito Activado:</strong> Las inscripciones serán confirmadas instantáneamente sin requerir comprobante ni cobro.</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0 ml-4 font-bold text-[11px]">
                  <input
                    type="checkbox"
                    checked={sendAttendeeConfirmation}
                    onChange={(e) => setSendAttendeeConfirmation(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>Enviar email de confirmación automática</span>
                  <input type="hidden" name="sendAttendeeConfirmation" value={sendAttendeeConfirmation ? "on" : "off"} />
                </label>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Nombre del Evento</label>
                <input name="title" defaultValue={initialData?.title} required placeholder="Ej: Seminario Andrés Sautel & Celeste Medina" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none" />
              </div>

              {/* Multi-Tag Selector */}
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Etiquetas / Tipos de Evento (Vista Socio)</span>
                  <span className="text-[10px] text-amber-500 font-medium">Ej: Combine "CLASE" + "MILONGA"</span>
                </label>
                
                {/* Active Tags Pills */}
                <div className="flex flex-wrap gap-2 min-h-[46px] p-3 bg-black/40 border border-white/10 rounded-2xl items-center">
                  {selectedTags.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic">Seleccione o agregue al menos una etiqueta...</span>
                  ) : (
                    selectedTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black uppercase shadow-sm">
                        {tag}
                        <button type="button" onClick={() => toggleTag(tag)} className="hover:text-red-400 font-bold ml-1 transition-colors text-sm">
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add Toggle Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Selección Rápida de Etiquetas:</span>
                  <div className="flex flex-wrap gap-2">
                    {["MILONGA", "CLASE", "WORKSHOP", "CAMPEONATO", "COMPETENCIA", "SEMINARIO", "CONCIERTO"].map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500 text-zinc-950 shadow-md font-black"
                              : "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/5"
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Tag Add */}
                <div className="flex gap-2 pt-1">
                  <input 
                    type="text"
                    value={customTagInput} 
                    onChange={(e) => setCustomTagInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag() } }}
                    placeholder="Agregar otra etiqueta personalizada..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none uppercase font-bold tracking-wider focus:border-amber-500/50" 
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>

                {/* Hidden input sent to form action */}
                <input type="hidden" name="type" value={selectedTags.join(", ")} />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Organizador</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                   <input name="organizer" defaultValue={initialData?.organizer || "Centro Amigos del Tango"} placeholder="Ej: Centro Amigos del Tango" className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-amber-500/50 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Lugar / Dirección del Evento</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                   <input 
                     name="location" 
                     defaultValue={initialData?.location || "Asociación Vecinal Gral. Mosconi"} 
                     placeholder="Ej: Asociación Vecinal Gral. Mosconi, Av. Beltrán 350" 
                     className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-amber-500/50 outline-none" 
                   />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Enlace a Google Maps (URL - Opcional)</label>
                <div className="relative">
                   <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                   <input 
                     name="milongaMapsUrl" 
                     defaultValue={initialData?.milongaMapsUrl || ""} 
                     placeholder="https://maps.app.goo.gl/..." 
                     className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none" 
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Contacto WhatsApp / Teléfono</label>
                <input name="contactPhone" defaultValue={initialData?.contactPhone || "2975295100"} placeholder="ej: 2975295100" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Contacto Email Público</label>
                <input name="contactEmail" defaultValue={initialData?.contactEmail || "contacto@centroamigosdeltango.com"} placeholder="ej: info@centroamigosdeltango.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none" />
              </div>

              {/* Mails Adicionales de Notificación */}
              <div className="md:col-span-2 space-y-2 bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={16} /> Mails Adicionales para Recibir Alertas de Inscripción / Comprobantes
                  </label>
                  <span className="text-[10px] text-zinc-400">Separados por comas</span>
                </div>
                <input 
                  name="notificationEmails" 
                  defaultValue={initialData?.notificationEmails || ""} 
                  placeholder="ej: presidente@gmail.com, tesorero@hotmail.com, colaborador@tango.org" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500/50 outline-none font-mono" 
                />
                <p className="text-[10px] text-zinc-400 italic">
                  💡 Por defecto siempre le llega la notificación al mail oficial del Centro Amigos del Tango. Sumá acá otros mails (de la comisión directiva o particulares) que también deban enterarse cada vez que alguien se inscriba o envíe comprobante de pago para este evento.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Fecha Inicio (Día)</label>
                <input name="startDate" type="date" required defaultValue={formatDateForInput(initialData?.startDate)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Fecha Fin (Día - Opcional)</label>
                <input name="endDate" type="date" defaultValue={formatDateForInput(initialData?.endDate)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none" />
              </div>
            </div>

            {/* Módulos Habilitados */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <label className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Contenido y Frecuencia del Evento</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${hasMilonga ? "bg-red-500/10 border-red-500/30 text-white" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                  <input type="checkbox" name="hasMilonga" checked={hasMilonga} onChange={(e) => setHasMilonga(e.target.checked)} className="hidden" />
                  <Music size={20} className={hasMilonga ? "text-red-400" : "text-zinc-600"} />
                  <div>
                    <p className="text-sm font-bold">Milonga</p>
                    <p className="text-[10px] text-zinc-400">Baile y buffet</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${hasClasses ? "bg-cyan-500/10 border-cyan-500/30 text-white" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                  <input type="checkbox" name="hasClasses" checked={hasClasses} onChange={(e) => setHasClasses(e.target.checked)} className="hidden" />
                  <BookOpen size={20} className={hasClasses ? "text-cyan-400" : "text-zinc-600"} />
                  <div>
                    <p className="text-sm font-bold">Capacitación</p>
                    <p className="text-[10px] text-zinc-400">Clases / Combos</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${isRecurring ? "bg-amber-500/10 border-amber-500/30 text-white" : "bg-black/20 border-white/5 text-zinc-500"}`}>
                  <input type="checkbox" name="isRecurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="hidden" />
                  <Repeat size={20} className={isRecurring ? "text-amber-400" : "text-zinc-600"} />
                  <div>
                    <p className="text-sm font-bold">Es Recurrente</p>
                    <p className="text-[10px] text-zinc-400">Agenda fija semanal</p>
                  </div>
                </label>
              </div>

              {/* Recurring Event Config Panel */}
              {isRecurring && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 md:p-5 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Repeat size={16} /> Configuración de Recurrencia Semanal
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Día Fijo de la Semana</label>
                      <select 
                        name="recurrenceDay" 
                        defaultValue={initialData?.recurrenceDay ?? 2}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d.id} value={d.id} className="bg-zinc-900 text-white">
                            Todos los {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Horario Fijo de Inicio (ej: 20:00)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input 
                          name="recurrenceTime" 
                          defaultValue={initialData?.recurrenceTime || "20:00"} 
                          placeholder="20:00" 
                          className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 italic">
                    💡 En la sección "Próximos Eventos", el socio verá únicamente la **próxima fecha semanal inmediata** de esta actividad sin saturar el calendario.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Capacitación / Clases Section */}
          {hasClasses && (
            <section className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-cyan-400" size={22} />
                  <div>
                    <h2 className="text-lg font-medium text-white">Configuración de Capacitación (Clases)</h2>
                    <p className="text-xs text-zinc-400">Defina el temario de las clases y títulos opcionales.</p>
                  </div>
                </div>
                <input 
                  name="comboTitle" 
                  defaultValue={initialData?.comboTitle || "Combo 4 clases"} 
                  placeholder="Nombre Combo (ej: Combo 4 clases)" 
                  className="bg-black/40 border border-cyan-500/20 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-cyan-400" 
                />
              </div>

              {/* Dynamic Classes List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Temario de Clases ({classes.length})</span>
                  <button 
                    type="button" 
                    onClick={addClassItem}
                    className="flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Agregar Clase
                  </button>
                </div>

                {classes.length === 0 ? (
                  <div className="p-8 text-center bg-black/20 border border-dashed border-cyan-500/20 rounded-2xl">
                    <p className="text-xs text-zinc-500">No hay clases configuradas. Haz clic en "Agregar Clase" para sumar la primera.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes.map((cls, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 p-4 md:p-5 rounded-2xl space-y-3 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                            Clase {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeClassItem(idx)}
                            className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Título de la Clase</label>
                            <input
                              type="text"
                              value={cls.title}
                              onChange={(e) => updateClassItem(idx, "title", e.target.value)}
                              placeholder="Ej: Técnica de Ganchos"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                            />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Descripción de la Clase (Opcional)</label>
                            <textarea
                              rows={2}
                              value={cls.description}
                              onChange={(e) => updateClassItem(idx, "description", e.target.value)}
                              placeholder="Ej: Ganchos estáticos y en movimiento. Control, ejecución y fluidez."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Fecha de la Clase</label>
                            <input
                              type="date"
                              value={cls.classDate}
                              onChange={(e) => updateClassItem(idx, "classDate", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Horario (Inicio → Fin)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={cls.startTime}
                                onChange={(e) => updateClassItem(idx, "startTime", e.target.value)}
                                placeholder="15:00"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                              />
                              <span className="text-zinc-600">a</span>
                              <input
                                type="text"
                                value={cls.endTime}
                                onChange={(e) => updateClassItem(idx, "endTime", e.target.value)}
                                placeholder="16:15"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" name="classesData" value={JSON.stringify(classes)} />
              </div>
            </section>
          )}

          {/* Milonga Section */}
          {hasMilonga && (
            <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <Music className="text-red-400" size={20} />
                  <h2 className="text-lg font-medium text-white">Programación Milonga</h2>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                    <Headphones size={18} />
                    <input name="tangoDJ" defaultValue={initialData?.tangoDJ} placeholder="Tango DJ Invitado" className="bg-transparent border-b border-red-500/20 text-sm py-1 outline-none focus:border-red-500 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Fecha u Horario de Inicio</label>
                    <input name="milongaStart" type="datetime-local" defaultValue={formatDateTimeForInput(initialData?.milongaStart)} className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none w-full" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Horario Finalización (ej: 03:00 hs)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <input name="milongaEndTime" defaultValue={initialData?.milongaEndTime || "03:00"} placeholder="03:00" className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Lugar Específico</label>
                    <input name="milongaLocation" defaultValue={initialData?.milongaLocation} placeholder="Asociación Vecinal Gral. Mosconi" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Dirección Google Maps (URL)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <input name="milongaMapsUrl" defaultValue={initialData?.milongaMapsUrl} placeholder="https://maps.google.com/..." className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none" />
                    </div>
                  </div>
              </div>
            </section>
          )}

          {/* Banner */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="text-amber-500" size={20} />
              <h2 className="text-lg font-medium">Banner / Flyer del Evento</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-black/40 hover:border-amber-500/30 transition-all min-h-[200px] flex items-center justify-center">
                {bannerPreview ? (
                  <>
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-xs font-bold text-white uppercase tracking-widest">Cambiar Imagen</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="text-zinc-500" size={24} />
                    </div>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Subir Banner Publicitario</p>
                    <p className="text-[10px] text-zinc-600 mt-1 italic">Recomendado: Formato vertical 1080x1350px (relación de aspecto 4:5, estándar de redes sociales).</p>
                  </div>
                )}
                <input 
                  type="file" 
                  name="eventBanner" 
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <input type="hidden" name="existingBanner" value={initialData?.eventBanner || ""} />
            </div>
          </section>

          {/* Description */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Descripción General para el Sitio Web</label>
            <textarea name="description" defaultValue={initialData?.description} rows={5} placeholder="Escribe aquí la reseña de los maestros, recomendaciones..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none text-sm" />
          </section>
        </div>

        {/* Sidebar Tarifas */}
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl sticky top-8 space-y-6">
            <h2 className="text-lg font-medium flex items-center gap-2 text-white border-b border-white/10 pb-4">
              <DollarSign size={20} className="text-emerald-500"/> Tarifario Configurable
            </h2>

            {/* Milonga Pricing */}
            {hasMilonga && (
              <div className="space-y-3 bg-red-500/5 border border-red-500/10 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                   <Music size={12} /> Entrada Milonga
                 </p>
                 <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold ml-1">Precio Socio ($)</label>
                    <input name="priceSocioMilonga" type="number" defaultValue={initialData?.priceSocioMilonga} placeholder="ej: 3000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold ml-1">Precio No Socio ($)</label>
                    <input name="priceNonSocioMilonga" type="number" defaultValue={initialData?.priceNonSocioMilonga} placeholder="ej: 6000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50" />
                 </div>
              </div>
            )}

            {/* Classes Pricing */}
            {hasClasses && (
              <div className="space-y-4 bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl">
                 <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                   <BookOpen size={12} /> Capacitaciones / Clases
                 </p>
                 
                 {/* Combo */}
                 <div className="space-y-2 pt-1 border-t border-cyan-500/10">
                   <span className="text-[10px] font-bold text-zinc-300 uppercase">Combo de Clases</span>
                   <div className="grid grid-cols-2 gap-2">
                     <div>
                       <label className="text-[9px] text-zinc-400 font-bold uppercase">Socio ($)</label>
                       <input name="priceSocioCombo" type="number" defaultValue={initialData?.priceSocioCombo || 33000} placeholder="33000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400" />
                     </div>
                     <div>
                       <label className="text-[9px] text-zinc-400 font-bold uppercase">No Socio ($)</label>
                       <input name="priceNonSocioCombo" type="number" defaultValue={initialData?.priceNonSocioCombo || 50000} placeholder="50000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400" />
                     </div>
                   </div>
                 </div>

                 {/* Clase Suelta */}
                 <div className="space-y-2 pt-2 border-t border-cyan-500/10">
                   <span className="text-[10px] font-bold text-zinc-300 uppercase">Clase Suelta</span>
                   <div className="grid grid-cols-2 gap-2">
                     <div>
                       <label className="text-[9px] text-zinc-400 font-bold uppercase">Socio ($)</label>
                       <input name="priceSocioClassLoose" type="number" defaultValue={initialData?.priceSocioClassLoose || 11000} placeholder="11000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400" />
                     </div>
                     <div>
                       <label className="text-[9px] text-zinc-400 font-bold uppercase">No Socio ($)</label>
                       <input name="priceNonSocioClassLoose" type="number" defaultValue={initialData?.priceNonSocioClassLoose || 17000} placeholder="17000" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400" />
                     </div>
                   </div>
                 </div>
              </div>
            )}
            
            <input type="hidden" name="type" value="MILONGA" />

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-amber-950/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save size={18} /> {isPending ? (isEditing ? "Guardando..." : "Publicando...") : (isEditing ? "Guardar Cambios" : "Publicar Evento")}
            </button>
          </section>
        </div>
      </div>
    </form>
  )
}
