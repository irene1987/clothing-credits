import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionType } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const operatorId = (session.user as any).id
  const body = await req.json()
  const { userId, type, amount, description } = body

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
  if (!user.isActive) return NextResponse.json({ error: 'Utente disabilitato' }, { status: 400 })

  let delta: number
  let balanceAfter: number

  if (type === 'ADD') {
    delta = Math.abs(amount)
    balanceAfter = user.credits + delta
  } else if (type === 'SUBTRACT') {
    delta = -Math.abs(amount)
    balanceAfter = user.credits + delta
    if (balanceAfter < 0) {
      return NextResponse.json({ error: 'Crediti insufficienti' }, { status: 400 })
    }
  } else if (type === 'RESET') {
    delta = -user.credits
    balanceAfter = 0
  } else if (type === 'ADJUSTMENT') {
    delta = amount
    balanceAfter = user.credits + delta
    if (balanceAfter < 0) return NextResponse.json({ error: 'Saldo negativo non consentito' }, { status: 400 })
  } else {
    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 })
  }

  const [tx] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId,
        operatorId,
        type: type as TransactionType,
        amount: delta,
        balanceAfter,
        description,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: balanceAfter },
    }),
  ])

  return NextResponse.json(tx, { status: 201 })
}
