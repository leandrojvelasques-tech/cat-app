const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CAMBIANDO NÚMERO DE SOCIO DE ANTONIO TRONCOSO ===\n');

  // Check if 578 exists
  const existing578 = await prisma.member.findFirst({ where: { memberNumber: '578' } });
  if (existing578) {
    console.log(`⚠ ATENCIÓN: El socio N° 578 ya existía registrado como: ${existing578.lastName}, ${existing578.firstName}`);
  } else {
    console.log('✓ El número 578 está libre.');
  }

  // Update Antonio Troncoso (currently 1011)
  const troncoso = await prisma.member.findFirst({ where: { memberNumber: '1011' } });
  if (!troncoso) {
    console.error('❌ No se encontró a Antonio Troncoso con N° 1011.');
    return;
  }

  const updated = await prisma.member.update({
    where: { id: troncoso.id },
    data: { memberNumber: '578' }
  });

  console.log(`✓ Socio N° 1011 (${updated.lastName}, ${updated.firstName}) actualizado exitosamente a N° ${updated.memberNumber}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
