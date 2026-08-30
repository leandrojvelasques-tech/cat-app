import { db } from "@/lib/db"

interface RouteContext {
  params: Promise<{ id: string; attachmentId: string }>
}

export async function GET(_: Request, { params }: RouteContext) {
  const { id, attachmentId } = await params
  const attachment = await db.novedadAttachment.findFirst({
    where: { id: attachmentId, novedadId: id, novedad: { isPublished: true } },
    select: { fileData: true, fileMimeType: true, fileName: true },
  })

  if (!attachment) return new Response("Archivo no encontrado.", { status: 404 })

  return new Response(new Uint8Array(attachment.fileData), {
    headers: {
      "Content-Type": attachment.fileMimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
