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

  // 1. Check if paid March 2026 (or current month)
  // Re-alignment with user's specific request for March 2026 as the 'now' marker
  const paidCurrentMonth = (member.fees || []).some((f: any) => 
    f.periodMonth === currentMonth && 
    f.periodYear === currentYear && 
    f.paymentStatus === 'PAID'
  )

  if (paidCurrentMonth) {
    return 'AL DIA'
  }

  // Define the base tracking date (Jan 2025 as per previous requirements)
  const START_DATE = new Date(2025, 0, 1) // Jan 1, 2025
  const joinDate = member.joinDate ? new Date(member.joinDate) : START_DATE
  const trackFrom = joinDate > START_DATE ? joinDate : START_DATE
  
  // Calculate total months expected since start until current month
  const monthsExpected = (now.getFullYear() - trackFrom.getFullYear()) * 12 + (now.getMonth() - trackFrom.getMonth()) + 1
  
  // Count uniques paid months in the tracking period
  const paidMonthsCount = (member.fees || []).filter((f: any) => 
    f.paymentStatus === 'PAID' && 
    (f.periodYear > START_DATE.getFullYear() || (f.periodYear === START_DATE.getFullYear() && f.periodMonth >= START_DATE.getMonth() + 1))
  ).length

  const debtMonths = Math.max(0, monthsExpected - paidMonthsCount)

  // 2. EN MORA: Debt < 3 months
  if (debtMonths < 3) {
    return 'EN MORA'
  }

  // 3. Activity Check: Any activity in last 12 months (365 days)
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  const hasPaymentActivity = (member.fees || []).some((f: any) => 
    new Date(f.paymentDate) >= oneYearAgo
  )

  const hasEventActivity = (member.eventRegistrations || []).some((er: any) => 
    new Date(er.createdAt) >= oneYearAgo
  )

  const hasActivity = hasPaymentActivity || hasEventActivity

  // 4. Distinction between INACTIVO and SUSPENDIDO
  if (hasActivity) {
    return 'INACTIVO'
  } else {
    return 'SUSPENDIDO'
  }
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
