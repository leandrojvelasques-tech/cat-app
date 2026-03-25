import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  const members = await db.member.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { dni: { contains: query, mode: 'insensitive' } },
      ],
      AND: [
        { status: { notIn: ['INACTIVE', 'DECEASED', 'RESIGNED'] } }
      ]
    },
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dni: true,
      email: true,
      phone: true,
      status: true
    }
  })

  return NextResponse.json(members)
}
