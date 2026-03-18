'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewLabelPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', credits: '', season: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/labels')
    } else {
      const data = await res.json()
      setError(data.error || 'Errore durante la creazione')
      setLoading(false)
    }
  }

  return (
    <div className="animate-in max-w-xl space-y-6">
      <Link href="/labels" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Torna alle etichette
      </Link>

      <div>
        <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Nuova etichetta
        </h1>
        <p className="text-slate-500 mt-1">Aggiungi una nuova tipologia di prodotto</p>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input
            className="input"
            required
            placeholder="es. Giacca invernale"
            value={form.name}
            onChange={e => set('name', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stagione *</label>
            <input
              className="input"
              required
              placeholder="es. Inverno 2025"
              value={form.season}
              onChange={e => set('season', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Crediti *</label>
            <input
              className="input"
              type="number"
              min={0}
              required
              placeholder="0"
              value={form.credits}
              onChange={e => set('credits', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Categoria *</label>
          <input
            className="input"
            required
            placeholder="es. Abbigliamento"
            value={form.category}
            onChange={e => set('category', e.target.value)}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creazione...' : 'Crea etichetta'}
          </button>
          <Link href="/labels" className="btn-secondary">Annulla</Link>
        </div>
      </form>
    </div>
  )
}
