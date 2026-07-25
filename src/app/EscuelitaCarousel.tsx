"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, GraduationCap, Clock, MapPin, Sparkles, Heart } from "lucide-react"

interface EscuelitaCarouselProps {
  photos: string[]
  docentes: string
}

export function EscuelitaCarousel({ photos, docentes }: EscuelitaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  function nextSlide() {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  return (
    <section id="escuelita" className="bg-[#1b2621]/40 py-24 md:py-32 px-6 md:px-16 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Información (Col span 5) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="px-3 py-1 text-[10px] font-black tracking-widest bg-cat-gold/10 text-cat-gold rounded-full border border-cat-gold/20 uppercase">
              La Escuelita del CAT
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mt-4">
              Aprender Tango es <span className="bg-gradient-to-r from-cat-gold to-cat-bronze bg-clip-text text-transparent">Gratuito</span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-4 font-light leading-relaxed">
              Fomentamos la cultura y abrimos la pista a toda la comunidad de Comodoro Rivadavia. Profesores socios del Centro Amigos del Tango rotan voluntariamente cada mes para brindar clases abiertas a todos los niveles, desde principiantes absolutos.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-start bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <Clock className="text-cat-gold shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Días y Horarios</h4>
                <p className="text-xs text-zinc-400 font-light mt-0.5">Todos los martes de 20:00 a 22:00 hs.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <MapPin className="text-cat-gold shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Lugar de Encuentro</h4>
                <p className="text-xs text-zinc-400 font-light mt-0.5">Centro Cultural de Comodoro Rivadavia (Av. Costanera).</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-[#59412c]/10 border border-[#59412c]/20 p-4 rounded-2xl">
              <GraduationCap className="text-cat-gold shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Docentes de este Mes</h4>
                <p className="text-sm text-cat-gold font-bold mt-1 font-serif">{docentes}</p>
                <p className="text-[10px] text-zinc-500 font-light mt-0.5">Rotación voluntaria mensual de socios CAT.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carrusel de Fotos (Col span 7) */}
        <div className="lg:col-span-7 w-full">
          <div className="relative group aspect-video md:aspect-[16/10] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
            {/* Foto actual */}
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out transform scale-100"
              style={{ backgroundImage: `url(${photos[currentIndex]})` }}
            />
            
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Controles de navegación */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicadores de fotos */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {photos.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-cat-gold' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>

            {/* Badge indicador */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
              Clases Anteriores
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
