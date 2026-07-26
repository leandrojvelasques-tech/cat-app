import { db } from "@/lib/db"

export interface FeePeriod {
  id: string
  yearFrom: number
  monthFrom: number
  yearTo: number | null
  monthTo: number | null
  amount: number
  description?: string
}

export const DEFAULT_FEE_HISTORY: FeePeriod[] = [
  {
    id: "default-1",
    yearFrom: 2026,
    monthFrom: 1,
    yearTo: 2026,
    monthTo: 6,
    amount: 6000,
    description: "Enero - Junio 2026"
  },
  {
    id: "default-2",
    yearFrom: 2026,
    monthFrom: 7,
    yearTo: null,
    monthTo: null,
    amount: 7000,
    description: "Julio 2026 en adelante"
  }
]

export async function getFeeHistory(): Promise<FeePeriod[]> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: "historial_cuotas" }
    })
    if (!setting || !setting.value) {
      return DEFAULT_FEE_HISTORY
    }
    const parsed = JSON.parse(setting.value) as FeePeriod[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_FEE_HISTORY
    }
    return parsed
  } catch (error) {
    console.error("Error leyendo historial_cuotas:", error)
    return DEFAULT_FEE_HISTORY
  }
}

/**
 * Calculates the exact fee amount for a given year, month, and member discount.
 */
export function getFeeAmountForPeriod(
  year: number,
  month: number,
  isFamilyDiscount: boolean = false,
  history: FeePeriod[] = DEFAULT_FEE_HISTORY
): number {
  // Sort periods by start date descending to find matching period
  const sorted = [...history].sort((a, b) => {
    const valA = a.yearFrom * 100 + a.monthFrom
    const valB = b.yearFrom * 100 + b.monthFrom
    return valB - valA
  })

  const targetVal = year * 100 + month
  let matchedAmount = 6000

  for (const period of sorted) {
    const startVal = period.yearFrom * 100 + period.monthFrom
    const endVal = period.yearTo && period.monthTo ? (period.yearTo * 100 + period.monthTo) : Infinity

    if (targetVal >= startVal && targetVal <= endVal) {
      matchedAmount = period.amount
      break
    }
  }

  // Apply 50% discount for family/partner
  return isFamilyDiscount ? Math.round(matchedAmount / 2) : matchedAmount
}
