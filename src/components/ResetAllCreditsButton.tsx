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

  return (
    <div className="relative">
      <button
        onClick={() => setConfirm(v => !v)}
        className="btn-secondary"
        aria-expanded={confirm}
      >
        <RotateCcw className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Azzera tutti i crediti</span>
        <span className="sm:hidden">Azzera</span>
      </button>

      {confirm && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-surface-200 rounded-2xl shadow-xl p-4 space-y-3">
          <p className="text-sm text-slate-600 leading-snug">
            Azzerare i crediti di <span className="font-semibold text-slate-900">tutti gli utenti</span>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="btn-danger text-sm flex-1 justify-center"
            >
              {loading ? 'Azzeramento...' : 'Conferma'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="btn-secondary text-sm flex-1 justify-center"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}