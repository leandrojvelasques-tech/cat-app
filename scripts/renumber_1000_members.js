const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = [
  { oldNum: '1000', newNum: '579', name: 'AGUERRI, MAGALI CELESTE' },
  { oldNum: '1001', newNum: '580', name: 'AYBAR, ROBERTO' },
  { oldNum: '1002', newNum: '581', name: 'BARRIA, ISNELDA' },
  { oldNum: '1003', newNum: '582', name: 'CHAPARRO, JORGE ANTONIO' },
  { oldNum: '1004', newNum: '583', name: 'D\'ANGELO, ANTONELLA' },
  { oldNum: '1005', newNum: '584', name: 'HERNÁNDEZ VERA, CARLA PAOLA' },
  { oldNum: '1006', newNum: '585', name: 'LUCERO, HUMBERTO' },
  { oldNum: '1007', newNum: '586', name: 'OJEDA, GLADYS' },
  { oldNum: '1008', newNum: '587', name: 'SANTANDER, FLAVIA' },
  { oldNum: '1009', newNum: '588', name: 'SIERRA, MELISA' },
  { oldNum: '1010', newNum: '589', name: 'THOMAS, KARINA ELIZABETH' },
  { oldNum: '1012', newNum: '590', name: 'ZENI, MARIELA' },
  { oldNum: '1013', newNum: '591', name: 'ZURLIS, MARIA ROSA' }
];

async function main() {
  console.log('=== RENUMERANDO SOCIOS 1000+ A RANGO 579-591 ===\n');

  let updatedCount = 0;

  for (const item of mapping) {
    const member = await prisma.member.findFirst({
      where: { memberNumber: item.oldNum }
    });

    if (!member) {
      console.log(`⚠ Socio N° ${item.oldNum} no encontrado.`);
      continue;
    }

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: { memberNumber: item.newNum }
    });

    console.log(`✓ Socio N° ${item.oldNum} (${updated.lastName}, ${updated.firstName}) -> Nuevo N° ${updated.memberNumber}`);
    updatedCount++;
  }

  console.log(`\n=== FINALIZADO: ${updatedCount} SOCIOS RENUMERADOS ===`);
}

main()
  .catch(e => {
    console.error('Error al redefinir números:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
