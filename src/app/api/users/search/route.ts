import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  if (!q) return NextResponse.json([])

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [
        { cardNumber: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, cardNumber: true, firstName: true, lastName: true, credits: true },
    take: 10,
    orderBy: { cardNumber: 'asc' },
  })

  return NextResponse.json(users)
}
