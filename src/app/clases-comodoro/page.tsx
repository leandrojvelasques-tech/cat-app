import { getPublicTangoClasses } from "@/app/actions/clases-actions"
import { PublicClasesClient } from "./PublicClasesClient"

export const metadata = {
  title: "Clases de Tango en Comodoro Rivadavia y Rada Tilly | CAT",
  description: "Guía completa y cartelera de clases de tango, talleres y profesores en Comodoro Rivadavia y Rada Tilly.",
}

export default async function PublicClasesComodoroPage() {
  const classesRes = await getPublicTangoClasses()
  const classes = classesRes.success ? (classesRes.data as any[]) : []

  return <PublicClasesClient initialClasses={classes} />
}
