import { db } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PagarCuotaForm } from "./PagarCuotaForm"

export default async function PagarCuotaPage(props: any) {
  const params = await props.params
  const searchParams = await props.searchParams
  const returnTo = searchParams?.returnTo
  
  const id = params?.id || props?.params?.id
  
  if (!id) return null

  const member = await db.member.findUnique({ where: { id } })
  if (!member) return null

  // Use a stable amount for V1, or query Settings
  const baseAmount = 6000
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-8 animate-in fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href={returnTo || `/admin/socios/${member.id}`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-3xl font-semibold tracking-tight text-white/90">Registrar Pago</h1>
           <p className="text-zinc-400 mt-1">Socio: {member.firstName} {member.lastName}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <PagarCuotaForm 
          memberId={member.id}
          baseAmount={baseAmount}
          currentMonth={currentMonth}
          currentYear={currentYear}
          returnTo={returnTo}
        />
      </div>
    </div>
  )
}
