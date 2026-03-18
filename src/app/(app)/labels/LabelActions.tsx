'use client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'

export function LabelActions({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Eliminare questa tipologia?')) return
    await fetch(`/api/labels/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => router.push(`/labels/${id}/edit`)}
        className="text-slate-300 hover:text-brand-500 transition-colors"
        title="Modifica"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="text-slate-300 hover:text-red-500 transition-colors"
        title="Elimina"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
