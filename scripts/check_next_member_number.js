const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lastMemberStringOrder = await prisma.member.findFirst({
    orderBy: { memberNumber: 'desc' },
  });
  console.log('Prisma string orderBy desc:', lastMemberStringOrder ? { memberNumber: lastMemberStringOrder.memberNumber, name: `${lastMemberStringOrder.lastName}, ${lastMemberStringOrder.firstName}` } : null);

  const allMembers = await prisma.member.findMany({ select: { memberNumber: true } });
  const maxNumeric = allMembers
    .map(m => parseInt(m.memberNumber, 10))
    .filter(n => !isNaN(n))
    .reduce((max, cur) => (cur > max ? cur : max), 0);

  console.log('Máximo numérico real en BD:', maxNumeric);
  console.log('Siguiente número correlativo que DEBE asignarse:', maxNumeric + 1);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
