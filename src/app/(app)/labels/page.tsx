import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LabelActions } from './LabelActions'

export default async function LabelsPage() {
  const labels = await prisma.label.findMany({
    orderBy: [{ name: 'asc' }, { season: 'asc' }],
  })

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            Etichette
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{labels.length} tipologie</p>
        </div>
        <Link href="/labels/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuova tipologia</span>
          <span className="sm:hidden">Nuova</span>
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipologia</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stagione</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Crediti</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {labels.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  Nessuna tipologia registrata
                </td>
              </tr>
            ) : (
              labels.map(label => (
                <tr key={label.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{label.name}</td>
                  <td className="px-6 py-4 text-slate-600">{label.season}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-brand-600">{label.credits}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{label.category}</td>
                  <td className="px-6 py-4">
                    <LabelActions id={label.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {labels.length === 0 ? (
          <div className="card text-center py-12 text-slate-400 text-sm">
            Nessuna tipologia registrata
          </div>
        ) : (
          labels.map(label => (
            <div key={label.id} className="card flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{label.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label.season} · {label.category}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-4">
                <div>
                  <p className="text-xl font-bold text-brand-600">{label.credits}</p>
                  <p className="text-[10px] text-slate-400">crediti</p>
                </div>
                <LabelActions id={label.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
