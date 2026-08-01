import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Gift, ArrowLeft, ShieldCheck, Sparkles, Tag, CheckCircle, Info, HeartHandshake } from "lucide-react"
import { getBenefits, seedDefaultBenefitsIfEmpty } from "@/app/actions/beneficios"

export default async function SocioBeneficiosLandingPage() {
  const session = await auth()
  if (!session || !session.user) redirect("/login")

  const userWithMember = await db.user.findUnique({
    where: { id: session.user.id },
    include: { member: true }
  })

  if (!userWithMember?.member) {
    redirect("/socios")
  }

  await seedDefaultBenefitsIfEmpty()
  const benefits = await getBenefits(true)

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/socios"
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-300 hover:text-white transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Exclusivo Socios CAT
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mt-1 flex items-center gap-3">
                <Gift className="text-amber-500 shrink-0" size={32} />
                <span>Beneficios Socios</span>
              </h1>
            </div>
          </div>

          <Link
            href="/socios"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-2xl transition-all"
          >
            ← Volver a Mi Portal
          </Link>
        </div>

        {/* Hero Section Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-950 border border-amber-500/30 p-8 sm:p-10 rounded-[36px] shadow-2xl space-y-4">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight">
              Disfrutá tus ventajas por ser parte del <span className="text-amber-500">Centro Amigos del Tango</span>
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
              Por ser socio de la institución tenés acceso a descuentos especiales, convenios y promociones en talleres, milongas e instituciones adheridas.
            </p>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold pt-2">
              <ShieldCheck size={16} />
              <span>Acceso habilitado para todos los socios registrados de la institución.</span>
            </div>
          </div>
        </div>

        {/* Grid de Beneficios */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              <span>Catálogo de Beneficios Vigentes</span>
            </h3>
            <span className="text-xs text-zinc-500 font-bold">{benefits.length} beneficio(s) disponible(s)</span>
          </div>

          {benefits.length === 0 ? (
            <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8 space-y-3">
              <Gift className="mx-auto text-zinc-600" size={40} />
              <p className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Próximamente se agregarán nuevos beneficios</p>
              <p className="text-zinc-500 text-xs">La administración está actualizando la oferta de convenios para los socios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group relative overflow-hidden backdrop-blur-md"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      {benefit.badge ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
                          {benefit.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                          BENEFICIO SOCIO
                        </span>
                      )}

                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <CheckCircle size={16} />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white tracking-tight uppercase leading-snug group-hover:text-amber-400 transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-zinc-300 mt-3 leading-relaxed font-normal whitespace-pre-line">
                        {benefit.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Tag size={14} className="text-amber-500" /> Válido presentando Carnet de Socio
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-500/80">CAT Socio</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <HeartHandshake className="text-amber-500 shrink-0" size={24} />
            <p>
              ¿Tenés un comercio, academia o emprendimiento y te gustaría ofrecer un beneficio o convenio para la comunidad del Centro Amigos del Tango?
            </p>
          </div>
          <a
            href="https://wa.me/5492975025462"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 rounded-xl font-bold transition-all shrink-0"
          >
            Contactar a Comisión
          </a>
        </div>

      </div>
    </div>
  )
}
