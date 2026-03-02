import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  await prisma.label.deleteMany()
  console.log('🗑️  Tabella labels svuotata')

  const csvPath = path.join(__dirname, 'labels.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[]

  console.log(`📂 Trovati ${records.length} record nel CSV`)

  let created = 0

  for (const row of records) {
    const name = row['name']?.trim()
    const credits = parseInt(row['dar']?.trim(), 10)
    const season = row['season']?.trim()
    const category = row['category']?.trim()

    if (!name || isNaN(credits)) continue

    await prisma.label.create({
      data: { name, credits, season, category },
    })
    created++
  }

  console.log(`✅ Importati: ${created} labels`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
