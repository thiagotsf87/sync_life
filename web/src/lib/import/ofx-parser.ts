import type { ParsedTransaction } from './csv-parser'

/**
 * Lightweight OFX/QFX parser.
 * Extracts <STMTTRN> blocks and maps to ParsedTransaction[].
 */
export function parseOFX(content: string): ParsedTransaction[] {
  const results: ParsedTransaction[] = []

  // Split by <STMTTRN> blocks
  const blocks = content.split(/<STMTTRN>/i).slice(1)

  for (const block of blocks) {
    const endIdx = block.search(/<\/STMTTRN>/i)
    const txBlock = endIdx !== -1 ? block.substring(0, endIdx) : block

    const dtPosted = extractTag(txBlock, 'DTPOSTED')
    const trnAmt = extractTag(txBlock, 'TRNAMT')
    const name = extractTag(txBlock, 'NAME') || extractTag(txBlock, 'MEMO') || ''

    if (!dtPosted || !trnAmt) continue

    const date = parseOFXDate(dtPosted)
    if (!date) continue

    const amount = parseFloat(trnAmt.replace(',', '.'))
    if (isNaN(amount) || amount === 0) continue

    results.push({
      date,
      description: name.trim() || 'Transação OFX',
      amount: Math.abs(amount),
      type: amount < 0 ? 'expense' : 'income',
      rawRow: { DTPOSTED: dtPosted, TRNAMT: trnAmt, NAME: name },
    })
  }

  return results
}

function extractTag(block: string, tag: string): string | null {
  // OFX format: <TAG>value\n  (no closing tag in SGML variant)
  // Also handle XML variant: <TAG>value</TAG>
  const regex = new RegExp(`<${tag}>([^<\\n]+)`, 'i')
  const match = block.match(regex)
  return match ? match[1].trim() : null
}

function parseOFXDate(raw: string): string | null {
  // OFX dates: YYYYMMDDHHMMSS[.XXX:tz] or YYYYMMDD
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!match) return null
  const [, y, m, d] = match
  return `${y}-${m}-${d}`
}
