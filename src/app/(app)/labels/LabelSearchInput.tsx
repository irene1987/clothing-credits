'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

export function LabelSearchInput({ defaultValue, sortField, sortDir }: {
  defaultValue: string
  sortField: string
  sortDir: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultValue)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set('q', value.trim())
      if (sortField !== 'name') params.set('sort', sortField)
      if (sortDir !== 'asc') params.set('dir', sortDir)
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
    }, 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Cerca per nome, stagione o categoria..."
        className="input pl-10"
      />
    </div>
  )
}
