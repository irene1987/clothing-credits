'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, RefreshCw } from 'lucide-react'

interface Props {
  userId: string
  currentCredits: number
}

export function CreditActions({ userId, currentCredits }: Props) {
  const router = useRouter()
  const [amount, setAmount] = useState(1)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const submit = async (type: 'ADD' | 'SUBTRACT' | 'RESET') => {
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, amount, description }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage({ type: 'ok', text: 'Operazione completata!' })
      setDescription('')
      router.refresh()
    } else {
      setMessage({ type: 'err', text: data.error || 'Errore' })
    }
    setLoading(false)
  }

  return (
    <div className="card space-y-4">
      <p className="text-sm font-medium text-slate-500">Gestione crediti</p>

      <div>
        <label className="label">Quantità</label>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary px-3"
            onClick={() => setAmount(Math.max(1, amount - 1))}
            type="button"
          >−</button>
          <input
            type="number"
            className="input text-center text-xl font-bold"
            value={amount}
            min={1}
            onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <button
            className="btn-secondary px-3"
            onClick={() => setAmount(amount + 1)}
            type="button"
          >+</button>
        </div>
      </div>

      <div>
        <label className="label">Nota (opzionale)</label>
        <input
          type="text"
          className="input"
          placeholder="es. Ritiro magliette invernali"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-primary justify-center"
          onClick={() => submit('ADD')}
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          Aggiungi
        </button>
        <button
          className="btn-danger justify-center"
          onClick={() => submit('SUBTRACT')}
          disabled={loading || currentCredits < amount}
        >
          <Minus className="w-4 h-4" />
          Sottrai
        </button>
      </div>

      <button
        className="btn-secondary w-full justify-center text-amber-600 border-amber-200 hover:bg-amber-50"
        onClick={() => {
          if (confirm('Azzerare i crediti di questo utente?')) submit('RESET')
        }}
        disabled={loading}
      >
        <RefreshCw className="w-4 h-4" />
        Azzera crediti
      </button>

      {message && (
        <div className={`text-sm rounded-xl p-3 text-center ${
          message.type === 'ok'
            ? 'bg-brand-50 text-brand-700'
            : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
