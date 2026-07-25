"use server"

import { db } from "@/lib/db"
import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { sendEnrollmentSubmittedEmail, sendNewEnrollmentAlertToBoard } from "@/lib/emails"

export async function submitEnrollmentRequest(formData: FormData) {
  try {
    const firstName = (formData.get("firstName") as string || "").trim()
    const lastName = (formData.get("lastName") as string || "").trim()
    const email = (formData.get("email") as string || "").toLowerCase().trim()
    const phone = (formData.get("phone") as string || "").trim()
    const dni = (formData.get("dni") as string || "").replace(/[^0-9]/g, "") // DNI limpio, solo números
    const birthDateStr = formData.get("birthDate") as string
    const address = (formData.get("address") as string || "").trim()
    const comment = (formData.get("comment") as string || "").trim()
    const file = formData.get("paymentProof") as File | null

    if (!firstName || !lastName || !email || !phone || !dni || !birthDateStr || !address || !file || file.size === 0) {
      return { success: false, error: "Todos los campos obligatorios (*) y el comprobante de pago son necesarios." }
    }

    // 1. Verificar si ya existe un socio con este DNI
    const existingMember = await db.member.findUnique({
      where: { dni }
    })
    if (existingMember) {
      return { success: false, error: "Ya existe un socio registrado en el padrón con este DNI." }
    }

    // 2. Verificar si ya existe una solicitud pendiente para este DNI
    const existingRequest = await db.enrollmentRequest.findFirst({
      where: {
        dni,
        status: "PENDING"
      }
    })
    if (existingRequest) {
      return { success: false, error: "Ya tenés una solicitud de inscripción pendiente en proceso. Te notificaremos por email." }
    }

    // 3. Procesar carga de comprobante de pago
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Nombre de archivo único
    const fileExtension = file.name.split('.').pop() || 'png'
    const uniqueName = `recibo-alta-${dni}-${Date.now()}.${fileExtension}`
    const filepath = join(uploadDir, uniqueName)
    
    // Guardar en disco local
    writeFileSync(filepath, buffer)
    const paymentProofUrl = `/uploads/${uniqueName}`

    // 4. Crear solicitud en la base de datos
    const request = await db.enrollmentRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dni,
        birthDate: new Date(birthDateStr),
        address,
        comment: comment || null,
        paymentProofUrl,
        status: "PENDING"
      }
    })

    // 5. Enviar notificaciones por correo de forma asíncrona (sin bloquear respuesta)
    // Confirmación al solicitante
    sendEnrollmentSubmittedEmail({
      firstName,
      lastName,
      email
    }).catch(err => console.error("Error al enviar email de confirmación de solicitud:", err))

    // Alerta al tesorero
    sendNewEnrollmentAlertToBoard({
      firstName,
      lastName,
      DNI: dni
    }).catch(err => console.error("Error al enviar alerta de solicitud al tesorero:", err))

    return { success: true }

  } catch (e: any) {
    console.error("Error al procesar solicitud de inscripción:", e)
    return { success: false, error: "Ocurrió un error inesperado al procesar la inscripción. Por favor intentá de nuevo." }
  }
}

import bcrypt from "bcrypt"
import { sendEnrollmentApprovedEmail } from "@/lib/emails"
import { revalidatePath } from "next/cache"

export async function approveEnrollmentRequest(requestId: string) {
  try {
    const request = await db.enrollmentRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.status !== "PENDING") {
      return { success: false, error: "La solicitud no existe o ya fue procesada." }
    }

    // 1. Verificar si ya existe un socio con este DNI
    const existingDni = await db.member.findUnique({
      where: { dni: request.dni }
    })
    if (existingDni) {
      return { success: false, error: "Ya existe un socio registrado en el padrón con el DNI de esta solicitud." }
    }

    // 2. Verificar si ya existe un usuario con este correo para evitar colisión de unique constraint
    const existingUser = await db.user.findUnique({
      where: { email: request.email }
    })

    // 3. Calcular número correlativo correcto
    const allMembers = await db.member.findMany({ select: { memberNumber: true } })
    const numbers = allMembers
      .map(m => Number(m.memberNumber))
      .filter(n => !isNaN(n))
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 999
    const nextMemberNumber = (maxNumber + 1).toString()

    // 4. Crear contraseña temporal y hash
    const tempPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    let createdMember: any = null
    let createdUser: any = null

    // 5. Crear/actualizar usuario y socio en una transacción
    await db.$transaction(async (tx) => {
      let user;
      if (existingUser) {
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role: "MEMBER",
            name: `${request.firstName} ${request.lastName}`,
            passwordHash
          }
        })
      } else {
        user = await tx.user.create({
          data: {
            email: request.email,
            name: `${request.firstName} ${request.lastName}`,
            passwordHash,
            role: "MEMBER",
            isBoardMember: false
          }
        })
      }

      const member = await tx.member.create({
        data: {
          memberNumber: nextMemberNumber,
          firstName: request.firstName,
          lastName: request.lastName,
          dni: request.dni,
          email: request.email,
          phone: request.phone,
          birthDate: request.birthDate,
          address: request.address,
          status: "ACTIVE",
          type: "ACTIVO",
          userId: user.id
        }
      })

      // Registrar primer pago ficticio para la cuota 1
      await tx.membershipFee.create({
        data: {
          memberId: member.id,
          periodYear: new Date().getFullYear(),
          periodMonth: new Date().getMonth() + 1,
          amountDue: 10000,
          amountPaid: 10000,
          paymentDate: new Date(),
          paymentMethod: "TRANSFER",
          paymentStatus: "PAID",
          notes: `[ALTA DE SOCIO] Comprobante verificado: ${request.paymentProofUrl}`
        }
      })

      await tx.enrollmentRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      })

      createdMember = member
      createdUser = user
    })

    // Enviar email de bienvenida al nuevo socio de forma asíncrona (fuera de la transacción)
    if (createdMember && createdUser) {
      sendEnrollmentApprovedEmail(createdMember, createdUser, tempPassword)
        .catch(err => console.error("Error al enviar email de alta de socio:", err))
    }

    revalidatePath("/admin/solicitudes")
    revalidatePath("/admin/socios")
    revalidatePath("/admin")
    return { success: true }

  } catch (e: any) {
    console.error("Error al aprobar solicitud de inscripción:", e)
    return { success: false, error: "Error interno al procesar la aprobación." }
  }
}

export async function rejectEnrollmentRequest(requestId: string) {
  try {
    const request = await db.enrollmentRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.status !== "PENDING") {
      return { success: false, error: "La solicitud no existe o ya fue procesada." }
    }

    await db.enrollmentRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    })

    revalidatePath("/admin/solicitudes")
    return { success: true }
  } catch (e: any) {
    console.error("Error al rechazar solicitud:", e)
    return { success: false, error: "Error al rechazar la solicitud." }
  }
}
