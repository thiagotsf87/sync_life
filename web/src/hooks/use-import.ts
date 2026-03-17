'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import { useCategories, type Category } from './use-categories'
import { parseCSV, mapTransactions, detectBankProfile, type ParsedTransaction, type ColumnMapping } from '@/lib/import/csv-parser'
import { parseOFX } from '@/lib/import/ofx-parser'
import { extractTextFromPdf, detectBankFromPdf, parsePdfTransactions } from '@/lib/import/pdf-parser'

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

interface ExistingTx {
  date: string
  amount: number
  description: string
}

export interface UseImportReturn {
  step: ImportStep
  file: File | null
  fileName: string
  fileType: 'csv' | 'ofx' | 'pdf' | null
  parsedData: ParsedTransaction[]
  headers: string[]
  columnMapping: ColumnMapping | null
  duplicateIndices: Set<number>
  skippedIndices: Set<number>
  importProgress: number
  importTotal: number
  importedCount: number
  error: string | null
  categories: Category[]
  categoryAssignments: Map<number, string>
  uncategorizedCount: number

  setFile: (file: File) => Promise<void>
  setColumnMapping: (mapping: ColumnMapping) => void
  applyMapping: () => void
  toggleSkip: (index: number) => void
  toggleAll: (skip: boolean) => void
  setCategoryForTransaction: (index: number, categoryId: string | null) => void
  setCategoryForAll: (categoryId: string) => void
  executeImport: () => Promise<void>
  reset: () => void
}

const BATCH_SIZE = 50

// ─── Auto-categorization by keywords ────────────────────────────────────────────

/** Remove accents/diacritics for matching — "salário" → "salario", "débito" → "debito" */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const EXPENSE_KEYWORDS: Record<string, string[]> = {
  'alimentacao': [
    'mercado', 'supermercado', 'ifood', 'uber eats', 'rappi', 'restaurante',
    'lanchonete', 'almoco', 'jantar', 'padaria', 'cafe', 'pizza', 'hamburguer',
    'sushi', 'delivery', 'hortifruti', 'acougue', 'feira', 'pag*', 'zé delivery',
  ],
  'transporte': [
    'uber', '99pop', '99app', 'combustivel', 'gasolina', 'estacionamento',
    'pedagio', 'onibus', 'metro', 'trem', 'passagem', 'taxi', 'corrida',
    'posto', 'shell', 'ipiranga', 'petrobras', 'auto posto', 'sem parar',
  ],
  'moradia': [
    'aluguel', 'condominio', 'iptu', 'luz', 'energia', 'enel', 'cemig', 'cpfl',
    'eletropaulo', 'agua', 'sabesp', 'copasa', 'gas', 'comgas', 'internet',
    'manutencao', 'celpe', 'coelba', 'equatorial',
  ],
  'saude': [
    'farmacia', 'drogaria', 'drogasil', 'droga raia', 'remedio', 'consulta',
    'exame', 'plano de saude', 'unimed', 'amil', 'sulamerica', 'dentista',
    'hospital', 'academia', 'smartfit', 'smart fit', 'bodytech',
  ],
  'educacao': [
    'curso', 'livro', 'escola', 'faculdade', 'mensalidade', 'material',
    'udemy', 'alura', 'hotmart', 'apostila',
  ],
  'lazer': [
    'cinema', 'netflix', 'spotify', 'show', 'teatro', 'viagem', 'hotel',
    'bar', 'festa', 'jogo', 'streaming', 'disney', 'hbo', 'prime video',
    'amazon prime', 'globoplay', 'ingresso',
  ],
  'vestuario': [
    'roupa', 'calcado', 'sapato', 'tenis', 'loja', 'shopping',
    'renner', 'riachuelo', 'c&a', 'zara', 'shein',
  ],
  'investimentos': [
    'aporte', 'investimento', 'acao', 'fii', 'cdb', 'tesouro',
    'aplicacao', 'resgate', 'btg', 'xp ', 'rico ', 'nuinvest', 'clear',
  ],
}

