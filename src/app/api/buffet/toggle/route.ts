import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { id, active } = await req.json()
  await db.buffetProduct.update({ where: { id }, data: { active } })
  return NextResponse.json({ ok: true })
}
