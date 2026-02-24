import { prisma } from '@/lib/prisma'
import { Users, ArrowUpRight, ArrowDownRight, TrendingUp, Shirt } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const [totalUsers, activeUsers, totalTransactions, recentTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.transaction.count(),
    prisma.transaction.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: true, operator: true },
    }),
  ])

  const avgCredits = await prisma.user.aggregate({ _avg: { credits: true } })
  const totalCredits = await prisma.user.aggregate({ _sum: { credits: true } })

  return {
    totalUsers,
    activeUsers,
    totalTransactions,
    recentTransactions,
    avgCredits: Math.round(avgCredits._avg.credits ?? 0),
    totalCredits: totalCredits._sum.credits ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      label: 'Utenti totali',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      sub: `${stats.activeUsers} attivi`,
    },
    {
      label: 'Crediti in circolazione',
      value: stats.totalCredits,
      icon: Shirt,
      color: 'text-brand-600 bg-brand-50',
      sub: `Media ${stats.avgCredits} per utente`,
    },
    {
      label: 'Transazioni totali',
      value: stats.totalTransactions,
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50',
      sub: 'Storico completo',
    },
  ]

  return (
    <div className="animate-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Panoramica del sistema di crediti</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value.toLocaleString('it')}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

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
