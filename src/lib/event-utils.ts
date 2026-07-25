export const DAYS_OF_WEEK = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" }
]

/**
 * Calculates the next occurrence Date for a recurring event relative to reference date (default now).
 * If event is not recurring, returns its original startDate.
 */
export function getNextEventDate(
  event: {
    startDate: Date | string
    isRecurring?: boolean | null
    recurrenceDay?: number | null
    recurrenceTime?: string | null
  },
  referenceDate: Date = new Date()
): Date {
  const originalDate = new Date(event.startDate)
  if (!event.isRecurring || event.recurrenceDay === null || event.recurrenceDay === undefined) {
    return originalDate
  }

  const targetDay = event.recurrenceDay // 0-6 (0=Sun, 1=Mon, ..., 6=Sat)
  const currentDay = referenceDate.getDay()

  let daysUntilTarget = targetDay - currentDay
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7
  }

  let hours = originalDate.getHours() || 20
  let minutes = originalDate.getMinutes() || 0

  if (event.recurrenceTime) {
    const parts = event.recurrenceTime.split(":")
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10) || hours
      minutes = parseInt(parts[1], 10) || minutes
    }
  }

  const nextDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() + daysUntilTarget,
    hours,
    minutes,
    0
  )

  // If target day is today but time has already passed, jump 7 days ahead to next week
  if (daysUntilTarget === 0 && nextDate < referenceDate) {
    nextDate.setDate(nextDate.getDate() + 7)
  }

  return nextDate
}

export function getDayName(dayIndex?: number | null): string {
  if (dayIndex === null || dayIndex === undefined) return ""
  const found = DAYS_OF_WEEK.find((d) => d.id === dayIndex)
  return found ? found.name : ""
}
