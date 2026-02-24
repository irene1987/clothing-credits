import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true, operator: true },
  })

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Transazioni
        </h1>
        <p className="text-slate-500 mt-1">Storico completo delle operazioni sui crediti</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utente</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Importo</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo dopo</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nota</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operatore</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-surface-50">
                <td className="px-6 py-3.5">
                  <Link href={`/users/${tx.userId}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {tx.user.firstName} {tx.user.lastName}
                  </Link>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {tx.amount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    </span>
                    <span className="text-slate-600 text-xs uppercase tracking-wide">{tx.type}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span className={`font-semibold ${tx.amount > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-mono text-slate-600">{tx.balanceAfter}</td>
                <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{tx.description || '—'}</td>
                <td className="px-6 py-3.5 text-slate-500">{tx.operator.name}</td>
                <td className="px-6 py-3.5 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <p className="text-center py-12 text-slate-400">Nessuna transazione</p>
        )}
      </div>
    </div>
  )
}
