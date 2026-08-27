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
  const originalDay = new Date(originalDate)
  const baseDate = referenceDate < originalDay ? originalDay : referenceDate
  const currentDay = baseDate.getDay()

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
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + daysUntilTarget,
    hours,
    minutes,
    0
  )

  // If target day is today but time has already passed, jump 7 days ahead to next week
  if (daysUntilTarget === 0 && nextDate < baseDate) {
    nextDate.setDate(nextDate.getDate() + 7)
  }

  return nextDate
}

/** Returns whether an event is within its configured publication window. */
export function isEventCurrentlyActive(
  event: {
    startDate: Date | string
    endDate?: Date | string | null
    isRecurring?: boolean | null
  },
  referenceDate: Date = new Date()
): boolean {
  const startDate = new Date(event.startDate)
  const startDay = new Date(startDate)
  startDay.setHours(0, 0, 0, 0)

  if (event.endDate) {
    const endDate = new Date(event.endDate)
    endDate.setHours(23, 59, 59, 999)
    if (referenceDate > endDate) return false
  }

  // Future events are publishable before their start date. Without an endDate,
  // a one-day event remains visible until the end of its start day.
  if (event.isRecurring || event.endDate) return true

  const startDayEnd = new Date(startDate)
  startDayEnd.setHours(23, 59, 59, 999)
  return referenceDate <= startDayEnd
}

/** Returns whether a calculated occurrence falls inside the event's configured window. */
export function isEventOccurrenceWithinWindow(
  event: { startDate: Date | string; endDate?: Date | string | null },
  occurrenceDate: Date
): boolean {
  const startDate = new Date(event.startDate)
  const startDay = new Date(startDate)
  startDay.setHours(0, 0, 0, 0)
  if (occurrenceDate < startDay) return false

  if (!event.endDate) return true

  const endDate = new Date(event.endDate)
  endDate.setHours(23, 59, 59, 999)
  return occurrenceDate <= endDate
}

export function getDayName(dayIndex?: number | null): string {
  if (dayIndex === null || dayIndex === undefined) return ""
  const found = DAYS_OF_WEEK.find((d) => d.id === dayIndex)
  return found ? found.name : ""
}

export interface EventPricingInfo {
  isFree: boolean
  isEarlyBirdActive: boolean
  earlyBirdDeadlineFormatted: string | null
  milongaSocio: number
  milongaNonSocio: number
  comboSocio: number
  comboNonSocio: number
  classLooseSocio: number
  classLooseNonSocio: number
  originalMilongaSocio: number
  originalMilongaNonSocio: number
  originalComboSocio: number
  originalComboNonSocio: number
}

export function getEffectiveEventPrices(event: any, referenceDate: Date = new Date()): EventPricingInfo {
  const isFree = Boolean(event?.isFree)
  
  const hasEarlyBird = Boolean(event?.hasEarlyBird)
  const deadline = event?.earlyBirdDeadline ? new Date(event.earlyBirdDeadline) : null
  const isEarlyBirdActive = !isFree && hasEarlyBird && Boolean(deadline) && referenceDate <= deadline!

  const earlyBirdDeadlineFormatted = deadline
    ? deadline.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null

  const originalMilongaSocio = isFree ? 0 : (event?.priceSocioMilonga ?? 0)
  const originalMilongaNonSocio = isFree ? 0 : (event?.priceNonSocioMilonga ?? 0)
  const originalComboSocio = isFree ? 0 : (event?.priceSocioCombo ?? 33000)
  const originalComboNonSocio = isFree ? 0 : (event?.priceNonSocioCombo ?? 50000)
  const classLooseSocio = isFree ? 0 : (event?.priceSocioClassLoose ?? 11000)
  const classLooseNonSocio = isFree ? 0 : (event?.priceNonSocioClassLoose ?? 17000)

  let milongaSocio = originalMilongaSocio
  let milongaNonSocio = originalMilongaNonSocio
  let comboSocio = originalComboSocio
  let comboNonSocio = originalComboNonSocio

  if (isEarlyBirdActive) {
    if (event?.priceSocioEarlyBird !== null && event?.priceSocioEarlyBird !== undefined) {
      milongaSocio = event.priceSocioEarlyBird
    }
    if (event?.priceNonSocioEarlyBird !== null && event?.priceNonSocioEarlyBird !== undefined) {
      milongaNonSocio = event.priceNonSocioEarlyBird
    }
    if (event?.priceSocioComboEarlyBird !== null && event?.priceSocioComboEarlyBird !== undefined) {
      comboSocio = event.priceSocioComboEarlyBird
    }
    if (event?.priceNonSocioComboEarlyBird !== null && event?.priceNonSocioComboEarlyBird !== undefined) {
      comboNonSocio = event.priceNonSocioComboEarlyBird
    }
  }

  return {
    isFree,
    isEarlyBirdActive,
    earlyBirdDeadlineFormatted,
    milongaSocio,
    milongaNonSocio,
    comboSocio,
    comboNonSocio,
    classLooseSocio,
    classLooseNonSocio,
    originalMilongaSocio,
    originalMilongaNonSocio,
    originalComboSocio,
    originalComboNonSocio
  }
}

