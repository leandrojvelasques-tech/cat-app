"use client"

import { useState } from "react"
import { createEvent, updateEvent } from "@/app/actions/eventos"
import { Calendar, Music, Users, MapPin, DollarSign, ArrowLeft, Save, Globe, Lock, Clock, Plus, Trash2, User, Headphones } from "lucide-react"
import Link from "next/link"

interface EventFormProps {
  initialData?: any
  isEditing?: boolean
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const [type, setType] = useState(initialData?.type || "BOTH")
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true)
  const [classes, setClasses] = useState(initialData?.workshopClasses ? JSON.parse(initialData.workshopClasses) : [{ id: 1, name: "", start: "", end: "", description: "" }])
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.eventBanner || null)

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

  const addClass = () => {
    if (classes.length < 4) {
      setClasses([...classes, { id: Date.now(), name: "", start: "", end: "", description: "" }])
    }
  }

  const removeClass = (id: number) => {
    setClasses(classes.filter((c: any) => c.id !== id))
  }

  const updateClass = (id: number, field: string, value: string) => {
    setClasses(classes.map((c: any) => c.id === id ? { ...c, [field]: value } : c))
  }

  const formatDateForInput = (date: any) => {
    if (!date) return ""
    return new Date(date).toISOString().split('T')[0]
  }

  const formatDateTimeForInput = (date: any) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toISOString().slice(0, 16)
  }

  const formAction = isEditing 
    ? updateEvent.bind(null, initialData.id) 
    : createEvent

  return (
    <form action={formAction} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href={isEditing ? `/admin/eventos/${initialData.id}` : "/admin/eventos"} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white/90">
                {isEditing ? "Editar Evento" : "Programar Nuevo Evento"}
            </h1>
            <p className="text-zinc-400 mt-1">Gestión avanzada de clases, DJ y organizadores.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                 <Calendar className="text-amber-500" size={20} />
                 <h2 className="text-lg font-medium">Información General</h2>
               </div>
               
               <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button type="button" onClick={() => setIsPublic(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPublic ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "text-zinc-500 hover:text-zinc-300"}`}><Globe size={14} /> WEB PÚBLICA</button>
                  <button type="button" onClick={() => setIsPublic(false)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isPublic ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}><Lock size={14} /> INTERNO</button>
                  <input type="hidden" name="isPublic" value={isPublic ? "on" : "off"} />
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Nombre del Evento</label>
                <input name="title" defaultValue={initialData?.title} required placeholder="Ej: Festival de Tango CAT" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none" />
              </div>

               <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Organizador</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                   <input name="organizer" defaultValue={initialData?.organizer || "Centro Amigos del Tango"} className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-amber-500/50 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Locación Gral.</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                   <input name="location" defaultValue={initialData?.location || "Sede Central CAT"} className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-amber-500/50 outline-none" />
                </div>
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
          </section>

          {/* Milonga Section */}
          {(type === 'MILONGA' || type === 'BOTH') && (
            <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between border-b border-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <Music className="text-red-400" size={20} />
                  <h2 className="text-lg font-medium">Logística de la Milonga</h2>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                   <Headphones size={18} />
                   <input name="tangoDJ" defaultValue={initialData?.tangoDJ} placeholder="Tango DJ Invitado" className="bg-transparent border-b border-red-500/20 text-sm py-1 outline-none focus:border-red-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Horario Milonga</label>
                    <div className="flex items-center gap-2">
                      <input name="milongaStart" type="datetime-local" defaultValue={formatDateTimeForInput(initialData?.milongaStart)} className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none w-full" />
                      <span className="text-zinc-600">→</span>
                      <input name="milongaEnd" type="datetime-local" defaultValue={formatDateTimeForInput(initialData?.milongaEnd)} className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none w-full" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Lugar Provisorio</label>
                    <input name="milongaLocation" defaultValue={initialData?.milongaLocation} placeholder="Especifique si cambia de sede" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                 </div>
              </div>
            </section>
          )}

          {/* Workshop Section with multiple classes */}
          {(type === 'WORKSHOP' || type === 'BOTH') && (
            <section className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-6">
               <div className="flex items-center justify-between border-b border-blue-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-400" size={20} />
                  <h2 className="text-lg font-medium">Estructura del Workshop</h2>
                </div>
                <button 
                  type="button" 
                  onClick={addClass}
                  disabled={classes.length >= 4}
                  className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={14} /> AGREGAR CLASE ({classes.length}/4)
                </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Lugar del Workshop</label>
                    <input name="workshopLocation" defaultValue={initialData?.workshopLocation} placeholder="Especifique si cambia de sede" className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none" />
                  </div>
               </div>

               <div className="space-y-4">
                  {classes.map((cls: any, idx: number) => (
                    <div key={cls.id} className="relative bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 animate-in slide-in-from-right-4 duration-300">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-blue-500/80 uppercase">Clase #{idx + 1}</span>
                          {classes.length > 1 && (
                            <button type="button" onClick={() => removeClass(cls.id)} className="text-zinc-600 hover:text-red-400 p-1 transition-colors"><Trash2 size={14}/></button>
                          )}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            placeholder="Nombre de la Clase (ej: Técnica de Mujer)" 
                            className="bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                            value={cls.name}
                            onChange={(e) => updateClass(cls.id, "name", e.target.value)}
                          />
                          <div className="flex items-center gap-2">
                             <input type="datetime-local" className="bg-zinc-900/50 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white outline-none w-full" value={cls.start} onChange={(e) => updateClass(cls.id, "start", e.target.value)} />
                             <span className="text-zinc-600 text-xs">→</span>
                             <input type="datetime-local" className="bg-zinc-900/50 border border-white/5 rounded-xl px-2 py-2 text-[10px] text-white outline-none w-full" value={cls.end} onChange={(e) => updateClass(cls.id, "end", e.target.value)} />
                          </div>
                       </div>
                       <input 
                        placeholder="Descripción corta de lo que se verá en la clase..." 
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2 text-xs text-zinc-400 outline-none focus:border-blue-500/30"
                        value={cls.description}
                        onChange={(e) => updateClass(cls.id, "description", e.target.value)}
                       />
                    </div>
                  ))}
               </div>
               <input type="hidden" name="workshopClasses" value={JSON.stringify(classes)} />
            </section>
          )}

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="text-amber-500" size={20} />
              <h2 className="text-lg font-medium">Banner del Evento</h2>
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
                    <p className="text-[10px] text-zinc-600 mt-1 italic">Recomendado: 1200x600px o similar</p>
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

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Descripción para el Sitio Web</label>
            <textarea name="description" defaultValue={initialData?.description} rows={5} placeholder="Escribe aquí los detalles finales para la web..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500/50 outline-none text-sm" />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2"><Save size={18} className="text-amber-500"/> Categoría</h2>
            <div className="grid grid-cols-1 gap-2">
               {[
                 { id: 'MILONGA', icon: Music, label: 'Solo Milonga' },
                 { id: 'WORKSHOP', icon: Users, label: 'Solo Workshop' },
                 { id: 'BOTH', icon: Calendar, label: 'Milonga + Workshop' },
               ].map(opt => {
                 const Icon = opt.icon
                 return (
                   <button key={opt.id} type="button" onClick={() => setType(opt.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-xs font-medium ${type === opt.id ? "bg-white/10 border-white/20 text-white" : "bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300"}`}>
                     <Icon size={16} /> {opt.label}
                   </button>
                 )
               })}
               <input type="hidden" name="type" value={type} />
            </div>
          </section>

          <section className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl sticky top-8">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2"><DollarSign size={18} className="text-emerald-500"/> Tarifas</h2>
            <div className="space-y-4">
              {(type === 'MILONGA' || type === 'BOTH') && (
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest px-1">Tarifa Milonga</p>
                   <input name="priceSocioMilonga" type="number" defaultValue={initialData?.priceSocioMilonga} placeholder="Pr. Socio" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                   <input name="priceNonSocioMilonga" type="number" defaultValue={initialData?.priceNonSocioMilonga} placeholder="Pr. No Socio" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                </div>
              )}
              {(type === 'WORKSHOP' || type === 'BOTH') && (
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest px-1">Tarifa Workshop</p>
                   <input name="priceSocioWorkshop" type="number" defaultValue={initialData?.priceSocioWorkshop} placeholder="Pr. Socio" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                   <input name="priceNonSocioWorkshop" type="number" defaultValue={initialData?.priceNonSocioWorkshop} placeholder="Pr. No Socio" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                </div>
              )}
              {type === 'BOTH' && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                   <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-1">Combo Full Pass</p>
                   <input name="priceSocioFull" type="number" defaultValue={initialData?.priceSocioFull} placeholder="Combo Socio" className="w-full bg-white/5 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                   <input name="priceNonSocioFull" type="number" defaultValue={initialData?.priceNonSocioFull} placeholder="Combo No Socio" className="w-full bg-white/5 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-white outline-none" />
                </div>
              )}
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-amber-950/30 flex items-center justify-center gap-3 mt-4">
                <Save size={18} /> {isEditing ? "Guardar Cambios" : "Publicar Evento"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
