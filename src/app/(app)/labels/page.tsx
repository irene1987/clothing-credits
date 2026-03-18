import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { LabelActions } from './LabelActions'
import { ClickableRow } from '@/components/ClickableRow'
import { LabelSearchInput } from './LabelSearchInput'

type SortField = 'name' | 'season' | 'credits' | 'category'
type SortDir = 'asc' | 'desc'
const VALID_FIELDS: SortField[] = ['name', 'season', 'credits', 'category']

export default async function LabelsPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; dir?: string }
}) {
  const q = searchParams.q?.trim() || ''
  const sortField: SortField = VALID_FIELDS.includes(searchParams.sort as SortField)
    ? (searchParams.sort as SortField)
    : 'name'
  const sortDir: SortDir = searchParams.dir === 'desc' ? 'desc' : 'asc'

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { season: { contains: q, mode: 'insensitive' as const } },
          { category: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const labels = await prisma.label.findMany({
    where,
    orderBy: { [sortField]: sortDir },
  })

  function sortUrl(field: SortField) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('sort', field)
    if (field === sortField) {
      params.set('dir', sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('dir', 'asc')
    }
    return `/labels?${params.toString()}`
  }

  function SortTh({ field, label, className }: { field: SortField; label: string; className?: string }) {
    const isActive = sortField === field
    return (
      <th className={`px-6 py-3.5 ${className ?? 'text-left'}`}>
        <Link
          href={sortUrl(field)}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider select-none group text-slate-500 hover:text-slate-800 transition-colors"
        >
          {label}
          <span className={`transition-colors ${isActive ? 'text-brand-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
            {isActive
              ? sortDir === 'asc'
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronsUpDown className="w-3.5 h-3.5" />
            }
          </span>
        </Link>
      </th>
    )
  }

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            Etichette
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{labels.length} etichette{q ? ` per "${q}"` : ''}</p>
        </div>
        <Link href="/labels/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuova etichetta</span>
          <span className="sm:hidden">Nuova</span>
        </Link>
      </div>

      {/* Search */}
      <LabelSearchInput defaultValue={q} sortField={sortField} sortDir={sortDir} />

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <SortTh field="name" label="Tipologia" />
              <SortTh field="season" label="Stagione" />
              <SortTh field="credits" label="Crediti" />
              <SortTh field="category" label="Categoria" />
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {labels.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  {q ? `Nessun risultato per "${q}"` : 'Nessuna etichetta registrata'}
                </td>
              </tr>
            ) : (
              labels.map(label => (
                <ClickableRow key={label.id} href={`/labels/${label.id}/edit`} className="hover:bg-brand-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{label.name}</td>
                  <td className="px-6 py-4 text-slate-600">{label.season}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-brand-600">{label.credits}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{label.category}</td>
                  <td className="px-6 py-4">
                    <LabelActions id={label.id} />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {labels.length === 0 ? (
          <div className="card text-center py-12 text-slate-400 text-sm">
            {q ? `Nessun risultato per "${q}"` : 'Nessuna etichetta registrata'}
          </div>
        ) : (
          labels.map(label => (
            <Link key={label.id} href={`/labels/${label.id}/edit`} className="card flex items-center gap-4 p-4 hover:bg-surface-50 transition-colors active:scale-[0.99]">
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
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
