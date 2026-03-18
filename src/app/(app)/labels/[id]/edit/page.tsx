'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

export default function EditLabelPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', credits: '', season: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/labels/${params.id}`, { method: 'DELETE' })
    router.push('/labels')
  }

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
        Modifica etichetta
      </h1>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stagione *</label>
            <select className="input" required value={form.season} onChange={e => set('season', e.target.value)}>
              <option value="">—</option>
              <option value="Inverno">Inverno</option>
              <option value="Estate">Estate</option>
              <option value="4Stagioni">4Stagioni</option>
            </select>
          </div>
          <div>
            <label className="label">Crediti *</label>
            <input className="input" type="number" min={0} required value={form.credits} onChange={e => set('credits', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Categoria *</label>
          <select className="input" required value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">—</option>
            <option value="Child">Child</option>
            <option value="Baby">Baby</option>
            <option value="Uomo">Uomo</option>
            <option value="Donna">Donna</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
            <Link href="/labels" className="btn-secondary">Annulla</Link>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="btn-secondary text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Elimina
          </button>
        </div>
      </form>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Elimina etichetta</p>
                <p className="text-sm text-slate-500 mt-0.5">Questa azione non può essere annullata.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1 justify-center"
              >
                {deleting ? 'Eliminazione...' : 'Elimina'}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
