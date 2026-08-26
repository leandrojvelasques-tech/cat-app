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

  if (referenceDate < startDay) return false

  if (event.endDate) {
    const endDate = new Date(event.endDate)
    endDate.setHours(23, 59, 59, 999)
    if (referenceDate > endDate) return false
  }

  const startDayEnd = new Date(startDate)
  startDayEnd.setHours(23, 59, 59, 999)
  return Boolean(event.isRecurring) || referenceDate <= startDayEnd
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
