"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Trophy, Medal, Star, User, Maximize2, X, Award } from "lucide-react"
import { format } from "date-fns"

export interface AttendedMilonga {
  id: string
  title: string
  date: Date | string
}

export function DigitalMemberCard({ 
  member, 
  awards,
  attendedMilongas = [],
  calculatedStatus
}: { 
  member: any
  awards: any[]
  attendedMilongas?: AttendedMilonga[]
  calculatedStatus?: string
}) {
  const hasPodium = awards.some(a => a.place <= 3)
  const isChampion = awards.some(a => a.place === 1)
  const isHonorario = member.type === "HONORARIO"
  const [fullscreen, setFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const membershipStatus = calculatedStatus || member.debtStatus || "AL DIA"
  const membershipStatusClass = membershipStatus === "AL DIA"
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    : membershipStatus === "SUSPENDIDO"
    ? "text-red-400 bg-red-500/10 border-red-500/30"
    : "text-amber-300 bg-amber-500/10 border-amber-500/30"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Bloquear scroll del body cuando está en fullscreen
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [fullscreen])

  const cardContent = (
    <div className={`relative w-full bg-gradient-to-br border shadow-2xl rounded-[32px] overflow-hidden backdrop-blur-md flex flex-col justify-between ${
      isHonorario
        ? "from-zinc-900 via-amber-950/40 to-yellow-950/30 border-amber-500/40 shadow-amber-900/20"
        : isChampion
        ? "from-zinc-900 via-zinc-950 to-amber-900/40 border-amber-500/30"
        : "from-zinc-900/95 to-zinc-950/98 border-white/10"
    } ${fullscreen ? "h-full p-6 sm:p-10 md:p-14" : "p-4 sm:p-6 md:p-8 min-h-[560px] sm:min-h-0 sm:aspect-[1.8/1]"}`}>

      {/* Background Glow */}
      <div className={`absolute inset-0 rounded-[32px] blur-3xl opacity-10 pointer-events-none bg-gradient-to-tr ${
        isHonorario ? "from-yellow-400 via-amber-500 to-amber-700" : isChampion ? "from-amber-600 via-amber-400 to-yellow-200" : "from-amber-800 to-zinc-900"
      }`} />

      {/* Watermark */}
      <div className="absolute -bottom-4 -left-4 text-white opacity-[0.03] text-7xl font-black italic select-none pointer-events-none tracking-tight">
        VIENTOS DE TANGO
      </div>

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start relative z-10">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg">C</div>
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-white/50 italic">Centro Amigos del Tango</h2>
           </div>
           <p className="text-[10px] text-zinc-600 font-bold ml-10">FUNDADA EN 1991</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
          {isHonorario && (
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30">
              <Award size={10} /> SOCIO HONORARIO
            </div>
          )}
          {isChampion && (
            <div className="bg-amber-500 text-zinc-950 text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20 animate-pulse">
              <Trophy size={10} /> CAMPEÓN CAT
            </div>
          )}
          {member.isBoardMember && !isChampion && (
            <div className="bg-white/10 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
              <Star size={10} className="text-amber-500" /> {member.position?.toUpperCase() || "COMISIÓN"}
            </div>
          )}
        </div>
      </div>

      {/* Center Content */}
      <div className={`flex flex-col items-stretch gap-5 sm:flex-row sm:items-end sm:gap-6 relative z-10 ${fullscreen ? "sm:gap-10" : ""}`}>
         <div className="relative shrink-0 mx-auto sm:mx-0">
            <div className={`bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-zinc-700 font-black border border-white/10 shadow-xl overflow-hidden ${
              fullscreen ? "w-32 h-32" : "w-20 h-20 md:w-24 md:h-24"
            }`}>
              {member.avatarUrl ? (
                 <img src={member.avatarUrl} className="w-full h-full object-cover" alt="Socio" />
              ) : (
                 <User size={fullscreen ? 52 : 36} className="opacity-20" />
              )}
            </div>
            {hasPodium && (
              <div className="absolute -right-3 -top-3 w-10 h-10 bg-amber-500 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-xl">
                 <Medal size={20} className="text-zinc-950" />
              </div>
            )}
         </div>

         <div className="flex-1 pb-1 text-center sm:text-left">
            <h3 className={`font-black text-white tracking-tighter uppercase leading-none mb-3 ${fullscreen ? "text-3xl sm:text-4xl md:text-5xl" : "text-2xl md:text-2xl"}`}>
              {member.lastName}, {member.firstName}
            </h3>
            <div className="flex justify-center sm:justify-start gap-5 flex-wrap">
               <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Nro Socio</span>
                  <span className={`font-bold text-amber-500 ${fullscreen ? "text-2xl" : "text-sm"}`}>#{member.memberNumber}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">DNI</span>
                  <span className={`font-bold text-white/80 ${fullscreen ? "text-xl" : "text-sm"}`}>{member.dni}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Categoría</span>
                  <span className={`font-bold text-white/80 ${fullscreen ? "text-xl" : "text-sm"}`}>{member.type}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col items-stretch border-t border-white/5 pt-4 relative z-10 gap-4 sm:flex-row sm:justify-between sm:items-center sm:flex-wrap sm:gap-2">
         <div className="flex gap-4 items-center">
            <div className="flex flex-col">
               <span className="text-[7px] uppercase font-black tracking-widest text-zinc-600">Socio Desde</span>
               <span className={`font-bold text-zinc-300 ${fullscreen ? "text-base" : "text-[9px]"}`}>{new Date(member.joinDate).getFullYear()}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[7px] uppercase font-black tracking-widest text-zinc-600">Validez</span>
               <span className={`font-bold ${fullscreen ? "text-base" : "text-[9px]"}`}>{membershipStatus}</span>
            </div>
            <div className={`flex flex-col border-l border-white/10 pl-3 ${membershipStatusClass}`}>
               <span className="text-[7px] uppercase font-black tracking-widest text-zinc-600">Estado de deuda</span>
               <span className={`font-black text-[9px] uppercase px-2 py-1 rounded-md border w-fit ${membershipStatusClass}`}>{membershipStatus}</span>
            </div>
            {member.boardHistory?.some((h: any) => h.position.includes("Presidente")) && (
              <div className="flex flex-col border-l border-white/10 pl-3">
                 <span className="text-[7px] uppercase font-black tracking-widest text-amber-500/50">Legado</span>
                 <span className="text-[9px] font-bold text-amber-500 uppercase">Ex-Presidente</span>
              </div>
            )}
         </div>

         {/* Condecoraciones & Medallas */}
         <div className="flex flex-col items-stretch gap-2 sm:items-end sm:flex-row sm:flex-wrap sm:justify-end">
            {/* Insignias de Asistencia a Milongas del Año con Título y Fecha */}
            {attendedMilongas.length > 0 && (
              <div className="flex flex-col items-stretch gap-2 max-h-40 overflow-y-auto sm:flex-row sm:items-center sm:flex-wrap sm:max-h-none sm:overflow-visible">
                {attendedMilongas.map((m, idx) => {
                  const eventDate = new Date(m.date)
                  const formattedDate = format(eventDate, "dd/MM/yyyy")

                  return (
                    <div
                      key={m.id || idx}
                      className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-3 py-2 rounded-xl shadow-md transition-all"
                    >
                      <span className="text-amber-400 text-xs font-black">★</span>
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-black uppercase text-white tracking-tight truncate max-w-[220px] sm:max-w-[140px]">
                          {m.title}
                        </span>
                        <span className="text-[8px] font-bold text-amber-300/90 tracking-widest">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Medallas de Campeonato */}
            {awards.map((award, i) => (
              <div
                key={i}
                title={`${award.category} ${award.championship.year}`}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border shadow-lg ${
                  award.place === 1 ? "bg-amber-500/20 border-amber-500/30 text-amber-500" :
                  award.place === 2 ? "bg-zinc-300/20 border-zinc-300/30 text-zinc-300" :
                  "bg-orange-800/20 border-orange-800/30 text-orange-800"
                }`}
              >
                 <Medal size={14} />
              </div>
            ))}
         </div>
      </div>
    </div>
  )

  const fullscreenOverlay = (
    <div className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col">
      {/* Botón cerrar */}
      <button
        onClick={() => setFullscreen(false)}
        className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10"
      >
        <X size={22} />
      </button>

      {/* Carnet centrado; en celular conserva la orientación vertical */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div style={{ width: "100%", maxWidth: "860px", height: "100%" }} className="transition-all duration-300">
          {cardContent}
        </div>
      </div>

      <p className="text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest pb-4">
        Toque la X para cerrar
      </p>
    </div>
  )

  return (
    <div className="relative group">
      {/* Glow exterior */}
      <div className={`absolute inset-0 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700 bg-gradient-to-tr ${
        isChampion ? "from-amber-600 via-amber-400 to-yellow-200" : "from-amber-800 to-zinc-900"
      }`} />

      {/* Card normal */}
      <div className="relative">
        {cardContent}
      </div>

      {/* Botón Presentar Carnet */}
      <button
        onClick={() => setFullscreen(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
      >
        <Maximize2 size={16} />
        Presentar Carnet en Fullscreen
      </button>

      {/* Portal fullscreen — escapa de cualquier stacking context */}
      {mounted && fullscreen && createPortal(fullscreenOverlay, document.body)}
    </div>
  )
}
