import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { NewOperatorForm } from '@/components/NewOperatorForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/dashboard')

  const operators = await prisma.operator.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="animate-in space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl md:text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Impostazioni
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Gestione operatori e configurazione</p>
      </div>

      {/* Operators */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-5">Operatori</h2>
        <div className="space-y-2 mb-6">
          {operators.map(op => (
            <div key={op.id} className="p-3 rounded-xl bg-surface-50">

              {/* Top row: avatar + name/email + badges */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                  {op.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{op.name}</p>
                  <p className="text-xs text-slate-400 truncate">{op.email}</p>
                </div>
                {/* Badges + date: inline on sm+, wrap below on mobile */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className={op.role === 'ADMIN' ? 'badge-amber' : 'badge-slate'}>
                    {op.role}
                  </span>
                  <span className={op.isActive ? 'badge-green' : 'badge-red'}>
                    {op.isActive ? 'Attivo' : 'Disabilitato'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(op.createdAt)}</span>
                </div>
              </div>

              {/* Mobile-only second row: badges + date */}
              <div className="flex items-center gap-2 mt-2 pl-12 sm:hidden">
                <span className={op.role === 'ADMIN' ? 'badge-amber' : 'badge-slate'}>
                  {op.role}
                </span>
                <span className={op.isActive ? 'badge-green' : 'badge-red'}>
                  {op.isActive ? 'Attivo' : 'Disabilitato'}
                </span>
                <span className="text-xs text-slate-400 ml-auto">{formatDate(op.createdAt)}</span>
              </div>

            </div>
          ))}
        </div>

        <div className="border-t border-surface-200 pt-5">
          <h3 className="font-medium text-slate-700 mb-4">Aggiungi operatore</h3>
          <NewOperatorForm />
        </div>
      </div>
    </div>
  )
}