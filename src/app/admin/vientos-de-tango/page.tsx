import { db } from "@/lib/db"
import { Trophy, Calendar, Medal, Users, User, Trash2, Link as LinkIcon } from "lucide-react"
import { AddResultForm } from "./AddResultForm"
import { deleteChampionshipResult } from "@/app/actions/vientos-de-tango"
import { EditResultModal } from "./EditResultModal"

export default async function VientosDeTangoPage() {
  const championships = await db.championship.findMany({
    orderBy: { year: "desc" },
    include: {
      results: {
        include: {
          member: true
        },
        orderBy: [{ category: "asc" }, { place: "asc" }]
      }
    }
  })

  const members = await db.member.findMany({
    select: { id: true, firstName: true, lastName: true, memberNumber: true },
    orderBy: { lastName: "asc" }
  })

  return (
    <div className="flex flex-col gap-8 animate-in mt-10 fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-amber-500/15 transition-all duration-700"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 uppercase italic flex items-center gap-4">
             <Trophy size={36} className="text-amber-500" />
             Vientos de Tango
          </h1>
          <p className="text-zinc-500 max-w-lg font-medium">
             Salón de la Fama y Registro Histórico de Campeonatos del Centro Amigos del Tango desde 2007.
          </p>
        </div>
        <div className="flex gap-4 relative">
            <div className="bg-black/40 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
               <div className="bg-white/5 p-3 rounded-2xl text-amber-500">
                  <Medal size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Podios Cargados</p>
                  <p className="text-2xl font-black text-white">{championships.reduce((acc: number, c: any) => acc + c.results.length, 0)}</p>
               </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(championships as any[]).map((champ) => (
          <div key={champ.id} className="bg-white/5 border border-white/10 rounded-[48px] p-8 backdrop-blur-md hover:border-amber-500/20 transition-all group shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
             
             <div className="flex justify-between items-start mb-10 relative">
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase italic">Edición {champ.year}</h2>
                   <div className="flex items-center gap-2 mt-2">
                       <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                       <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 italic">VIENTOS DE TANGO</span>
                   </div>
                </div>
                <AddResultForm championshipId={champ.id} year={champ.year} members={members as any} />
             </div>

             <div className="flex flex-col gap-4 relative">
                {champ.results.length === 0 ? (
                  <div className="py-16 text-center bg-white/[0.02] rounded-[32px] border-2 border-dashed border-white/5">
                     <Trophy size={24} className="mx-auto text-zinc-800 mb-4" />
                     <p className="text-xs uppercase font-black tracking-widest text-zinc-700 italic">Sin resultados registrados aún</p>
                  </div>
                ) : (
                  (champ.results as any[]).map((result) => (
                    <div key={result.id} className="flex justify-between items-center p-6 rounded-3xl bg-white/[0.03] border border-white/5 group/res hover:bg-white/[0.06] hover:border-white/10 transition-all">
                       <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl ${
                            result.place === 1 ? "bg-amber-500/20 border-amber-500/30 text-amber-500" :
                            result.place === 2 ? "bg-zinc-400/20 border-zinc-400/30 text-zinc-400" :
                            "bg-orange-800/20 border-orange-800/30 text-orange-800"
                          }`}>
                            <Medal size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                               <p className="text-[10px] uppercase font-black tracking-tighter text-zinc-500 mr-2 italic">{result.category}</p>
                               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                 result.place === 1 ? "bg-amber-500 text-zinc-950" : "bg-white/10 text-white/50"
                               }`}>
                                 {result.place === 1 ? "🥇 CAMPEÓN" : result.place === 2 ? "🥈 2º PUESTO" : "🥉 3º PUESTO"}
                               </span>
                            </div>
                            <p className="text-white text-lg font-bold tracking-tight">
                               {result.firstName} {result.lastName}
                               {result.partnerName && <span className="text-zinc-500 font-medium ml-1"> & {result.partnerName}</span>}
                            </p>
                            {result.member ? (
                              <div className="flex items-center gap-2 mt-2 bg-amber-500/10 px-3 py-1 rounded-full w-fit border border-amber-500/10">
                                 <Users size={12} className="text-amber-500" />
                                 <span className="text-[10px] uppercase font-black tracking-widest text-amber-500/80 italic">Vinculado: #{result.member.memberNumber}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-2 opacity-40">
                                 <LinkIcon size={12} className="text-zinc-500" />
                                 <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 italic">Sin vincular</span>
                              </div>
                            )}
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <EditResultModal 
                             result={result} 
                             members={members as any[]} 
                             allChampionships={championships.map(c => ({ id: c.id, year: c.year }))} 
                          />
                          
                          <form action={async () => {
                              "use server"
                              await deleteChampionshipResult(result.id)
                          }}>
                             <button 
                               type="submit"
                               className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all opacity-0 group-hover/res:opacity-100"
                             >
                                <Trash2 size={16} />
                             </button>
                          </form>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
