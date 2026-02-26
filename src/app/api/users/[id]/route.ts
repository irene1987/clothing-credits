import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { firstName, lastName, cardNumber, birthYear, gender, age, tags, email, notes, isActive } = body

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { firstName, lastName, cardNumber, birthYear: birthYear ? parseInt(birthYear) : null, gender: gender || null, age: birthYear ? new Date().getFullYear() - parseInt(birthYear) : (age ? parseInt(age) : null), tags: tags || null, email, notes, isActive },
    })
    return NextResponse.json(user)
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Numero tessera già usato' }, { status: 409 })
    throw e
  }
}
