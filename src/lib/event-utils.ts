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

