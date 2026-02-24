import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.operator.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrator',
      passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log('✅ Admin creato:', admin.email)
  console.log('📧 Email: admin@example.com')
  console.log('🔑 Password: admin123')
  console.log('⚠️  Cambia la password dopo il primo accesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
