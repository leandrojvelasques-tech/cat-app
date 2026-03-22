"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createMember(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const dni = formData.get("dni") as string
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

  // Dates
  const birthDate = birthDateStr ? new Date(birthDateStr) : null
  const joinDate = joinDateStr ? new Date(joinDateStr) : new Date()

  // Logic to get the next member number.
  const lastMember = await db.member.findFirst({
    orderBy: { memberNumber: "desc" },
  })
  
  const nextMemberNumber = lastMember && !isNaN(Number(lastMember.memberNumber))
    ? (Number(lastMember.memberNumber) + 1).toString()
    : "1000"

  await db.member.create({
    data: {
      memberNumber: nextMemberNumber,
      firstName,
      lastName,
      dni,
      email: email || null,
      phone: phone || null,
      city: city || null,
      address: address || null,
      status: status || "ACTIVE",
      type,
      notes,
      birthDate,
      joinDate,
      wantsMailing
    }
  })

  revalidatePath("/admin/socios")
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
  await db.member.update({
    where: { id: memberId },
    data: { 
      status,
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
