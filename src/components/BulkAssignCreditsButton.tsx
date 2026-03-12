'use client'
import { useState } from 'react'
import { Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BulkAssignCreditsButton({ usersWithCredits }: { usersWithCredits: number }) {
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

  // ── Disabled state: credits not yet reset ──────────────────────────────────
  if (usersWithCredits > 0) {
    return (
      <button disabled className="btn-secondary text-sm opacity-40 cursor-not-allowed" title="Prima devi azzerare tutti i crediti">
        <Gift className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Assegna crediti</span>
        <span className="sm:hidden">Assegna</span>
      </button>
    )
  }

  // ── Result banner ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 hidden sm:inline">
            ✓ {result.adulti} adulti +50 cr. · {result.bambini} bambini +20 cr.
          </span>
          <button onClick={() => setResult(null)} className="btn-secondary text-sm">
            OK
          </button>
        </div>
        {/* Mobile: result shown as dropdown */}
        <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white border border-surface-200 rounded-2xl shadow-xl p-3 sm:hidden">
          <p className="text-sm text-slate-600">
            ✓ <span className="font-medium text-slate-900">{result.adulti}</span> adulti +50 cr.
            · <span className="font-medium text-slate-900">{result.bambini}</span> bambini +20 cr.
          </p>
        </div>
      </div>
    )
  }

  // ── Main button + dropdown confirm ────────────────────────────────────────
  return (
    <div className="relative">
      <button
        onClick={() => setConfirm(v => !v)}
        className="btn-secondary"
        aria-expanded={confirm}
      >
        <Gift className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Assegna crediti</span>
        <span className="sm:hidden">Assegna</span>
      </button>

      {confirm && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-surface-200 rounded-2xl shadow-xl p-4 space-y-3">
          <p className="text-sm text-slate-600 leading-snug">
            Assegnare crediti a tutti gli utenti?{' '}
            <span className="font-semibold text-slate-900">+50 adulti · +20 bambini</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAssign}
              disabled={loading}
              className="btn-primary text-sm flex-1 justify-center"
            >
              {loading ? 'Assegnazione...' : 'Conferma'}
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