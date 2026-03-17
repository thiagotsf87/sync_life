import { describe, it, expect, vi, beforeEach } from 'vitest'

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
  function JsPDFMock() {
    return mockDoc
  }
  return { default: JsPDFMock }
})

vi.mock('jspdf-autotable', () => ({
  default: mockAutoTable,
}))

// ─── Mock use-relatorios types (only need the types) ──────────────────────────
vi.mock('@/hooks/use-relatorios', () => ({}))

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('generateRelatorioPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetNumberOfPages.mockReturnValue(1)
  })

  it('generates PDF with header and KPI summary', async () => {
    const { generateRelatorioPdf } = await import('../relatorio-mensal')

    await generateRelatorioPdf({
      periodStats: {
        totalRecipes: 5000,
        totalExpenses: 3000,
        totalBalance: 2000,
        avgSavingsRate: 40,
        prevTotalRecipes: 4000,
        prevTotalExpenses: 2500,
        prevTotalBalance: 1500,
        prevAvgSavingsRate: 37.5,
        txCount: 50,
        monthCount: 3,
        topGrowingCategory: null,
        topGrowthPct: 0,
        monthWithBestBalance: 'jan/24',
      },
      catCompData: [],
      topExpenses: [],
      barChartData: [],
      period: 'Jan 2024',
    })

    // Header
    expect(mockSetFillColor).toHaveBeenCalledWith(16, 185, 129)
    expect(mockText).toHaveBeenCalledWith('SyncLife — Relatório Financeiro', 40, 28)
    expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Jan 2024'), 40, 46)

    // KPI table
    expect(mockAutoTable).toHaveBeenCalledWith(
      mockDoc,
      expect.objectContaining({
        head: [['Métrica', 'Valor']],
      }),
    )

    // Save with correct filename
    expect(mockSave).toHaveBeenCalledWith('SyncLife_Relatorio_Jan_2024.pdf')
  })

  it('includes category comparison when catCompData is not empty', async () => {
    const { generateRelatorioPdf } = await import('../relatorio-mensal')

    await generateRelatorioPdf({
      periodStats: {
        totalRecipes: 5000, totalExpenses: 3000, totalBalance: 2000,
        avgSavingsRate: 40, prevTotalRecipes: 0, prevTotalExpenses: 0,
        prevTotalBalance: 0, prevAvgSavingsRate: 0, txCount: 10,
        monthCount: 1, topGrowingCategory: null, topGrowthPct: 0,
        monthWithBestBalance: '',
      },
      catCompData: [
        { name: 'Alimentação', color: '#10b981', currentTotal: 1500, prevTotal: 1200, delta: 25 },
      ],
      topExpenses: [],
      barChartData: [],
      period: 'Test',
    })

    expect(mockText).toHaveBeenCalledWith('Comparativo por Categoria', 40, expect.any(Number))
    expect(mockAutoTable).toHaveBeenCalledWith(
      mockDoc,
      expect.objectContaining({
        head: [['Categoria', 'Atual', 'Anterior', 'Δ%']],
      }),
    )
  })

  it('includes top expenses when data is provided', async () => {
    const { generateRelatorioPdf } = await import('../relatorio-mensal')

    await generateRelatorioPdf({
      periodStats: {
        totalRecipes: 5000, totalExpenses: 3000, totalBalance: 2000,
        avgSavingsRate: 40, prevTotalRecipes: 0, prevTotalExpenses: 0,
        prevTotalBalance: 0, prevAvgSavingsRate: 0, txCount: 10,
        monthCount: 1, topGrowingCategory: null, topGrowthPct: 0,
        monthWithBestBalance: '',
      },
      catCompData: [],
      topExpenses: [
        {
          id: '1', description: 'Aluguel', amount: 2000, type: 'expense' as const,
          date: '2024-01-15', payment_method: 'pix', notes: null,
          is_future: false, categories: { id: 'c1', name: 'Moradia', icon: '🏠', color: '#ff0000' },
        },
      ],
      barChartData: [],
      period: 'Test',
    })

    expect(mockText).toHaveBeenCalledWith('Top 5 Maiores Despesas', 40, expect.any(Number))
  })

  it('includes monthly evolution when barChartData is provided', async () => {
    const { generateRelatorioPdf } = await import('../relatorio-mensal')

    await generateRelatorioPdf({
      periodStats: {
        totalRecipes: 5000, totalExpenses: 3000, totalBalance: 2000,
        avgSavingsRate: 40, prevTotalRecipes: 0, prevTotalExpenses: 0,
        prevTotalBalance: 0, prevAvgSavingsRate: 0, txCount: 10,
        monthCount: 1, topGrowingCategory: null, topGrowthPct: 0,
        monthWithBestBalance: '',
      },
      catCompData: [],
      topExpenses: [],
      barChartData: [
        { month: 'jan/24', receitas: 5000, despesas: 3000 },
        { month: 'fev/24', receitas: 5500, despesas: 3200 },
      ],
      period: 'Test',
    })

    expect(mockText).toHaveBeenCalledWith('Evolução Mensal', 40, expect.any(Number))
    expect(mockAutoTable).toHaveBeenCalledWith(
      mockDoc,
      expect.objectContaining({
        head: [['Mês', 'Receitas', 'Despesas', 'Saldo']],
      }),
    )
  })

  it('adds page footer to every page', async () => {
    const { generateRelatorioPdf } = await import('../relatorio-mensal')
    mockGetNumberOfPages.mockReturnValue(3)

    await generateRelatorioPdf({
      periodStats: {
        totalRecipes: 0, totalExpenses: 0, totalBalance: 0,
        avgSavingsRate: 0, prevTotalRecipes: 0, prevTotalExpenses: 0,
        prevTotalBalance: 0, prevAvgSavingsRate: 0, txCount: 0,
        monthCount: 0, topGrowingCategory: null, topGrowthPct: 0,
        monthWithBestBalance: '',
      },
      catCompData: [],
      topExpenses: [],
      barChartData: [],
      period: 'Test',
    })

    expect(mockSetPage).toHaveBeenCalledWith(1)
    expect(mockSetPage).toHaveBeenCalledWith(2)
    expect(mockSetPage).toHaveBeenCalledWith(3)
    expect(mockText).toHaveBeenCalledWith(
      expect.stringContaining('Gerado por SyncLife'),
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ align: 'center' }),
    )
  })
})
