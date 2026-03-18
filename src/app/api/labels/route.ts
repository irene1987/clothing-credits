import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, credits, season, category } = await req.json()
  if (!name || !season || !category || credits === undefined) {
    return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
  }

  const label = await prisma.label.create({
    data: { name, credits: parseInt(credits), season, category },
  })
  return NextResponse.json(label, { status: 201 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const labels = await prisma.label.findMany({
    orderBy: [{ name: 'asc' }, { season: 'asc' }],
  })

  return NextResponse.json(labels)
}
