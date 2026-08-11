import { db } from "@/lib/db"

function getEventEndDate(startDate: Date, endDate: Date | null): Date {
  const date = new Date(endDate || startDate)
  date.setUTCHours(23, 59, 59, 999)
  return date
}

/** Keeps event status aligned with the configured event dates. */
export async function finalizePastEvents(now = new Date()): Promise<number> {
  const openEvents = await db.event.findMany({
    where: { status: "OPEN" },
    select: { id: true, startDate: true, endDate: true }
  })

  const finishedEventIds = openEvents
    .filter(event => now >= getEventEndDate(event.startDate, event.endDate))
    .map(event => event.id)

  if (finishedEventIds.length === 0) return 0

  const result = await db.event.updateMany({
    where: { id: { in: finishedEventIds }, status: "OPEN" },
    data: { status: "FINALIZADO" }
  })

  return result.count
}
