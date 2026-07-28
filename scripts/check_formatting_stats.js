const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany();
  
  let withDotsDni = 0;
  let withoutDotsDni = 0;
  let tempPendingDni = 0;

  let upperNames = 0;
  let mixedNames = 0;

  members.forEach(m => {
    if (!m.dni) return;
    if (m.dni.includes('.')) withDotsDni++;
    else if (m.dni.startsWith('TEMP') || m.dni.startsWith('PENDIENTE')) tempPendingDni++;
    else withoutDotsDni++;

    const isUpper = (m.firstName + m.lastName) === (m.firstName + m.lastName).toUpperCase();
    if (isUpper) upperNames++;
    else mixedNames++;
  });

  console.log('--- DNI SUMMARY ---');
  console.log('Total socios:', members.length);
  console.log('DNI con puntos (ej. 25.697.226):', withDotsDni);
  console.log('DNI sin puntos (ej. 29858469):', withoutDotsDni);
  console.log('DNI Temporales/Pendientes:', tempPendingDni);

  console.log('\n--- NAMES SUMMARY ---');
  console.log('Nombres en MAYÚSCULAS:', upperNames);
  console.log('Nombres en Mixto/Minúsculas:', mixedNames);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
