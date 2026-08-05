import { getPublicTangoClasses } from "@/app/actions/clases-actions"
import { PublicClasesClient } from "../clases-comodoro/PublicClasesClient"

export const metadata = {
  title: "Clases de Tango | Centro Amigos del Tango",
  description: "Guía completa de clases de tango, talleres y profesores en Comodoro Rivadavia y Rada Tilly.",
}

export default async function PublicClasesPage() {
  const classesRes = await getPublicTangoClasses()
  const classes = classesRes.success && classesRes.data ? classesRes.data : []

  return <PublicClasesClient initialClasses={classes} />
}
