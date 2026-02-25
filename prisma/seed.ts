import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('2020', 12)

  // Elimina vecchi admin
  await prisma.operator.deleteMany({
    where: { role: Role.ADMIN }
  })

  const admin = await prisma.operator.create({
    data: {
      email: 'darbazarsociale@gmail.com',
      name: 'Administrator',
      passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log('✅ Admin creato:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())