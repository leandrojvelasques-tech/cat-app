import { db } from "@/lib/db"
import { Trophy, Calendar, Medal, Users, User, Trash2 } from "lucide-react"
import { AddResultForm } from "./AddResultForm"
import { deleteChampionshipResult } from "@/app/actions/vientos-de-tango"

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
    select: { id: true, firstName: true, lastName: true, memberNumber: true }
  })

  const categoriesOrder = ["TANGO PISTA", "MILONGA", "VALS", "TANGO ESCENARIO"]

  return (
    <div className="flex flex-col gap-8 animate-in mt-10 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-amber-500/15 transition-all duration-700"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 uppercase italic flex items-center gap-4">
             <Trophy size={36} className="text-amber-500" />
             Vientos de Tango
          </h1>
          <p className="text-zinc-500 max-w-lg">
             Salón de la Fama y Registro Histórico de Campeonatos del Centro Amigos del Tango desde 2007.
          </p>
        </div>
        <div className="flex gap-4 relative">
           <form action={async () => {
                 "use server"
                 const years = Array.from({length: new Date().getFullYear() - 2006}, (_, i) => 2007 + i)
                 for (const y of years) {
                    await db.championship.upsert({
                        where: { year_name: { year: y, name: "Vientos de Tango" } },
                        update: {},
                        create: { year: y, name: "Vientos de Tango" }
                    })
                 }
           }}>
              <button 
                type="submit"
                className="flex items-center gap-2 bg-amber-500 text-zinc-950 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-amber-500/10"
              >
                <Calendar size={18} /> Sincronizar Años (2007-Actual)
              </button>
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {championships.map((champ) => (
          <div key={champ.id} className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-md hover:border-amber-500/20 transition-all group shadow-xl">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tighter mb-1 italic uppercase">Edición {champ.year}</h2>
                   <div className="flex items-center gap-2 mt-2">
                       <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                       <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 italic">Campeonato Metropolitano</span>
                   </div>
                </div>
                <AddResultForm championshipId={champ.id} year={champ.year} members={members} />
             </div>

             <div className="flex flex-col gap-1">
                {champ.results.length === 0 ? (
                  <div className="py-10 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                     <Trophy size={20} className="mx-auto text-zinc-800 mb-2" />
                     <p className="text-[10px] uppercase font-black tracking-widest text-zinc-700 italic">Sin resultados registrados</p>
                  </div>
                ) : (
                  champ.results.map((result) => (
                    <div key={result.id} className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.03] border border-white/5 group/res hover:bg-white/[0.06] transition-all">
                       <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
                            result.place === 1 ? "bg-amber-500/20 border-amber-500/30 text-amber-500" :
                            result.place === 2 ? "bg-zinc-400/20 border-zinc-400/30 text-zinc-400" :
                            "bg-orange-800/20 border-orange-800/30 text-orange-800"
                          }`}>
                            <Medal size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <p className="text-[9px] uppercase font-black tracking-tighter text-zinc-500 mr-2 italic">{result.category}</p>
                               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                 result.place === 1 ? "bg-amber-500 text-zinc-950" : "bg-white/10 text-white/50"
                               }`}>
                                 {result.place === 1 ? "🥇 CAMPEON" : result.place === 2 ? "🥈 2DO PUESTO" : "🥉 3ER PUESTO"}
                               </span>
                            </div>
                            <p className="text-white font-bold tracking-tight">
                               {result.lastName}, {result.firstName}
                               {result.partnerName && <span className="text-zinc-500 font-medium"> & {result.partnerName}</span>}
                            </p>
                            {result.member && (
                              <div className="flex items-center gap-1.5 mt-1">
                                 <Users size={10} className="text-amber-500" />
                                 <span className="text-[10px] uppercase font-black tracking-widest text-amber-500/70">VINCULADO: SOCIO #{result.member.memberNumber}</span>
                              </div>
                            )}
                          </div>
                       </div>
                       
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
                  ))
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
