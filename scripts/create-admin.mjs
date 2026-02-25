import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const p = new PrismaClient()

// Hash bcrypt pre-calcolato per "admin123"
const passwordHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMWRmCkKSynWHBGO1YBbgK'

const email = process.env.ADMIN_EMAIL || 'darbazarsociale@gmail.com'
const name = process.env.ADMIN_NAME || 'Administrator'

try {
  const op = await p.operator.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name, passwordHash, role: 'ADMIN' },
  })
  console.log('✅ Admin creato/aggiornato:', op.email)
} catch (e) {
  console.error('❌ Errore:', e.message)
} finally {
  await p.$disconnect()
}