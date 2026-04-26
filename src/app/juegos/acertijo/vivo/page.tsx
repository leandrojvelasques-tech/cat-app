import { getGameConfig } from "@/app/actions/juegos"
import { AcertijoWelcome } from "../AcertijoWelcome"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Acertijo 2.0 (En Vivo) | Centro Amigos del Tango",
  description: "Participá de la trivia interactiva en vivo.",
}

export default async function AcertijoLivePage() {
  const gameConfig = await getGameConfig()

  if (!gameConfig.isActive) {
    redirect("/juegos")
  }

  return <AcertijoWelcome gameConfig={gameConfig} mode="live" />
}
