const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allMembers = await prisma.member.findMany();

  const members1000 = allMembers.filter(m => {
    const num = parseInt(m.memberNumber, 10);
    return !isNaN(num) && num >= 1000;
  });

  // Sort by joinDate asc, then createdAt asc, then memberNumber asc
  members1000.sort((a, b) => {
    const jA = a.joinDate ? new Date(a.joinDate).getTime() : 0;
    const jB = b.joinDate ? new Date(b.joinDate).getTime() : 0;
    if (jA !== jB) return jA - jB;

    const cA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const cB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (cA !== cB) return cA - cB;

    return parseInt(a.memberNumber, 10) - parseInt(b.memberNumber, 10);
  });

  console.log(`Encontrados ${members1000.length} socios con número >= 1000:\n`);

  members1000.forEach((m, idx) => {
    const newNum = 579 + idx;
    console.log(`Actual N° ${m.memberNumber.padEnd(5)} -> Nuevo N° ${newNum} | ${m.lastName}, ${m.firstName} | Alta: ${m.joinDate ? m.joinDate.toISOString().slice(0,10) : 'Sin fecha'} | Creado: ${m.createdAt.toISOString().slice(0,10)}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
