import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({ select: { cardNumber: true } })

  const max = users.reduce((acc, u) => {
    const n = parseInt(u.cardNumber, 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)

  return NextResponse.json({ nextCard: String(max + 1) })
}
