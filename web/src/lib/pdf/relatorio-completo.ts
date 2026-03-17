function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`
}

export interface ReportData {
  userName: string
  period: string
  // Life Sync Score
  lifeScore: number
  dimensions: { name: string; score: number }[]
  // Finanças
  financas?: {
    totalIncome: number
    totalExpense: number
    balance: number
    savingsRate: number
    topCategories: { name: string; amount: number }[]
  }
  // Futuro (goals)
  futuro?: {
    activeGoals: number
    completedGoals: number
    goals: { name: string; progress: number; target: number }[]
  }
  // Corpo
  corpo?: {
    activities: number
    totalMinutes: number
    currentWeight?: number
  }
  // Patrimônio
  patrimonio?: {
    totalValue: number
    totalInvested: number
    gainPct: number
  }
  // Tempo (agenda)
  tempo?: {
    totalEvents: number
    completedEvents: number
  }
  // Mente
  mente?: {
    studyHours: number
    activeTracks: number
  }
}

export async function generateRelatorioPdfCompleto(data: ReportData): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = 0

  function checkPage(needed: number) {
    if (y + needed > pageHeight - 60) {
      doc.addPage()
      y = 40
    }
  }

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(16, 185, 129)
  doc.rect(0, 0, pageWidth, 70, 'F')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text('SyncLife — Relatório Completo', 40, 30)
  doc.setFontSize(12)
  doc.text(`${data.userName} · ${data.period}`, 40, 52)
  doc.setFontSize(9)
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 40, 52, { align: 'right' })
  y = 90

  // ── Life Sync Score ─────────────────────────────────────────────────────
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(15)
  doc.text('Life Sync Score', 40, y)
  y += 10

  doc.setFontSize(36)
  doc.setTextColor(16, 185, 129)
  doc.text(`${Math.round(data.lifeScore)}`, 40, y + 30)
  doc.setFontSize(14)
  doc.setTextColor(120, 120, 120)
  doc.text('pontos', 95, y + 30)
  y += 50

  if (data.dimensions.length > 0) {
    const dimRows = data.dimensions.map(d => [d.name, `${Math.round(d.score)}%`])
    autoTable(doc, {
      startY: y,
      head: [['Dimensão', 'Score']],
      body: dimRows,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Finanças ────────────────────────────────────────────────────────────
  if (data.financas) {
    checkPage(200)
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text('Finanças', 40, y)
    y += 18

    const finKpis = [
      ['Receitas', fmtCurrency(data.financas.totalIncome)],
      ['Despesas', fmtCurrency(data.financas.totalExpense)],
      ['Saldo', fmtCurrency(data.financas.balance)],
      ['Taxa de Poupança', `${data.financas.savingsRate}%`],
    ]

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: finKpis,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16

    if (data.financas.topCategories.length > 0) {
      const catRows = data.financas.topCategories.map(c => [c.name, fmtCurrency(c.amount)])
      autoTable(doc, {
        startY: y,
        head: [['Categoria', 'Gasto']],
        body: catRows,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 40, right: 40 },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
    }
  }

  // ── Futuro (Goals) ──────────────────────────────────────────────────────
  if (data.futuro && data.futuro.goals.length > 0) {
    checkPage(180)
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text(`Futuro — ${data.futuro.activeGoals} ativas, ${data.futuro.completedGoals} concluídas`, 40, y)
    y += 18

    const goalRows = data.futuro.goals.map(g => [
      g.name,
      fmtCurrency(g.progress),
      fmtCurrency(g.target),
      `${g.target > 0 ? Math.round((g.progress / g.target) * 100) : 0}%`,
    ])

    autoTable(doc, {
      startY: y,
      head: [['Objetivo', 'Atual', 'Meta', 'Progresso']],
      body: goalRows,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Corpo ───────────────────────────────────────────────────────────────
  if (data.corpo) {
    checkPage(120)
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text('Corpo', 40, y)
    y += 18

    const corpoRows: string[][] = [
      ['Atividades no mês', `${data.corpo.activities}`],
      ['Minutos de exercício', `${data.corpo.totalMinutes} min`],
    ]
    if (data.corpo.currentWeight) {
      corpoRows.push(['Peso atual', `${data.corpo.currentWeight} kg`])
    }

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: corpoRows,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Patrimônio ──────────────────────────────────────────────────────────
  if (data.patrimonio) {
    checkPage(120)
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text('Patrimônio', 40, y)
    y += 18

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: [
        ['Valor Total', fmtCurrency(data.patrimonio.totalValue)],
        ['Total Investido', fmtCurrency(data.patrimonio.totalInvested)],
        ['Rentabilidade', fmtPct(data.patrimonio.gainPct)],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Tempo (Agenda) ──────────────────────────────────────────────────────
  if (data.tempo) {
    checkPage(100)
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text('Tempo', 40, y)
    y += 18

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Eventos', `${data.tempo.totalEvents}`],
        ['Concluídos', `${data.tempo.completedEvents}`],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Mente ───────────────────────────────────────────────────────────────
  if (data.mente) {
    checkPage(100)
    doc.setFontSize(14)
    doc.setTextColor(60, 60, 60)
    doc.text('Mente', 40, y)
    y += 18

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: [
        ['Horas de estudo', `${data.mente.studyHours}h`],
        ['Trilhas ativas', `${data.mente.activeTracks}`],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [234, 179, 8], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 40, right: 40 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24
  }

  // ── Footer on every page ────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Gerado por SyncLife — Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' },
    )
  }

  doc.save(`SyncLife_Relatorio_Completo_${data.period.replace(/\s/g, '_')}.pdf`)
}
