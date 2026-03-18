import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const label = await prisma.label.findUnique({ where: { id: params.id } })
  if (!label) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(label)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, credits, season, category } = body

  const label = await prisma.label.update({
    where: { id: params.id },
    data: {
      name,
      credits: parseInt(credits),
      season,
      category,
    },
  })
  return NextResponse.json(label)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.label.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
