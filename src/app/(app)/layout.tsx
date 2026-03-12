import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* pt-14 on mobile to clear the fixed top bar; md:pt-0 restores normal flow */}
      <main className="flex-1 p-8 pt-[calc(3.5rem+2rem)] md:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}