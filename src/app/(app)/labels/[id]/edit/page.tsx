'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditLabelPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', credits: '', season: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/labels/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          name: data.name,
          credits: String(data.credits),
          season: data.season,
          category: data.category,
        })
        setFetching(false)
      })
  }, [params.id])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/labels/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/labels')
    } else {
      const data = await res.json()
      setError(data.error || 'Errore')
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-slate-400 p-8">Caricamento...</div>

  return (
    <div className="animate-in max-w-xl space-y-6">
      <Link href="/labels" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Torna alle tipologie
      </Link>

      <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
        Modifica tipologia
      </h1>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stagione *</label>
            <input className="input" required value={form.season} onChange={e => set('season', e.target.value)} />
          </div>
          <div>
            <label className="label">Crediti *</label>
            <input className="input" type="number" min={0} required value={form.credits} onChange={e => set('credits', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Categoria *</label>
          <input className="input" required value={form.category} onChange={e => set('category', e.target.value)} />
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          <Link href="/labels" className="btn-secondary">Annulla</Link>
        </div>
      </form>
    </div>
  )
}
