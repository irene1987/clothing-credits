'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ShoppingBag, Pencil, Check } from 'lucide-react'

interface User {
  id: string
  cardNumber: string
  firstName: string
  lastName: string
  credits: number
}

interface Label {
  id: string
  name: string
  credits: number
  season: string
  category: string
}

interface CartItem {
  label: Label
  quantity: number
}

function SearchCombobox<T>({
  placeholder,
  onSearch,
  onSelect,
  onQueryChange,
  renderOption,
  renderSelected,
  selected,
}: {
  placeholder: string
  onSearch: (q: string) => Promise<T[]>
  onSelect: (item: T) => void
  onQueryChange?: () => void
  renderOption: (item: T) => React.ReactNode
  renderSelected: (item: T) => string
  selected: T | null
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) return
    const t = setTimeout(async () => {
      if (query.length < 1) { setResults([]); return }
      const r = await onSearch(query)
      setResults(r)
      setOpen(true)
    }, 250)
    return () => clearTimeout(t)
  }, [query, selected])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center gap-2">
        <span className="input flex-1 bg-brand-50 text-brand-800 font-medium truncate">{renderSelected(selected)}</span>
        <button type="button" onClick={() => { onSelect(null as any); setQuery('') }} className="btn-secondary text-sm px-3 shrink-0">
          Cambia
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <input
        className="input w-full"
        placeholder={placeholder}
        value={query}
        onChange={e => { setQuery(e.target.value); onQueryChange?.() }}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((item, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-4 py-2.5 hover:bg-brand-50 text-sm border-b border-surface-100 last:border-0"
              onClick={() => { onSelect(item); setQuery(''); setOpen(false) }}
            >
              {renderOption(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingQty, setEditingQty] = useState('')

  const startEdit = (i: number) => {
    setEditingIndex(i)
    setEditingQty(String(cart[i].quantity))
  }

  const confirmEdit = (i: number) => {
    const qty = Math.max(1, parseInt(editingQty) || 1)
    setCart(prev => prev.map((item, idx) => idx === i ? { ...item, quantity: qty } : item))
    setEditingIndex(null)
  }

  useEffect(() => {
    fetch('/api/labels').then(r => r.json()).then(setAllLabels)
  }, [])

  const searchUsers = async (q: string): Promise<User[]> => {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
    return res.json()
  }

  const searchLabels = async (q: string): Promise<Label[]> => {
    return allLabels.filter(l =>
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      l.season.toLowerCase().includes(q.toLowerCase())
    )
  }

  const totalCredits = cart.reduce((sum, item) => sum + item.label.credits * item.quantity, 0)
  const remainingCredits = user ? user.credits - totalCredits : null

  const addToCart = () => {
    if (!selectedLabel) return
    setCart(prev => {
      const existing = prev.findIndex(i => i.label.id === selectedLabel.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + quantity }
        return updated
      }
      return [...prev, { label: selectedLabel, quantity }]
    })
    setSelectedLabel(null)
    setQuantity(1)
  }

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!user || cart.length === 0 || totalCredits === 0) return
    setLoading(true)
    setMessage(null)

    const description = cart.map(i => `${i.label.name} (${i.label.season}) x${i.quantity}`).join(', ')

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        type: 'SUBTRACT',
        amount: totalCredits,
        description,
      }),
    })

    if (res.ok) {
      setMessage({ type: 'ok', text: `Salvato! Scalati ${totalCredits} crediti da ${user.firstName} ${user.lastName}.` })
      setUser(null)
      setCart([])
    } else {
      const data = await res.json()
      setMessage({ type: 'err', text: data.error || 'Errore nel salvataggio' })
    }
    setLoading(false)
  }

  return (
    <div className="animate-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl md:text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Checkout
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Scala i crediti in base ai prodotti ritirati</p>
      </div>

      {/* Step 1 - Utente */}
      <div className="card space-y-3">
        <p className="text-sm font-medium text-slate-500">1. Seleziona utente</p>
        <SearchCombobox<User>
          placeholder="Cerca tessera, nome o cognome..."
          onSearch={searchUsers}
          onSelect={(u) => { setUser(u); if (!u) setMessage(null) }}
          onQueryChange={() => setMessage(null)}
          selected={user}
          renderOption={u => (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-mono text-brand-600">{u.cardNumber}</span>
              <span className="font-medium text-slate-800">{u.firstName} {u.lastName}</span>
              <span className="text-slate-400 text-xs">{u.credits} crediti</span>
            </div>
          )}
          renderSelected={u => `${u.cardNumber} — ${u.firstName} ${u.lastName}`}
        />
        {user && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            <span className="text-sm text-slate-500">Budget iniziale:</span>
            <span className="font-bold text-slate-900">{user.credits} cr.</span>
            <span className="text-slate-300">→</span>
            <span className="text-sm text-slate-500">Residuo:</span>
            <span className={`font-bold text-lg ${remainingCredits! < 0 ? 'text-red-600' : 'text-brand-600'}`}>
              {remainingCredits} cr.
            </span>
          </div>
        )}
      </div>

      {/* Step 2 - Aggiungi prodotto */}
      <div className="card space-y-3">
        <p className="text-sm font-medium text-slate-500">2. Aggiungi prodotti</p>
        {/* Stack vertically on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="label">Tipo prodotto</label>
            <SearchCombobox<Label>
              placeholder="Cerca per nome o stagione..."
              onSearch={searchLabels}
              onSelect={setSelectedLabel}
              selected={selectedLabel}
              renderOption={l => (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-medium text-slate-800">{l.name}</span>
                  <span className="text-xs text-slate-500">{l.season}</span>
                  <span className="text-xs text-slate-400">{l.category}</span>
                  <span className="ml-auto font-semibold text-brand-600">{l.credits} cr.</span>
                </div>
              )}
              renderSelected={l => `${l.name} — ${l.season} — ${l.category} (${l.credits} cr.)`}
            />
          </div>
          <div className="flex gap-3 sm:gap-3 items-end">
            <div className="w-24 shrink-0">
              <label className="label">Quantità</label>
              <input
                type="number"
                className="input text-center"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!selectedLabel}
              className="btn-primary flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              Aggiungi
            </button>
          </div>
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <>
          {/* Desktop table (sm+) */}
          <div className="hidden sm:block card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stagione</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtà</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cr./pz</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Totale</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {cart.map((item, i) => (
                  <tr key={i} className="hover:bg-surface-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{item.label.name}</td>
                    <td className="px-5 py-3 text-slate-500">{item.label.season}</td>
                    <td className="px-5 py-3 text-slate-500">{item.label.category}</td>
                    <td className="px-5 py-3 text-center text-slate-700">
                      {editingIndex === i ? (
                        <input
                          type="number"
                          className="input text-center w-16 py-1 px-2 text-sm"
                          min={1}
                          value={editingQty}
                          onChange={e => setEditingQty(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmEdit(i); if (e.key === 'Escape') setEditingIndex(null) }}
                          onBlur={() => confirmEdit(i)}
                          autoFocus
                        />
                      ) : item.quantity}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">{item.label.credits}</td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-600">
                      {item.label.credits * (editingIndex === i ? (parseInt(editingQty) || 1) : item.quantity)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingIndex === i ? (
                          <button type="button" onClick={() => confirmEdit(i)} className="text-brand-500 hover:text-brand-700 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button type="button" onClick={() => startEdit(i)} className="text-slate-300 hover:text-brand-500 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => removeFromCart(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-surface-200 bg-surface-50">
                  <td colSpan={5} className="px-5 py-3 text-sm font-semibold text-slate-600 text-right">Totale crediti da scalare</td>
                  <td className="px-5 py-3 text-right text-xl font-bold text-brand-600">{totalCredits}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile cart cards (< sm) */}
          <div className="sm:hidden card p-0 overflow-hidden divide-y divide-surface-100">
            {cart.map((item, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.label.name}</p>
                    <p className="text-xs text-slate-400">{item.label.season} · {item.label.category}</p>
                  </div>
                  <button type="button" onClick={() => removeFromCart(i)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{item.label.credits} cr./pz ×</span>
                  {/* Inline quantity edit */}
                  {editingIndex === i ? (
                    <input
                      type="number"
                      className="input text-center w-16 py-1 px-2 text-sm"
                      min={1}
                      value={editingQty}
                      onChange={e => setEditingQty(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') confirmEdit(i); if (e.key === 'Escape') setEditingIndex(null) }}
                      onBlur={() => confirmEdit(i)}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(i)}
                      className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
                    >
                      {item.quantity}
                      <Pencil className="w-3 h-3 text-slate-300" />
                    </button>
                  )}
                  <span className="ml-auto font-bold text-brand-600">
                    = {item.label.credits * (editingIndex === i ? (parseInt(editingQty) || 1) : item.quantity)} cr.
                  </span>
                </div>
              </div>
            ))}
            {/* Total row */}
            <div className="flex items-center justify-between px-4 py-3 bg-surface-50">
              <span className="text-sm font-semibold text-slate-600">Totale da scalare</span>
              <span className="text-xl font-bold text-brand-600">{totalCredits} cr.</span>
            </div>
          </div>
        </>
      )}

      {/* Save */}
      {cart.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!user || loading || (remainingCredits !== null && remainingCredits < 0)}
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <ShoppingBag className="w-4 h-4" />
            {loading ? 'Salvataggio...' : 'Salva e scala crediti'}
          </button>
          {!user && <span className="text-sm text-slate-400 text-center sm:text-left">Seleziona prima un utente</span>}
          {user && remainingCredits !== null && remainingCredits < 0 && (
            <span className="text-sm text-red-600 font-medium text-center sm:text-left">Crediti insufficienti!</span>
          )}
        </div>
      )}

      {message && (
        <div className={`rounded-xl p-4 text-sm font-medium ${message.type === 'ok' ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}