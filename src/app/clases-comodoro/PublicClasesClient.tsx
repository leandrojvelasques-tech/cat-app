"use client"

import { useState } from "react"
import Link from "next/link"
import { OfficialLogo } from "@/components/OfficialLogo"
import { 
  BookOpen, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Instagram, 
  Search, 
  ChevronLeft, 
  Sparkles, 
  MessageSquare, 
  ExternalLink,
  Users,
  CheckCircle2,
  Tag,
  Gift,
  FileText,
  Building
} from "lucide-react"

interface ClassItem {
  id: string
  teacherName: string
  group: string | null
  city: string
  neighborhood: string | null
  locationName: string
  address: string
  schedule: string
  contactInfo: string | null
  priceType: string
  priceDetails: string | null
  registrationUrl: string | null
  notes: string | null
  teacher?: {
    id: string
    fullName: string
    photoUrl: string | null
    bio: string | null
    phone: string | null
    email: string | null
    instagram: string | null
  } | null
}

export function PublicClasesClient({ initialClasses }: { initialClasses: ClassItem[] }) {
  const [selectedCity, setSelectedCity] = useState("TODAS")
  const [selectedPrice, setSelectedPrice] = useState("TODOS")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClasses = initialClasses.filter(c => {
    const matchesCity = selectedCity === "TODAS" || c.city.toLowerCase() === selectedCity.toLowerCase()
    const matchesPrice = selectedPrice === "TODOS" || c.priceType === selectedPrice
    const search = searchQuery.toLowerCase().trim()
    const matchesSearch = search === "" ||
      c.teacherName.toLowerCase().includes(search) ||
      (c.group && c.group.toLowerCase().includes(search)) ||
      (c.neighborhood && c.neighborhood.toLowerCase().includes(search)) ||
      c.locationName.toLowerCase().includes(search) ||
      c.address.toLowerCase().includes(search) ||
      c.schedule.toLowerCase().includes(search)

    return matchesCity && matchesPrice && matchesSearch
  })

  const getContactLink = (cls: ClassItem) => {
    if (!cls.contactInfo) return null
    const info = cls.contactInfo.trim()

    // If it has Instagram
    if (info.startsWith("@")) {
      return {
        url: `https://instagram.com/${info.replace("@", "")}`,
        label: info,
        type: "INSTAGRAM"
      }
    }

    // If it's email
    if (info.includes("@")) {
      const email = info.includes("/") ? info.split("/").find(s => s.includes("@"))?.trim() || info : info
      return {
        url: `mailto:${email}?subject=Consulta%20Clase%20de%20Tango&body=Hola!%20Quería%20consultar%20por%20la%20clase%20de%20Tango%20con%20${encodeURIComponent(cls.teacherName)}`,
        label: email,
        type: "EMAIL"
      }
    }

    // Clean phone for WhatsApp
    const phonePart = info.split("/")[0].trim()
    const cleanPhone = phonePart.replace(/\D/g, "")
    if (cleanPhone.length >= 6) {
      const formattedPhone = cleanPhone.startsWith("54") ? cleanPhone : "549" + cleanPhone
      return {
        url: `https://wa.me/${formattedPhone}?text=Hola!%20Quería%20consultar%20por%20la%20clase%20de%20Tango%20en%20${encodeURIComponent(cls.locationName)}%20con%20${encodeURIComponent(cls.teacherName)}`,
        label: `WhatsApp: ${phonePart}`,
        type: "WHATSAPP"
      }
    }

    return {
      url: `tel:${cleanPhone}`,
      label: info,
      type: "PHONE"
    }
  }

  const countGratis = initialClasses.filter(c => c.priceType === "GRATIS").length
  const countComodoro = initialClasses.filter(c => c.city === "Comodoro Rivadavia").length
  const countRadaTilly = initialClasses.filter(c => c.city === "Rada Tilly").length

  return (
    <div className="bg-[#131313] text-[#e4e2e0] min-h-screen selection:bg-amber-500/30 font-sans relative overflow-x-hidden pb-32">
      
      {/* Background glowing decorations */}
      <div className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/90 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <nav className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <OfficialLogo className="h-9 w-[54px]" priority compact />
          </Link>
          
          <div>
            <Link 
              href="/" 
              className="text-zinc-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 active:scale-95"
            >
              <ChevronLeft size={14} />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-28 md:pt-36 max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Cartelera Actualizada • Marzo 2026
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight font-serif">
            Clases de Tango en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Comodoro y Rada Tilly</span>
          </h1>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light">
            Guía unificada de clases de tango, talleres y escuelas en Comodoro Rivadavia y Rada Tilly. 
            Información de profesores, sedes, horarios y contacto directo.
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-400" /> {initialClasses.length} Clases Registradas
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Gift size={14} /> {countGratis} Clases Gratuitas
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              📍 Comodoro ({countComodoro}) / Rada Tilly ({countRadaTilly})
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* City Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCity("TODAS")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === "TODAS" 
                    ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" 
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                Todas las Ciudades
              </button>
              <button
                onClick={() => setSelectedCity("Comodoro Rivadavia")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === "Comodoro Rivadavia" 
                    ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" 
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                📍 Comodoro Rivadavia
              </button>
              <button
                onClick={() => setSelectedCity("Rada Tilly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCity === "Rada Tilly" 
                    ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" 
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                🏖️ Rada Tilly
              </button>
            </div>

            {/* Price Filter Pills */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              <button
                onClick={() => setSelectedPrice("TODOS")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedPrice === "TODOS" 
                    ? "bg-white/10 text-white border-white/30" 
                    : "bg-transparent text-zinc-500 border-white/5 hover:text-zinc-300"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedPrice("GRATIS")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedPrice === "GRATIS" 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                    : "bg-transparent text-zinc-500 border-white/5 hover:text-emerald-400"
                }`}
              >
                🎁 Gratis ($0)
              </button>
              <button
                onClick={() => setSelectedPrice("ARANCELADO")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedPrice === "ARANCELADO" 
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/10" 
                    : "bg-transparent text-zinc-500 border-white/5 hover:text-cyan-400"
                }`}
              >
                Aranceladas
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por profesor (ej: Leandro, Zarate), grupo, barrio o sede..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Mostrando <strong>{filteredClasses.length}</strong> clase(s) encontradas</span>
          {(selectedCity !== "TODAS" || selectedPrice !== "TODOS" || searchQuery !== "") && (
            <button
              onClick={() => {
                setSelectedCity("TODAS")
                setSelectedPrice("TODOS")
                setSearchQuery("")
              }}
              className="text-amber-400 hover:underline font-bold"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl space-y-3">
            <BookOpen size={48} className="mx-auto text-zinc-700" />
            <h3 className="text-lg font-bold text-zinc-400">No se encontraron clases con los filtros aplicados</h3>
            <p className="text-xs text-zinc-600">Probá modificando el término de búsqueda o la ciudad seleccionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => {
              const contact = getContactLink(cls)
              const hasPhoto = cls.teacher?.photoUrl

              return (
                <div 
                  key={cls.id}
                  className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-amber-500/5 relative overflow-hidden"
                >
                  {/* Glowing accent border top */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent group-hover:via-amber-400 transition-all" />

                  <div className="space-y-4">
                    {/* Header Badge & Price Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-amber-300">
                          📍 {cls.city}
                        </span>
                        {cls.neighborhood && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-zinc-400">
                            {cls.neighborhood}
                          </span>
                        )}
                      </div>

                      {cls.priceType === "GRATIS" ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-lg shadow-emerald-950/40">
                          <Gift size={12} /> GRATIS ($0)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          ARANCELADO
                        </span>
                      )}
                    </div>

                    {/* Teacher Profile Info */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-amber-500/30 overflow-hidden shrink-0 flex items-center justify-center shadow-lg shadow-black group-hover:border-amber-400 transition-all">
                        {hasPhoto ? (
                          <img src={cls.teacher?.photoUrl!} alt={cls.teacherName} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={28} className="text-amber-500/60" />
                        )}
                      </div>

                      <div>
                        {cls.group && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/90 block mb-0.5">
                            {cls.group}
                          </span>
                        )}
                        <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors font-serif leading-snug">
                          {cls.teacherName}
                        </h3>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="space-y-1 bg-black/40 p-4 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin size={14} className="text-amber-500 shrink-0" /> {cls.locationName}
                      </h4>
                      <p className="text-xs text-zinc-400 pl-5 font-light">{cls.address}</p>
                    </div>

                    {/* Schedule Card */}
                    <div className="space-y-1 bg-amber-950/10 border border-amber-500/20 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} /> Horario de Clases
                      </span>
                      <p className="text-xs font-medium text-zinc-200 leading-relaxed">
                        {cls.schedule}
                      </p>
                    </div>

                    {/* Notes / Comments */}
                    {cls.notes && (
                      <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl text-xs text-amber-300/90 font-light flex items-start gap-2">
                        <FileText size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{cls.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact info display if available */}
                  {cls.contactInfo && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5"><Phone size={12} className="text-amber-500" /> {cls.contactInfo}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
