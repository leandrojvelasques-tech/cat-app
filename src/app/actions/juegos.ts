"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// ============================================
// QUESTIONS CRUD
// ============================================

export async function getQuestions(filters?: {
  category?: string
  difficulty?: string
  isActive?: boolean
  search?: string
}) {
  const where: Record<string, unknown> = {}
  if (filters?.category) where.category = filters.category
  if (filters?.difficulty) where.difficulty = filters.difficulty
  if (filters?.isActive !== undefined) where.isActive = filters.isActive
  if (filters?.search) {
    where.statement = { contains: filters.search, mode: "insensitive" }
  }

  return db.triviaQuestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
}

export async function getQuestion(id: string) {
  return db.triviaQuestion.findUnique({ where: { id } })
}

export async function createQuestion(data: {
  statement: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  category: string
  difficulty: string
  isActive: boolean
}) {
  const question = await db.triviaQuestion.create({ data })
  revalidatePath("/admin/juegos/acertijo/preguntas")
  return question
}

export async function updateQuestion(
  id: string,
  data: {
    statement: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctOption: string
    category: string
    difficulty: string
    isActive: boolean
  }
) {
  const question = await db.triviaQuestion.update({ where: { id }, data })
  revalidatePath("/admin/juegos/acertijo/preguntas")
  return question
}

export async function deleteQuestion(id: string) {
  await db.triviaQuestion.delete({ where: { id } })
  revalidatePath("/admin/juegos/acertijo/preguntas")
}

export async function importQuestions(questions: any[]) {
  const count = await db.triviaQuestion.createMany({
    data: questions.map(q => ({
      statement: q.statement,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      category: q.category || "general",
      difficulty: q.difficulty || "MEDIUM",
      isActive: true
    }))
  })
  revalidatePath("/admin/juegos/acertijo/preguntas")
  return count
}


export async function toggleQuestionActive(id: string, isActive: boolean) {
  await db.triviaQuestion.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/juegos/acertijo/preguntas")
}

// ============================================
// GAME CONFIG
// ============================================

export async function getGameConfig() {
  let game = await db.triviaGame.findFirst({
    where: { name: "Acertijo 2.0" },
  })
  if (!game) {
    game = await db.triviaGame.create({
      data: { name: "Acertijo 2.0" },
    })
  }
  return game
}

export async function updateGameConfig(data: {
  isActive: boolean
  questionsEasy: number
  questionsMedium: number
  questionsHard: number
  timeEasy: number
  timeMedium: number
  timeHard: number
  totalTimeLimit: number | null
  pointsCorrect: number
  pointsIncorrect: number
}) {
  const game = await getGameConfig()
  const updated = await db.triviaGame.update({
    where: { id: game.id },
    data,
  })
  revalidatePath("/admin/juegos")
  revalidatePath("/juegos")
  revalidatePath("/juegos/acertijo")
  revalidatePath("/juegos/acertijo/vivo")
  return updated
}

export async function toggleGameActive(isActive: boolean) {
  const game = await getGameConfig()
  await db.triviaGame.update({
    where: { id: game.id },
    data: { isActive },
  })
  revalidatePath("/admin/juegos")
  revalidatePath("/juegos")
}

// ============================================
// LIVE GAME MODALITY CONTROLS
// ============================================

export async function startLiveSession(questionIds: string[], timerDuration = 10) {
  const game = await getGameConfig()
  return db.triviaGame.update({
    where: { id: game.id },
    data: {
      status: "QUESTION_HIDDEN",
      activeQuestionIds: questionIds,
      currentQuestionIndex: 0,
      currentQuestionId: questionIds[0],
      timerDuration,
      timerEndAt: null,
      isActive: true
    },
  })
}

export async function nextLiveQuestion() {
  const game = await getGameConfig()
  const nextIndex = game.currentQuestionIndex + 1
  
  if (nextIndex >= game.activeQuestionIds.length) {
    return db.triviaGame.update({
      where: { id: game.id },
      data: { status: "SHOWING_RESULTS" }
    })
  }

  return db.triviaGame.update({
    where: { id: game.id },
    data: {
      currentQuestionIndex: nextIndex,
      currentQuestionId: game.activeQuestionIds[nextIndex],
      status: "QUESTION_HIDDEN", // <-- Cambiado a oculto por defecto
      timerEndAt: null,
    },
  })
}

export async function revealLiveQuestion() {
  const game = await getGameConfig()
  return db.triviaGame.update({
    where: { id: game.id },
    data: { status: "WAITING_QUESTION" }
  })
}


export async function startLiveTimer(duration?: number) {
  const game = await getGameConfig()
  const d = duration || game.timerDuration
  const endAt = new Date(Date.now() + d * 1000)

  return db.triviaGame.update({
    where: { id: game.id },
    data: {
      status: "TIMER_ACTIVE",
      timerEndAt: endAt,
    },
  })
}

