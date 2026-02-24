'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, ArrowLeftRight, LogOut,
  Shirt, Settings, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Utenti', icon: Users },
  { href: '/transactions', label: 'Transazioni', icon: ArrowLeftRight },
]

const adminNav = [
  { href: '/settings', label: 'Impostazioni', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-surface-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-200">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
          <Shirt className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm leading-tight">ClothingCredits</p>
          <p className="text-xs text-slate-400">Gestione tessere</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn('nav-link', pathname.startsWith(href) && 'active')}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
            </div>
            {adminNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn('nav-link', pathname.startsWith(href) && 'active')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-surface-200">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 group">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-sm font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
            title="Esci"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
