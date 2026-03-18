import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const currentYear = now.getFullYear()

  const since = new Date()
  since.setMonth(since.getMonth() - 11)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const [
    totalUsers, activeUsers, usersWithCredits,
    bambini, adulti, adultiF, adultiM, adultiNB, adultiNullGender,
    transactions, labels,
    newUsersRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { credits: { gt: 0 } } }),
    prisma.user.count({ where: { tags: { contains: 'bambin', mode: 'insensitive' } } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' } } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: 'F' } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: 'M' } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: 'NB' } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: null } }),
    prisma.transaction.findMany({
      where: { type: 'SUBTRACT', createdAt: { gte: since } },
      select: { userId: true, description: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.label.findMany({ select: { name: true, season: true, category: true } }),
    prisma.user.findMany({
      where: { createdAt: { gte: new Date(currentYear, 0, 1) } },
      select: { createdAt: true },
    }),
  ])

  // Monthly checkout stats
  const labelMap = new Map(labels.map(l => [`${l.name}||${l.season}`, l.category]))
  const monthMap = new Map<string, { users: Set<string>; products: Map<string, { name: string; season: string; count: number }> }>()

  for (const tx of transactions) {
    const date = new Date(tx.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap.has(key)) monthMap.set(key, { users: new Set(), products: new Map() })
    const entry = monthMap.get(key)!
    entry.users.add(tx.userId)
    if (tx.description) {
      for (const part of tx.description.split(', ')) {
        const match = part.match(/^(.+) \((.+)\) x(\d+)$/)
        if (match) {
          const name = match[1], season = match[2], qty = parseInt(match[3])
          const productKey = `${name}||${season}`
          const existing = entry.products.get(productKey)
          if (existing) existing.count += qty
          else entry.products.set(productKey, { name, season, count: qty })
        }
      }
    }
  }

  const monthlyStats = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [year, month] = key.split('-')
      const topEntry = Array.from(data.products.values()).sort((a, b) => b.count - a.count)[0]
      return {
        key,
        label: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
        uniqueUsers: data.users.size,
        topProduct: topEntry ? {
          name: topEntry.name,
          season: topEntry.season,
          category: labelMap.get(`${topEntry.name}||${topEntry.season}`) ?? null,
          count: topEntry.count,
        } : null,
      }
    })

  // New users per month (current year)
  const newUsersMap = new Map<number, number>()
  for (let i = 0; i <= now.getMonth(); i++) newUsersMap.set(i, 0)
  for (const u of newUsersRaw) {
    const m = new Date(u.createdAt).getMonth()
    if (newUsersMap.has(m)) newUsersMap.set(m, (newUsersMap.get(m) || 0) + 1)
  }
  const newUsersPerMonth = Array.from(newUsersMap.entries()).map(([month, count]) => ({
    label: new Date(currentYear, month).toLocaleDateString('it-IT', { month: 'long' }),
    count,
  }))

  return NextResponse.json({
    generatedAt: now.toISOString(),
    year: currentYear,
    generalStats: { totalUsers, activeUsers, usersWithCredits, bambini, adulti, adultiF, adultiM, adultiNB, adultiNullGender },
    monthlyStats,
    newUsersPerMonth,
  })
}