export async function resetLiveGame() {
  const game = await getGameConfig()
  return db.triviaGame.update({
    where: { id: game.id },
    data: {
      status: "IDLE",
      currentQuestionId: null,
      currentQuestionIndex: 0,
      activeQuestionIds: [],
      timerEndAt: null,
      isActive: false
    },
  })
}

export async function getLiveStatus(sessionId?: string) {
  // Heartbeat: Si viene un sessionId, actualizamos su updatedAt
  if (sessionId) {
    try {
      await db.triviaSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      })
    } catch (e) {
      // Ignorar errores si la sesión no existe
    }
  }

  const game = await db.triviaGame.findFirst({
    where: { name: "Acertijo 2.0" },
    include: {
      sessions: {
        where: { completedAt: { not: null } },
        include: { player: true },
        orderBy: [{ score: "desc" }, { totalTime: "asc" }],
        take: 10
      }
    }
  })
  
  if (!game) return null

  // 1. Contar y obtener nombres de jugadores activos (en los últimos 10 segundos)
  const activeThreshold = new Date(Date.now() - 10000)
  const activeSessions = await db.triviaSession.findMany({
    where: {
      gameId: game.id,
      updatedAt: { gte: activeThreshold },
    },
    include: { player: true },
  })

  const connectedNames = activeSessions.map(s => 
    s.player.nickname || `${s.player.firstName} ${s.player.lastName.charAt(0)}.`
  )

  // 2. Obtener estadísticas de respuestas para la pregunta actual
  const answerStats: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  if (game.currentQuestionId) {
    const answers = await db.triviaAnswer.groupBy({
      by: ["selectedOption"],
      where: {
        questionId: game.currentQuestionId,
        // Solo contamos las respuestas recientes (últimos 10 minutos)
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } 
      },
      _count: { id: true }
    })
    
    answers.forEach(a => {
      if (a.selectedOption && answerStats[a.selectedOption] !== undefined) {
        answerStats[a.selectedOption] = a._count.id
      }
    })
  }

  // 3. Ranking dinámico (incluye sesiones en curso)
  const rankingSessions = await db.triviaSession.findMany({
    where: { gameId: game.id },
    include: { player: true },
    orderBy: [
      { score: "desc" },
      { updatedAt: "desc" }
    ],
    take: 10
  })

  let currentQuestion = null
  if (game.currentQuestionId && game.status !== "QUESTION_HIDDEN") {
    currentQuestion = await db.triviaQuestion.findUnique({
      where: { id: game.currentQuestionId },
      select: {
        id: true,
        statement: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        category: true,
      }
    })
  }

  return {
    status: game.status,
    currentQuestion,
    currentQuestionIndex: game.currentQuestionIndex,
    totalQuestions: game.activeQuestionIds.length,
    timerEndAt: game.timerEndAt,
    timerDuration: game.timerDuration,
    connectedCount: activeSessions.length,
    connectedNames,
    answerStats,
    ranking: rankingSessions.map(s => ({
      name: s.player.nickname || `${s.player.firstName} ${s.player.lastName.charAt(0)}.`,
      score: s.score
    }))
  }
}




// ============================================
// PLAYER FLOW
// ============================================

export async function registerPlayer(data: {
  firstName: string
  lastName: string
  nickname?: string
  email?: string
  phone?: string
}) {
  return db.triviaPlayer.create({ data })
}

export async function getRandomQuestions(counts: { easy: number; medium: number; hard: number }) {
  // Get all active questions
  const allQuestions = await db.triviaQuestion.findMany({
    where: { isActive: true },
    select: {
      id: true,
      statement: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      category: true,
      difficulty: true,
    },
  })

  const easy = allQuestions.filter(q => q.difficulty === 'EASY')
  const medium = allQuestions.filter(q => q.difficulty === 'MEDIUM')
  const hard = allQuestions.filter(q => q.difficulty === 'HARD')

  const shuffle = (arr: any[]) => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  return [
    ...shuffle(easy).slice(0, counts.easy),
    ...shuffle(medium).slice(0, counts.medium),
    ...shuffle(hard).slice(0, counts.hard),
  ]
}

export async function createSession(playerId: string, gameId: string) {
  return db.triviaSession.create({
    data: { playerId, gameId },
  })
}

export async function submitAnswer(data: {
  sessionId: string
  questionId: string
  selectedOption: string
  timeTaken: number
}) {
  // Get the question to check correctness
  const question = await db.triviaQuestion.findUnique({
    where: { id: data.questionId },
  })
  if (!question) throw new Error("Pregunta no encontrada")

  const isCorrect = data.selectedOption === question.correctOption

  return db.triviaAnswer.create({
    data: {
      sessionId: data.sessionId,
      questionId: data.questionId,
      selectedOption: data.selectedOption,
      isCorrect,
      timeTaken: data.timeTaken,
    },
  })
}

