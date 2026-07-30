import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Re-seeding clases de tango en Comodoro y Rada Tilly (Marzo 2026)...")

  // Delete existing classes and teachers to replace with updated Marzo 2026 data
  await prisma.localTangoClass.deleteMany({})
  await prisma.localTangoTeacher.deleteMany({})

  const rawClasses = [
    {
      teacherName: "Centro Amigos del Tango",
      group: "Escuelita del CAT",
      city: "Comodoro Rivadavia",
      neighborhood: "Centro",
      locationName: "Centro Cultural Comodoro",
      address: "Hipólito Yrigoyen 99",
      contactInfo: "2975 29-5100 / centroamigosdeltango@gmail.com",
      schedule: "Martes de 20 a 22 hs. Profes nuevos cada mes.",
      priceType: "GRATIS",
      priceDetails: "Gratis - Abierto a todo público",
      notes: "Fecha de inicio definir por Cultura. Profesores rotativos del CAT cada mes.",
      order: 1
    },
    {
      teacherName: "Leandro y Camila",
      group: "Comodoro Tango",
      city: "Comodoro Rivadavia",
      neighborhood: "Centro",
      locationName: "Swing Estudio",
      address: "Maipu 1369",
      contactInfo: "2974 31-5848 / leandrojvelasques@gmail.com",
      schedule: "Viernes 20 a 21.30 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Inicia Viernes 6 de Marzo para nivel principiantes",
      order: 2
    },
    {
      teacherName: "Leandro y Lucía",
      group: "Comodoro Tango",
      city: "Comodoro Rivadavia",
      neighborhood: "Centro",
      locationName: "Pizzeria 03",
      address: "Av. Rivadavia 348",
      contactInfo: "2974 05-9568 / leandrojvelasques@gmail.com",
      schedule: "Martes de 20 a 21 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Luego de la clase arranca la milonga",
      order: 3
    },
    {
      teacherName: "Federico Riquelme",
      group: "Federico Riquelme",
      city: "Comodoro Rivadavia",
      neighborhood: "Centro",
      locationName: "Pizzeria 03",
      address: "Av. Rivadavia 348",
      contactInfo: "2975151712",
      schedule: "Martes 21 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Luego de la clase arranca la milonga",
      order: 4
    },
    {
      teacherName: "Manuel Sotomayor y Marcela Andrada",
      group: "Garufa",
      city: "Comodoro Rivadavia",
      neighborhood: "Industrial",
      locationName: "Garufa Eventos",
      address: "Manuel de Arburua y Peral",
      contactInfo: "2974 12-2957",
      schedule: "Viernes 20 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "",
      order: 5
    },
    {
      teacherName: "Manuel Sotomayor y Stella",
      group: "Garufa",
      city: "Comodoro Rivadavia",
      neighborhood: "Roca",
      locationName: "Particular",
      address: "Canadá 2727",
      contactInfo: "2974 12-2957",
      schedule: "A convenir",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Clases personalizadas para parejas",
      order: 6
    },
    {
      teacherName: "Natalia Padilla",
      group: "Natalia Padilla",
      city: "Rada Tilly",
      neighborhood: "",
      locationName: "Escuela de Danzas de Stella Fernandez",
      address: "Araucanos 34",
      contactInfo: "2975948680",
      schedule: "Lunes 20 a 21:30 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "",
      order: 7
    },
    {
      teacherName: "Marcos Zarate",
      group: "Malvon Tango",
      city: "Comodoro Rivadavia",
      neighborhood: "Divina Providencia",
      locationName: "Vecinal Divina Providencia",
      address: "Dr Manuel Sueiro 1290 KM3 (esquina Gallardo Rodríguez)",
      contactInfo: "297-5025462",
      schedule: "Jueves 19:30 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "",
      order: 8
    },
    {
      teacherName: "Marcos Zarate",
      group: "Tango Social - Taller municipal",
      city: "Comodoro Rivadavia",
      neighborhood: "Centro",
      locationName: "CIP (Centro Información Pública)",
      address: "Kennedy 1336",
      contactInfo: "297-5025462",
      schedule: "Viernes 18:30 a 20:00 hs",
      priceType: "GRATIS",
      priceDetails: "Gratis - Taller Municipal",
      notes: "Inicia en Abril 2026",
      order: 9
    },
    {
      teacherName: "Maxi Arratia y Lucia Murua",
      group: "Grupo de la Uni",
      city: "Comodoro Rivadavia",
      neighborhood: "KM5",
      locationName: "Universidad Km4",
      address: "Anexo Edificio Aulas",
      contactInfo: "2974 92-9184 / cultura.unpsjb@gmail.com",
      schedule: "Sábado 14 hs",
      priceType: "GRATIS",
      priceDetails: "Gratis",
      notes: "Empieza en Marzo. Fecha a definir por la U.N.P.S.J.B",
      order: 10
    },
    {
      teacherName: "Julieta Reñanco",
      group: "Julieta Reñanco",
      city: "Comodoro Rivadavia",
      neighborhood: "",
      locationName: "Sinergia Estudio",
      address: "Bahamonde 2516",
      contactInfo: "2975 15-1712",
      schedule: "Lunes y Viernes",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "",
      order: 11
    },
    {
      teacherName: "Alberto Baldini",
      group: "Recodo",
      city: "Comodoro Rivadavia",
      neighborhood: "",
      locationName: "El Recodo",
      address: "Alfredo Palacios 519",
      contactInfo: "2974353698",
      schedule: "Domingo 19 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "",
      order: 12
    },
    {
      teacherName: "Loreley Hernandez",
      group: "Loreley Hernandez",
      city: "Comodoro Rivadavia",
      neighborhood: "",
      locationName: "Escuela de Arte",
      address: "Clara Mizrahi S/N",
      contactInfo: "2974229402",
      schedule: "Lunes y Viernes 18:30 a 20:00 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "",
      order: 13
    },
    {
      teacherName: "Liliana Iribarne y Nestor Acosta",
      group: "",
      city: "Comodoro Rivadavia",
      neighborhood: "Centro",
      locationName: "Sadhana Estudio",
      address: "Chacabuco 336",
      contactInfo: "2975096177",
      schedule: "Lunes y Miércoles 21:00 a 22:30 hs",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Ofrecen profesorado de Tango",
      order: 14
    },
    {
      teacherName: "Escuela de Danzas El Camaruco",
      group: "",
      city: "Comodoro Rivadavia",
      neighborhood: "La Loma",
      locationName: "El Camaruco",
      address: "Maipu 1355",
      contactInfo: "297625935",
      schedule: "Consultar horarios",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Ofrecen profesorado de Tango",
      order: 15
    },
    {
      teacherName: "Escuela de Danzas Proyeccion Sur",
      group: "",
      city: "Comodoro Rivadavia",
      neighborhood: "Pueyrredon",
      locationName: "Proyeccion Sur",
      address: "Olavarría 948",
      contactInfo: "2975935992",
      schedule: "Consultar horarios",
      priceType: "ARANCELADO",
      priceDetails: "Arancelado",
      notes: "Ofrecen profesorado de Tango",
      order: 16
    }
  ]

  const teacherMap = new Map<string, string>()

  for (const cls of rawClasses) {
    if (!teacherMap.has(cls.teacherName)) {
      const teacher = await prisma.localTangoTeacher.create({
        data: {
          fullName: cls.teacherName,
          city: cls.city,
          phone: cls.contactInfo.includes("/") ? cls.contactInfo.split("/")[0].trim() : cls.contactInfo,
          email: cls.contactInfo.includes("@") ? cls.contactInfo.split("/").find(s => s.includes("@"))?.trim() || null : null,
        }
      })
      teacherMap.set(cls.teacherName, teacher.id)
    }
  }

  for (const cls of rawClasses) {
    const teacherId = teacherMap.get(cls.teacherName)
    await prisma.localTangoClass.create({
      data: {
        teacherName: cls.teacherName,
        group: cls.group || null,
        teacherId: teacherId || null,
        city: cls.city,
        neighborhood: cls.neighborhood || null,
        locationName: cls.locationName,
        address: cls.address,
        schedule: cls.schedule,
        contactInfo: cls.contactInfo,
        priceType: cls.priceType,
        priceDetails: cls.priceDetails,
        notes: cls.notes || null,
        isPublished: true,
        order: cls.order
      }
    })
  }

  console.log(`✓ Re-seed Marzo 2026 completado: ${rawClasses.length} clases y ${teacherMap.size} profesores.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
