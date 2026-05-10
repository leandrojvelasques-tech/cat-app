"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createBuffetProduct(formData: FormData) {
  const name = formData.get("name") as string
  const brand = formData.get("brand") as string
  const size = formData.get("size") as string
  const price = parseFloat(formData.get("price") as string) || 0
  const type = formData.get("type") as string
  const active = formData.get("active") === "on"

  await db.buffetProduct.create({
    data: {
      name,
      brand,
      size,
      price,
      type,
      active
    }
  })

  revalidatePath("/admin/buffet")
  redirect("/admin/buffet")
}

export async function updateBuffetProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const brand = formData.get("brand") as string
  const size = formData.get("size") as string
  const price = parseFloat(formData.get("price") as string) || 0
  const type = formData.get("type") as string
  const active = formData.get("active") === "on"

  await db.buffetProduct.update({
    where: { id },
    data: {
      name,
      brand,
      size,
      price,
      type,
      active
    }
  })

  revalidatePath("/admin/buffet")
  redirect("/admin/buffet")
}

export async function registerBuffetSale({
  eventId,
  items,
  amountTotal,
  amountPaid,
  paymentMethod,
  buyerName,
  buyerId
}: {
  eventId: string
  items: { productId: string; quantity: number; priceAtSale: number }[]
  amountTotal: number
  amountPaid: number
  paymentMethod: string
  buyerName?: string
  buyerId?: string
}) {
  await db.buffetSale.create({
    data: {
      event: { connect: { id: eventId } },
      amountTotal,
      amountPaid,
      paymentMethod,
      buyerName: buyerName || null,
      buyer: buyerId ? { connect: { id: buyerId } } : undefined,
      items: {
        create: items.map(item => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          priceAtSale: item.priceAtSale
        }))
      }
    }
  })

  revalidatePath(`/admin/eventos/${eventId}/buffet`)
  revalidatePath(`/admin/eventos/${eventId}/caja`)
}

export async function openBuffetCashRegister(eventId: string, openingBalance: number) {
  await db.buffetCashRegister.create({
    data: {
      eventId,
      openingBalance,
      status: "OPEN"
    }
  })
  revalidatePath(`/admin/eventos/${eventId}/buffet`)
}

export async function addBuffetWithdrawal(registerId: string, eventId: string, amount: number, reason: string) {
  await db.buffetCashWithdrawal.create({
    data: {
      registerId,
      amount,
      reason
    }
  })
  revalidatePath(`/admin/eventos/${eventId}/buffet`)
}

export async function closeBuffetCashRegister(registerId: string, eventId: string, closingBalance: number, observations?: string) {
  const register = await db.buffetCashRegister.findUnique({
    where: { id: registerId },
    include: { event: true }
  })

  if (!register) throw new Error("Caja no encontrada")

  // Actualizar registro de caja
  await db.buffetCashRegister.update({
    where: { id: registerId },
    data: {
      closingBalance,
      observations,
      status: "CLOSED",
      closedAt: new Date()
    }
  })

  // Volcado a Cobranzas (como EventRegistration especial)
  // Nota: amountPaid es el balance final (efectivo real recaudado)
  await db.eventRegistration.create({
    data: {
      eventId,
      firstName: "RECAUDACIÓN",
      lastName: "BUFFET",
      amountPaid: closingBalance,
      registrationType: "BUFFET",
      paymentStatus: "PAID",
      paymentMethod: "EFECTIVO",
      source: "MANAGEMENT"
    }
  })

  revalidatePath(`/admin/eventos/${eventId}/buffet`)
  revalidatePath(`/admin/cuotas`)
}
