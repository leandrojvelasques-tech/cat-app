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
  { id: "default-1", yearFrom: 2026, monthFrom: 1, yearTo: 2026, monthTo: 6, amount: 6000, description: "Enero - Junio 2026" },
  { id: "default-2", yearFrom: 2026, monthFrom: 7, yearTo: null, monthTo: null, amount: 7000, description: "Julio 2026 en adelante" }
]

export function getFeeAmountForPeriod(year: number, month: number, isFamilyDiscount = false, history: FeePeriod[] = DEFAULT_FEE_HISTORY): number {
  const target = year * 100 + month
  const sorted = [...history].sort((a, b) => (b.yearFrom * 100 + b.monthFrom) - (a.yearFrom * 100 + a.monthFrom))
  let amount = 6000
  for (const period of sorted) {
    const start = period.yearFrom * 100 + period.monthFrom
    const end = period.yearTo && period.monthTo ? period.yearTo * 100 + period.monthTo : Infinity
    if (target >= start && target <= end) {
      amount = period.amount
      break
    }
  }
  return isFamilyDiscount ? Math.round(amount / 2) : amount
}
