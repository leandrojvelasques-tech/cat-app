import { PrismaClient } from '@prisma/client'
import { slugify } from '../src/lib/slug-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('=== ASIGNANDO SLUGS AMIGABLES A EVENTOS EXISTENTES ===\n')

  const events = await prisma.event.findMany()
  const slugCounts = new Map<string, number>()

  for (const event of events) {
    let baseSlug = slugify(event.title) || 'evento'
    const year = new Date(event.startDate).getUTCFullYear()
    if (!baseSlug.includes(String(year))) {
      baseSlug = `${baseSlug}-${year}`
    }

    let finalSlug = baseSlug
    let count = slugCounts.get(baseSlug) || 0
    if (count > 0) {
      finalSlug = `${baseSlug}-${count + 1}`
    }
    slugCounts.set(baseSlug, count + 1)

    await prisma.event.update({
      where: { id: event.id },
      data: { slug: finalSlug }
    })

    console.log(`✓ Evento "${event.title}" -> slug: /eventos/${finalSlug}`)
  }

  console.log('\n=== MIGRACIÓN DE SLUGS COMPLETADA ===')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