export function isExternalEvent(event?: { type?: string | null } | null): boolean {
  if (!event || !event.type) return false
  const t = event.type.toUpperCase()
  return t.includes("DIFUSIÓN") || t.includes("DIFUSION") || t.includes("EXTERNO")
}

export interface CalendarEventOccurrence {
  eventId: string
  title: string
  description: string | null
  date: Date
  time: string | null
  isRecurring: boolean
  isExternal: boolean
  eventBanner: string | null
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function formatCalendarDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Expands persisted events into dated occurrences for the public annual calendar.
 * The caller supplies a horizon so the same function works for the current year
 * and for future years that already contain scheduled events.
 */
export function getCalendarEventOccurrences(
  events: Array<{
    id: string
    title: string
    description?: string | null
    startDate: Date | string
    endDate?: Date | string | null
    isRecurring?: boolean | null
    recurrenceDay?: number | null
    recurrenceTime?: string | null
    eventBanner?: string | null
    type?: string | null
  }>,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEventOccurrence[] {
  const firstDay = startOfLocalDay(rangeStart)
  const lastDay = endOfLocalDay(rangeEnd)
  const occurrences: CalendarEventOccurrence[] = []

  for (const event of events) {
    const eventStart = new Date(event.startDate)
    const eventStartDay = startOfLocalDay(eventStart)
    const eventEndDay = event.endDate ? endOfLocalDay(new Date(event.endDate)) : eventStartDay
    const occurrenceStart = event.isRecurring ? new Date(Math.max(firstDay.getTime(), eventStartDay.getTime())) : eventStartDay
    const occurrenceEnd = event.isRecurring
      ? event.endDate ? new Date(Math.min(lastDay.getTime(), eventEndDay.getTime())) : lastDay
      : eventStartDay

    if (event.isRecurring && event.recurrenceDay !== null && event.recurrenceDay !== undefined) {
      const cursor = new Date(occurrenceStart)
      while (cursor <= occurrenceEnd) {
        if (cursor.getDay() === event.recurrenceDay && cursor >= firstDay && cursor <= lastDay) {
          occurrences.push({
            eventId: event.id,
            title: event.title,
            description: event.description || null,
            date: new Date(cursor),
            time: event.recurrenceTime || null,
            isRecurring: true,
            isExternal: isExternalEvent(event),
            eventBanner: event.eventBanner || null,
          })
        }
        cursor.setDate(cursor.getDate() + 1)
      }
      continue
    }

    if (eventStartDay >= firstDay && eventStartDay <= lastDay) {
      occurrences.push({
        eventId: event.id,
        title: event.title,
        description: event.description || null,
        date: eventStartDay,
        time: eventStart.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        isRecurring: false,
        isExternal: isExternalEvent(event),
        eventBanner: event.eventBanner || null,
      })
    }
  }

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime() || a.title.localeCompare(b.title, "es"))
}

export function getCalendarDateKey(date: Date): string {
  return formatCalendarDateKey(date)
}
