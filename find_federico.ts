import { db } from "./src/lib/db"

async function findFederico() {
  const members = await db.member.findMany({
    where: {
      OR: [
        { firstName: { contains: "Federico", mode: "insensitive" } },
        { lastName: { contains: "Riquelme", mode: "insensitive" } }
      ]
    }
  })
  console.log(JSON.stringify(members, null, 2))
}

findFederico()
