import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Gift } from "lucide-react"
import { getBenefits, seedDefaultBenefitsIfEmpty } from "@/app/actions/beneficios"
import { BenefitManagementClient } from "./BenefitFormModal"

export default async function AdminBeneficiosPage() {
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect("/admin")
  }

  // Ensure initial seed data exists if empty
  await seedDefaultBenefitsIfEmpty()

  // Fetch all benefits (active and inactive) for admin
  const benefits = await getBenefits(false)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/configuracion"
              className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
              title="Volver a Ajustes"
            >
              <ArrowLeft size={18} />
            </a>
            <h1 className="text-3xl font-black tracking-tight text-white/90 flex items-center gap-3">
              <Gift className="text-amber-500" size={28} />
              <span>Beneficios Socios</span>
            </h1>
          </div>
          <p className="text-zinc-400 mt-1 text-sm">
            Gestione los beneficios exclusivos redactados para los socios de la institución.
          </p>
        </div>
      </div>

      <BenefitManagementClient initialBenefits={benefits} />
    </div>
  )
}
