import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SolicitudesList } from "./SolicitudesList"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SolicitudesPage() {
  const session = await auth()
  
  // Solo permitir acceso a directivos/administradores (no colaboradores)
  if (
    !session || 
    (session.user.role !== "ADMIN" && 
     session.user.role !== "BOARD" && 
     session.user.role !== "SUPERADMIN")
  ) {
    redirect("/admin")
  }

  // Obtener solicitudes pendientes ordenadas de más nuevas a más viejas
  const solicitudes = await db.enrollmentRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/socios"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">Solicitudes de Inscripción</h1>
          <p className="text-zinc-400 mt-1">Verifique comprobantes y autorice el ingreso de nuevos socios.</p>
        </div>
      </div>

      <SolicitudesList initialSolicitudes={solicitudes} />
    </div>
  )
}
