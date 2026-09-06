import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getPaymentStatus } from "@/lib/member-utils"

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
        { status: { notIn: ['BAJA', 'INACTIVE', 'DECEASED', 'RESIGNED', 'DUPLICATE', 'MOROSIDAD', 'ADMINISTRATIVE', 'ARCHIVED'] } }
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
      status: true,
      type: true,
      debtStatus: true,
      joinDate: true,
      fees: {
        select: {
          periodMonth: true,
          periodYear: true,
          paymentStatus: true
        }
      }
    }
  })

  return NextResponse.json(members.map(member => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    dni: member.dni,
    email: member.email,
    phone: member.phone,
    status: member.status,
    paymentStatus: getPaymentStatus(member)
  })))
}
