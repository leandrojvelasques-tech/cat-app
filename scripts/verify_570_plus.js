const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany();

  const sorted = members.map(m => ({ ...m, num: parseInt(m.memberNumber, 10) }))
    .filter(m => !isNaN(m.num) && m.num >= 570)
    .sort((a, b) => a.num - b.num);

  console.log('=== SOCIOS DESDE EL N° 570 EN ADELANTE ===\n');
  sorted.forEach(m => {
    console.log(`N° ${m.memberNumber.padEnd(5)} | ${m.lastName}, ${m.firstName} | DNI: ${m.dni}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
