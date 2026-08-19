import { db } from "@/lib/db"
import { calculateMemberStatus, getMemberBajaReason, formatDNI } from "@/lib/member-utils"
import { NextRequest, NextResponse } from "next/server"

function toCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(";"),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(";")
    ),
  ]
  // UTF-8 BOM so Excel opens accented characters cleanly
  return "\uFEFF" + lines.join("\n")
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get("query") || ""
  const view = searchParams.get("view") || "all"
  const statusParam = searchParams.get("status") || ""

  const now = new Date()
  const BAJA_STATUS_KEYS = ["BAJA", "DECEASED", "RESIGNED", "INACTIVE", "ARCHIVED", "DUPLICATE", "MOROSIDAD", "ADMINISTRATIVE"]

  const viewFilter = view === "honorary"
    ? { type: "HONORARIO", status: { notIn: BAJA_STATUS_KEYS } }
    : view === "archive" 
    ? (statusParam ? (statusParam === "INACTIVE" ? { status: { in: ["INACTIVE", "ARCHIVED", "ADMINISTRATIVE"] } } : { status: statusParam }) : { status: { in: BAJA_STATUS_KEYS } })
    : view === "all"
    ? (statusParam ? { status: statusParam } : {})
    : { status: { notIn: BAJA_STATUS_KEYS }, type: { not: "HONORARIO" } }

  const membersData = await db.member.findMany({
    where: {
      AND: [
        viewFilter,
        query ? {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { dni: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { memberNumber: { contains: query, mode: 'insensitive' } },
          ]
        } : {}
      ]
    },
    include: {
      fees: {
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
      }
    }
  })

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const filteredMembers = membersData.filter((member: any) => {
    const calculated = calculateMemberStatus(member, now)
    
    if (view === "all") {
      if (statusParam === "ACTIVE") return calculated === 'AL DIA'
      if (statusParam === "DEBTOR") return calculated === 'EN MORA'
      if (statusParam === "SUSPENDED") return calculated === 'SUSPENDIDO'
      if (statusParam === "BAJA") return calculated === 'BAJA'
      return true
    }

    if (view === "archive") {
      return calculated === 'BAJA'
    }

    if (statusParam === "ACTIVE") return calculated === 'AL DIA'
    if (statusParam === "DEBTOR") return calculated === 'EN MORA'
    if (statusParam === "SUSPENDED") return calculated === 'SUSPENDIDO'

    return calculated === 'AL DIA' || calculated === 'EN MORA'
  }).sort((a: any, b: any) => {
    const numA = Number(a.memberNumber) || 0
    const numB = Number(b.memberNumber) || 0
    return numA - numB
  })

  const rows = filteredMembers.map((m: any) => {
    const calculated = calculateMemberStatus(m, now)
    const lastFee = m.fees[0]
    const lastPaidLabel = lastFee ? `${monthNames[lastFee.periodMonth - 1]} ${lastFee.periodYear}` : 'Sin pagos'
    const bajaReason = getMemberBajaReason(m)

    return {
      "N° Socio": m.memberNumber,
      "Apellido": m.lastName,
      "Nombre": m.firstName,
      "DNI": formatDNI(m.dni),
      "Estado": calculated + (calculated === 'BAJA' && bajaReason ? ` (${bajaReason})` : ''),
      "Tipo de Socio": m.type || "ACTIVO",
      "Email": m.email || "-",
      "Teléfono": m.phone || "-",
      "Dirección": m.address || "-",
      "Fecha Ingreso": m.joinDate ? new Date(m.joinDate).toLocaleDateString("es-AR") : "-",
      "Último Pago": lastPaidLabel,
      "Descuento Pareja": m.isFamilyDiscount ? "Sí (50%)" : "No"
    }
  })

  const csv = toCSV(rows)
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `padron_socios_${view}_${dateStr}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
