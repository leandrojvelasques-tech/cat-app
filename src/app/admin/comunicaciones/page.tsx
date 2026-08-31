import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Globe2, LockKeyhole, MessageSquareText, Newspaper } from "lucide-react"

export default async function AdminCommunicationsLandingPage() {
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) redirect("/admin")

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <MessageSquareText size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white/90">Comunicaciones</h1>
          <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
            Organizá la información del CAT según quién puede verla: toda la comunidad o sólo los socios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link href="/admin/comunicaciones/socios" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-white/[0.07]">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400"><LockKeyhole size={23} /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Acceso privado</p>
          <h2 className="mt-2 text-2xl font-black text-white transition-colors group-hover:text-amber-400">Comunicaciones a socios</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">Gestiones, reuniones y decisiones de la Comisión Directiva. Sólo las ven los socios dentro de su portal.</p>
          <span className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">Administrar <span aria-hidden="true">→</span></span>
        </Link>
        <Link href="/admin/comunicaciones/novedades" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-white/[0.07]">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300"><Globe2 size={23} /></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Publicación abierta</p>
          <h2 className="mt-2 text-2xl font-black text-white transition-colors group-hover:text-amber-400">Novedades CAT</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">Información institucional que se publica en el home y puede enviarse por email a los socios.</p>
          <span className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">Administrar <span aria-hidden="true">→</span></span>
        </Link>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
        <Newspaper size={18} className="mt-0.5 shrink-0 text-amber-500" />
        <p><span className="font-bold text-white">Criterio de visibilidad:</span> las novedades son públicas; las comunicaciones a socios requieren ingresar al portal.</p>
      </div>
    </div>
  )
}
