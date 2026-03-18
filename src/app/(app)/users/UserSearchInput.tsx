'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

interface UserResult {
  id: string
  cardNumber: string
  firstName: string
  lastName: string
  credits: number
}

export function UserSearchInput({
  defaultValue,
}: {
  defaultValue: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [results, setResults] = useState<UserResult[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (value.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(value.trim())}`)
      const data: UserResult[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    }, 250)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (user: UserResult) => {
    setOpen(false)
    setValue(`${user.firstName} ${user.lastName}`)
    router.push(`/users/${user.id}`)
  }

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Cerca nome, cognome o tessera..."
        className="input pl-10"
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden">
          {results.map(user => (
            <button
              key={user.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(user)}
              className="w-full text-left px-4 py-2.5 hover:bg-brand-50 text-sm border-b border-surface-100 last:border-0"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-mono text-brand-600 text-xs">{user.cardNumber}</span>
                <span className="font-medium text-slate-800">{user.firstName} {user.lastName}</span>
                <span className="text-slate-400 text-xs ml-auto">{user.credits} crediti</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
