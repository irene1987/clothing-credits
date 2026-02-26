'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditUserPage({ params }: { params: { id: string } }) {
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
    notes: '',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/users/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          cardNumber: data.cardNumber,
          birthYear: data.birthYear ? String(data.birthYear) : '',
          gender: data.gender || '',
          age: data.age ? String(data.age) : '',
          tags: data.tags || '',
          email: data.email || '',
          notes: data.notes || '',
          isActive: data.isActive,
        })
        setFetching(false)
      })
  }, [params.id])

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/users/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push(`/users/${params.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Errore')
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-slate-400 p-8">Caricamento...</div>

  return (
    <div className="animate-in max-w-xl space-y-6">
      <Link href={`/users/${params.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Torna al profilo
      </Link>

      <h1 className="text-4xl text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
        Modifica utente
      </h1>

      <form onSubmit={submit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nome</label>
            <input className="input" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div>
            <label className="label">Cognome</label>
            <input className="input" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Numero tessera</label>
          <input className="input font-mono" required value={form.cardNumber} onChange={e => set('cardNumber', e.target.value)} />
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

        <div>
          <label className="label">Tags</label>
          <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>

        <div>
          <label className="label">Note</label>
          <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-brand-600"
            checked={form.isActive}
            onChange={e => set('isActive', e.target.checked)}
          />
          <span className="text-sm font-medium text-slate-700">Utente attivo</span>
        </label>

        {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          <Link href={`/users/${params.id}`} className="btn-secondary">Annulla</Link>
        </div>
      </form>
    </div>
  )
}
