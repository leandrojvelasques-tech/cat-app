"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cleanDNI } from "@/lib/member-utils"
import { auth } from "@/auth"
import bcrypt from "bcrypt"
import { sendTemporaryMemberAccessEmail } from "@/lib/emails"
import { generateTemporaryPassword } from "@/lib/temporary-password"

const MEMBER_MANAGEMENT_ROLES = ["ADMIN", "BOARD", "SUPERADMIN", "COLLABORATOR"]

export async function getNextMemberNumberInfo() {
  const allMembers = await db.member.findMany({ select: { memberNumber: true } })
  const maxNumber = allMembers
    .map(m => Number(m.memberNumber))
    .filter(n => !isNaN(n))
    .reduce((max, cur) => (cur > max ? cur : max), 0)
  return (maxNumber + 1).toString()
}

export async function checkMemberDuplicate(dniRaw?: string, emailRaw?: string, excludeId?: string) {
  const dni = cleanDNI(dniRaw)
  const email = emailRaw ? emailRaw.trim().toLowerCase() : ""

  let duplicateDniMember = null
  let duplicateEmailMember = null

  if (dni && dni.length > 0) {
    duplicateDniMember = await db.member.findFirst({
      where: {
        dni,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: {
        id: true,
        memberNumber: true,
        firstName: true,
        lastName: true,
        dni: true
      }
    })
  }

  if (email && email.length > 0) {
    duplicateEmailMember = await db.member.findFirst({
      where: {
        email,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: {
        id: true,
        memberNumber: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })
  }

  return {
    duplicateDniMember,
    duplicateEmailMember
  }
}

export async function createMember(formData: FormData) {
  const session = await auth()
  if (!session?.user || !MEMBER_MANAGEMENT_ROLES.includes(session.user.role)) {
    throw new Error("No autorizado")
  }

  const firstNameRaw = formData.get("firstName") as string
  const lastNameRaw = formData.get("lastName") as string
  const dniRaw = formData.get("dni") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const city = formData.get("city") as string
  const address = formData.get("address") as string
  const status = formData.get("status") as string
  const type = formData.get("type") as string || "ACTIVO"
  const notes = formData.get("notes") as string
  const birthDateStr = formData.get("birthDate") as string
  const joinDateStr = formData.get("joinDate") as string
  const wantsMailing = formData.get("wantsMailing") === "on"

  const firstName = firstNameRaw ? firstNameRaw.trim().toUpperCase() : ""
  const lastName = lastNameRaw ? lastNameRaw.trim().toUpperCase() : ""
  const dni = cleanDNI(dniRaw)
  const normalizedEmail = email ? email.trim().toLowerCase() : ""

  // Dates
  const birthDate = birthDateStr ? new Date(birthDateStr) : null
  const joinDate = joinDateStr ? new Date(joinDateStr) : new Date()

  // Logic to get the next member number correctly (numeric max).
  const allMembers = await db.member.findMany({ select: { memberNumber: true } })
  const maxNumber = allMembers
    .map(m => Number(m.memberNumber))
    .filter(n => !isNaN(n))
    .reduce((max, cur) => (cur > max ? cur : max), 0)
  
  const nextMemberNumber = (maxNumber + 1).toString()

  // DNI & Email Uniqueness Validation
  if (dni && dni.length > 0) {
    const existingDni = await db.member.findFirst({ where: { dni } })
    if (existingDni) {
      throw new Error("Ya existe un socio registrado con este DNI.")
    }
  }

  if (normalizedEmail) {
    const existingEmail = await db.member.findFirst({ where: { email: normalizedEmail } })
    if (existingEmail) {
      throw new Error("Ya existe un socio registrado con este correo electrónico.")
    }

    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      throw new Error("Ya existe una cuenta de acceso con este correo electrónico.")
    }
  }

  const temporaryPassword = normalizedEmail ? generateTemporaryPassword() : null
  const passwordHash = temporaryPassword ? await bcrypt.hash(temporaryPassword, 12) : null

  const { member, user } = await db.$transaction(async (tx) => {
    const createdUser = normalizedEmail && passwordHash
      ? await tx.user.create({
          data: {
            email: normalizedEmail,
            name: `${firstName} ${lastName}`,
            passwordHash,
            role: "MEMBER",
            mustChangePassword: true,
          },
          select: { id: true, email: true },
        })
      : null

    const createdMember = await tx.member.create({
      data: {
        memberNumber: nextMemberNumber,
        firstName,
        lastName,
        dni,
        email: normalizedEmail || null,
        phone: phone || null,
        city: city || null,
        address: address || null,
        status: status || "ACTIVE",
        type,
        notes,
        birthDate,
        joinDate,
        wantsMailing,
        userId: createdUser?.id || null,
      },
      select: { id: true, firstName: true, lastName: true, email: true, memberNumber: true },
    })

    return { member: createdMember, user: createdUser }
  })

  if (user && temporaryPassword && member.email) {
    await sendTemporaryMemberAccessEmail({ ...member, email: member.email }, user, temporaryPassword, session.user.email || session.user.id)
      .catch((error) => console.error("No se pudo enviar el acceso inicial del socio:", error))
  }

  revalidatePath("/admin/socios")
  revalidatePath("/admin/estado-socios")
  redirect("/admin/socios")
}

export async function updateMemberDiscount(memberId: string, isFamilyDiscount: boolean, partnerId?: string) {
  // Update the current member
  await db.member.update({
    where: { id: memberId },
    data: { 
      isFamilyDiscount,
      partnerId: partnerId || null
    }
  })
  
  // Symmetrically update the partner if specified
  if (partnerId && isFamilyDiscount) {
     await db.member.update({
       where: { id: partnerId },
       data: { 
          isFamilyDiscount: true,
          partnerId: memberId
       }
     })
     revalidatePath(`/admin/socios/${partnerId}`)
  } else if (!isFamilyDiscount && partnerId) {
     // If discount is removed, also remove from previous partner if they were linked
     await db.member.update({
       where: { id: partnerId },
       data: { 
          isFamilyDiscount: false,
          partnerId: null
       }
     })
     revalidatePath(`/admin/socios/${partnerId}`)
  }

  revalidatePath(`/admin/socios/${memberId}`)
  return { success: true }
}

export async function changeMemberStatus(memberId: string, status: string) {
  await db.member.update({
    where: { id: memberId },
    data: { status }
  })
  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/admin/socios")
  revalidatePath("/admin/archivo")
}

export async function deactivateMember(memberId: string, status: string, notes?: string) {
  if (!['RESIGNED', 'DECEASED', 'ADMINISTRATIVE'].includes(status)) {
    throw new Error("El motivo de baja no es válido.")
  }
  const bajaReason = status === "DECEASED" ? "FALLECIMIENTO" : status === "ADMINISTRATIVE" ? "BAJA_ADMINISTRATIVA" : "RENUNCIA"
  await db.member.update({
    where: { id: memberId },
    data: { 
      status: "BAJA",
      bajaReason,
      debtStatus: "AL DIA",
      type: "ACTIVO",
      notes: notes ? `BAJA (${new Date().toLocaleDateString()}): ${notes}` : undefined
    }
  })
  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/admin/socios")
  revalidatePath("/admin/archivo")
  redirect("/admin/archivo")
}

export async function sendCommunication(data: {
  memberId: string
  type: string
  subject: string
  content: string
  channel: string
}) {
  // Record in database
  const communication = await db.communication.create({
    data: {
      memberId: data.memberId,
      type: data.type,
      subject: data.subject,
      content: data.content,
      channel: data.channel,
      status: "SENT",
    }
  })

  // Trigger n8n webhook if configured
  const n8nWebhook = process.env.N8N_WELCOME_WEBHOOK_URL
  if (n8nWebhook) {
     try {
       await fetch(n8nWebhook, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            communicationId: communication.id,
            ...data
         })
       })
     } catch (e) {
       console.error("Failed to trigger n8n webhook", e)
     }
  }

  revalidatePath(`/admin/socios/${data.memberId}`)
  return communication
}
export async function updateMemberAvatar(memberId: string, avatarUrl: string | null) {
  await db.member.update({
    where: { id: memberId },
    data: { avatarUrl }
  })
  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/admin/socios")
  return { success: true }
}

