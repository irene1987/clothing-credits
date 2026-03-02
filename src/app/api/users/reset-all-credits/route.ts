import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { count } = await prisma.user.updateMany({
    where: { credits: { gt: 0 } },
    data: { credits: 0 },
  })

  return NextResponse.json({ reset: count })
}
