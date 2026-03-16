import Papa from 'papaparse'

export interface ParsedTransaction {
  date: string        // YYYY-MM-DD
  description: string
  amount: number      // always positive
  type: 'income' | 'expense'
  rawRow: Record<string, string>
}

export interface ColumnMapping {
  date: string
  description: string
  amount: string
}

interface BankProfile {
  name: string
  dateCol: string
  descCol: string
  amountCol: string
}

const BANK_PROFILES: BankProfile[] = [
  { name: 'Nubank', dateCol: 'date', descCol: 'title', amountCol: 'amount' },
  { name: 'Inter', dateCol: 'Data Lançamento', descCol: 'Descrição', amountCol: 'Valor' },
  { name: 'Itaú', dateCol: 'data', descCol: 'lancamento', amountCol: 'valor' },
  { name: 'Bradesco', dateCol: 'Data', descCol: 'Histórico', amountCol: 'Valor' },
  { name: 'Generic', dateCol: 'Data', descCol: 'Descrição', amountCol: 'Valor' },
  { name: 'Generic EN', dateCol: 'Date', descCol: 'Description', amountCol: 'Amount' },
]

function normalizeKey(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function detectBankProfile(headers: string[]): ColumnMapping | null {
  const normalizedHeaders = headers.map(normalizeKey)

  for (const profile of BANK_PROFILES) {
    const dateIdx = normalizedHeaders.indexOf(normalizeKey(profile.dateCol))
    const descIdx = normalizedHeaders.indexOf(normalizeKey(profile.descCol))
    const amountIdx = normalizedHeaders.indexOf(normalizeKey(profile.amountCol))

    if (dateIdx !== -1 && descIdx !== -1 && amountIdx !== -1) {
      return {
        date: headers[dateIdx],
        description: headers[descIdx],
        amount: headers[amountIdx],
      }
    }
  }
  return null
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim()

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return isoMatch[0]

  // MM/DD/YYYY (US format)
  const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch
    const month = parseInt(m, 10)
    if (month > 12) {
      // Actually DD/MM/YYYY
      return `${y}-${d.padStart(2, '0')}-${m.padStart(2, '0')}`
    }
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  return null
}

function parseAmount(raw: string): number | null {
  let cleaned = raw.trim()
  // Remove currency symbols
  cleaned = cleaned.replace(/[R$€£\s]/g, '')
  // Handle Brazilian format: 1.234,56 → 1234.56
  if (/\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  }
  // Handle plain comma decimal: 1234,56 → 1234.56
  else if (/^\-?\d+(,\d{1,2})$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.')
  }
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

export function parseCSV(fileContent: string): {
  headers: string[]
  rows: Record<string, string>[]
} {
  const result = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
  }
}

export function mapTransactions(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): ParsedTransaction[] {
  const results: ParsedTransaction[] = []

  for (const row of rows) {
    const rawDate = row[mapping.date]
    const rawDesc = row[mapping.description]
    const rawAmount = row[mapping.amount]

    if (!rawDate || !rawAmount) continue

    const date = parseDate(rawDate)
    if (!date) continue

    const amount = parseAmount(rawAmount)
    if (amount === null || amount === 0) continue

    results.push({
      date,
      description: (rawDesc ?? '').trim() || 'Sem descrição',
      amount: Math.abs(amount),
      type: amount < 0 ? 'expense' : 'income',
      rawRow: row,
    })
  }

  return results
}
