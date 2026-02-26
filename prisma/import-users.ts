import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const csvPath = path.join(__dirname, 'Beneficiaries_Rome_2026-02-25_075855.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[]

  console.log(`📂 Trovati ${records.length} record nel CSV`)

  let created = 0
  let skipped = 0

  for (const row of records) {
    const cardNumber = row['ID']?.trim()
    const firstName = row['Firstname']?.trim() || ''
    const lastName = row['Surname']?.trim() || ''

    if (!cardNumber) {
      skipped++
      continue
    }

    try {
      const gender = row['Gender']?.trim() || null
      const ageRaw = row['Age']?.trim()
      const age = ageRaw ? parseInt(ageRaw) || null : null
      const tags = row['Tags']?.trim() || null

      await prisma.user.create({
        data: {
          cardNumber,
          firstName,
          lastName,
          gender,
          age,
          tags,
          isActive: true,
          credits: 0,
        },
      })
      created++
    } catch (e: any) {
      console.error(`❌ Errore su ${cardNumber} ${firstName} ${lastName}: ${e.message}`)
      skipped++
    }
  }

  console.log(`✅ Importati: ${created}`)
  console.log(`⚠️  Saltati: ${skipped}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
