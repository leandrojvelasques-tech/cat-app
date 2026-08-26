import { db } from "@/lib/db"

function getEventEndDate(startDate: Date, endDate: Date | null): Date {
  const date = new Date(endDate || startDate)
  date.setUTCHours(23, 59, 59, 999)
  return date
}

/** Keeps event status aligned with the configured event dates. */
export async function finalizePastEvents(now = new Date()): Promise<number> {
  // Older versions could incorrectly close recurring events when their reference date passed.
  // Reopen only those without an expiry date or whose expiry is still in the future.
  await db.event.updateMany({
    where: {
      status: "FINALIZADO",
      isRecurring: true,
      OR: [{ endDate: null }, { endDate: { gte: now } }]
    },
    data: { status: "OPEN" }
  })

  const openEvents = await db.event.findMany({
    where: { status: "OPEN" },
    select: { id: true, startDate: true, endDate: true, isRecurring: true }
  })

  const finishedEventIds = openEvents
    .filter(event => !event.isRecurring && now >= getEventEndDate(event.startDate, event.endDate))
    .map(event => event.id)

  if (finishedEventIds.length === 0) return 0

  const result = await db.event.updateMany({
    where: { id: { in: finishedEventIds }, status: "OPEN" },
    data: { status: "FINALIZADO" }
  })

  return result.count
}
