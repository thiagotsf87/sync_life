import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReportData } from '../relatorio-completo'

// ─── Mock jsPDF and jspdf-autotable ─────────────────────────────────────────────

const mockSave = vi.fn()
const mockText = vi.fn()
const mockSetFontSize = vi.fn()
const mockSetTextColor = vi.fn()
const mockSetFillColor = vi.fn()
const mockRect = vi.fn()
const mockAddPage = vi.fn()
const mockSetPage = vi.fn()
const mockGetNumberOfPages = vi.fn(() => 1)
const mockAutoTable = vi.fn()

const mockDoc = {
  text: mockText,
  setFontSize: mockSetFontSize,
  setTextColor: mockSetTextColor,
  setFillColor: mockSetFillColor,
  rect: mockRect,
  addPage: mockAddPage,
  setPage: mockSetPage,
  getNumberOfPages: mockGetNumberOfPages,
  save: mockSave,
  internal: {
    pageSize: {
      getWidth: () => 595,
      getHeight: () => 842,
    },
  },
  lastAutoTable: { finalY: 200 },
}

vi.mock('jspdf', () => {
  // Must be a proper constructor function so `new jsPDF(...)` works
  function JsPDFMock() {
    return mockDoc
  }
  return { default: JsPDFMock }
})

vi.mock('jspdf-autotable', () => ({
  default: mockAutoTable,
}))

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('generateRelatorioPdfCompleto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetNumberOfPages.mockReturnValue(1)
  })

  const baseData: ReportData = {
    userName: 'Test User',
    period: 'Jan 2024',
    lifeScore: 75,
    dimensions: [
      { name: 'Finanças', score: 80 },
      { name: 'Corpo', score: 70 },
    ],
  }

  it('generates PDF with header and life score section', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    await generateRelatorioPdfCompleto(baseData)

    // Header
    expect(mockSetFillColor).toHaveBeenCalledWith(16, 185, 129)
    expect(mockRect).toHaveBeenCalled()
    expect(mockText).toHaveBeenCalledWith('SyncLife — Relatório Completo', 40, 30)
    expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Test User'), 40, 52)

    // Life Score
    expect(mockText).toHaveBeenCalledWith('Life Sync Score', 40, expect.any(Number))
    expect(mockText).toHaveBeenCalledWith('75', 40, expect.any(Number))

    // Dimensions table
    expect(mockAutoTable).toHaveBeenCalledWith(
      mockDoc,
      expect.objectContaining({
        head: [['Dimensão', 'Score']],
        body: [['Finanças', '80%'], ['Corpo', '70%']],
      }),
    )

    // Save
    expect(mockSave).toHaveBeenCalledWith('SyncLife_Relatorio_Completo_Jan_2024.pdf')
  })

  it('includes finanças section when data is provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const data: ReportData = {
      ...baseData,
      financas: {
        totalIncome: 5000,
        totalExpense: 3000,
        balance: 2000,
        savingsRate: 40,
        topCategories: [{ name: 'Alimentação', amount: 1500 }],
      },
    }

    await generateRelatorioPdfCompleto(data)

    expect(mockText).toHaveBeenCalledWith('Finanças', 40, expect.any(Number))
    // Should have autoTable for KPIs and categories
    expect(mockAutoTable).toHaveBeenCalledWith(
      mockDoc,
      expect.objectContaining({
        head: [['Métrica', 'Valor']],
      }),
    )
  })

  it('includes futuro section when data is provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const data: ReportData = {
      ...baseData,
      futuro: {
        activeGoals: 2,
        completedGoals: 1,
        goals: [{ name: 'Emergência', progress: 5000, target: 10000 }],
      },
    }

    await generateRelatorioPdfCompleto(data)

    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('Futuro'),
      40,
      expect.any(Number),
    )
    expect(mockAutoTable).toHaveBeenCalledWith(
      mockDoc,
      expect.objectContaining({
        head: [['Objetivo', 'Atual', 'Meta', 'Progresso']],
      }),
    )
  })

  it('includes corpo section when data is provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const data: ReportData = {
      ...baseData,
      corpo: { activities: 15, totalMinutes: 450, currentWeight: 75 },
    }

    await generateRelatorioPdfCompleto(data)

    expect(mockText).toHaveBeenCalledWith('Corpo', 40, expect.any(Number))
  })

  it('includes patrimonio section when data is provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const data: ReportData = {
      ...baseData,
      patrimonio: { totalValue: 100000, totalInvested: 80000, gainPct: 25 },
    }

    await generateRelatorioPdfCompleto(data)

    expect(mockText).toHaveBeenCalledWith('Patrimônio', 40, expect.any(Number))
  })

  it('includes tempo section when data is provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const data: ReportData = {
      ...baseData,
      tempo: { totalEvents: 20, completedEvents: 15 },
    }

    await generateRelatorioPdfCompleto(data)

    expect(mockText).toHaveBeenCalledWith('Tempo', 40, expect.any(Number))
  })

  it('includes mente section when data is provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const data: ReportData = {
      ...baseData,
      mente: { studyHours: 30, activeTracks: 2 },
    }

    await generateRelatorioPdfCompleto(data)

    expect(mockText).toHaveBeenCalledWith('Mente', 40, expect.any(Number))
  })

  it('adds page footer to all pages', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    mockGetNumberOfPages.mockReturnValue(2)

    await generateRelatorioPdfCompleto(baseData)

    expect(mockSetPage).toHaveBeenCalledWith(1)
    expect(mockSetPage).toHaveBeenCalledWith(2)
    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('Gerado por SyncLife'),
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ align: 'center' }),
    )
  })

  it('skips optional sections when data is not provided', async () => {
    const { generateRelatorioPdfCompleto } = await import('../relatorio-completo')
    const minimalData: ReportData = {
      userName: 'User',
      period: 'Test',
      lifeScore: 50,
      dimensions: [],
    }

    await generateRelatorioPdfCompleto(minimalData)

    // Should still save but without optional sections
    expect(mockSave).toHaveBeenCalled()
    // Finanças, Corpo, Patrimônio, Tempo, Mente should NOT appear
    const textCalls = mockText.mock.calls.map((c: unknown[]) => c[0])
    expect(textCalls).not.toContain('Finanças')
    expect(textCalls).not.toContain('Corpo')
    expect(textCalls).not.toContain('Patrimônio')
    expect(textCalls).not.toContain('Tempo')
    expect(textCalls).not.toContain('Mente')
  })
})
