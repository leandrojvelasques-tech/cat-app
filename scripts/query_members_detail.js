const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const numbers = ['577', '1005', '1011'];
  
  const members = await prisma.member.findMany({
    where: { memberNumber: { in: numbers } },
    include: { fees: true }
  });

  console.log(JSON.stringify(members, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
