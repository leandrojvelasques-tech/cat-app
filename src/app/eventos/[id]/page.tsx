import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Music, ChevronLeft, User, DollarSign, Headphones, Clock, Sparkles, BookOpen, ExternalLink, MessageSquare, Mail, Phone } from "lucide-react"
import { auth } from "@/auth"

export default async function PublicEventLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const event = await db.event.findFirst({
    where: {
      OR: [
        { slug: id },
        { id: id }
      ]
    },
    include: {
      classes: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!event || !event.isPublic) {
    notFound()
  }

  const day = new Date(event.startDate).getUTCDate()
  const month = new Date(event.startDate).toLocaleString("es-ES", { month: "long", timeZone: "UTC" }).toUpperCase()
  const year = new Date(event.startDate).getUTCFullYear()

  const formattedMilongaTime = event.milongaStart 
    ? new Date(event.milongaStart).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : null

  // Robust pricing fallbacks matching flyer defaults if null
  const comboNonSocioPrice = event.priceNonSocioCombo ?? 50000
  const comboSocioPrice = event.priceSocioCombo ?? 33000
  const looseNonSocioPrice = event.priceNonSocioClassLoose ?? 17000
  const looseSocioPrice = event.priceSocioClassLoose ?? 11000

  const whatsappPhone = event.contactPhone || "2975295100"
  const cleanPhone = whatsappPhone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("54") ? cleanPhone : "549" + cleanPhone}?text=Hola!%20Consulta%20sobre%20el%20evento%20${encodeURIComponent(event.title)}`

  return (
    <div className="bg-[#131313] text-[#e4e2e0] min-h-screen selection:bg-amber-500/30 font-sans relative overflow-x-hidden pb-32">
      
      {/* Background gradients */}
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <nav className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="font-black text-lg text-zinc-950">C</span>
            </div>
            <span className="font-bold text-lg tracking-wider text-white">CAT</span>
          </Link>
          
          <div>
            <Link 
              href="/" 
              className="text-zinc-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 active:scale-95 animate-in fade-in duration-300"
            >
              <ChevronLeft size={14} />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-28 md:pt-36 max-w-6xl mx-auto px-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Image/Flyer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900 group">
              {event.eventBanner ? (
                <img 
                  src={event.eventBanner} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                  <Calendar size={72} className="opacity-10 animate-pulse" />
                  <span className="text-xs uppercase tracking-widest font-semibold opacity-30">{event.organizer || "Centro Amigos del Tango"}</span>
                </div>
              )}
            </div>

            {/* Google Maps Redirect Card */}
            {event.milongaMapsUrl && (
              <a
                href={event.milongaMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-gradient-to-r from-red-950/40 via-zinc-900 to-black p-5 rounded-2xl border border-red-500/20 hover:border-red-500/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-red-400 transition-colors">Cómo Llegar (Google Maps)</h4>
                    <p className="text-[10px] text-zinc-400">{event.milongaLocation || event.location}</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
              </a>
            )}

            {/* Contact Card */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} /> Contacto & Consultas
              </h4>
              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all text-xs font-bold"
                >
                  <MessageSquare size={16} /> WhatsApp: {whatsappPhone}
                </a>

                {event.contactEmail && (
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 transition-all text-xs font-medium"
                  >
                    <Mail size={16} className="text-amber-500" /> {event.contactEmail}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-3 space-y-8 bg-white/[0.02] border border-white/5 p-8 md:p-10 rounded-3xl backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 text-[10px] font-extrabold rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 tracking-wider">
                  PRÓXIMO EVENTO
                </span>
                <span className="text-amber-500 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={12} /> {day} de {month}, {year}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-serif">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-400 text-xs md:text-sm font-light">
                <span className="flex items-center gap-2"><User size={14} className="text-amber-500" /> {event.organizer || "Centro Amigos del Tango"}</span>
                <span className="flex items-center gap-2"><MapPin size={14} className="text-zinc-500" /> {event.location || "Sede Central CAT"}</span>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Description */}
            {event.description && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Información General</h3>
                <p className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-light">
                  {event.description}
                </p>
              </div>
            )}

            {/* Capacitación / Clases Section */}
            {event.hasClasses && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
                  <BookOpen size={18} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Capacitación / Temario de Clases</h3>
                </div>

                {/* Class Syllabus Items */}
                {event.classes && event.classes.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {event.classes.map((cls, idx) => (
                      <div key={cls.id || idx} className="bg-cyan-950/20 border border-cyan-500/20 p-5 rounded-2xl flex items-start gap-4 hover:border-cyan-500/40 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-black text-base shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-white">{cls.title}</h4>
                            {(cls.classDate || cls.startTime) && (
                              <span className="text-[10px] font-bold text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                                {cls.classDate ? new Date(cls.classDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }) : ''} {cls.startTime}{cls.endTime ? ` a ${cls.endTime}` : ''} hs
                              </span>
                            )}
                          </div>
                          {cls.description && (
                            <p className="text-xs text-zinc-400 font-light leading-relaxed">{cls.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pricing Grid - Matching Flyer (Valores) */}
                <div className="border border-red-500/30 rounded-3xl overflow-hidden bg-gradient-to-b from-black to-zinc-950 p-6 md:p-8 space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-black tracking-widest uppercase text-cyan-400 italic">Valores Capacitación</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative divide-y md:divide-y-0 md:divide-x divide-white/10">
                    
                    {/* No Socios */}
                    <div className="space-y-4 pt-2 md:pt-0 md:pr-4">
                      <h5 className="text-xs font-black text-red-500 uppercase tracking-widest text-center">No Socios</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400 font-medium">{event.comboTitle || "Combo clases"}:</span>
                          <span className="text-white font-black text-lg">${comboNonSocioPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400 font-medium">Clase suelta:</span>
                          <span className="text-white font-black text-lg">${looseNonSocioPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Socios */}
                    <div className="space-y-4 pt-4 md:pt-0 md:pl-6">
                      <h5 className="text-xs font-black text-cyan-400 uppercase tracking-widest text-center">Socios CAT</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400 font-medium">{event.comboTitle || "Combo clases"}:</span>
                          <span className="text-amber-400 font-black text-lg">${comboSocioPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400 font-medium">Clase suelta:</span>
                          <span className="text-amber-400 font-black text-lg">${looseSocioPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Milonga Section */}
            {event.hasMilonga && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Music size={18} className="text-red-400" />
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">Programación Milonga</h3>
                  </div>
                  {event.tangoDJ && (
                    <span className="text-xs text-red-300 font-medium flex items-center gap-1.5">
                      <Headphones size={14} /> DJ: {event.tangoDJ}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Cronograma Card */}
                  <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} /> Horarios de Milonga
                    </h4>
                    <div className="space-y-2 text-sm text-zinc-300 font-light">
                      {formattedMilongaTime && (
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Inicio:</span>
                          <span className="font-bold text-white">{formattedMilongaTime} hs</span>
                        </div>
                      )}
                      {event.milongaEndTime && (
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Finalización:</span>
                          <span className="font-bold text-white">{event.milongaEndTime} hs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Milonga Card */}
                  <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={14} /> Valor Milonga
                    </h4>
                    <div className="space-y-2 text-sm text-zinc-300 font-light">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Socio CAT:</span>
                        <span className="font-bold text-amber-400 text-base">${(event.priceSocioMilonga || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">No Socio:</span>
                        <span className="font-bold text-white text-base">${(event.priceNonSocioMilonga || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-white/5" />

            {/* Booking CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {session?.user ? (
                <Link 
                  href="/socios" 
                  className="bg-gradient-to-tr from-amber-500 to-amber-700 hover:brightness-110 text-zinc-950 font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 text-center text-xs tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} /> Reservar con Tarifa Preferencial Socio
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-gradient-to-tr from-amber-500 to-amber-700 hover:brightness-110 text-zinc-950 font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 text-center text-xs tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Ingresar como Socio para Reservar
                </Link>
              )}
              <Link 
                href="/" 
                className="bg-white/5 hover:bg-white/10 text-zinc-300 px-8 py-4 rounded-2xl text-center text-xs font-bold border border-white/5 transition-all hover:text-white"
              >
                Volver al Inicio
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
