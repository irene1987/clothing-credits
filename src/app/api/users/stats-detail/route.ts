import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const month = searchParams.get('month') // YYYY-MM

  if (!type || !month) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const [year, monthNum] = month.split('-').map(Number)
  const start = new Date(year, monthNum - 1, 1)
  const end = new Date(year, monthNum, 1)

  if (type === 'new_users') {
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { id: true, cardNumber: true, firstName: true, lastName: true, gender: true, age: true, tags: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(users)
  }

  if (type === 'checkout_users') {
    const txs = await prisma.transaction.findMany({
      where: { type: 'SUBTRACT', createdAt: { gte: start, lt: end } },
      select: { userId: true, user: { select: { id: true, cardNumber: true, firstName: true, lastName: true, gender: true, age: true, tags: true } } },
      distinct: ['userId'],
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(txs.map(t => t.user))
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
