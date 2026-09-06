const SUPPORTED_PAYMENT_METHODS = [
  "CASH",
  "TRANSFER",
  "EFECTIVO",
  "TRANSFERENCIA",
] as const

export function isSupportedPaymentMethod(value: unknown): value is (typeof SUPPORTED_PAYMENT_METHODS)[number] {
  return typeof value === "string" && SUPPORTED_PAYMENT_METHODS.includes(value as (typeof SUPPORTED_PAYMENT_METHODS)[number])
}
