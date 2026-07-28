import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetDnis = ['31092126', '29858469', '18006386'];
  
  console.log('=== SEARCH BY DNI ===');
  const foundByDni = await prisma.member.findMany({
    where: { dni: { in: targetDnis } },
    include: { fees: true }
  });
  console.log(JSON.stringify(foundByDni, null, 2));

  console.log('=== SEARCH BY NAME / LASTNAME ===');
  const foundByName = await prisma.member.findMany({
    where: {
      OR: [
        { lastName: { contains: 'Taboada', mode: 'insensitive' } },
        { lastName: { contains: 'Troncoso', mode: 'insensitive' } },
        { lastName: { contains: 'Hernandez', mode: 'insensitive' } },
        { lastName: { contains: 'Hernández', mode: 'insensitive' } },
        { lastName: { contains: 'Vera', mode: 'insensitive' } },
        { firstName: { contains: 'Carla', mode: 'insensitive' } },
        { firstName: { contains: 'Daniela', mode: 'insensitive' } },
        { firstName: { contains: 'Antonio', mode: 'insensitive' } }
      ]
    },
    include: { fees: true }
  });
  console.log(JSON.stringify(foundByName, null, 2));

  console.log('=== HIGHEST MEMBER NUMBERS ===');
  const allMembers = await prisma.member.findMany({
    select: { memberNumber: true, firstName: true, lastName: true, dni: true, status: true }
  });

  const parsed = allMembers.map(m => {
    const num = parseInt(m.memberNumber, 10);
    return { ...m, num: isNaN(num) ? 0 : num };
  }).sort((a, b) => b.num - a.num);

  console.log('Top 20 highest member numbers:');
  console.log(parsed.slice(0, 20));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
