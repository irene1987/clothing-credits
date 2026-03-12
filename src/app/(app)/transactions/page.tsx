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
        <h1 className="text-3xl md:text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Transazioni
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Storico completo delle operazioni sui crediti</p>
      </div>

      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block card p-0 overflow-hidden">
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

      {/* ── Mobile list (< md) ── */}
      <div className="md:hidden space-y-2">
        {transactions.length === 0 ? (
          <div className="card text-center py-12 text-slate-400 text-sm">Nessuna transazione</div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="card p-4 space-y-2">
              {/* Row 1: icon + user + amount */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  tx.amount > 0 ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-500'
                }`}>
                  {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <Link href={`/users/${tx.userId}`} className="flex-1 font-medium text-brand-600 hover:text-brand-700 truncate">
                  {tx.user.firstName} {tx.user.lastName}
                </Link>
                <div className="text-right shrink-0">
                  <span className={`font-bold text-base ${tx.amount > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">cr.</span>
                </div>
              </div>

              {/* Row 2: note (if present) */}
              {tx.description && (
                <p className="text-xs text-slate-500 truncate pl-11">{tx.description}</p>
              )}

              {/* Row 3: meta — operator · balance · date */}
              <div className="flex items-center gap-2 pl-11 text-xs text-slate-400">
                <span>{tx.operator.name}</span>
                <span className="text-slate-200">·</span>
                <span>saldo <span className="font-mono text-slate-500">{tx.balanceAfter}</span></span>
                <span className="text-slate-200">·</span>
                <span className="ml-auto">
                  {new Date(tx.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  {' '}
                  {new Date(tx.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}