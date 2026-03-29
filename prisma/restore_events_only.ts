import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  console.log("Restoring main events...")

  const mainEvent = await prisma.event.upsert({
    where: { id: "main-event-cat" }, // I'll assign fixed IDs for upserting
    update: {},
    create: {
      id: "main-event-cat",
      title: "MILONGA CAT / SEMINARIO",
      startDate: new Date(2025, 8, 6),
      endDate: new Date(2025, 8, 6),
      location: "Sede Social CAT",
      description: "Profesores: Javier Rodriguez y Daniela Barria",
      status: "FINALIZADO",
      type: "BOTH",
      priceSocioMilonga: 12000,
    }
  });

  const attendance = [43, 58, 35, 78];
  for (let i = 0; i < 4; i++) {
    const fixedId = "milonga-km3-" + (i + 1)
    const ev = await prisma.event.upsert({
      where: { id: fixedId },
      update: {},
      create: {
        id: fixedId,
        title: `Milonga Mensual km3 - Edición $ {i+1}`,
        startDate: new Date(2025, 4 + i, 15),
        endDate: new Date(2025, 4 + i, 15),
        location: "Vecinal de km3",
        status: "FINALIZADO",
        type: "MILONGA",
        priceSocioMilonga: 8000,
        priceNonSocioMilonga: 10000,
      }
    });

    // Create attendees if they don't exist
    const count = await prisma.eventRegistration.count({ where: { eventId: ev.id } })
    if (count === 0) {
      console.log(`Creating $ {attendance[i]} attendees for $ {ev.title}...`)
      for (let j = 0; j < attendance[i]; j++) {
        await prisma.eventRegistration.create({
          data: {
            eventId: ev.id,
            firstName: "Asistente",
            lastName: `$ {j+1}`,
            amountPaid: j < attendance[i] / 2 ? 8000 : 10000,
            paymentStatus: "PAID",
            registrationType: "MILONGA",
            createdAt: ev.startDate
          }
        });
      }
    }
  }

  const eventAttendees = [
    { nombre: "DANIEL ARCRICH", monto: 59000, detalle: "Combo + milo", fecha: new Date(2025, 7, 21) },
    { nombre: "PAULA SANDOVAL", monto: 12000, detalle: "Clase 1", fecha: new Date(2025, 7, 29) },
    { nombre: "ESTEBAN LUCERO", monto: 30000, detalle: "Combo", fecha: new Date(2025, 7, 30) },
    { nombre: "CARLA CEJAS MAIDANA", monto: 36000, detalle: "Clase 1, 2 y 4", fecha: new Date(2025, 7, 31) },
    { nombre: "LOLA", monto: 31000, detalle: "Combo + milo", fecha: new Date(2025, 7, 31) },
    { nombre: "IVAN ROST", monto: 45000, detalle: "3 clases y 2 clases", fecha: new Date(2025, 8, 1) },
    { nombre: "KARINA THOMAS", monto: 30000, detalle: "Combo", fecha: new Date(2025, 8, 1) },
    { nombre: "LOURDES CARRIZO", monto: 28000, detalle: "3 clases", fecha: new Date(2025, 8, 1) },
    { nombre: "PATRICIA NAHUELQUIN", monto: 24000, detalle: "Clase 3 y 4", fecha: new Date(2025, 8, 1) },
    { nombre: "DIANA LORENZO", monto: 31000, detalle: "Combo + milo", fecha: new Date(2025, 8, 4) },
    { nombre: "MARCOS MARCIAL", monto: 47000, detalle: "Combo + milo", fecha: new Date(2025, 8, 4) },
    { nombre: "CAMILA ELLY", monto: 31000, detalle: "Combo + milo", fecha: new Date(2025, 8, 4) },
  ];

  const mainEventRegistrationCount = await prisma.eventRegistration.count({ where: { eventId: mainEvent.id } })
  if (mainEventRegistrationCount === 0) {
      console.log(`Creating attendees for main event...`)
      for (const att of eventAttendees) {
        const [lastName, ...firstNames] = att.nombre.split(" ");
        await prisma.eventRegistration.create({
          data: {
            eventId: mainEvent.id,
            firstName: firstNames.join(" ") || lastName,
            lastName: lastName,
            email: att.nombre.toLowerCase().replace(" ", ".") + "@gmail.com",
            amountPaid: att.monto,
            paymentStatus: "PAID",
            paymentMethod: "TRANSFERENCIA",
            registrationType: att.detalle,
            createdAt: att.fecha,
          }
        });
      }
  }

  console.log("✅ Event restoration finished.")
}
main().finally(() => prisma.$disconnect())
