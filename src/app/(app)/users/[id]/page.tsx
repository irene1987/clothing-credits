import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Edit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreditActions } from '@/components/CreditActions'

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { operator: true },
      },
    },
  })

  if (!user) notFound()

  const maxCredits = 20 // Customizable

  return (
    <div className="animate-in space-y-6 max-w-4xl">
      {/* Back */}
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Tutti gli utenti
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-slate-500 font-mono text-sm">{user.cardNumber}</p>
              <div className="flex items-center gap-2 mt-1">
                {user.isActive
                  ? <span className="badge-green">Attivo</span>
                  : <span className="badge-slate">Disabilitato</span>
                }
                {user.phone && <span className="text-sm text-slate-500">{user.phone}</span>}
              </div>
            </div>
          </div>
          <Link href={`/users/${user.id}/edit`} className="btn-secondary">
            <Edit className="w-4 h-4" />
            Modifica
          </Link>
        </div>

        {user.notes && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800">
            📝 {user.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credits */}
        <div className="card text-center">
          <p className="text-sm font-medium text-slate-500 mb-4">Crediti disponibili</p>
          <div className="flex justify-center mb-4">
            <div
              className="credits-ring"
              style={{ '--pct': Math.min((user.credits / maxCredits) * 100, 100) } as any}
            >
              <span className="relative z-10 text-3xl font-bold text-slate-900">
                {user.credits}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400">su {maxCredits} massimi</p>
        </div>

        {/* Actions */}
        <CreditActions userId={user.id} currentCredits={user.credits} />
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Storico transazioni</h2>
        {user.transactions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">Nessuna transazione</p>
        ) : (
          <div className="space-y-1">
            {user.transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  tx.amount > 0 ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-500'
                }`}>
                  {tx.amount > 0
                    ? <ArrowUpRight className="w-4 h-4" />
                    : <ArrowDownRight className="w-4 h-4" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{tx.description || tx.type}</p>
                  <p className="text-xs text-slate-400">
                    {tx.operator.name} · {formatDateTime(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.amount > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-slate-400">→ {tx.balanceAfter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
