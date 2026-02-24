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
        <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Impostazioni
        </h1>
        <p className="text-slate-500 mt-1">Gestione operatori e configurazione</p>
      </div>

      {/* Operators */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-5">Operatori</h2>
        <div className="space-y-2 mb-6">
          {operators.map(op => (
            <div key={op.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-50">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                {op.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{op.name}</p>
                <p className="text-xs text-slate-400">{op.email}</p>
              </div>
              <span className={op.role === 'ADMIN' ? 'badge-amber' : 'badge-slate'}>
                {op.role}
              </span>
              <span className={op.isActive ? 'badge-green' : 'badge-red'}>
                {op.isActive ? 'Attivo' : 'Disabilitato'}
              </span>
              <span className="text-xs text-slate-400">{formatDate(op.createdAt)}</span>
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
