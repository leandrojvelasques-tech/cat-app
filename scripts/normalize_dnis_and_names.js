const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== NORMALIZANDO DNI Y NOMBRES EN LA BASE DE DATOS ===\n');

  const members = await prisma.member.findMany();

  let countDniCleaned = 0;
  let countNamesUppercased = 0;

  for (const m of members) {
    let newDni = m.dni;
    let newFirstName = m.firstName;
    let newLastName = m.lastName;

    let needsUpdate = false;

    // 1. DNI normalization (strip dots and spaces if it's numeric/dotted DNI)
    if (newDni && !newDni.startsWith('TEMP') && !newDni.startsWith('PENDIENTE')) {
      const cleaned = newDni.replace(/\./g, '').replace(/\s/g, '').trim();
      if (cleaned !== newDni) {
        newDni = cleaned;
        needsUpdate = true;
        countDniCleaned++;
      }
    }

    // 2. Name normalization (force UPPERCASE)
    if (newFirstName && newFirstName !== newFirstName.toUpperCase()) {
      newFirstName = newFirstName.toUpperCase().trim();
      needsUpdate = true;
      countNamesUppercased++;
    }

    if (newLastName && newLastName !== newLastName.toUpperCase()) {
      newLastName = newLastName.toUpperCase().trim();
      needsUpdate = true;
      countNamesUppercased++;
    }

    if (needsUpdate) {
      await prisma.member.update({
        where: { id: m.id },
        data: {
          dni: newDni,
          firstName: newFirstName,
          lastName: newLastName
        }
      });
    }
  }

  console.log(`✓ DNI limpiados (sin puntos): ${countDniCleaned}`);
  console.log(`✓ Nombres/Apellidos pasados a MAYÚSCULAS: ${countNamesUppercased}`);
  console.log('\n=== MIGRACIÓN DE DATOS COMPLETADA ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