const INCOME_KEYWORDS: Record<string, string[]> = {
  'salario': [
    'salario', 'folha', 'holerite', 'contra-cheque', 'contracheque',
    'adiantamento', 'ferias', '13o', 'decimo terceiro', 'plr',
    'pis', 'fgts', 'rescisao',
  ],
  'freelance': [
    'freelance', 'consultoria', 'servico', 'honorario', 'comissao',
    'nota fiscal', 'nf-e', 'mei',
  ],
  'investimentos': [
    'dividendo', 'provento', 'jcp', 'rendimento', 'juros sobre capital',
    'resgate', 'lucro', 'yield',
  ],
  'outros': [
    'venda', 'reembolso', 'cashback', 'presente', 'estorno',
    'devolucao', 'premio', 'bonus', 'pix recebido', 'ted recebido',
    'transferencia recebida', 'credito', 'deposito',
  ],
}

/**
 * Keyword-based auto-categorization for bank statement descriptions.
 * - Normalizes accents (salário/salario both match)
 * - Matches against real bank statement language (PIX, TED, DEB AUTOM, etc.)
 * - If no keyword match found for an income transaction, falls back to first income category
 *   (bank income is almost always salary/transfer)
 */
function suggestCategory(
  description: string,
  type: 'income' | 'expense',
  categories: Category[],
): string | null {
  const desc = normalize(description)
  const filtered = categories.filter(c => c.type === type)
  if (filtered.length === 0) return null

  const keywords = type === 'expense' ? EXPENSE_KEYWORDS : INCOME_KEYWORDS
  for (const [catName, words] of Object.entries(keywords)) {
    if (words.some(w => desc.includes(normalize(w)))) {
      const match = filtered.find(c => normalize(c.name).includes(catName))
      if (match) return match.id
    }
  }

  // Fallback for income: bank income transactions (TED, PIX recebido, depósito)
  // are almost always salary or transfers — assign to first income category
  if (type === 'income' && filtered.length > 0) {
    return filtered[0].id
  }

  return null
}

function buildCategorySuggestions(
  txs: ParsedTransaction[],
  categories: Category[],
): Map<number, string> {
  const map = new Map<number, string>()
  for (let i = 0; i < txs.length; i++) {
    const catId = suggestCategory(txs[i].description, txs[i].type, categories)
    if (catId) map.set(i, catId)
  }
  return map
}

