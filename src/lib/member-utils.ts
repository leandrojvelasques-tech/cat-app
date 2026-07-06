import { Member, MembershipFee, EventRegistration } from "@prisma/client"

export type CalculatedStatus = 'AL DIA' | 'EN MORA' | 'INACTIVO' | 'SUSPENDIDO' | 'BAJA'

/**
 * Calculates the current status of a member based on payment and activity history.
 * @param member Member object with fees and eventRegistrations included.
 * @param now Reference date (default current).
 */
export function calculateMemberStatus(member: any, now: Date = new Date()): CalculatedStatus {
  // If the manual status is already a terminal state, return BAJA
  if (["DECEASED", "RESIGNED", "ARCHIVED", "INACTIVE"].includes(member.status)) {
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

  // Calcular meses previos de referencia M1 (Mayo) y M2 (Abril)
  let monthM1 = referenceMonth - 1
  let yearM1 = referenceYear
  if (monthM1 === 0) {
    monthM1 = 12
    yearM1 = referenceYear - 1
  }

  let monthM2 = referenceMonth - 2
  let yearM2 = referenceYear
  if (monthM2 <= 0) {
    monthM2 = 12 + monthM2
    yearM2 = referenceYear - 1
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
  if (hasPaid(monthM1, yearM1) || hasPaid(monthM2, yearM2) || (debtMonths > 0 && debtMonths < 3)) {
    return 'EN MORA'
  }

  // 3. INACTIVO: Pagó al menos una cuota en 2026 (Enero, Febrero, Marzo)
  const hasPaidInReferenceYear = paidFees.some((f: any) => f.periodYear === referenceYear)
  if (hasPaidInReferenceYear) {
    return 'INACTIVO'
  }

  // 4. SUSPENDIDO: No registra ningún pago en 2026
  return 'SUSPENDIDO'
}

/**
 * Helper to get the Tailwind classes for a status badge.
 */
export function getStatusBadgeStyles(status: CalculatedStatus) {
  switch (status) {
    case 'AL DIA': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case 'EN MORA': return "bg-amber-500/10 text-amber-300 border-amber-500/20"
    case 'INACTIVO': return "bg-zinc-500/10 text-zinc-400 border-white/10"
    case 'SUSPENDIDO': return "bg-red-500/10 text-red-500 border-red-500/20"
    case 'BAJA': return "bg-zinc-900 text-zinc-600 border-zinc-800"
    default: return "bg-zinc-500/10 text-zinc-400 border-white/10"
  }
}
