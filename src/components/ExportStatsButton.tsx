'use client'
import { useState } from 'react'
import { FileText } from 'lucide-react'

interface StatsData {
  generatedAt: string
  year: number
  generalStats: {
    totalUsers: number
    activeUsers: number
    usersWithCredits: number
    bambini: number
    adulti: number
    adultiF: number
    adultiM: number
    adultiNB: number
    adultiNullGender: number
  }
  monthlyStats: {
    key: string
    label: string
    uniqueUsers: number
    topProduct: { name: string; season: string; category: string | null; count: number } | null
  }[]
  newUsersPerMonth: { label: string; count: number }[]
}

async function fetchStats(): Promise<StatsData> {
  const res = await fetch('/api/stats')
  return res.json()
}


async function exportPDF(data: StatsData) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const brandColor: [number, number, number] = [99, 62, 182]
  const pageW = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFillColor(...brandColor)
  doc.rect(0, 0, pageW, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('DarBazar — Statistiche', 14, 9.5)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Anno ${data.year}  ·  Generato il ${new Date(data.generatedAt).toLocaleString('it-IT')}`, pageW - 14, 9.5, { align: 'right' })

  y = 26
  doc.setTextColor(30, 30, 30)

  // Section helper
  const section = (title: string) => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...brandColor)
    doc.text(title, 14, y)
    doc.setDrawColor(...brandColor)
    doc.setLineWidth(0.3)
    doc.line(14, y + 1.5, pageW - 14, y + 1.5)
    doc.setTextColor(30, 30, 30)
    y += 7
  }

  // General stats
  section('Statistiche generali')
  const g = data.generalStats
  autoTable(doc, {
    startY: y,
    head: [['Indicatore', 'Valore']],
    body: [
      ['Utenti totali', String(g.totalUsers)],
      ['Utenti attivi', String(g.activeUsers)],
      ['Utenti con crediti', String(g.usersWithCredits)],
      ['Bambini', String(g.bambini)],
      ['Adulti (totale)', String(g.adulti)],
      ['Adulti — Femmine (F)', String(g.adultiF)],
      ['Adulti — Maschi (M)', String(g.adultiM)],
      ['Adulti — Non-binary (NB)', String(g.adultiNB)],
      ['Adulti — Genere non specificato', String(g.adultiNullGender)],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  })
  y = (doc as any).lastAutoTable.finalY + 10

  // New users per month
  section(`Nuovi utenti per mese — ${data.year}`)
  autoTable(doc, {
    startY: y,
    head: [['Mese', 'Nuovi utenti']],
    body: data.newUsersPerMonth.map(m => [m.label, String(m.count)]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  })
  y = (doc as any).lastAutoTable.finalY + 10

  // Monthly checkout stats
  section('Statistiche mensili checkout')
  autoTable(doc, {
    startY: y,
    head: [['Mese', 'Utenti unici', 'Prodotto più richiesto', 'Stagione', 'Categoria', 'Qtà']],
    body: data.monthlyStats.map(m => [
      m.label,
      String(m.uniqueUsers),
      m.topProduct?.name ?? '—',
      m.topProduct?.season ?? '—',
      m.topProduct?.category ?? '—',
      m.topProduct ? String(m.topProduct.count) : '—',
    ]),
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 246, 255] },
    columnStyles: { 1: { halign: 'center' }, 5: { halign: 'center' } },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  })

  doc.save(`statistiche-${data.year}.pdf`)
}

export function ExportStatsButton() {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const data = await fetchStats()
      await exportPDF(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="btn-secondary text-sm flex items-center gap-1.5"
      title="Esporta PDF"
    >
      <FileText className="w-4 h-4" />
      {loading ? 'Export...' : 'PDF'}
    </button>
  )
}
