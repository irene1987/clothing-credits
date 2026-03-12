'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, ArrowLeftRight, LogOut,
  Settings, ShoppingBag, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/checkout', label: 'Checkout', icon: ShoppingBag },
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

  // Desktop: collapsed (icon-only) vs expanded
  const [collapsed, setCollapsed] = useState(false)
  // Mobile: drawer open/closed
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const NavItems = ({ compact }: { compact: boolean }) => (
    <>
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          title={compact ? label : undefined}
          className={cn(
            'nav-link',
            pathname.startsWith(href) && 'active',
            compact && 'justify-center px-0'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {!compact && <span>{label}</span>}
        </Link>
      ))}

      {isAdmin && (
        <>
          <div className={cn('pt-4 pb-2', compact && 'hidden')}>
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
          </div>
          {compact && <div className="my-2 border-t border-surface-200" />}
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={compact ? label : undefined}
              className={cn(
                'nav-link',
                pathname.startsWith(href) && 'active',
                compact && 'justify-center px-0'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!compact && <span>{label}</span>}
            </Link>
          ))}
        </>
      )}
    </>
  )

  const UserFooter = ({ compact }: { compact: boolean }) => (
    <div className="px-3 py-4 border-t border-surface-200">
      {compact ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-sm font-semibold cursor-default"
            title={session?.user?.name ?? ''}
          >
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Esci"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 group">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-sm font-semibold shrink-0">
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
      )}
    </div>
  )

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 bg-white border-b border-surface-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:bg-surface-100 transition-colors"
          aria-label="Apri menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 flex justify-center">
          <Image src="/logo.png" alt="DarBazar" width={120} height={30} style={{ objectFit: 'contain' }} priority />
        </div>
        {/* spacer to center logo */}
        <div className="w-9" />
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer */}
          <aside className="relative w-64 bg-white flex flex-col min-h-screen shadow-2xl animate-slide-in">
            {/* Logo + close */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
              <Image src="/logo.png" alt="DarBazar" width={140} height={35} style={{ objectFit: 'contain' }} priority />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-surface-100 transition-colors"
                aria-label="Chiudi menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <NavItems compact={false} />
            </nav>
            <UserFooter compact={false} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 bg-white border-r border-surface-200 min-h-screen transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo / icon */}
        <div className={cn(
          'flex items-center border-b border-surface-200 overflow-hidden transition-all duration-300',
          collapsed ? 'justify-center px-0 py-5' : 'px-6 py-5'
        )}>
          {collapsed ? (
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 font-bold text-sm select-none">
              D
            </div>
          ) : (
            <Image src="/logo.png" alt="DarBazar" width={200} height={50} style={{ objectFit: 'contain', width: '100%', height: 'auto' }} priority />
          )}
        </div>

        {/* Nav */}
        <nav className={cn('flex-1 py-4 space-y-1', collapsed ? 'px-2' : 'px-3')}>
          <NavItems compact={collapsed} />
        </nav>

        {/* User */}
        <UserFooter compact={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center gap-2 py-3 border-t border-surface-200',
            'text-xs text-slate-400 hover:text-slate-600 hover:bg-surface-50 transition-colors',
            collapsed ? 'px-0' : 'px-4'
          )}
          title={collapsed ? 'Espandi sidebar' : 'Riduci sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Riduci</span></>
          }
        </button>
      </aside>
    </>
  )
}