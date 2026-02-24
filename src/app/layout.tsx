import type { Metadata } from 'next'
import { Sora, DM_Serif_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const body = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

const display = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'ClothingCredits — Gestione Tessere',
  description: 'Sistema di gestione crediti per distribuzione vestiario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${body.variable} ${display.variable}`}>
      <body className="bg-surface-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
