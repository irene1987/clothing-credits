import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({ orderBy: { lastName: 'asc' } })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { firstName, lastName, cardNumber, phone, email, notes, credits } = body

  if (!firstName || !lastName || !cardNumber) {
    return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
  }

  // Check duplicate card
  const existing = await prisma.user.findFirst({ where: { cardNumber } })
  if (existing) {
    return NextResponse.json({ error: 'Numero tessera già esistente' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { firstName, lastName, cardNumber, phone, email, notes, credits: credits || 0 },
  })

  return NextResponse.json(user, { status: 201 })
}
