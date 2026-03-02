'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

interface NewUsersMonth {
  key: number
  label: string
  count: number
}

interface MonthStat {
  key: string
  label: string
  uniqueUsers: number
}

interface UserDetail {
  id: string
  cardNumber: string
  firstName: string
  lastName: string
  gender: string | null
  age: number | null
  tags: string | null
  createdAt?: string
}

interface ModalState {
  type: 'new_users' | 'checkout_users'
  monthKey: string
  label: string
}

function ClickableBar({
  label,
  value,
  max,
  color,
  disabled,
  onClick,
}: {
  label: string
  value: number
  max: number
  color: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="w-full text-left group disabled:cursor-default"
      disabled={disabled}
      onClick={onClick}
    >
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={`font-semibold ${!disabled ? 'group-hover:text-brand-600 underline decoration-dotted underline-offset-2' : 'text-slate-400'} transition-colors`}>
          {value.toLocaleString('it')}
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} ${!disabled ? 'group-hover:opacity-75 transition-opacity' : ''}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </button>
  )
}

function Modal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const [users, setUsers] = useState<UserDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/stats-detail?type=${state.type}&month=${state.monthKey}`)
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
  }, [state.type, state.monthKey])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <div>
            <h2 className="font-semibold text-slate-900">
              {state.type === 'new_users' ? 'Nuovi utenti' : 'Utenti al ritiro'}
            </h2>
            <p className="text-sm text-slate-500 capitalize">{state.label}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-10">Caricamento...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">Nessun utente</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-surface-200">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Tessera</th>
                  <th className="text-left px-5 py-3">Nome</th>
                  <th className="text-left px-5 py-3">Genere</th>
                  <th className="text-left px-5 py-3">Età</th>
                  <th className="text-left px-5 py-3">Tags</th>
                  {state.type === 'new_users' && <th className="text-left px-5 py-3">Data reg.</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-surface-50">
                    <td className="px-5 py-3 font-mono text-xs text-brand-600">{u.cardNumber}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <Link
                        href={`/users/${u.id}`}
                        className="hover:text-brand-600 transition-colors"
                        onClick={onClose}
                      >
                        {u.firstName} {u.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.gender || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{u.age ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{u.tags || '—'}</td>
                    {state.type === 'new_users' && (
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('it-IT') : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-surface-200 text-xs text-slate-400 text-right">
          {!loading && `${users.length} utenti`}
        </div>
      </div>
    </div>
  )
}

export function NewUsersChart({
  months,
  year,
}: {
  months: NewUsersMonth[]
  year: number
}) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const max = Math.max(...months.map(m => m.count), 1)

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-500">Nuovi utenti per mese ({year})</p>
          <span className="text-xs font-semibold bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full">
            Totale anno: {months.reduce((s, m) => s + m.count, 0)}
          </span>
        </div>
        <div className="space-y-3 mt-4">
          {months.map(m => (
            <ClickableBar
              key={m.key}
              label={m.label}
              value={m.count}
              max={max}
              color="bg-emerald-400"
              disabled={m.count === 0}
              onClick={() => setModal({
                type: 'new_users',
                monthKey: `${year}-${String(m.key + 1).padStart(2, '0')}`,
                label: m.label,
              })}
            />
          ))}
        </div>
      </div>
      {modal && <Modal state={modal} onClose={() => setModal(null)} />}
    </>
  )
}

export function CheckoutUsersChart({ monthlyStats }: { monthlyStats: MonthStat[] }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const max = Math.max(...monthlyStats.map(m => m.uniqueUsers), 1)

  return (
    <>
      <div className="card">
        <p className="text-sm font-medium text-slate-500">Utenti al ritiro per mese</p>
        <div className="space-y-3 mt-4">
          {monthlyStats.map(m => (
            <ClickableBar
              key={m.key}
              label={m.label}
              value={m.uniqueUsers}
              max={max}
              color="bg-brand-500"
              disabled={m.uniqueUsers === 0}
              onClick={() => setModal({
                type: 'checkout_users',
                monthKey: m.key,
                label: m.label,
              })}
            />
          ))}
        </div>
      </div>
      {modal && <Modal state={modal} onClose={() => setModal(null)} />}
    </>
  )
}