export async function updateMember(id: string, formData: FormData) {
  const firstNameRaw = formData.get("firstName") as string
  const lastNameRaw = formData.get("lastName") as string
  const dniRaw = formData.get("dni") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const city = formData.get("city") as string
  const address = formData.get("address") as string
  const societaryStatus = formData.get("societaryStatus") as string
  const bajaReason = formData.get("bajaReason") as string
  const debtStatus = formData.get("debtStatus") as string
  const isHonorary = societaryStatus === "HONORARIO"
  const isBaja = societaryStatus === "BAJA"

  if (!['ACTIVO', 'HONORARIO', 'BAJA'].includes(societaryStatus)) {
    throw new Error("Estado societario inválido.")
  }
  if (isBaja && !['RENUNCIA', 'FALLECIMIENTO', 'BAJA_ADMINISTRATIVA'].includes(bajaReason)) {
    throw new Error("Una baja debe tener un motivo válido.")
  }
  if (!isBaja && !isHonorary && !['AL DIA', 'EN MORA', 'SUSPENDIDO'].includes(debtStatus)) {
    throw new Error("Estado de deuda inválido.")
  }
  const notes = formData.get("notes") as string
  const birthDateStr = formData.get("birthDate") as string
  const joinDateStr = formData.get("joinDate") as string
  const honoraryAppointmentDateStr = formData.get("honoraryAppointmentDate") as string
  const honoraryReason = (formData.get("honoraryReason") as string | null) || ""
  const honorarySummary = (formData.get("honorarySummary") as string | null) || ""
  const wantsMailing = formData.get("wantsMailing") === "on"
  const avatarUrl = formData.get("avatarUrl") as string

  const firstName = firstNameRaw ? firstNameRaw.trim().toUpperCase() : ""
  const lastName = lastNameRaw ? lastNameRaw.trim().toUpperCase() : ""
  const dni = cleanDNI(dniRaw)

  // Dates
  const birthDate = birthDateStr ? new Date(birthDateStr) : null
  const joinDate = joinDateStr ? new Date(joinDateStr) : new Date()
  const honoraryAppointmentDate = honoraryAppointmentDateStr ? new Date(honoraryAppointmentDateStr) : null

  if (isHonorary && !honoraryReason?.trim()) {
    throw new Error("Un socio honorario debe tener registrado el motivo de su nombramiento.")
  }

  // DNI & Email Uniqueness Validation
  if (dni && dni.length > 0) {
    const existingDni = await db.member.findFirst({
      where: { dni, NOT: { id } }
    })
    if (existingDni) {
      throw new Error("Ya existe otro socio registrado con este DNI.")
    }
  }

  if (email && email.trim().length > 0) {
    const existingEmail = await db.member.findFirst({
      where: { email: email.trim().toLowerCase(), NOT: { id } }
    })
    if (existingEmail) {
      throw new Error("Ya existe otro socio registrado con este correo electrónico.")
    }
  }

  await db.member.update({
    where: { id },
    data: {
      firstName,
      lastName,
      dni,
      email: email ? email.trim().toLowerCase() : null,
      phone: phone || null,
      city: city || null,
      address: address || null,
      status: isBaja ? "BAJA" : "ACTIVE",
      bajaReason: isBaja ? bajaReason : null,
      debtStatus: isBaja || isHonorary ? "AL DIA" : debtStatus,
      type: isHonorary ? "HONORARIO" : "ACTIVO",
      honoraryAppointmentDate: isHonorary ? honoraryAppointmentDate : null,
      honoraryReason: isHonorary ? honoraryReason.trim() : null,
      honorarySummary: isHonorary ? honorarySummary.trim() : null,
      notes: isHonorary ? null : notes,
      birthDate,
      joinDate,
      wantsMailing: isHonorary ? false : wantsMailing,
      avatarUrl: avatarUrl || null
    }
  })

  revalidatePath(`/admin/socios/${id}`)
  revalidatePath("/admin/socios")
  revalidatePath("/socios-honorarios")
  redirect(`/admin/socios/${id}`)
}
export async function updateMemberProfile(memberId: string, formData: FormData) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) throw new Error("No autorizado")

  // Verify the user owns this member record
  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { userId: true }
  })

  if (!member || member.userId !== session.user.id) {
    throw new Error("No tiene permisos para editar este perfil")
  }

  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const avatarUrl = formData.get("avatarUrl") as string
  const password = formData.get("password") as string

  // Actualizar datos del socio
  await db.member.update({
    where: { id: memberId },
    data: {
      email: email || null,
      phone: phone || null,
      avatarUrl: avatarUrl || null
    }
  })

  // Si se ingresó una nueva contraseña, actualizarla en el modelo User
  if (password && password.trim().length > 0) {
    const passwordHash = await bcrypt.hash(password, 10)
    await db.user.update({
      where: { id: member.userId },
      data: { passwordHash }
    })
  }

  revalidatePath("/socios")
  return { success: true }
}

