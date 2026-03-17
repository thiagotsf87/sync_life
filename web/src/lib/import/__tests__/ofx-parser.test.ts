import { describe, it, expect } from 'vitest'
import { parseOFX } from '../ofx-parser'

describe('parseOFX', () => {
  it('parses a single STMTTRN block', () => {
    const ofx = `
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240115120000[-03:EST]
<TRNAMT>-150.00
<NAME>Supermercado ABC
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2024-01-15')
    expect(result[0].amount).toBe(150)
    expect(result[0].type).toBe('expense')
    expect(result[0].description).toBe('Supermercado ABC')
  })

  it('parses multiple STMTTRN blocks', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240115
<TRNAMT>-100.00
<NAME>Compra 1
</STMTTRN>
<STMTTRN>
<DTPOSTED>20240116
<TRNAMT>500.00
<NAME>Salário
</STMTTRN>
<STMTTRN>
<DTPOSTED>20240117
<TRNAMT>-75.50
<NAME>Compra 2
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(3)

    expect(result[0].type).toBe('expense')
    expect(result[0].amount).toBe(100)

    expect(result[1].type).toBe('income')
    expect(result[1].amount).toBe(500)

    expect(result[2].type).toBe('expense')
    expect(result[2].amount).toBe(75.50)
  })

  it('treats positive TRNAMT as income', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>1500.00
<NAME>Transferência recebida
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].type).toBe('income')
    expect(result[0].amount).toBe(1500)
  })

  it('treats negative TRNAMT as expense', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>-250.00
<NAME>Pagamento
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].type).toBe('expense')
    expect(result[0].amount).toBe(250)
  })

  it('uses MEMO when NAME is absent', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>-50.00
<MEMO>Pagamento via PIX
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].description).toBe('Pagamento via PIX')
  })

  it('uses default description when both NAME and MEMO are absent', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>-50.00
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].description).toBe('Transação OFX')
  })

  it('skips blocks without DTPOSTED', () => {
    const ofx = `
<STMTTRN>
<TRNAMT>-100.00
<NAME>Sem data
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(0)
  })

  it('skips blocks without TRNAMT', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<NAME>Sem valor
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(0)
  })

  it('skips blocks with zero amount', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>0.00
<NAME>Zero
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(0)
  })

  it('handles OFX date format with timezone YYYYMMDDHHMMSS[tz]', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240315093045[-03:EST]
<TRNAMT>-200.00
<NAME>Test
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].date).toBe('2024-03-15')
  })

  it('handles short OFX date format YYYYMMDD', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240315
<TRNAMT>-200.00
<NAME>Test
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].date).toBe('2024-03-15')
  })

  it('handles comma decimal separator in TRNAMT', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>-150,75
<NAME>Test
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].amount).toBe(150.75)
  })

  it('returns empty array for empty content', () => {
    expect(parseOFX('')).toEqual([])
  })

  it('returns empty array for content without STMTTRN blocks', () => {
    const ofx = `<OFX><SIGNONMSGSRSV1><SONRS></SONRS></SIGNONMSGSRSV1></OFX>`
    expect(parseOFX(ofx)).toEqual([])
  })

  it('populates rawRow with OFX fields', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120
<TRNAMT>-100.00
<NAME>Test TX
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result[0].rawRow).toEqual({
      DTPOSTED: '20240120',
      TRNAMT: '-100.00',
      NAME: 'Test TX',
    })
  })

  it('is case-insensitive for tags', () => {
    const ofx = `
<stmttrn>
<dtposted>20240120
<trnamt>-50.00
<name>Lowercase tags
</stmttrn>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Lowercase tags')
  })

  it('handles XML-style closing tags', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>20240120</DTPOSTED>
<TRNAMT>-100.00</TRNAMT>
<NAME>XML Style</NAME>
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(100)
    expect(result[0].description).toBe('XML Style')
  })

  it('skips blocks with invalid date format', () => {
    const ofx = `
<STMTTRN>
<DTPOSTED>baddate
<TRNAMT>-100.00
<NAME>Bad date
</STMTTRN>
`
    const result = parseOFX(ofx)
    expect(result).toHaveLength(0)
  })
})