export async function finishSession(sessionId: string) {
  const answers = await db.triviaAnswer.findMany({
    where: { sessionId },
  })

  const session = await db.triviaSession.findUnique({
    where: { id: sessionId },
    include: { game: true },
  })
  if (!session) throw new Error("Sesión no encontrada")

  const totalCorrect = answers.filter((a) => a.isCorrect).length
  const totalIncorrect = answers.filter((a) => !a.isCorrect).length
  const totalTime = answers.reduce((sum, a) => sum + a.timeTaken, 0)
  const score =
    totalCorrect * session.game.pointsCorrect -
    totalIncorrect * Math.abs(session.game.pointsIncorrect)

  return db.triviaSession.update({
    where: { id: sessionId },
    data: {
      totalCorrect,
      totalIncorrect,
      totalTime,
      score: Math.max(0, score),
      completedAt: new Date(),
    },
  })
}

export async function getSessionResult(sessionId: string) {
  return db.triviaSession.findUnique({
    where: { id: sessionId },
    include: {
      player: true,
      game: true,
      answers: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

// ============================================
// RANKING
// ============================================

export async function getRanking(limit = 50) {
  return db.triviaSession.findMany({
    where: { completedAt: { not: null } },
    include: { player: true },
    orderBy: [{ score: "desc" }, { totalTime: "asc" }],
    take: limit,
  })
}

export async function getPlayerRank(sessionId: string) {
  const session = await db.triviaSession.findUnique({
    where: { id: sessionId },
  })
  if (!session || !session.completedAt) return null

  const betterCount = await db.triviaSession.count({
    where: {
      completedAt: { not: null },
      OR: [
        { score: { gt: session.score } },
        {
          score: session.score,
          totalTime: { lt: session.totalTime },
        },
      ],
    },
  })

  return betterCount + 1
}

// ============================================
// ADMIN METRICS
// ============================================

export async function getGameMetrics() {
  const [
    totalPlayers,
    totalSessions,
    avgCorrect,
    avgTime,
    avgScore,
    questionStats,
  ] = await Promise.all([
    db.triviaPlayer.count(),
    db.triviaSession.count({ where: { completedAt: { not: null } } }),
    db.triviaSession.aggregate({
      where: { completedAt: { not: null } },
      _avg: { totalCorrect: true },
    }),
    db.triviaSession.aggregate({
      where: { completedAt: { not: null } },
      _avg: { totalTime: true },
    }),
    db.triviaSession.aggregate({
      where: { completedAt: { not: null } },
      _avg: { score: true },
    }),
    db.triviaAnswer.groupBy({
      by: ["questionId", "isCorrect"],
      _count: { id: true },
    }),
  ])

  // Calculate most/least answered correctly
  const statsMap: Record<string, { total: number; correct: number }> = {}
  
  ;(questionStats as any[]).forEach((stat) => {
    if (!statsMap[stat.questionId]) {
      statsMap[stat.questionId] = { total: 0, correct: 0 }
    }
    statsMap[stat.questionId].total += stat._count.id
    if (stat.isCorrect) {
      statsMap[stat.questionId].correct += stat._count.id
    }
  })

  const withRates = Object.entries(statsMap).map(([questionId, data]) => ({
    questionId,
    total: data.total,
    correct: data.correct,
    rate: data.correct / data.total,
  }))

  withRates.sort((a, b) => b.rate - a.rate)
  const mostCorrect = withRates[0] || null
  const leastCorrect = withRates[withRates.length - 1] || null


  // Get question details
  let mostCorrectQuestion = null
  let leastCorrectQuestion = null
  if (mostCorrect) {
    mostCorrectQuestion = await db.triviaQuestion.findUnique({
      where: { id: mostCorrect.questionId },
    })
  }
  if (leastCorrect && leastCorrect.questionId !== mostCorrect?.questionId) {
    leastCorrectQuestion = await db.triviaQuestion.findUnique({
      where: { id: leastCorrect.questionId },
    })
  }

  return {
    totalPlayers,
    totalSessions,
    avgCorrect: avgCorrect._avg.totalCorrect || 0,
    avgTime: avgTime._avg.totalTime || 0,
    avgScore: avgScore._avg.score || 0,
    mostCorrectQuestion: mostCorrectQuestion
      ? {
          ...mostCorrectQuestion,
          rate: mostCorrect!.rate,
          total: mostCorrect!.total,
        }
      : null,
    leastCorrectQuestion: leastCorrectQuestion
      ? {
          ...leastCorrectQuestion,
          rate: leastCorrect!.rate,
          total: leastCorrect!.total,
        }
      : null,
    totalQuestions: await db.triviaQuestion.count(),
    activeQuestions: await db.triviaQuestion.count({ where: { isActive: true } }),
  }
}

export async function getSessionHistory(limit = 50) {
  return db.triviaSession.findMany({
    where: { completedAt: { not: null } },
    include: { player: true },
    orderBy: { completedAt: "desc" },
    take: limit,
  })
}

export async function getQuestionCategories() {
  const cats = await db.triviaQuestion.findMany({
    select: { category: true },
    distinct: ["category"],
  })
  return cats.map((c) => c.category)
}
