'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    birthYear: '',
    gender: '',
    age: '',
    tags: '',
    email: '',
    credits: 0,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/users/next-card')
      .then(r => r.json())
      .then(data => {
        if (data.nextCard) setForm(f => ({ ...f, cardNumber: data.nextCard }))
      })
      .catch(() => {})
  }, [])

  const set = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/users/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Errore durante la creazione')
      setLoading(false)
    }
  }

  return (
    <div className="animate-in max-w-xl space-y-6">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Torna agli utenti
      </Link>

      <div>
        <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Nuovo utente
        </h1>
        <p className="text-slate-500 mt-1">Registra un nuovo beneficiario</p>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nome *</label>
            <input className="input" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div>
            <label className="label">Cognome *</label>
            <input className="input" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Numero tessera *</label>
          <input
            className="input font-mono"
            required
            value={form.cardNumber}
            onChange={e => set('cardNumber', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Anno di nascita</label>
            <input className="input" type="number" min={1900} max={new Date().getFullYear()} value={form.birthYear} onChange={e => set('birthYear', e.target.value)} />
          </div>
          <div>
            <label className="label">Genere</label>
            <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">—</option>
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="NB">Non-binary</option>
            </select>
          </div>
          <div>
            <label className="label">Età</label>
            <input className="input" type="number" min={0} max={120} value={form.age} onChange={e => set('age', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tags</label>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
          <div>
            <label className="label">Crediti iniziali</label>
            <input
              className="input"
              type="number"
              min={0}
              value={form.credits}
              onChange={e => set('credits', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <label className="label">Note</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Eventuali note sull'utente..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creazione...' : 'Crea utente'}
          </button>
          <Link href="/users" className="btn-secondary">Annulla</Link>
        </div>
      </form>
    </div>
  )
}
