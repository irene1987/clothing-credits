import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UserPlus, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 20

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const q = searchParams.q?.trim() || ''
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))

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
      orderBy: { cardNumber: 'desc' },
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
    const qs = params.toString()
    return `/users${qs ? `?${qs}` : ''}`
  }

  function getPageNumbers(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            Utenti
          </h1>
          <p className="text-slate-500 mt-1">{totalCount} utenti trovati</p>
        </div>
        <Link href="/users/new" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Nuovo utente
        </Link>
      </div>

      {/* Search */}
      <form method="get" className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cerca per nome, cognome o numero tessera..."
          className="input pl-10"
        />
      </form>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Utente
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tessera
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Crediti
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Stato
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Registrato
              </th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
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
                        {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 text-xs">{user.cardNumber}</td>
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
                    <Link
                      href={`/users/${user.id}`}
                      className="btn-secondary text-xs py-1.5"
                    >
                      Dettagli
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
            <p className="text-sm text-slate-400">
              Pagina {page} di {totalPages} · {totalCount} utenti
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={pageUrl(page - 1)}
                aria-disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === 1
                    ? 'text-slate-300 pointer-events-none'
                    : 'text-slate-600 hover:bg-surface-100'
                }`}
              >
                ←
              </Link>
              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm select-none">…</span>
                ) : (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-600 hover:bg-surface-100'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
              <Link
                href={pageUrl(page + 1)}
                aria-disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === totalPages
                    ? 'text-slate-300 pointer-events-none'
                    : 'text-slate-600 hover:bg-surface-100'
                }`}
              >
                →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
