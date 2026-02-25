
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { secret, email, name } = await req.json()
  if (secret !== 'setup123') return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const passwordHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMWRmCkKSynWHBGO1YBbgK'
  try {
    const op = await prisma.operator.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, name: name || 'Admin', passwordHash, role: 'ADMIN' },
    })
    return NextResponse.json({ ok: true, email: op.email })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
