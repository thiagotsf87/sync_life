'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseCSV, mapTransactions, detectBankProfile, type ParsedTransaction, type ColumnMapping } from '@/lib/import/csv-parser'
import { parseOFX } from '@/lib/import/ofx-parser'

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
  fileType: 'csv' | 'ofx' | null
  parsedData: ParsedTransaction[]
  headers: string[]
  columnMapping: ColumnMapping | null
  duplicateIndices: Set<number>
  skippedIndices: Set<number>
  importProgress: number
  importTotal: number
  importedCount: number
  error: string | null

  setFile: (file: File) => Promise<void>
  setColumnMapping: (mapping: ColumnMapping) => void
  applyMapping: () => void
  toggleSkip: (index: number) => void
  executeImport: () => Promise<void>
  reset: () => void
}

const BATCH_SIZE = 50

export function useImport(): UseImportReturn {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFileState] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'csv' | 'ofx' | null>(null)
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMappingState] = useState<ColumnMapping | null>(null)
  const [duplicateIndices, setDuplicateIndices] = useState<Set<number>>(new Set())
  const [skippedIndices, setSkippedIndices] = useState<Set<number>>(new Set())
  const [importProgress, setImportProgress] = useState(0)
  const [importTotal, setImportTotal] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const rawRowsRef = useRef<Record<string, string>[]>([])

  const setFile = useCallback(async (f: File) => {
    setError(null)
    setFileState(f)
    setFileName(f.name)

    const ext = f.name.split('.').pop()?.toLowerCase()
    const content = await f.text()

    if (ext === 'ofx' || ext === 'qfx') {
      setFileType('ofx')
      const txs = parseOFX(content)
      if (txs.length === 0) {
        setError('Nenhuma transação encontrada no arquivo OFX.')
        return
      }
      setParsedData(txs)
      setStep('preview')
      await detectDuplicates(txs)
    } else {
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
      const autoSkip = new Set<number>()
      txs.forEach((tx, i) => {
        const key = `${tx.date}|${tx.amount}|${tx.description.toLowerCase().trim()}`
        if (existingSet.has(key)) {
          dupes.add(i)
          autoSkip.add(i)
        }
      })
      setDuplicateIndices(dupes)
      setSkippedIndices(autoSkip)
    } catch {
      // Non-blocking: duplicates just won't be detected
    }
  }

  const executeImport = useCallback(async () => {
    setError(null)
    setStep('importing')

    const toImport = parsedData.filter((_, i) => !skippedIndices.has(i))
    setImportTotal(toImport.length)
    setImportProgress(0)
    setImportedCount(0)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let total = 0
      for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
        const batch = toImport.slice(i, i + BATCH_SIZE)
        const rows = batch.map(tx => ({
          user_id: user.id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          date: tx.date,
          payment_method: null,
          notes: `Importado de ${fileName}`,
          is_future: new Date(tx.date) > new Date(),
          category_id: null,
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('transactions')
          .insert(rows)

        if (insertError) {
          throw new Error(`Erro ao inserir lote ${Math.floor(i / BATCH_SIZE) + 1}`)
        }

        total += batch.length
        setImportProgress(total)
        setImportedCount(total)
      }

      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao importar')
      setStep('preview')
    }
  }, [parsedData, skippedIndices, fileName])

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
    setFile, setColumnMapping, applyMapping,
    toggleSkip, executeImport, reset,
  }
}
