'use client'
import { useState } from 'react'
import { Download } from 'lucide-react'

interface User {
  cardNumber: string
  firstName: string
  lastName: string
  gender: string | null
  age: number | null
  tags: string | null
  notes: string | null
}

export function ExportUsersButton() {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const users: User[] = await res.json()

      const header = ['ID', 'Firstname', 'Surname', 'Gender', 'Age', 'Tags', 'Comments', 'Boxtribute Family ID', 'Head of Family']
      const rows = users.map(u => [
        u.cardNumber,
        u.firstName,
        u.lastName,
        u.gender ?? '',
        u.age != null ? String(u.age) : '',
        u.tags ?? '',
        u.notes ?? '',
        '',
        '',
      ])

      const csv = [header, ...rows]
        .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `utenti-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="btn-secondary text-sm flex items-center gap-1.5"
      title="Esporta CSV utenti"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Export...' : 'CSV'}
    </button>
  )
}
