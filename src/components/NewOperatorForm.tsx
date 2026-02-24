'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NewOperatorForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OPERATOR' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'ok', text: 'Operatore creato!' })
      setForm({ name: '', email: '', password: '', role: 'OPERATOR' })
      router.refresh()
    } else {
      setMessage({ type: 'err', text: data.error || 'Errore' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nome</label>
          <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={8} value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <div>
          <label className="label">Ruolo</label>
          <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="OPERATOR">Operatore</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`text-sm rounded-xl p-3 ${message.type === 'ok' ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Creazione...' : 'Crea operatore'}
      </button>
    </form>
  )
}
