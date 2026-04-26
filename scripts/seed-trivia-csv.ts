import { readFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// CSV Parser that handles quotes
function parseCSVRow(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

async function main() {
  const filePath = join(process.cwd(), "public", "preguntas_tango_CAT.csv")
  console.log(`Leyendo CSV desde: ${filePath}`)
  
  const content = readFileSync(filePath, "utf-8")
  const lines = content.split("\n").filter(line => line.trim().length > 0)
  
  // Skip header
  const rows = lines.slice(1).map(parseCSVRow)

  console.log("Eliminando datos existentes...")
  await prisma.triviaAnswer.deleteMany({})
  await prisma.triviaSession.deleteMany({})
  await prisma.triviaQuestion.deleteMany({})

  console.log(`Insertando ${rows.length} preguntas...`)

  const data = rows.map(row => {
    // CSV format: id,nivel,categoria,pregunta,opcion_a,opcion_b,opcion_c,opcion_d,respuesta_correcta,explicacion_breve
    const [id, nivel, categoria, pregunta, opcionA, opcionB, opcionC, opcionD, correcta, explicacion] = row
    
    // Map nivel to difficulty
    let difficulty = "MEDIUM"
    if (nivel?.toLowerCase().includes("fácil")) difficulty = "EASY"
    if (nivel?.toLowerCase().includes("difícil")) difficulty = "HARD"

    return {
      statement: pregunta?.trim() || "",
      optionA: opcionA?.trim() || "",
      optionB: opcionB?.trim() || "",
      optionC: opcionC?.trim() || "",
      optionD: opcionD?.trim() || "",
      correctOption: correcta?.trim() || "A",
      category: categoria?.trim() || "General",
      difficulty: difficulty,
      isActive: true
    }
  }).filter(q => q.statement.length > 0)

  const created = await prisma.triviaQuestion.createMany({
    data: data
  })

  console.log(`✅ ¡Se importaron ${created.count} preguntas con éxito!`)
}

main()
  .catch(e => {
    console.error("Error importando:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
