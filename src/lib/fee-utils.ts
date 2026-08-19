import { db } from "@/lib/db"
import { DEFAULT_FEE_HISTORY, getFeeAmountForPeriod, type FeePeriod } from "@/lib/fee-calculation"

export { DEFAULT_FEE_HISTORY, getFeeAmountForPeriod }
export type { FeePeriod }

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
/**
 * Gets the current effective monthly fee amount.
 * Checks setting 'cuota_mensual' or falls back to fee history calculation for the current period.
 */
export async function getCurrentFeeAmount(): Promise<number> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: "cuota_mensual" }
    })
    if (setting && setting.value) {
      const parsed = parseFloat(setting.value)
      if (!isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
    const now = new Date()
    const history = await getFeeHistory()
    return getFeeAmountForPeriod(now.getFullYear(), now.getMonth() + 1, false, history)
  } catch (error) {
    console.error("Error obteniendo cuota mensual actual:", error)
    return 7000
  }
}

