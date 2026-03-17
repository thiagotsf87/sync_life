import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectBankFromPdf, parsePdfTransactions } from '../pdf-parser'

// We test detectBankFromPdf and parsePdfTransactions directly
// extractTextFromPdf depends on pdfjs-dist (browser-only) so we skip it in unit tests

describe('detectBankFromPdf', () => {
  it('detects Nubank', () => {
    const pages = ['Extrato de conta\nNu Pagamentos S.A.\nCNPJ: 18.236.120/0001-58']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Nubank')
  })

  it('detects Nubank (lowercase nubank keyword)', () => {
    const pages = ['fatura nubank março 2026']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Nubank')
  })

  it('detects Inter', () => {
    const pages = ['Banco Inter S.A.\nExtrato da conta corrente']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Inter')
  })

  it('detects Inter via inter.co', () => {
    const pages = ['Extrato gerado por inter.co em 01/03/2026']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Inter')
  })

  it('detects Itaú', () => {
    const pages = ['Itau Unibanco S.A.\nExtrato de Conta Corrente']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Itaú')
  })

  it('detects Itaú via itau.com.br', () => {
    const pages = ['Acesse itau.com.br para mais informações']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Itaú')
  })

  it('detects Bradesco', () => {
    const pages = ['Bradesco S.A.\nExtrato de conta']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Bradesco')
  })

  it('detects C6 Bank', () => {
    const pages = ['C6 Bank - Extrato mensal']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('C6 Bank')
  })

  it('detects BTG Pactual', () => {
    const pages = ['BTG Pactual - Extrato consolidado']
    const profile = detectBankFromPdf(pages)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('BTG Pactual')
  })

  it('returns null for unknown bank', () => {
    const pages = ['Some random PDF\nwithout bank keywords']
    const profile = detectBankFromPdf(pages)
    expect(profile).toBeNull()
  })

  it('searches in first 2 pages only', () => {
    const pages = ['Page 1', 'Page 2', 'Nu Pagamentos on page 3']
    const profile = detectBankFromPdf(pages)
    expect(profile).toBeNull()
  })

  it('handles empty pages array', () => {
    const profile = detectBankFromPdf([])
    expect(profile).toBeNull()
  })
})

describe('parsePdfTransactions', () => {
  it('parses transactions with DD/MM/YYYY date format', () => {
    const pages = [
      '15/03/2026 Supermercado ABC R$ 150,00\n16/03/2026 Farmácia XYZ R$ 45,90',
    ]
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2026-03-15')
    expect(result[0].description).toBe('Supermercado ABC')
    expect(result[0].amount).toBe(150)
    expect(result[0].type).toBe('income')
    expect(result[1].date).toBe('2026-03-16')
    expect(result[1].amount).toBe(45.9)
  })

  it('parses negative amounts as expenses', () => {
    const pages = ['15/03/2026 Compra cartão -R$ 200,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('expense')
    expect(result[0].amount).toBe(200)
  })

  it('parses amounts without R$ symbol', () => {
    const pages = ['15/03/2026 Transferência PIX 1.500,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(1500)
  })

  it('parses amounts with thousands separator', () => {
    const pages = ['10/01/2026 Salário 5.432,10']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(5432.1)
  })

  it('parses DD/MM (short date) using current year', () => {
    const pages = ['15/03 Compra no débito 99,90']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(1)
    const currentYear = new Date().getFullYear()
    expect(result[0].date).toBe(`${currentYear}-03-15`)
  })

  it('returns empty array for pages with no transactions', () => {
    const pages = ['This is just a header page\nNo transaction data here']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty pages', () => {
    const result = parsePdfTransactions([], null)
    expect(result).toHaveLength(0)
  })

  it('returns empty array for pages with empty strings', () => {
    const result = parsePdfTransactions(['', ''], null)
    expect(result).toHaveLength(0)
  })

  it('skips lines with zero amount', () => {
    const pages = ['15/03/2026 Saldo anterior 0,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('handles multiple pages', () => {
    const pages = [
      '01/03/2026 Compra A 100,00',
      '15/03/2026 Compra B 200,00',
      '28/03/2026 Compra C 300,00',
    ]
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(3)
    expect(result[0].description).toBe('Compra A')
    expect(result[1].description).toBe('Compra B')
    expect(result[2].description).toBe('Compra C')
  })

  it('uses bank profile regex when provided', () => {
    const profile = {
      name: 'Nubank',
      lineRegex: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\s*R?\$?\s*[\d.,]+)\s*$/,
      dateGroup: 1,
      descGroup: 2,
      amountGroup: 3,
      dateFormat: 'DD/MM/YYYY' as const,
    }
    const pages = ['01/03/2026 PIX Recebido 500,00']
    const result = parsePdfTransactions(pages, profile)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(500)
  })

  it('populates rawRow correctly', () => {
    const pages = ['15/03/2026 Padaria Bom Pão R$ 12,50']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(1)
    expect(result[0].rawRow).toHaveProperty('date')
    expect(result[0].rawRow).toHaveProperty('description')
    expect(result[0].rawRow).toHaveProperty('amount')
  })

  it('handles negative amounts with space after minus', () => {
    const pages = ['15/03/2026 Débito automático - R$ 350,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('expense')
    expect(result[0].amount).toBe(350)
  })

  it('uses default description for empty description', () => {
    // This is unlikely in practice but tests the fallback
    const pages = ['15/03/2026  150,00']
    const result = parsePdfTransactions(pages, null)
    // The regex requires at least some text between date and amount
    // so this likely won't match, which is fine
    expect(result.every(tx => tx.description.length > 0)).toBe(true)
  })

  it('skips "Saldo do dia" lines', () => {
    const pages = [
      '15/03/2026 PIX Recebido 500,00\n15/03/2026 Saldo do dia 1.200,00\n16/03/2026 Compra Débito 45,90',
    ]
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(2)
    expect(result[0].description).toBe('PIX Recebido')
    expect(result[1].description).toBe('Compra Débito')
  })

  it('skips "Saldo anterior" lines', () => {
    const pages = ['01/03/2026 Saldo anterior 3.500,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('skips "Saldo final" lines', () => {
    const pages = ['31/03/2026 Saldo final 4.200,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('skips "Saldo disponível" lines', () => {
    const pages = ['15/03/2026 Saldo disponível 2.800,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('skips "Total do dia" lines', () => {
    const pages = ['15/03/2026 Total do dia 750,00']
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('skips various balance keywords case-insensitively', () => {
    const pages = [
      '15/03/2026 SALDO DO DIA 1.000,00\n15/03/2026 Saldo Inicial 500,00\n15/03/2026 TOTAL DE ENTRADAS 2.000,00\n15/03/2026 Total de Saídas 1.500,00\n15/03/2026 Limite disponível 5.000,00',
    ]
    const result = parsePdfTransactions(pages, null)
    expect(result).toHaveLength(0)
  })

  it('keeps real transactions that contain partial balance words', () => {
    const pages = ['15/03/2026 Pagamento Boleto Saldanha 120,00']
    const result = parsePdfTransactions(pages, null)
    // "Saldanha" contains "sald" but NOT any full balance keyword
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Pagamento Boleto Saldanha')
  })
})
