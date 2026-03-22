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
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { dni: { contains: query } },
      ],
      AND: [
        { status: { in: ['ACTIVE', 'DEBTOR', 'SUSPENDED'] } }
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
