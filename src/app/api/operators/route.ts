import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }

  const { name, email, password, role } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
  }

  const existing = await prisma.operator.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email già registrata' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)

  const operator = await prisma.operator.create({
    data: {
      name,
      email,
      passwordHash,
      role: (role as Role) || Role.OPERATOR,
    },
  })

  return NextResponse.json({ id: operator.id, name: operator.name, email: operator.email }, { status: 201 })
}
