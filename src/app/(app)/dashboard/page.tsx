import { prisma } from '@/lib/prisma'
import { Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ResetAllCreditsButton } from '@/components/ResetAllCreditsButton'
import { BulkAssignCreditsButton } from '@/components/BulkAssignCreditsButton'

async function getNewUsersPerMonth() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startOfYear } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const monthMap = new Map<number, number>()
  for (let i = 0; i <= now.getMonth(); i++) {
    monthMap.set(i, 0)
  }

  for (const user of users) {
    const month = new Date(user.createdAt).getMonth()
    if (monthMap.has(month)) {
      monthMap.set(month, (monthMap.get(month) || 0) + 1)
    }
  }

  const months = Array.from(monthMap.entries()).map(([month, count]) => ({
    key: month,
    label: new Date(currentYear, month).toLocaleDateString('it-IT', { month: 'short' }),
    count,
  }))

  return { months, totalYear: users.length, year: currentYear }
}

async function getMonthlyStats() {
  const since = new Date()
  since.setMonth(since.getMonth() - 11)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const transactions = await prisma.transaction.findMany({
    where: { type: 'SUBTRACT', createdAt: { gte: since } },
    select: { userId: true, description: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const monthMap = new Map<string, { users: Set<string>; products: Map<string, number> }>()

  for (const tx of transactions) {
    const date = new Date(tx.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthMap.has(key)) {
      monthMap.set(key, { users: new Set(), products: new Map() })
    }

    const entry = monthMap.get(key)!
    entry.users.add(tx.userId)

    if (tx.description) {
      for (const part of tx.description.split(', ')) {
        const match = part.match(/^(.+) \(.+\) x(\d+)$/)
        if (match) {
          const name = match[1]
          const qty = parseInt(match[2])
          entry.products.set(name, (entry.products.get(name) || 0) + qty)
        }
      }
    }
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [year, month] = key.split('-')
      const topProduct = Array.from(data.products.entries()).sort((a, b) => b[1] - a[1])[0]
      return {
        key,
        label: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
        uniqueUsers: data.users.size,
        topProduct: topProduct ? { name: topProduct[0], count: topProduct[1] } : null,
      }
    })
}

async function getStats() {
  const [
    totalUsers,
    activeUsers,
    recentTransactions,
    bambini,
    adulti,
    adultiF,
    adultiM,
    adultiNB,
    adultiNullGender,
    usersWithCredits,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.transaction.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: true, operator: true },
    }),
    prisma.user.count({ where: { tags: { contains: 'bambin', mode: 'insensitive' } } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' } } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: 'F' } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: 'M' } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: 'NB' } }),
    prisma.user.count({ where: { tags: { contains: 'adult', mode: 'insensitive' }, gender: null } }),
    prisma.user.count({ where: { credits: { gt: 0 } } }),
  ])

  return {
    totalUsers,
    activeUsers,
    recentTransactions,
    bambini,
    adulti,
    adultiF,
    adultiM,
    adultiNB,
    adultiNullGender,
    usersWithCredits,
  }
}

function BarChart({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="space-y-3 mt-4">
      {items.map(({ label, value, color }) => (
        <div key={label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">{label}</span>
            <span className="font-semibold text-slate-800">{value.toLocaleString('it')}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const [stats, monthlyStats, newUsersStats] = await Promise.all([getStats(), getMonthlyStats(), getNewUsersPerMonth()])

  return (
    <div className="animate-in space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Panoramica del sistema di crediti</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkAssignCreditsButton usersWithCredits={stats.usersWithCredits} />
          <ResetAllCreditsButton />
        </div>
      </div>

      {/* Stats top */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Utenti totali</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalUsers.toLocaleString('it')}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.activeUsers} attivi</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: bambini vs adulti */}
        <div className="card">
          <p className="text-sm font-medium text-slate-500">Utenti per fascia</p>
          <BarChart items={[
            { label: 'Bambini', value: stats.bambini, color: 'bg-amber-400' },
            { label: 'Adulti', value: stats.adulti, color: 'bg-brand-500' },
          ]} />
        </div>

        {/* Card 2: genere adulti */}
        <div className="card">
          <p className="text-sm font-medium text-slate-500">Genere adulti</p>
          <BarChart items={[
            { label: 'Femmine (F)', value: stats.adultiF, color: 'bg-pink-400' },
            { label: 'Maschi (M)', value: stats.adultiM, color: 'bg-blue-400' },
            { label: 'Non-binary (NB)', value: stats.adultiNB, color: 'bg-violet-400' },
            { label: 'Non specificato', value: stats.adultiNullGender, color: 'bg-slate-300' },
          ]} />
        </div>
      </div>

      {/* New users per month */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-500">Nuovi utenti per mese ({newUsersStats.year})</p>
          <span className="text-xs font-semibold bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full">
            Totale anno: {newUsersStats.totalYear}
          </span>
        </div>
        <BarChart items={newUsersStats.months.map(m => ({
          label: m.label,
          value: m.count,
          color: 'bg-emerald-400',
        }))} />
      </div>

      {/* Monthly stats */}
      {monthlyStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card">
            <p className="text-sm font-medium text-slate-500">Utenti al ritiro per mese</p>
            <BarChart items={monthlyStats.map(m => ({
              label: m.label,
              value: m.uniqueUsers,
              color: 'bg-brand-500',
            }))} />
          </div>

          <div className="card">
            <p className="text-sm font-medium text-slate-500">Prodotto più richiesto per mese</p>
            <div className="space-y-2 mt-4">
              {monthlyStats.map(m => (
                <div key={m.key} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400 w-10 shrink-0 capitalize">{m.label}</span>
                  {m.topProduct ? (
                    <>
                      <span className="font-medium text-slate-800 flex-1 truncate">{m.topProduct.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{m.topProduct.count} pz</span>
                    </>
                  ) : (
                    <span className="text-slate-300 italic">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 text-slate-400 text-sm">
          Nessun checkout ancora registrato
        </div>
      )}

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900">Ultime transazioni</h2>
          <Link href="/transactions" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Vedi tutte →
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nessuna transazione ancora</p>
        ) : (
          <div className="space-y-1">
            {stats.recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  tx.amount > 0 ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-500'
                }`}>
                  {tx.amount > 0
                    ? <ArrowUpRight className="w-4 h-4" />
                    : <ArrowDownRight className="w-4 h-4" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {tx.user.firstName} {tx.user.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{tx.description || tx.type}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.amount > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} cr.
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
