import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const members = await prisma.member.count()
  const events = await prisma.event.count()
  const users = await prisma.user.count()
  const payments = await prisma.membershipFee.count()
  const registrations = await prisma.eventRegistration.count()
  console.log({ members, events, users, payments, registrations })
}
main().finally(() => prisma.$disconnect())
