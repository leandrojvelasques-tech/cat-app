import { db } from "@/lib/db"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { NextRequest, NextResponse } from "next/server"

// Converts an array of objects to CSV string
function toCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(";"),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(";")
    ),
  ]
  return lines.join("\n")
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const query = searchParams.get("query") || ""
  const type = searchParams.get("type") || "all"
  const eventId = searchParams.get("eventId") || ""
  const eventType = searchParams.get("eventType") || "all"

  const now = new Date()
  const currentMonth = month ? parseInt(month) : now.getMonth() + 1
  const currentYear = year ? parseInt(year) : now.getFullYear()

  const fees = await db.membershipFee.findMany({
    where: {
      AND: [
        month ? { periodMonth: parseInt(month) } : {},
        year ? { periodYear: parseInt(year) } : {},
        query
          ? {
              member: {
                OR: [
                  { firstName: { contains: query, mode: "insensitive" } },
                  { lastName: { contains: query, mode: "insensitive" } },
                ],
              },
            }
          : {},
        type === "fee" || type === "all" ? {} : { id: "none" },
      ],
    },
    include: { member: true, recordedBy: true },
    orderBy: { paymentDate: "desc" },
  })

  const registrations = await db.eventRegistration.findMany({
    where: {
      AND: [
        month
          ? {
              createdAt: {
                gte: new Date(currentYear, currentMonth - 1, 1),
                lt: new Date(currentYear, currentMonth, 1),
              },
            }
          : {},
        eventId ? { eventId } : {},
        eventType !== "all" ? { registrationType: eventType } : {},
        query
          ? {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { member: { firstName: { contains: query, mode: "insensitive" } } },
                { member: { lastName: { contains: query, mode: "insensitive" } } },
                { event: { title: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {},
        type === "event" || type === "all" ? {} : { id: "none" },
      ],
      paymentStatus: "PAID",
    },
    include: { member: true, event: true, recordedBy: true },
    orderBy: { createdAt: "desc" },
  })

  const rows: Record<string, string | number>[] = [
    ...fees.map((f) => ({
      Fecha: format(f.paymentDate, "dd/MM/yyyy HH:mm"),
      Pagador: `${f.member.lastName}, ${f.member.firstName}`,
      "N° Socio": f.member.memberNumber,
      Categoría: "CUOTA",
      Concepto: `Cuota Social - ${format(
        new Date(f.periodYear, f.periodMonth - 1, 1),
        "MMMM yyyy",
        { locale: es }
      )}`,
      "Método de Pago": f.paymentMethod || "EFECTIVO",
      "Monto ($)": f.amountPaid,
      "Registrado por": f.recordedBy?.name || "Sistema",
    })),
    ...registrations.map((r) => ({
      Fecha: format(r.createdAt, "dd/MM/yyyy HH:mm"),
      Pagador: r.member
        ? `${r.member.lastName}, ${r.member.firstName}`
        : `${r.lastName}, ${r.firstName}`,
      "N° Socio": r.member?.memberNumber || "No socio",
      Categoría: "EVENTO",
      Concepto: `Entrada: ${r.event.title} (${r.registrationType})`,
      "Método de Pago": r.paymentMethod || "EFECTIVO",
      "Monto ($)": r.amountPaid,
      "Registrado por": r.recordedBy?.name || "Sistema",
    })),
  ].sort((a, b) => {
    // Sort by date descending (same order as the UI)
    const dateA = new Date((a.Fecha as string).split(" ")[0].split("/").reverse().join("-")).getTime()
    const dateB = new Date((b.Fecha as string).split(" ")[0].split("/").reverse().join("-")).getTime()
    return dateB - dateA
  })

  const csv = toCSV(rows)
  const filename = `cobranzas_${currentYear}-${String(currentMonth).padStart(2, "0")}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
