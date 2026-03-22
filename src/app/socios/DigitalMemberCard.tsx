"use client"
import { Trophy, Medal, Star, Calendar, MapPin, User, Hash, CheckCircle2 } from "lucide-react"

export function DigitalMemberCard({ member, awards }: { member: any, awards: any[] }) {
  const hasPodium = awards.some(a => a.place <= 3)
  const isChampion = awards.some(a => a.place === 1)

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[1.6/1] group transition-all duration-700 hover:scale-[1.02] perspective-1000">
      {/* Background Glow */}
      <div className={`absolute inset-0 rounded-[32px] blur-2xl opacity-20 transition-all duration-700 bg-gradient-to-tr ${
        isChampion ? "from-amber-600 via-amber-400 to-yellow-200" : "from-amber-800 to-zinc-900"
      }`} />
      
      {/* Card Body */}
      <div className={`relative h-full w-full bg-gradient-to-br border shadow-2xl rounded-[32px] overflow-hidden backdrop-blur-md p-8 flex flex-col justify-between ${
        isChampion 
          ? "from-zinc-900 via-zinc-950 to-amber-900/40 border-amber-500/30" 
          : "from-zinc-900/95 to-zinc-950/98 border-white/10"
      }`}>
        
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg">C</div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-white/50 italic">Centro Amigos del Tango</h2>
             </div>
             <p className="text-[10px] text-zinc-600 font-bold ml-10">FUNDADA EN 1991</p>
          </div>
          
          {isChampion && (
            <div className="flex flex-col items-end">
               <div className="bg-amber-500 text-zinc-950 text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20 animate-pulse">
                 <Trophy size={10} /> CAMPEÓN CAT
               </div>
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className="flex gap-6 items-end">
           <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-zinc-700 text-2xl font-black border border-white/10 shadow-xl overflow-hidden">
                {member.avatarUrl ? (
                   <img src={member.avatarUrl} className="w-full h-full object-cover" alt="Socio" />
                ) : (
                   <User size={40} className="opacity-20" />
                )}
              </div>
              {hasPodium && (
                <div className="absolute -right-3 -top-3 w-10 h-10 bg-amber-500 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-xl">
                   <Medal size={20} className="text-zinc-950" />
                </div>
              )}
           </div>

           <div className="flex-1 pb-1">
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                {member.lastName}, {member.firstName}
              </h3>
              <div className="flex gap-4">
                 <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Nro Socio</span>
                    <span className="text-sm font-bold text-amber-500">#{member.memberNumber}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">DNI</span>
                    <span className="text-sm font-bold text-white/80">{member.dni}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Categoría</span>
                    <span className="text-sm font-bold text-white/80">{member.type}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer Overlay Text / Watermark */}
        <div className="absolute -bottom-4 -left-4 text-white opacity-[0.03] text-7xl font-black italic select-none pointer-events-none tracking-tight">
          VIENTOS DE TANGO
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
           <div className="flex gap-3">
              <div className="flex flex-col">
                 <span className="text-[7px] uppercase font-black tracking-widest text-zinc-600">Socio Desde</span>
                 <span className="text-[9px] font-bold text-zinc-300">{new Date(member.joinDate).getFullYear()}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[7px] uppercase font-black tracking-widest text-zinc-600">Validez</span>
                 <span className="text-[9px] font-bold text-emerald-400">AL DIA</span>
              </div>
           </div>
           
           {/* Mini Medal Shelf */}
           <div className="flex gap-1">
              {awards.slice(0, 3).map((award, i) => (
                <div key={i} title={`${award.category} ${award.championship.year}`} className="w-5 h-5 bg-white/5 rounded-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                   <Star size={10} className={award.place === 1 ? "text-amber-500" : "text-zinc-500"} />
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
