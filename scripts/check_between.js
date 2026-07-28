const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allMembers = await prisma.member.findMany();

  const between = allMembers.filter(m => {
    const n = parseInt(m.memberNumber, 10);
    return !isNaN(n) && n >= 579 && n < 1000;
  });

  console.log(`Socios existentes entre 579 y 999: ${between.length}`);
  if (between.length > 0) {
    console.log(between.map(m => ({ num: m.memberNumber, name: `${m.lastName}, ${m.firstName}` })));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