export function useImport(): UseImportReturn {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFileState] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'csv' | 'ofx' | 'pdf' | null>(null)
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMappingState] = useState<ColumnMapping | null>(null)
  const [duplicateIndices, setDuplicateIndices] = useState<Set<number>>(new Set())
  const [skippedIndices, setSkippedIndices] = useState<Set<number>>(new Set())
  const [importProgress, setImportProgress] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [categoryAssignments, setCategoryAssignments] = useState<Map<number, string>>(new Map())
  const rawRowsRef = useRef<Record<string, string>[]>([])

  const { categories } = useCategories()

  // Auto-suggest categories when transactions are parsed and categories are available
  useEffect(() => {
    if (parsedData.length === 0 || categories.length === 0) return
    setCategoryAssignments(buildCategorySuggestions(parsedData, categories))
  }, [parsedData, categories])

  const setCategoryForTransaction = useCallback((index: number, categoryId: string | null) => {
    setCategoryAssignments(prev => {
      const next = new Map(prev)
      if (categoryId) next.set(index, categoryId)
      else next.delete(index)
      return next
    })
  }, [])

  const setCategoryForAll = useCallback((categoryId: string) => {
    setCategoryAssignments(prev => {
      const next = new Map(prev)
      for (let i = 0; i < parsedData.length; i++) {
        if (!next.has(i) && !skippedIndices.has(i)) {
          next.set(i, categoryId)
        }
      }
      return next
    })
  }, [parsedData, skippedIndices])

  const uncategorizedCount = parsedData.filter(
    (_, i) => !skippedIndices.has(i) && !categoryAssignments.has(i)
  ).length

  const setFile = useCallback(async (f: File) => {
    setError(null)
    setFileState(f)
    setFileName(f.name)

    const ext = f.name.split('.').pop()?.toLowerCase()

    if (ext === 'pdf') {
      setFileType('pdf')
      try {
        const pages = await extractTextFromPdf(f)
        const bankProfile = detectBankFromPdf(pages)
        const txs = parsePdfTransactions(pages, bankProfile)
        if (txs.length === 0) {
          setError('Não foi possível extrair transações deste PDF. Tente exportar o extrato em CSV.')
          return
        }
        setParsedData(txs)
        setSkippedIndices(new Set(txs.map((_, i) => i)))
        setStep('preview')
        await detectDuplicates(txs)
      } catch {
        setError('Erro ao processar o PDF. Verifique se o arquivo não está protegido por senha.')
      }
    } else if (ext === 'ofx' || ext === 'qfx') {
      const content = await f.text()
      setFileType('ofx')
      const txs = parseOFX(content)
      if (txs.length === 0) {
        setError('Nenhuma transação encontrada no arquivo OFX.')
        return
      }
      setParsedData(txs)
      setSkippedIndices(new Set(txs.map((_, i) => i)))
      setStep('preview')
      await detectDuplicates(txs)
    } else {
      const content = await f.text()
      setFileType('csv')
      const { headers: h, rows } = parseCSV(content)
      if (rows.length === 0) {
        setError('Arquivo CSV vazio ou inválido.')
        return
      }
      setHeaders(h)
      rawRowsRef.current = rows

      const autoMapping = detectBankProfile(h)
      if (autoMapping) {
        setColumnMappingState(autoMapping)
        const txs = mapTransactions(rows, autoMapping)
        setParsedData(txs)
        setSkippedIndices(new Set(txs.map((_, i) => i)))
        setStep('preview')
        await detectDuplicates(txs)
      } else {
        setStep('mapping')
      }
    }
  }, [])

  const setColumnMapping = useCallback((mapping: ColumnMapping) => {
    setColumnMappingState(mapping)
  }, [])

  const applyMapping = useCallback(() => {
    if (!columnMapping) return
    const txs = mapTransactions(rawRowsRef.current, columnMapping)
    if (txs.length === 0) {
      setError('Nenhuma transação válida encontrada com o mapeamento selecionado.')
      return
    }
    setParsedData(txs)
    setSkippedIndices(new Set(txs.map((_, i) => i)))
    setStep('preview')
    detectDuplicates(txs)
  }, [columnMapping])

  const toggleSkip = useCallback((index: number) => {
    setSkippedIndices(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const toggleAll = useCallback((skip: boolean) => {
    if (skip) {
      setSkippedIndices(new Set(parsedData.map((_, i) => i)))
    } else {
      setSkippedIndices(new Set())
    }
  }, [parsedData])

  async function detectDuplicates(txs: ParsedTransaction[]) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dates = txs.map(t => t.date)
      const minDate = dates.reduce((a, b) => a < b ? a : b)
      const maxDate = dates.reduce((a, b) => a > b ? a : b)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      const { data: existing } = await sb
        .from('transactions')
        .select('date, amount, description')
        .eq('user_id', user.id)
        .gte('date', minDate)
        .lte('date', maxDate) as { data: ExistingTx[] | null }

      if (!existing || existing.length === 0) return

      const existingSet = new Set(
        existing.map(e => `${e.date}|${e.amount}|${e.description.toLowerCase().trim()}`)
      )

      const dupes = new Set<number>()
      txs.forEach((tx, i) => {
        const key = `${tx.date}|${tx.amount}|${tx.description.toLowerCase().trim()}`
        if (existingSet.has(key)) {
          dupes.add(i)
        }
      })
      setDuplicateIndices(dupes)
    } catch {
      // Non-blocking: duplicates just won't be detected
    }
  }

  const executeImport = useCallback(async () => {
    setError(null)
    setStep('importing')

    const indicesToImport = parsedData
      .map((_, i) => i)
      .filter(i => !skippedIndices.has(i))

    setImportTotal(indicesToImport.length)
    setImportProgress(0)
    setImportedCount(0)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let total = 0
      for (let i = 0; i < indicesToImport.length; i += BATCH_SIZE) {
        const batchIndices = indicesToImport.slice(i, i + BATCH_SIZE)
        const rows = batchIndices.map(idx => ({
          user_id: user.id,
          amount: parsedData[idx].amount,
          type: parsedData[idx].type,
          description: parsedData[idx].description,
          date: parsedData[idx].date,
          category_id: categoryAssignments.get(idx) ?? null,
          payment_method: 'transfer',
          notes: `Importado de ${fileName}`,
          is_future: new Date(parsedData[idx].date) > new Date(),
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('transactions')
          .insert(rows)

        if (insertError) {
          throw new Error(`Erro ao inserir lote ${Math.floor(i / BATCH_SIZE) + 1}`)
        }

        total += batchIndices.length
        setImportProgress(total)
        setImportedCount(total)
      }

      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao importar')
      setStep('preview')
    }
  }, [parsedData, skippedIndices, categoryAssignments, fileName])

  const reset = useCallback(() => {
    setStep('upload')
    setFileState(null)
    setFileName('')
    setFileType(null)
    setParsedData([])
    setHeaders([])
    setColumnMappingState(null)
    setDuplicateIndices(new Set())
    setSkippedIndices(new Set())
    setCategoryAssignments(new Map())
    setImportProgress(0)
    setImportTotal(0)
    setImportedCount(0)
    setError(null)
    rawRowsRef.current = []
  }, [])

  return {
    step, file, fileName, fileType,
    parsedData, headers, columnMapping,
    duplicateIndices, skippedIndices,
    importProgress, importTotal, importedCount,
    error,
    categories, categoryAssignments, uncategorizedCount,
    setFile, setColumnMapping, applyMapping,
    toggleSkip, toggleAll,
    setCategoryForTransaction, setCategoryForAll,
    executeImport, reset,
  }
}

// ─── Import History Hook ────────────────────────────────────────────────────────

export interface ImportBatch {
  notes: string
  fileName: string
  count: number
  totalIncome: number
  totalExpense: number
  dateRange: { min: string; max: string }
}

export function useImportHistory() {
  const queryClient = useQueryClient()

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['import-history'],
    queryFn: async (): Promise<ImportBatch[]> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const sb = supabase as any
      const { data, error } = await sb
        .from('transactions')
        .select('notes, date, amount, type')
        .eq('user_id', user.id)
        .like('notes', 'Importado de %')
        .order('date', { ascending: false })

      if (error || !data) return []

      const groups = new Map<string, { notes: string; dates: string[]; income: number; expense: number; count: number }>()

      for (const tx of data as { notes: string; date: string; amount: number; type: string }[]) {
        if (!tx.notes) continue
        if (!groups.has(tx.notes)) {
          groups.set(tx.notes, { notes: tx.notes, dates: [], income: 0, expense: 0, count: 0 })
        }
        const g = groups.get(tx.notes)!
        g.dates.push(tx.date)
        g.count++
        if (tx.type === 'income') g.income += tx.amount
        else g.expense += tx.amount
      }

      return Array.from(groups.values()).map(g => ({
        notes: g.notes,
        fileName: g.notes.replace('Importado de ', ''),
        count: g.count,
        totalIncome: g.income,
        totalExpense: g.expense,
        dateRange: {
          min: g.dates.reduce((a, b) => (a < b ? a : b)),
          max: g.dates.reduce((a, b) => (a > b ? a : b)),
        },
      }))
    },
  })

  const deleteBatch = useCallback(async (notes: string): Promise<number> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // Count first for feedback
    const sb = supabase as any
    const { count } = await sb
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('notes', notes)

    const { error } = await sb
      .from('transactions')
      .delete()
      .eq('user_id', user.id)
      .eq('notes', notes)

    if (error) throw new Error(error.message)

    queryClient.invalidateQueries({ queryKey: ['import-history'] })
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })

    return count ?? 0
  }, [queryClient])

  return { batches, isLoading, deleteBatch }
}
