import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { EventForm } from "../../EventForm"

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await db.event.findUnique({
    where: { id }
  })

  if (!event) notFound()

  return <EventForm initialData={event} isEditing={true} />
}
