'use client'
import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ResetAllCreditsButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    await fetch('/api/users/reset-all-credits', { method: 'POST' })
    setLoading(false)
    setConfirm(false)
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Azzerare i crediti di tutti gli utenti?</span>
        <button onClick={handleReset} disabled={loading} className="btn-danger text-sm">
          {loading ? 'Azzeramento...' : 'Conferma'}
        </button>
        <button onClick={() => setConfirm(false)} className="btn-secondary text-sm">
          Annulla
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)} className="btn-secondary">
      <RotateCcw className="w-4 h-4" />
      Azzera tutti i crediti
    </button>
  )
}
