export type SocietaryStatus = 'ACTIVO' | 'HONORARIO' | 'BAJA'
export type PaymentStatus = 'AL DIA' | 'EN MORA' | 'SUSPENDIDO'
export type CalculatedStatus = PaymentStatus | 'BAJA' | 'HONORARIO'

const LEGACY_BAJA_STATUSES = [
  'DECEASED',
  'RESIGNED',
  'ARCHIVED',
  'INACTIVE',
  'DUPLICATE',
  'MOROSIDAD',
  'ADMINISTRATIVE',
] as const

export function getSocietaryStatus(member: any): SocietaryStatus {
  if (member.type === 'HONORARIO' && member.status !== 'BAJA') {
    return 'HONORARIO'
  }

  if (member.status === 'BAJA' || LEGACY_BAJA_STATUSES.includes(member.status)) {
    return 'BAJA'
  }

  return 'ACTIVO'
}

/**
 * Calculates the current status of a member based on payment and activity history.
 * @param member Member object with fees and eventRegistrations included.
 * @param now Reference date (default current).
 */
export function calculateMemberStatus(member: any, now: Date = new Date()): CalculatedStatus {
  // If the member is an Honorary Member, they are permanently HONORARIO (exempt from fee debt)
  if (member.type === 'HONORARIO' && member.status !== 'BAJA') {
    return 'HONORARIO'
  }

  // If the manual status is already a terminal state, return BAJA
  if (member.status === 'BAJA' || LEGACY_BAJA_STATUSES.includes(member.status)) {
    return 'BAJA'
  }

  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const currentDay = now.getDate()

  // Determinar el mes de referencia exigible (si es día 10 o menos, el mes actual no venció)
  let referenceMonth = currentMonth
  let referenceYear = currentYear

  if (currentDay <= 10) {
    referenceMonth = currentMonth - 1
    if (referenceMonth === 0) {
      referenceMonth = 12
      referenceYear = currentYear - 1
    }
  }

  const paidFees = (member.fees || []).filter((f: any) => f.paymentStatus === 'PAID')

  const hasPaid = (month: number, year: number) => {
    return paidFees.some((f: any) => f.periodMonth === month && f.periodYear === year)
  }

  const hasPaidOnOrAfter = (month: number, year: number) => {
    return paidFees.some((f: any) => 
      f.periodYear > year || (f.periodYear === year && f.periodMonth >= month)
    )
  }

  // 1. AL DIA: Pagó el mes de referencia exigible o posterior (ej. Junio o posterior)
  if (hasPaidOnOrAfter(referenceMonth, referenceYear)) {
    return 'AL DIA'
  }

  // Calcular meses de deuda esperados en 2026 desde su ingreso
  const START_YEAR = 2026
  const START_MONTH = 1
  
  let trackFromMonth = START_MONTH
  let trackFromYear = START_YEAR
  
  if (member.joinDate) {
    const joinDate = new Date(member.joinDate)
    const joinYear = joinDate.getFullYear()
    const joinMonth = joinDate.getMonth() + 1
    
    if (joinYear > START_YEAR || (joinYear === START_YEAR && joinMonth > START_MONTH)) {
      trackFromMonth = joinMonth
      trackFromYear = joinYear
    }
  }

  const expectedMonths: { month: number; year: number }[] = []
  let y = trackFromYear
  let m = trackFromMonth
  
  while (y < referenceYear || (y === referenceYear && m <= referenceMonth)) {
    expectedMonths.push({ month: m, year: y })
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }

  const unpaidMonths = expectedMonths.filter(em => !hasPaid(em.month, em.year))
  const debtMonths = unpaidMonths.length

  // 2. EN MORA: Pagó Mayo o Abril, o debe menos de 3 meses en total
  if (debtMonths > 0 && debtMonths <= 3) {
    return 'EN MORA'
  }

  // 3. INACTIVO: Pagó al menos una cuota en 2026 (Enero, Febrero, Marzo)
  // 4. SUSPENDIDO: No registra ningún pago en 2026
  return 'SUSPENDIDO'
}

export function getPaymentStatus(member: any, now: Date = new Date()): PaymentStatus {
  if (member.type === 'HONORARIO' || member.status === 'BAJA') return 'AL DIA'

  if (['AL DIA', 'EN MORA', 'SUSPENDIDO'].includes(member.debtStatus)) {
    return member.debtStatus
  }

  const calculatedStatus = calculateMemberStatus(member, now)
  if (calculatedStatus === 'BAJA' || calculatedStatus === 'HONORARIO') return 'AL DIA'
  return calculatedStatus
}

export function getMemberBajaReason(member: any): string | null {
  if (member.bajaReason === 'FALLECIMIENTO') return "Fallecimiento"
  if (member.bajaReason === 'RENUNCIA') return "Renuncia"
  if (member.bajaReason === 'BAJA_ADMINISTRATIVA') return "Decisión Administrativa"
  if (member.status === "DECEASED") return "Fallecimiento"
  if (member.status === "RESIGNED") return "Renuncia"
  if (member.status === "DUPLICATE") return "Socio Duplicado"
  if (member.status === "MOROSIDAD") return "Morosidad"
  if (["ARCHIVED", "INACTIVE", "ADMINISTRATIVE"].includes(member.status)) return "Decisión Administrativa"
  return null
}

/**
 * Helper to get the Tailwind classes for a status badge.
 */
export function getStatusBadgeStyles(status: CalculatedStatus) {
  switch (status) {
    case 'HONORARIO': return "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40 font-bold"
    case 'AL DIA': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case 'EN MORA': return "bg-amber-500/10 text-amber-300 border-amber-500/20"
    case 'SUSPENDIDO': return "bg-red-500/10 text-red-500 border-red-500/20"
    case 'BAJA': return "bg-zinc-800 text-zinc-300 border-zinc-700"
    default: return "bg-zinc-500/10 text-zinc-400 border-white/10"
  }
}

export function getBajaReasonStyles(reason: string | null) {
  switch (reason) {
    case 'Fallecimiento': return "bg-purple-950/70 text-purple-300 border-purple-800/50"
    case 'Renuncia': return "bg-orange-950/70 text-orange-300 border-orange-800/50"
    case 'Socio Duplicado': return "bg-blue-950/70 text-blue-300 border-blue-800/50"
    case 'Morosidad': return "bg-red-950/70 text-red-300 border-red-800/50"
    case 'Decisión Administrativa': return "bg-zinc-900/80 text-zinc-400 border-zinc-700/50"
    default: return "bg-zinc-800 text-zinc-400 border-zinc-700"
  }
}

/**
 * Strips dots, spaces, and dashes from raw DNI input before saving to database.
 */
export function cleanDNI(dni?: string | null): string {
  if (!dni) return ""
  const trimmed = dni.trim()
  if (trimmed.startsWith("TEMP") || trimmed.startsWith("PENDIENTE")) {
    return trimmed
  }
  return trimmed.replace(/[\.\s-]/g, "")
}

/**
 * Formats a clean DNI string into thousand separators with dots for display (e.g., 31092126 -> 31.092.126).
 * Leaves TEMP / PENDIENTE strings intact.
 */
export function formatDNI(dni?: string | null): string {
  if (!dni) return ""
  const trimmed = dni.trim()
  if (trimmed.startsWith("TEMP") || trimmed.startsWith("PENDIENTE")) {
    return trimmed
  }
  const cleanDigits = trimmed.replace(/\D/g, "")
  if (!cleanDigits) return trimmed
  return new Intl.NumberFormat("es-AR").format(Number(cleanDigits))
}
