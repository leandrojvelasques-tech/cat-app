import { db } from "@/lib/db"
import { NovedadesArchiveClient } from "./NovedadesArchiveClient"

export const revalidate = 3600 // Revalida cada hora

export default async function NovedadesPage() {
  const novedades = await db.novedad.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: { attachments: { select: { id: true, fileName: true, fileMimeType: true } } }
  })

  return <NovedadesArchiveClient initialNovedades={novedades} />
}
