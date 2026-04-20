import { getGameConfig } from "@/app/actions/juegos"
import { redirect } from "next/navigation"
import { AcertijoWelcome } from "./AcertijoWelcome"

export const metadata = {
  title: "Acertijo 2.0 | Centro Amigos del Tango",
  description: "¿Cuánto sabés de tango? Poné a prueba tus conocimientos con Acertijo 2.0, el juego de trivia del Centro Amigos del Tango.",
}

export default async function AcertijoPage() {
  const game = await getGameConfig()
  
  if (!game.isActive) {
    redirect("/juegos")
  }

  return <AcertijoWelcome gameConfig={game} />
}
