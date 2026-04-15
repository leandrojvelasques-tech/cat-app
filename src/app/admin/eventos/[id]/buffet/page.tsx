import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { BuffetPOS } from "./BuffetPOS"

export default async function BuffetEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event, products] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.buffetProduct.findMany({ where: { active: true }, orderBy: [{ type: "asc" }, { name: "asc" }] })
  ])

  if (!event) notFound()

  const members = await db.member.findMany({
    select: { id: true, firstName: true, lastName: true, memberNumber: true },
    where: { status: "ACTIVE" },
    orderBy: { lastName: "asc" }
  })

  return <BuffetPOS event={event} products={products} members={members} />
}
