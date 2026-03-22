import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { CheckCircle2, History, AlertCircle } from "lucide-react"

export default async function PortalSocioPage() {
  const session = await auth()
  if (!session || !session.user) redirect("/login")

  const userWithMember = await db.user.findUnique({
    where: { id: session.user.id },
    include: { member: { include: { fees: true } } }
  })

  // If the admin logs into the portal accidentally or a user has no member record yet
  if (!userWithMember?.member) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Padrón de Socio no Encontrado</h2>
        <p className="text-zinc-500">Comuníquese con administración para vincular su cuenta.</p>
      </div>
    )
  }

  const member = userWithMember.member
  const isAlDia = member.status === "ACTIVE" // Lógica simplificada de Deuda para V1.

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
         <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
         <div className="relative z-10">
           <h1 className="text-3xl md:text-4xl font-light mb-2">Hola, <span className="font-semibold">{member.firstName}</span></h1>
           <p className="text-zinc-400">Bienvenido a su portal de autogestión del Centro Amigos del Tango.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
           <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
             Estado de Cuenta
           </h2>
           
           <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border ${
             isAlDia ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
           }`}>
              {isAlDia ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700 mb-1">Al Día</h3>
                  <p className="text-emerald-600/80 text-center text-sm">No registra deuda de cuotas. ¡Gracias!</p>
                </>
              ) : (
                <>
                   <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-red-700 mb-1">Cuotas Pendientes</h3>
                  <p className="text-red-600/80 text-center text-sm">Por favor, regularice su situación.</p>
                </>
              )}
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
           <h2 className="text-lg font-semibold text-zinc-900 mb-6">Mis Datos</h2>
           
           <div className="space-y-4">
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <span className="text-zinc-500 text-sm">Nro. de Socio</span>
                <span className="font-semibold text-zinc-900">#{member.memberNumber}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <span className="text-zinc-500 text-sm">DNI</span>
                <span className="font-semibold text-zinc-900">{member.dni}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <span className="text-zinc-500 text-sm">Estado Administrativo</span>
                <span className="font-semibold text-zinc-900">{member.status === 'ACTIVE' ? 'Activo' : member.status}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-zinc-500 text-sm">Miembro desde</span>
                <span className="font-semibold text-zinc-900">{new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-zinc-900 rounded-3xl p-8 text-center text-white">
        <h3 className="text-xl font-medium mb-4">¿Desea abonar su cuota?</h3>
        <p className="text-zinc-400 mb-6 max-w-md mx-auto">Para mantener su estado al día y colaborar con el Centro, puede realizar una transferencia bancaria o utilizar Mercado Pago.</p>
        <button className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-900/20">
          <History size={18} /> Ver opciones de pago
        </button>
      </div>

    </div>
  )
}
