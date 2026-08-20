import { getAdminTangoClasses, getAdminTangoTeachers } from "@/app/actions/clases-actions"
import { ClassManagementClient } from "./ClassManagementClient"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export const metadata = {
  title: "Administración de Clases de Tango | CAT",
  description: "Panel de administración de Clases de Tango en Comodoro Rivadavia y Rada Tilly",
}

export default async function AdminClasesComodoroPage() {
  const classesRes = await getAdminTangoClasses()
  const teachersRes = await getAdminTangoTeachers()

  type ClassManagementProps = Parameters<typeof ClassManagementClient>[0]
  const classes: ClassManagementProps["initialClasses"] = classesRes.success ? (classesRes.data as ClassManagementProps["initialClasses"]) : []
  const teachers: ClassManagementProps["initialTeachers"] = teachersRes.success ? (teachersRes.data as ClassManagementProps["initialTeachers"]) : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Administración de clases</p>
          <p className="text-sm text-zinc-400 mt-1">Gestioná las propuestas regulares y la Escuela del CAT desde este espacio.</p>
        </div>
        <Link
          href="/admin/escuelita"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-blue-300 transition-colors hover:bg-blue-500/20"
        >
          <GraduationCap size={16} /> Administrar Escuela del CAT
        </Link>
      </div>
      <ClassManagementClient initialClasses={classes} initialTeachers={teachers} />
    </div>
  )
}
