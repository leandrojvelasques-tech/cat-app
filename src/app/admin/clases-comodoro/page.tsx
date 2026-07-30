import { getAdminTangoClasses, getAdminTangoTeachers } from "@/app/actions/clases-actions"
import { ClassManagementClient } from "./ClassManagementClient"

export const metadata = {
  title: "Administración de Clases de Tango | CAT",
  description: "Panel de administración de Clases de Tango en Comodoro Rivadavia y Rada Tilly",
}

export default async function AdminClasesComodoroPage() {
  const classesRes = await getAdminTangoClasses()
  const teachersRes = await getAdminTangoTeachers()

  const classes = classesRes.success ? (classesRes.data as any[]) : []
  const teachers = teachersRes.success ? (teachersRes.data as any[]) : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <ClassManagementClient initialClasses={classes} initialTeachers={teachers} />
    </div>
  )
}
