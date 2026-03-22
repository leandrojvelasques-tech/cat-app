"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createChampionship(year: number) {
  await db.championship.upsert({
    where: { year_name: { year, name: "Vientos de Tango" } },
    update: {},
    create: { year, name: "Vientos de Tango" }
  })
  revalidatePath("/admin/vientos-de-tango")
}

export async function addChampionshipResult(data: {
  championshipId: string
  category: string
  place: number
  firstName: string
  lastName: string
  partnerName?: string
  memberId?: string
}) {
  await db.championshipResult.create({
    data: {
      championshipId: data.championshipId,
      category: data.category,
      place: data.place,
      firstName: data.firstName,
      lastName: data.lastName,
      partnerName: data.partnerName,
      memberId: data.memberId || null
    }
  })
  revalidatePath("/admin/vientos-de-tango")
  if (data.memberId) {
     revalidatePath(`/admin/socios/${data.memberId}`)
     revalidatePath("/socios")
  }
}

export async function deleteChampionshipResult(id: string) {
  const result = await db.championshipResult.delete({
    where: { id }
  })
  revalidatePath("/admin/vientos-de-tango")
  if (result.memberId) {
     revalidatePath(`/admin/socios/${result.memberId}`)
     revalidatePath("/socios")
  }
}
export async function updateChampionshipResult(id: string, data: {
  championshipId?: string
  category?: string
  place?: number
  firstName?: string
  lastName?: string
  partnerName?: string
  memberId?: string | null
}) {
  const result = await db.championshipResult.update({
    where: { id },
    data: {
      championshipId: data.championshipId,
      category: data.category,
      place: data.place,
      firstName: data.firstName,
      lastName: data.lastName,
      partnerName: data.partnerName,
      memberId: data.memberId === undefined ? undefined : data.memberId
    }
  })
  revalidatePath("/admin/vientos-de-tango")
  if (result.memberId) {
     revalidatePath(`/admin/socios/${result.memberId}`)
     revalidatePath("/socios")
  }
}

export async function linkChampionshipResult(resultId: string, memberId: string | null) {
  const result = await db.championshipResult.update({
    where: { id: resultId },
    data: { memberId }
  })
  revalidatePath("/admin/vientos-de-tango")
  if (memberId) {
     revalidatePath(`/admin/socios/${memberId}`)
     revalidatePath("/socios")
  }
}
