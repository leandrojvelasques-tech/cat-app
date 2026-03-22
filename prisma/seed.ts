import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database... (Total Cleanup)");
  await prisma.membershipFee.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany({ where: { email: { not: "admin@centroamigosdeltango.com" } } });

  const adminPassword = await bcrypt.hash("TangoAdmin2026!", 10);

  // List of Board Members from user request
  const boardMembers = [
    { email: "dolores.moron@centroamigosdeltango.com", firstName: "Dolores", lastName: "Moron", position: "Presidente" },
    { email: "federico.riquelme@centroamigosdeltango.com", firstName: "Federico", lastName: "Riquelme", position: "Vice Presidente" },
    { email: "camila.elly@centroamigosdeltango.com", firstName: "Camila", lastName: "Elly", position: "Secretaria" },
    { email: "alberto.baldini@centroamigosdeltango.com", firstName: "Alberto", lastName: "Baldini", position: "Tesorero" },
    { email: "barbara.morales@centroamigosdeltango.com", firstName: "Bárbara", lastName: "Morales", position: "1er Vocal" },
    { email: "diana.lorenzo@centroamigosdeltango.com", firstName: "Diana", lastName: "Lorenzo", position: "2do Vocal" },
    { email: "laura.marinelli@centroamigosdeltango.com", firstName: "Laura", lastName: "Marinelli", position: "3er Vocal" },
    { email: "sergio.lopez@centroamigosdeltango.com", firstName: "Sergio", lastName: "López", position: "1er Vocal Suplente" },
    { email: "pablo.correia@centroamigosdeltango.com", firstName: "Pablo", lastName: "Correia", position: "2do Vocal Suplente" },
  ];

  console.log("Seeding board members...");
  for (const board of boardMembers) {
    await prisma.user.upsert({
      where: { email: board.email },
      update: {
        passwordHash: adminPassword,
        role: "BOARD",
        position: board.position,
        isBoardMember: true,
        name: `${board.firstName} ${board.lastName}`,
      },
      create: {
        email: board.email,
        passwordHash: adminPassword,
        role: "BOARD",
        position: board.position,
        isBoardMember: true,
        name: `${board.firstName} ${board.lastName}`,
      },
    });
  }

  // Admin (generic check)
  await prisma.user.upsert({
    where: { email: "admin@centroamigosdeltango.com" },
    update: { passwordHash: adminPassword, name: "SuperAdmin" },
    create: {
      email: "admin@centroamigosdeltango.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      name: "SuperAdmin",
    },
  });

  // List of real members from images
  const members = [
    { nro: 115, nombre: "ACOSTA NESTOR", activos: 1 },
    { nro: 999, nombre: "AGUIRRE MAGALI CELESTE", activos: 1 },
    { nro: 422, nombre: "ALCARAZ VICTOR DAMIAN", activos: 1 },
    { nro: 302, nombre: "ANDRADA MARCELA", activos: 1 },
    { nro: 999, nombre: "ANTUNEZ CLAUDIA & LORENA", activos: 1 },
    { nro: 347, nombre: "ARRATIA MAXIMILIANO", activos: 1 },
    { nro: 999, nombre: "AZCONA MARCELA GLADYS", activos: 1 },
    { nro: 130, nombre: "BALDINI ALBERTO JAVIER", activos: 1 },
    { nro: 300, nombre: "BARRIA GERONIMO", activos: 1 },
    { nro: 999, nombre: "BARRIA ISOLDA", activos: 1 },
    { nro: 999, nombre: "BASUALDO TIARA", activos: 1 },
    { nro: 999, nombre: "CABRERA LILIANA", activos: 1 },
    { nro: 999, nombre: "CABRERA SONIA", activos: 1 },
    { nro: 999, nombre: "CARRIZO LOURDES", activos: 1 },
    { nro: 103, nombre: "CATTO CARLOS ALBERTO", activos: 1 },
    { nro: 999, nombre: "CERATI CAROLINA", activos: 1 },
    { nro: 119, nombre: "CORREIA PABLO", activos: 1 },
    { nro: 430, nombre: "DAS NEVES GUERREIRO RICARDO", activos: 1 },
    { nro: 124, nombre: "DIAZ REARNE LILIANA", activos: 1 },
    { nro: 999, nombre: "DIAZ VIRGINIA CELESTE", activos: 1 },
    { nro: 999, nombre: "DIAZ MARGOT MARIA", activos: 1 },
    { nro: 268, nombre: "EFTIMOFF ROBERTO", activos: 1 },
    { nro: 408, nombre: "ELLY CAMILA", activos: 1 },
    { nro: 399, nombre: "ESANS MAURO", activos: 1 },
    { nro: 332, nombre: "ESPOSITO MARTA", activos: 1 },
    { nro: 999, nombre: "FERREL MARIELA", activos: 0 },
    { nro: 999, nombre: "GALLEGOS SERGIO DIEGO", activos: 1 },
    { nro: 999, nombre: "GARCIA SOFIA", activos: 1 },
    { nro: 999, nombre: "GARRIDO ARACELI", activos: 1 },
    { nro: 999, nombre: "GOMEZ JAVIER ANGEL", activos: 1 },
    { nro: 999, nombre: "HARO DELFINA", activos: 1 },
    { nro: 167, nombre: "HERNANDEZ LORELEY", activos: 1 },
    { nro: 999, nombre: "HERNANDEZ NATALIA SOLE", activos: 1 },
    { nro: 149, nombre: "HEREDIA MARIA ELENA", activos: 1 },
    { nro: 101, nombre: "HERRERA STELLA MARIS", activos: 1 },
    { nro: 349, nombre: "HUERTA REYNOSO ANDREA", activos: 1 },
    { nro: 201, nombre: "MARCELA", activos: 1 },
    { nro: 999, nombre: "LAGO GABRIELA", activos: 1 },
    { nro: 207, nombre: "LARROCA NORBERTO", activos: 1 },
    { nro: 999, nombre: "LESBETT CALLE V", activos: 1 },
    { nro: 999, nombre: "LOHR NORA MARTA", activos: 1 },
    { nro: 399, nombre: "LOPEZ MIGUEL ALFREDO", activos: 1 },
    { nro: 449, nombre: "LOPEZ SERGIO", activos: 1 },
    { nro: 999, nombre: "LORENZO DIANA", activos: 1 },
    { nro: 999, nombre: "LUCERO HUMBERTO", activos: 1 },
    { nro: 508, nombre: "LUNA NORA", activos: 1 },
    { nro: 399, nombre: "MARCIAL MARCIAL", activos: 1 },
    { nro: 205, nombre: "MATUS ALICIA", activos: 1 },
    { nro: 999, nombre: "MAURO MARIINKENKIOUS", activos: 1 },
    { nro: 999, nombre: "MAYORGA SANCHEZ ANGEL", activos: 1 },
    { nro: 227, nombre: "OSCAR (Arpillera)", activos: 1 },
    { nro: 999, nombre: "MENDOZA JULIAN", activos: 1 },
    { nro: 414, nombre: "MERCADO DIANA", activos: 1 },
    { nro: 35, nombre: "MOLINA GRACIELA", activos: 1 },
    { nro: 511, nombre: "MORALES BARBARA ELIZABETH", activos: 1 },
    { nro: 392, nombre: "MORONI NORBERTO", activos: 1 },
    { nro: 1, nombre: "MORON MARIA DOLORES", activos: 1 },
    { nro: 399, nombre: "MOYA MARCELA", activos: 1 },
    { nro: 999, nombre: "MUÑOZ ALBERTO", activos: 1 },
    { nro: 999, nombre: "MUÑUA LUCIA", activos: 1 },
    { nro: 316, nombre: "NAVA ANGELLUIS", activos: 1 },
    { nro: 999, nombre: "NIEVA MARIANA (Mari)", activos: 1 },
    { nro: 999, nombre: "NIEVA MARIA OFFELIA", activos: 1 },
    { nro: 999, nombre: "OJEDA GLADYS", activos: 1 },
    { nro: 999, nombre: "ORTIZ YANINA PAOLA", activos: 1 },
    { nro: 426, nombre: "PADILLA NATALIE", activos: 1 },
    { nro: 320, nombre: "PARAVIC MARIELA", activos: 1 },
    { nro: 329, nombre: "PORTA BEATRIZ", activos: 1 },
    { nro: 999, nombre: "QUERCIA VERONICA", activos: 1 },
    { nro: 999, nombre: "QUINTEROS GERARDO", activos: 1 },
    { nro: 999, nombre: "REYNOSO JULIETA", activos: 1 },
    { nro: 496, nombre: "RIOS TANIA", activos: 1 },
    { nro: 999, nombre: "RIQUELME FEDERICO", activos: 1 },
    { nro: 504, nombre: "RIVAROLA ANTONIO", activos: 1 },
    { nro: 999, nombre: "RIVERO ROBERTO GABRIEL", activos: 1 },
    { nro: 999, nombre: "ROMAN AGOSTINA", activos: 1 },
    { nro: 999, nombre: "ROST IVAN", activos: 1 },
    { nro: 999, nombre: "RUA ESTELA BEATRIZ", activos: 1 },
    { nro: 999, nombre: "SALINAS DIEGO", activos: 1 },
    { nro: 323, nombre: "SANCHEZ PILAR", activos: 1 },
    { nro: 999, nombre: "SANTANDER FLAVIA", activos: 1 },
    { nro: 999, nombre: "SIERRA MELISA", activos: 1 },
    { nro: 999, nombre: "SOSA ITALO", activos: 1 },
    { nro: 33, nombre: "SOTOMAYOR MANUEL", activos: 1 },
    { nro: 999, nombre: "TEDESCO ARIEL", activos: 1 },
    { nro: 999, nombre: "THOMAS KARINA ELIZABETH", activos: 1 },
    { nro: 999, nombre: "TOSSNETI CONRADO", activos: 1 },
    { nro: 191, nombre: "TORRES OSCAR EDUARDO", activos: 1 },
    { nro: 999, nombre: "UNQUEN MALENA", activos: 1 },
    { nro: 999, nombre: "URIBE JOSE RUPERTO", activos: 1 },
    { nro: 999, nombre: "VALENZUELA HUGO", activos: 1 },
    { nro: 164, nombre: "VELASQUES LEANDRO", activos: 1 },
    { nro: 999, nombre: "VELAZCO ANDREA", activos: 1 },
    { nro: 999, nombre: "VILLARROEL RENE", activos: 1 },
    { nro: 999, nombre: "VILLEGAS FABIOLA", activos: 1 },
    { nro: 999, nombre: "YAÑEZ CINTIA MICAELA", activos: 1 },
    { nro: 322, nombre: "ZAHIRA MORONATI", activos: 1 },
    { nro: 84, nombre: "ZEGARRA VICTOR MANUEL", activos: 1 },
    { nro: 999, nombre: "ZENI MARIELA", activos: 1 }
  ];

  console.log(`Seeding $ {members.length} real members...`);

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const names = m.nombre.split(" ");
    const lastName = names[0];
    const firstName = names.slice(1).join(" ");

    const joinYear = Math.random() > 0.5 ? 2024 : 2025;
    const joinMonth = Math.floor(Math.random() * 12);
    const isBaja = i > 90; // Small percentage of churn

    // Create unique user for each member
    const user = await prisma.user.create({
      data: {
        email: `socio$ {i}$ {m.nro === 999 ? 'extra' : m.nro}@cat.com`,
        passwordHash: adminPassword,
        role: "MEMBER",
        name: `$ {firstName} $ {lastName}`.trim(),
      }
    });

    const dbMember = await prisma.member.create({
      data: {
        memberNumber: m.nro.toString(),
        firstName: firstName || lastName,
        lastName: lastName,
        dni: (Math.floor(Math.random() * 20000000) + 10000000).toString(),
        email: user.email,
        type: "ACTIVO",
        status: isBaja ? "RESIGNED" : (m.activos === 1 ? "ACTIVE" : "SUSPENDED"),
        joinDate: new Date(joinYear, joinMonth, 1),
        deactivatedAt: isBaja ? new Date(2025, 11, 1) : null,
        userId: user.id,
        address: "Av. General Paz " + Math.floor(Math.random() * 2000),
      }
    });

    // Seed 2025 payments
    if (!isBaja) {
      // 2025 full year
      for (let month = 1; month <= 12; month++) {
        if (new Date(2025, month - 1, 1).getTime() >= dbMember.joinDate.getTime()) {
          const fee = 5000;
          await prisma.membershipFee.create({
            data: {
              memberId: dbMember.id,
              periodMonth: month,
              periodYear: 2025,
              amountDue: fee,
              amountPaid: fee,
              paymentDate: new Date(2025, month - 1, 10),
              paymentStatus: "PAID",
              paymentMethod: "EFECTIVO"
            }
          });
        }
      }

      // 2026 payments - Specifically for the 17 "Al Día"
      // Let's pick the first 17 active members
      if (i < 17) {
        // Paid Jan, Feb, March 2026
        for (let month = 1; month <= 3; month++) {
          await prisma.membershipFee.create({
            data: {
              memberId: dbMember.id,
              periodMonth: month,
              periodYear: 2026,
              amountDue: 6000,
              amountPaid: 6000,
              paymentDate: new Date(2026, month - 1, 5),
              paymentStatus: "PAID",
              paymentMethod: "EFECTIVO"
            }
          });
        }
      } else if (i < 40) {
        // En Mora (paid jan/feb but not march)
        for (let month = 1; month <= 2; month++) {
          await prisma.membershipFee.create({
            data: {
              memberId: dbMember.id,
              periodMonth: month,
              periodYear: 2026,
              amountDue: 6000,
              amountPaid: 6000,
              paymentDate: new Date(2026, month - 1, 5),
              paymentStatus: "PAID",
              paymentMethod: "EFECTIVO"
            }
          });
        }
      }
    }
  }

  // Seed Event from Image 3
  const mainEvent = await prisma.event.create({
    data: {
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

  // 4 extra milongas requested
  const attendance = [43, 58, 35, 78];
  for (let i = 0; i < 4; i++) {
    const ev = await prisma.event.create({
      data: {
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

    // Create attendees
    const count = attendance[i];
    for (let j = 0; j < count; j++) {
      await prisma.eventRegistration.create({
        data: {
          eventId: ev.id,
          firstName: "Asistente",
          lastName: `$ {j+1}`,
          amountPaid: j < count / 2 ? 8000 : 10000,
          paymentStatus: "PAID",
          registrationType: "MILONGA",
          createdAt: ev.startDate
        }
      });
    }
  }

  // Seed attendees for main event
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

  console.log("Database seeded with REAL data from images.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
   })
