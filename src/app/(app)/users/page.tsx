import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UserPlus, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 20

type SortField = 'firstName' | 'lastName' | 'cardNumber' | 'gender' | 'age' | 'credits' | 'isActive' | 'createdAt'
type SortDir = 'asc' | 'desc'

const VALID_FIELDS: SortField[] = ['firstName', 'lastName', 'cardNumber', 'gender', 'age', 'credits', 'isActive', 'createdAt']

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; sort?: string; dir?: string }
}) {
  const q = searchParams.q?.trim() || ''
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const sortField: SortField = VALID_FIELDS.includes(searchParams.sort as SortField)
    ? (searchParams.sort as SortField)
    : 'cardNumber'
  const sortDir: SortDir = searchParams.dir === 'asc' ? 'asc' : 'desc'

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' as const } },
          { lastName: { contains: q, mode: 'insensitive' as const } },
          { cardNumber: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    if (sortField !== 'cardNumber') params.set('sort', sortField)
    if (sortDir !== 'desc') params.set('dir', sortDir)
    const qs = params.toString()
    return `/users${qs ? `?${qs}` : ''}`
  }

  function sortUrl(field: SortField) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('sort', field)
    if (field === sortField) {
      params.set('dir', sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      params.set('dir', field === 'createdAt' ? 'desc' : 'asc')
    }
    return `/users?${params.toString()}`
  }

  function getPageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
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
            Utenti
          </h1>
          <p className="text-slate-500 mt-1 text-sm">{totalCount} utenti trovati</p>
        </div>
        <Link href="/users/new" className="btn-primary shrink-0">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuovo utente</span>
          <span className="sm:hidden">Nuovo</span>
        </Link>
      </div>

      {/* Search */}
      <form method="get" className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cerca nome, cognome o tessera..."
          className="input pl-10"
        />
        {/* Preserve sort params across search submissions */}
        {sortField !== 'cardNumber' && <input type="hidden" name="sort" value={sortField} />}
        {sortDir !== 'desc' && <input type="hidden" name="dir" value={sortDir} />}
      </form>

      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <SortTh field="firstName" label="Utente" />
              <SortTh field="cardNumber" label="Tessera" />
              <SortTh field="gender" label="Genere" />
              <SortTh field="age" label="Età" />
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
              <SortTh field="credits" label="Crediti" />
              <SortTh field="isActive" label="Stato" />
              <SortTh field="createdAt" label="Registrato" />
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400">
                  {q ? `Nessun risultato per "${q}"` : 'Nessun utente registrato'}
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                        {user.birthYear && <p className="text-xs text-slate-400">{user.birthYear}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 text-xs">{user.cardNumber}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.gender || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.age ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{user.tags || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-base ${user.credits > 0 ? 'text-brand-600' : 'text-slate-400'}`}>
                      {user.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive
                      ? <span className="badge-green">Attivo</span>
                      : <span className="badge-slate">Disabilitato</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/users/${user.id}`} className="btn-secondary text-xs py-1.5">
                      Dettagli
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
            <p className="text-sm text-slate-400">
              Pagina {page} di {totalPages} · {totalCount} utenti
            </p>
            <Pagination page={page} totalPages={totalPages} pageUrl={pageUrl} getPageNumbers={getPageNumbers} />
          </div>
        )}
      </div>

      {/* ── Mobile card list (< md) ── */}
      <div className="md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="card text-center py-12 text-slate-400 text-sm">
            {q ? `Nessun risultato per "${q}"` : 'Nessun utente registrato'}
          </div>
        ) : (
          users.map(user => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="card flex items-center gap-4 p-4 hover:bg-surface-50 transition-colors active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                  {user.isActive
                    ? <span className="badge-green text-[10px] py-0.5">Attivo</span>
                    : <span className="badge-slate text-[10px] py-0.5">Disabilitato</span>
                  }
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{user.cardNumber}</p>
                {user.tags && <p className="text-xs text-slate-400 truncate mt-0.5">{user.tags}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xl font-bold ${user.credits > 0 ? 'text-brand-600' : 'text-slate-300'}`}>
                  {user.credits}
                </p>
                <p className="text-[10px] text-slate-400">crediti</p>
              </div>
            </Link>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">{page}/{totalPages} · {totalCount} utenti</p>
            <div className="flex items-center gap-1">
              <Link href={pageUrl(page - 1)} aria-disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-600 hover:bg-surface-100'}`}>
                ←
              </Link>
              <span className="text-sm text-slate-600 font-medium px-2">{page}</span>
              <Link href={pageUrl(page + 1)} aria-disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-600 hover:bg-surface-100'}`}>
                →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, pageUrl, getPageNumbers }: {
  page: number
  totalPages: number
  pageUrl: (p: number) => string
  getPageNumbers: () => (number | '...')[]
}) {
  return (
    <div className="flex items-center gap-1">
      <Link href={pageUrl(page - 1)} aria-disabled={page === 1}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-600 hover:bg-surface-100'}`}>
        ←
      </Link>
      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm select-none">…</span>
        ) : (
          <Link key={p} href={pageUrl(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-surface-100'}`}>
            {p}
          </Link>
        )
      )}
      <Link href={pageUrl(page + 1)} aria-disabled={page === totalPages}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-600 hover:bg-surface-100'}`}>
        →
      </Link>
    </div>
  )
}