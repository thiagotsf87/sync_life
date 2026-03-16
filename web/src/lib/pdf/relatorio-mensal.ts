import type { PeriodStats, CategoryComparison, RawTransaction } from '@/hooks/use-relatorios'

function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

export async function generateRelatorioPdf(data: {
  periodStats: PeriodStats
  catCompData: CategoryComparison[]
  topExpenses: RawTransaction[]
  barChartData: { month: string; receitas: number; despesas: number }[]
  period: string
}): Promise<void> {
  const { periodStats, catCompData, topExpenses, barChartData, period } = data

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 0

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(16, 185, 129)
  doc.rect(0, 0, pageWidth, 60, 'F')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('SyncLife — Relatório Financeiro', 40, 28)
  doc.setFontSize(11)
  doc.text(`Período: ${period}`, 40, 46)
  doc.setFontSize(9)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 40, 46, { align: 'right' })
  y = 80

  // ── KPI Summary ─────────────────────────────────────────────────────────
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(13)
  doc.text('Resumo do Período', 40, y)
  y += 18

  const kpis = [
    ['Receitas', fmtCurrency(periodStats.totalRecipes)],
    ['Despesas', fmtCurrency(periodStats.totalExpenses)],
    ['Saldo', fmtCurrency(periodStats.totalBalance)],
    ['Taxa de Poupança', `${periodStats.avgSavingsRate.toFixed(1)}%`],
  ]

  autoTable(doc, {
    startY: y,
    head: [['Métrica', 'Valor']],
    body: kpis,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 40, right: 40 },
  })

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24

  // ── Categorias ──────────────────────────────────────────────────────────
  if (catCompData.length > 0) {
    doc.setFontSize(13)
    doc.setTextColor(60, 60, 60)
    doc.text('Comparativo por Categoria', 40, y)
    y += 18

    const catRows = catCompData.map(c => [
      c.name,
      fmtCurrency(c.currentTotal),
      fmtCurrency(c.prevTotal),
      c.delta != null ? fmtPct(c.delta) : '—',
    ])

    autoTable(doc, {
      startY: y,
      head: [['Categoria', 'Atual', 'Anterior', 'Δ%']],
      body: catRows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
      margin: { left: 40, right: 40 },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Top 5 Despesas ──────────────────────────────────────────────────────
  if (topExpenses.length > 0) {
    // Check if we need a new page
    if (y > 650) {
      doc.addPage()
      y = 40
    }

    doc.setFontSize(13)
    doc.setTextColor(60, 60, 60)
    doc.text('Top 5 Maiores Despesas', 40, y)
    y += 18

    const expenseRows = topExpenses.slice(0, 5).map(tx => [
      new Date(tx.date).toLocaleDateString('pt-BR'),
      tx.description,
      tx.categories?.name ?? '—',
      fmtCurrency(tx.amount),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Data', 'Descrição', 'Categoria', 'Valor']],
      body: expenseRows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [244, 63, 94], textColor: [255, 255, 255] },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Evolução Mensal ─────────────────────────────────────────────────────
  if (barChartData.length > 0) {
    if (y > 600) {
      doc.addPage()
      y = 40
    }

    doc.setFontSize(13)
    doc.setTextColor(60, 60, 60)
    doc.text('Evolução Mensal', 40, y)
    y += 18

    const monthRows = barChartData.map(m => [
      m.month,
      fmtCurrency(m.receitas),
      fmtCurrency(m.despesas),
      fmtCurrency(m.receitas - m.despesas),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Mês', 'Receitas', 'Despesas', 'Saldo']],
      body: monthRows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [0, 85, 255], textColor: [255, 255, 255] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 40, right: 40 },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      'Gerado por SyncLife — synclife.app',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' },
    )
  }

  doc.save(`SyncLife_Relatorio_${period.replace(/\s/g, '_')}.pdf`)
}
