import { prisma } from '@/lib/prisma'
import { Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ResetAllCreditsButton } from '@/components/ResetAllCreditsButton'
import { BulkAssignCreditsButton } from '@/components/BulkAssignCreditsButton'

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
  const stats = await getStats()

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
