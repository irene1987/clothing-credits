'use client'
import { useState } from 'react'
import { Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BulkAssignCreditsButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ adulti: number; bambini: number } | null>(null)
  const router = useRouter()

  const handleAssign = async () => {
    setLoading(true)
    const res = await fetch('/api/users/bulk-assign-credits', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    setConfirm(false)
    setResult(data)
    router.refresh()
  }

  if (result) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          ✓ {result.adulti} adulti +50 cr. · {result.bambini} bambini +20 cr.
        </span>
        <button onClick={() => setResult(null)} className="btn-secondary text-sm">
          OK
        </button>
      </div>
    )
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Assegnare crediti a tutti? (+50 adulti, +20 bambini)</span>
        <button onClick={handleAssign} disabled={loading} className="btn-primary text-sm">
          {loading ? 'Assegnazione...' : 'Conferma'}
        </button>
        <button onClick={() => setConfirm(false)} className="btn-secondary text-sm">
          Annulla
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)} className="btn-secondary">
      <Gift className="w-4 h-4" />
      Assegna crediti
    </button>
  )
}
