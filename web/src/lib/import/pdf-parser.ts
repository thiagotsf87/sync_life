import type { ParsedTransaction } from './csv-parser'

export interface PdfBankProfile {
  name: string
  lineRegex: RegExp
  dateGroup: number
  descGroup: number
  amountGroup: number
  dateFormat: 'DD/MM/YYYY' | 'DD/MM'
}

const PDF_BANK_PROFILES: PdfBankProfile[] = [
  {
    name: 'Nubank',
    lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
    dateGroup: 1,
    descGroup: 2,
    amountGroup: 3,
    dateFormat: 'DD/MM/YYYY',
  },
  {
    name: 'Inter',
    lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
    dateGroup: 1,
    descGroup: 2,
    amountGroup: 3,
    dateFormat: 'DD/MM/YYYY',
  },
  {
    name: 'Itaú',
    lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
    dateGroup: 1,
    descGroup: 2,
    amountGroup: 3,
    dateFormat: 'DD/MM/YYYY',
  },
  {
    name: 'Bradesco',
    lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
    dateGroup: 1,
    descGroup: 2,
    amountGroup: 3,
    dateFormat: 'DD/MM/YYYY',
  },
  {
    name: 'C6 Bank',
    lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
    dateGroup: 1,
    descGroup: 2,
    amountGroup: 3,
    dateFormat: 'DD/MM/YYYY',
  },
  {
    name: 'BTG Pactual',
    lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
    dateGroup: 1,
    descGroup: 2,
    amountGroup: 3,
    dateFormat: 'DD/MM/YYYY',
  },
]

const BANK_KEYWORDS: Array<{ name: string; keywords: string[] }> = [
  { name: 'Nubank', keywords: ['nu pagamentos', 'nubank'] },
  { name: 'Inter', keywords: ['banco inter', 'inter.co'] },
  { name: 'Itaú', keywords: ['itau unibanco', 'itau.com.br', 'itaú unibanco'] },
  { name: 'Bradesco', keywords: ['bradesco', 'bradesconet'] },
  { name: 'C6 Bank', keywords: ['c6 bank', 'c6 consig'] },
  { name: 'BTG Pactual', keywords: ['btg pactual'] },
]

/**
 * Extract text content from a PDF file using pdfjs-dist.
 * Returns one string per page.
 */
export async function extractTextFromPdf(file: File): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist')

  // Configure worker — serve from public/ (copied from node_modules at build time)
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const arrayBuffer = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()

    // Group text items by Y position to reconstruct lines
    const lineMap = new Map<number, Array<{ x: number; str: string }>>()
    for (const item of textContent.items) {
      if (!('str' in item) || !(item as { str: string }).str.trim()) continue
      const textItem = item as { str: string; transform: number[] }
      // transform[5] is the Y position, transform[4] is X
      const y = Math.round(textItem.transform[5])
      const x = textItem.transform[4]
      if (!lineMap.has(y)) lineMap.set(y, [])
      lineMap.get(y)!.push({ x, str: textItem.str })
    }

    // Sort lines by Y descending (PDF coordinates: bottom = 0)
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a)
    const lines: string[] = []
    for (const y of sortedYs) {
      const items = lineMap.get(y)!.sort((a, b) => a.x - b.x)
      lines.push(items.map(it => it.str).join(' '))
    }
    pages.push(lines.join('\n'))
  }

  return pages
}

/**
 * Detect which bank generated the PDF based on keywords in the first pages.
 */
export function detectBankFromPdf(pages: string[]): PdfBankProfile | null {
  const searchText = pages.slice(0, 2).join('\n').toLowerCase()

  for (const bank of BANK_KEYWORDS) {
    const found = bank.keywords.some(kw => searchText.includes(kw))
    if (found) {
      const profile = PDF_BANK_PROFILES.find(p => p.name === bank.name)
      return profile ?? null
    }
  }
  return null
}

// Keywords that indicate informational/balance lines (not actual transactions)
const BALANCE_KEYWORDS = [
  'saldo do dia',
  'saldo anterior',
  'saldo final',
  'saldo inicial',
  'saldo disponível',
  'saldo disponivel',
  'saldo em conta',
  'saldo total',
  'saldo bloqueado',
  'saldo de',
  'saldo',
  's a l d o',
  'total do dia',
  'total de entradas',
  'total de saídas',
  'total de saidas',
  'total entradas',
  'total saídas',
  'total saidas',
  'total do período',
  'total do periodo',
  'limite disponível',
  'limite disponivel',
  'limite total',
  'rendimento da conta',
  'rendimento poupança',
  'rendimento poupanca',
]

function isBalanceLine(description: string): boolean {
  const lower = description.toLowerCase().trim()
  return BALANCE_KEYWORDS.some(kw => lower.includes(kw))
}

// Generic regex for lines with date + description + amount
const GENERIC_LINE_REGEX =
  /(\d{2}\/\d{2}\/?\d{0,4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/

/**
 * Parse PDF text pages into transactions.
 * Uses bank-specific regex if profile detected, otherwise generic heuristic.
 */
export function parsePdfTransactions(
  pages: string[],
  profile: PdfBankProfile | null,
): ParsedTransaction[] {
  const results: ParsedTransaction[] = []
  const regex = profile?.lineRegex ?? GENERIC_LINE_REGEX
  const dateGroupIdx = profile?.dateGroup ?? 1
  const descGroupIdx = profile?.descGroup ?? 2
  const amountGroupIdx = profile?.amountGroup ?? 3

  const currentYear = new Date().getFullYear()

  for (const page of pages) {
    const lines = page.split('\n')
    for (const line of lines) {
      const match = line.match(regex)
      if (!match) continue

      const rawDate = match[dateGroupIdx]
      const rawDesc = match[descGroupIdx]
      const rawAmount = match[amountGroupIdx]

      const date = parsePdfDate(rawDate, currentYear)
      if (!date) continue

      const amount = parsePdfAmount(rawAmount)
      if (amount === null || amount === 0) continue

      const description = rawDesc.trim() || 'Transação PDF'

      // Skip informational/balance lines — not actual transactions
      if (isBalanceLine(description)) continue

      results.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? 'expense' : 'income',
        rawRow: { date: rawDate, description: rawDesc, amount: rawAmount },
      })
    }
  }

  return results
}

/**
 * Parse a date from PDF text.
 * Handles DD/MM/YYYY and DD/MM (infers current year).
 */
function parsePdfDate(raw: string, currentYear: number): string | null {
  const trimmed = raw.trim()

  // DD/MM/YYYY
  const fullMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (fullMatch) {
    const [, d, m, y] = fullMatch
    return `${y}-${m}-${d}`
  }

  // DD/MM (no year)
  const shortMatch = trimmed.match(/^(\d{2})\/(\d{2})$/)
  if (shortMatch) {
    const [, d, m] = shortMatch
    return `${currentYear}-${m}-${d}`
  }

  return null
}

/**
 * Parse a monetary amount from PDF text.
 * Handles: R$ 1.234,56 / -1.234,56 / 1234,56 / R$-500,00
 */
function parsePdfAmount(raw: string): number | null {
  let cleaned = raw.trim()
  // Remove currency symbol and whitespace
  cleaned = cleaned.replace(/R?\$?\s*/g, '')
  // Detect negative
  const isNegative = cleaned.includes('-')
  cleaned = cleaned.replace(/-/g, '').trim()
  // Brazilian format: 1.234,56 → 1234.56
  if (/\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (/^\d+(,\d{1,2})$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.')
  }
  const num = parseFloat(cleaned)
  if (isNaN(num)) return null
  return isNegative ? -num : num
}
