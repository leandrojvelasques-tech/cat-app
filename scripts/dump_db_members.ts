import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const members = await prisma.member.findMany({
    select: {
      id: true,
      memberNumber: true,
      firstName: true,
      lastName: true,
      dni: true,
      email: true,
      phone: true,
      type: true,
      status: true
    }
  })

  fs.writeFileSync('tmp_db_members.json', JSON.stringify(members, null, 2))
  console.log(`Exported ${members.length} members to tmp_db_members.json`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