export async function nombrarSocioHonorario(memberId: string, reason: string, honorarioDateStr?: string) {
  const session = await auth()
  if (!session?.user || !MEMBER_MANAGEMENT_ROLES.includes(session.user.role)) {
    throw new Error("No autorizado")
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error("Debe proporcionar el motivo de la designación como Socio Honorario.")
  }

  const dateStr = honorarioDateStr 
    ? new Date(honorarioDateStr).toLocaleDateString("es-AR")
    : new Date().toLocaleDateString("es-AR")

  const noteText = `SOCIO HONORARIO (Nombrado el ${dateStr}): ${reason.trim()}`

  const existingMember = await db.member.findUnique({
    where: { id: memberId },
    select: { notes: true }
  })

  const updatedNotes = existingMember?.notes 
    ? `${noteText}\n\n${existingMember.notes}`
    : noteText

  await db.member.update({
    where: { id: memberId },
    data: {
      type: "HONORARIO",
      notes: updatedNotes,
      honoraryReason: reason.trim(),
      honoraryAppointmentDate: honorarioDateStr ? new Date(`${honorarioDateStr}T12:00:00`) : new Date()
    }
  })

  // Auditoría en Comunicaciones
  await db.communication.create({
    data: {
      memberId,
      type: "GENERAL",
      subject: "Designación como Socio Honorario",
      content: noteText,
      channel: "MANUAL",
      status: "SENT"
    }
  })

  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/admin/socios")
  revalidatePath("/socios-honorarios")
  return { success: true }
}
