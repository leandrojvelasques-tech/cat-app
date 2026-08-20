import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

const MANAGEMENT_ROLES = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return new NextResponse("No autorizado", { status: 401 })

  const { id } = await params
  const communication = await db.memberCommunication.findUnique({ where: { id } })
  if (!communication) return new NextResponse("Documento no encontrado", { status: 404 })

  if (!MANAGEMENT_ROLES.includes(session.user.role)) {
    const member = await db.member.findFirst({ where: { userId: session.user.id }, select: { id: true } })
    if (!member || communication.status !== "PUBLISHED") return new NextResponse("No autorizado", { status: 403 })
  }

  if (!communication.fileData) return new NextResponse("Archivo no encontrado", { status: 404 })

  return new NextResponse(new Uint8Array(communication.fileData), {
    headers: {
      "Content-Type": communication.fileMimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(communication.fileName)}`,
      "Cache-Control": "private, no-store"
    }
  })
}
