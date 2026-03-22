// @ts-nocheck
import { db } from "./src/lib/db"

async function seedUserAwards() {
  // Find Leandro
  const leandro = await db.member.findFirst({
    where: {
      OR: [
        { firstName: { contains: "Leandro", mode: "insensitive" } },
        { lastName: { contains: "Velasques", mode: "insensitive" } }
      ]
    }
  })

  // Find Federico
  const federico = await db.member.findFirst({
    where: {
      OR: [
        { firstName: { contains: "Federico", mode: "insensitive" } },
        { lastName: { contains: "Riquelme", mode: "insensitive" } }
      ]
    }
  })

  // Find Dolores
  const dolores = await db.member.findFirst({
    where: {
      OR: [
        { firstName: { contains: "Dolores", mode: "insensitive" } },
        { lastName: { contains: "Moron", mode: "insensitive" } }
      ]
    }
  })

  console.log("Leandro:", leandro?.id)
  console.log("Federico:", federico?.id)
  console.log("Dolores:", dolores?.id)

  if (leandro) {
    // Championships
    const champ2020 = await db.championship.upsert({
      where: { year_name: { year: 2020, name: "Vientos de Tango" } },
      update: {},
      create: { year: 2020, name: "Vientos de Tango" }
    })
    const champ2017 = await db.championship.upsert({
      where: { year_name: { year: 2017, name: "Vientos de Tango" } },
      update: {},
      create: { year: 2017, name: "Vientos de Tango" }
    })

    // Awards
    await db.championshipResult.create({
      data: {
        championshipId: champ2020.id,
        category: "VALS",
        place: 2,
        firstName: "Leandro",
        lastName: "Velasques",
        partnerName: "Marcela Andrada",
        memberId: leandro.id
      }
    })
    await db.championshipResult.create({
      data: {
        championshipId: champ2017.id,
        category: "VALS",
        place: 3,
        firstName: "Leandro",
        lastName: "Velasques",
        memberId: leandro.id
      }
    })

    // Board History
    await db.boardHistory.create({
      data: {
        memberId: leandro.id,
        position: "Presidente",
        periodStart: "2012",
        periodEnd: "2023"
      }
    })
  }

  if (federico) {
     await db.boardHistory.create({
        data: {
           memberId: federico.id,
           position: "Presidente",
           periodStart: "Anterior",
           notes: "Gestión previa"
        }
     })
  }

  if (dolores) {
     await db.boardHistory.create({
        data: {
           memberId: dolores.id,
           position: "Presidente",
           notes: "Múltiples gestiones"
        }
     })
  }

  console.log("Seeded awards and history successfully!")
}

seedUserAwards()
