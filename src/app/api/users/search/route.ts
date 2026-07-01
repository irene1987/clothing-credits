import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  if (!q) return NextResponse.json([])

  const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true'

  const terms = q.split(/\s+/).filter(Boolean)

  const users = await prisma.user.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      AND: terms.map(term => ({
        OR: [
          { cardNumber: { contains: term, mode: 'insensitive' } },
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
        ],
      })),
    },
    select: { id: true, cardNumber: true, firstName: true, lastName: true, credits: true, isActive: true },
    orderBy: { cardNumber: 'asc' },
  })

  return NextResponse.json(users)
}
