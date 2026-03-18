'use client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export function LabelActions({ id }: { id: string }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await fetch(`/api/labels/${id}`, { method: 'DELETE' })
    setShowConfirm(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true) }}
          className="text-red-300 hover:text-red-500 transition-colors"
          title="Elimina"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

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
                disabled={loading}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1 justify-center"
              >
                {loading ? 'Eliminazione...' : 'Elimina'}
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
    </>
  )
}
