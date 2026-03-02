import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [adulti, bambini] = await Promise.all([
    prisma.user.updateMany({
      where: { tags: { contains: 'adult', mode: 'insensitive' } },
      data: { credits: { increment: 50 } },
    }),
    prisma.user.updateMany({
      where: { tags: { contains: 'bambin', mode: 'insensitive' } },
      data: { credits: { increment: 20 } },
    }),
  ])

  return NextResponse.json({ adulti: adulti.count, bambini: bambini.count })
}
