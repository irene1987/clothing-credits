import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Svuota la tabella prima di importare
  await prisma.user.deleteMany()
  console.log('🗑️  Tabella users svuotata')

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

  const currentYear = new Date().getFullYear()

  for (const row of records) {
    const cardNumber = row['ID']?.trim()
    const firstName = row['Firstname']?.trim() || ''
    const lastName = row['Surname']?.trim() || ''
    const gender = row['Gender']?.trim() || null
    const ageRaw = row['Age']?.trim()
    const age = ageRaw ? parseInt(ageRaw, 10) : null
    const birthYear = age ? currentYear - age : null
    const tags = row['Tags']?.trim() || null
    const notes = row['Comments']?.trim() || null

    if (!cardNumber) {
      skipped++
      continue
    }

    try {
      await prisma.user.create({
        data: {
          cardNumber,
          firstName,
          lastName,
          gender,
          age,
          birthYear,
          tags,
          notes,
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