"use server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addBoardHistory(data: {
  memberId: string
  position: string
  periodStart: string
  periodEnd?: string
  notes?: string
}) {
  await db.boardHistory.create({
    data: {
      memberId: data.memberId,
      position: data.position,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      notes: data.notes
    }
  })
  revalidatePath(`/admin/socios/${data.memberId}`)
  revalidatePath("/socios")
}

export async function deleteBoardHistory(id: string, memberId: string) {
  await db.boardHistory.delete({
    where: { id }
  })
  revalidatePath(`/admin/socios/${memberId}`)
  revalidatePath("/socios")
}
