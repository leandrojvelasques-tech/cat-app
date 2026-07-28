const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== ACTUALIZANDO SOCIOS DESDE EMAIL ===\n');

  // Helper function to update by memberNumber
  async function updateMemberByNumber(num, data) {
    const existing = await prisma.member.findFirst({ where: { memberNumber: num } });
    if (!existing) {
      throw new Error(`Socio N° ${num} no encontrado en la base de datos.`);
    }
    return prisma.member.update({
      where: { id: existing.id },
      data
    });
  }

  // 1. Carla Paola Hernández Vera (Socio #1005)
  const carla = await updateMemberByNumber('1005', {
    firstName: 'Carla Paola',
    lastName: 'Hernández Vera',
    dni: '31092126',
    email: 'carlahernandezvera9@gmail.com',
    phone: '2966232707',
    birthDate: new Date('1984-10-02T00:00:00.000Z'),
    address: 'Saavedra 583',
    city: 'Puerto San Julián',
    notes: 'Lugar de residencia: Pto. San Julián. Alta desde email.'
  });
  console.log(`✓ Socio N° 1005 actualizado: ${carla.firstName} ${carla.lastName} (DNI: ${carla.dni})`);

  // Actualizar comprobante de cuota Abril 2026 para Carla
  const carlaFee = await prisma.membershipFee.updateMany({
    where: {
      memberId: carla.id,
      periodYear: 2026,
      periodMonth: 4
    },
    data: {
      paymentMethod: 'TRANSFERENCIA',
      realPaymentDate: new Date('2026-04-11T13:42:27.000Z'),
      notes: 'Transferencia BNA+ N° 00465353 ($6.000,00)'
    }
  });
  console.log(`  └ Cuota 04/2026 actualizada: ${carlaFee.count} registro(s)`);

  // 2. Angela Daniela Taboada (Socio #577)
  const daniela = await updateMemberByNumber('577', {
    firstName: 'Angela Daniela',
    lastName: 'Taboada',
    dni: '29858469',
    email: 'daniela.taboada@live.com.ar',
    phone: '2974921111',
    birthDate: new Date('1982-11-29T00:00:00.000Z'),
    address: 'Rada Tilly',
    city: 'Rada Tilly',
    notes: 'Importado de planilla antigua. Alta/actualización desde email.'
  });
  console.log(`✓ Socio N° 577 actualizado: ${daniela.firstName} ${daniela.lastName} (DNI: ${daniela.dni})`);

  // Registrar/Actualizar comprobante de cuota Abril 2026 para Daniela
  const existingFeeDaniela = await prisma.membershipFee.findUnique({
    where: {
      memberId_periodYear_periodMonth: {
        memberId: daniela.id,
        periodYear: 2026,
        periodMonth: 4
      }
    }
  });

  if (existingFeeDaniela) {
    await prisma.membershipFee.update({
      where: { id: existingFeeDaniela.id },
      data: {
        paymentMethod: 'TRANSFERENCIA',
        realPaymentDate: new Date('2026-04-08T09:24:00.000Z'),
        notes: 'Transferencia Santander N° 58313548 ($6.000,00)'
      }
    });
    console.log(`  └ Cuota 04/2026 actualizada con comprobante Santander N° 58313548`);
  } else {
    await prisma.membershipFee.create({
      data: {
        memberId: daniela.id,
        periodYear: 2026,
        periodMonth: 4,
        amountDue: 6000,
        amountPaid: 6000,
        paymentDate: new Date('2026-04-08T09:24:00.000Z'),
        realPaymentDate: new Date('2026-04-08T09:24:00.000Z'),
        paymentMethod: 'TRANSFERENCIA',
        paymentStatus: 'PAID',
        notes: 'Transferencia Santander N° 58313548 ($6.000,00)'
      }
    });
    console.log(`  └ Cuota 04/2026 creada con comprobante Santander N° 58313548`);
  }

  // 3. Antonio Troncoso (Socio #1011)
  const antonio = await updateMemberByNumber('1011', {
    firstName: 'Antonio',
    lastName: 'Troncoso',
    dni: '18006386',
    email: 'troncosoantonio90@gmail.com',
    phone: '3435067230',
    birthDate: new Date('1967-07-31T00:00:00.000Z'),
    address: 'Chacra N° 22',
    city: 'Sarmiento',
    notes: 'CP 9020. Alta/actualización desde email.'
  });
  console.log(`✓ Socio N° 1011 actualizado: ${antonio.firstName} ${antonio.lastName} (DNI: ${antonio.dni})`);

  console.log('\n=== PROCESO FINALIZADO EXITOSAMENTE ===');
}

main()
  .catch(e => {
    console.error('Error al actualizar socios:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
