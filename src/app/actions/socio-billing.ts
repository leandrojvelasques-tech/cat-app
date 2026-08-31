"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { validateAndSanitizeFile } from "@/lib/security-utils"
import { sendFeePaymentPendingEmail } from "@/lib/emails"
import { getMemberDebt } from "./billing"

export async function submitSocioPaymentProof(formData: FormData) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return { success: false, error: "No autorizado. Inicie sesión nuevamente." }
    }

    const memberId = formData.get("memberId") as string
    const selectedMonthsStr = formData.get("selectedMonths") as string
    const paymentMethod = (formData.get("paymentMethod") as string) || "TRANSFER"
    const userNotes = (formData.get("notes") as string) || ""
    const file = formData.get("paymentProof") as File | null

    if (!memberId || !selectedMonthsStr) {
      return { success: false, error: "Faltan datos obligatorios para el registro de pago." }
    }

    // Check if the current user owns this member record or is admin
    const userMember = await db.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        memberNumber: true,
        type: true
      }
    })

    if (!userMember) {
      return { success: false, error: "Ficha de socio no encontrada." }
    }

    if (userMember.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "No tiene permisos para modificar este estado de cuenta." }
    }

    let selectedMonths: { year: number; month: number; amount: number }[] = []
    try {
      selectedMonths = JSON.parse(selectedMonthsStr)
    } catch {
      return { success: false, error: "Formato de meses inválido." }
    }

    if (!selectedMonths || selectedMonths.length === 0) {
      return { success: false, error: "Debe seleccionar al menos una cuota a abonar." }
    }

    if (!Array.isArray(selectedMonths) || selectedMonths.some(item =>
      !item || !Number.isInteger(item.year) || !Number.isInteger(item.month)
    )) {
      return { success: false, error: "Formato de cuotas inválido." }
    }

    const debtData = await getMemberDebt(memberId, { includeUpcoming: true })
    const debtKeys = debtData.months.map(period => `${period.year}-${period.month}`)
    const selectedKeys = selectedMonths.map(item => `${item.year}-${item.month}`)
    const selectedIndexes = selectedKeys.map(key => debtKeys.indexOf(key))
    const hasInvalidPeriod = selectedIndexes.some(index => index < 0)
    const isContinuousSelection = selectedIndexes.every((index, position) => index === position)

    if (hasInvalidPeriod || !isContinuousSelection) {
      return {
        success: false,
        error: "Debe pagar las cuotas pendientes en orden antes de adelantar meses."
      }
    }

    const debtByPeriod = new Map(
      debtData.months.map(period => [`${period.year}-${period.month}`, period])
    )
    selectedMonths = selectedMonths.map(item => ({
      ...item,
      amount: debtByPeriod.get(`${item.year}-${item.month}`)!.amount
    }))
    const isSuspensionRegularization = debtData.months[0]?.isSuspensionRegularization === true

    let paymentProofUrl: string | null = null
    if (file && file.size > 0) {
      if (file.size > 1024 * 1024 * 5) { // 5MB
        return { success: false, error: "El comprobante es demasiado grande. Máximo 5MB." }
      }
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const validation = await validateAndSanitizeFile(buffer, file.type)
      if (!validation.isValid) {
        return { success: false, error: validation.error || "Formato de comprobante no válido por seguridad." }
      }

      // Vercel's serverless filesystem is read-only. Store the validated file
      // inline so the proof remains available to the member and treasury views.
      paymentProofUrl = `data:${validation.mimeType};base64,${buffer.toString("base64")}`
    }

    const regularizationNote = isSuspensionRegularization ? "[REGULARIZACION_SUSPENDIDO]\n" : ""
    const proofNote = paymentProofUrl
      ? `${regularizationNote}[COMPROBANTE SOCIO VERIFICACIÓN: ${paymentProofUrl}]\n${userNotes}`
      : `${regularizationNote}${userNotes}`

    // Record fee payment intentions for verification
    for (const item of selectedMonths) {
      await db.membershipFee.upsert({
        where: {
          memberId_periodYear_periodMonth: {
            memberId,
            periodYear: item.year,
            periodMonth: item.month
          }
        },
        update: {
          amountDue: item.amount,
          amountPaid: item.amount,
          paymentStatus: "PENDING",
          paymentMethod,
          paymentDate: new Date(),
          notes: proofNote,
          recordedById: session.user.id
        },
        create: {
          memberId,
          periodYear: item.year,
          periodMonth: item.month,
          amountDue: item.amount,
          amountPaid: item.amount,
          paymentStatus: "PENDING",
          paymentMethod,
          paymentDate: new Date(),
          notes: proofNote,
          recordedById: session.user.id
        }
      })
    }

    // Enviar email de acuse de recibo de comprobante al socio
    try {
      const fullMember = await db.member.findUnique({
        where: { id: memberId },
        select: { id: true, firstName: true, lastName: true, email: true }
      })
      if (fullMember && fullMember.email) {
        await sendFeePaymentPendingEmail(fullMember, selectedMonths.length)
          .catch(err => console.error("Error al enviar acuse de recibo de cuota al socio:", err))
      }
    } catch (emailErr) {
      console.error("Error obteniendo datos del socio para acuse de recibo:", emailErr)
    }

    revalidatePath("/socios")
    revalidatePath("/admin/cuotas")
    revalidatePath(`/admin/socios/${memberId}`)

    return {
      success: true,
      message: "¡Comprobante enviado con éxito! Tu pago fue registrado para la verificación de Tesorería."
    }
  } catch (err: any) {
    console.error("Error en submitSocioPaymentProof:", err)
    return { success: false, error: err?.message || "Ocurrió un error inesperado al procesar el pago." }
  }
}
