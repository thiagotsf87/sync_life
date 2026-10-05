import { describe, it, expect } from 'vitest'
import { detectBankProfile, parseCSV, mapTransactions } from '../csv-parser'
import type { ColumnMapping } from '../csv-parser'

// ─── detectBankProfile ──────────────────────────────────────────────────────────

describe('detectBankProfile', () => {
  it('detects Nubank profile headers', () => {
    const result = detectBankProfile(['date', 'title', 'amount'])
    expect(result).toEqual({ date: 'date', description: 'title', amount: 'amount' })
  })

  it('detects Inter profile headers', () => {
    const result = detectBankProfile(['Data Lançamento', 'Descrição', 'Valor'])
    expect(result).toEqual({
      date: 'Data Lançamento',
      description: 'Descrição',
      amount: 'Valor',
    })
  })

  it('detects Itaú profile headers', () => {
    const result = detectBankProfile(['data', 'lancamento', 'valor'])
    expect(result).toEqual({ date: 'data', description: 'lancamento', amount: 'valor' })
  })

  it('detects Bradesco profile headers', () => {
    const result = detectBankProfile(['Data', 'Histórico', 'Valor'])
    expect(result).toEqual({ date: 'Data', description: 'Histórico', amount: 'Valor' })
  })

  it('detects Generic PT profile headers', () => {
    const result = detectBankProfile(['Data', 'Descrição', 'Valor'])
    expect(result).toEqual({ date: 'Data', description: 'Descrição', amount: 'Valor' })
  })

  it('detects Generic EN profile headers', () => {
    const result = detectBankProfile(['Date', 'Description', 'Amount'])
    expect(result).toEqual({ date: 'Date', description: 'Description', amount: 'Amount' })
  })

  it('returns null when no profile matches', () => {
    const result = detectBankProfile(['foo', 'bar', 'baz'])
    expect(result).toBeNull()
  })

  it('is case-insensitive for header matching', () => {
    const result = detectBankProfile(['DATE', 'TITLE', 'AMOUNT'])
    expect(result).toEqual({ date: 'DATE', description: 'TITLE', amount: 'AMOUNT' })
  })

  it('trims whitespace from headers', () => {
    const result = detectBankProfile([' date ', ' title ', ' amount '])
    expect(result).toEqual({ date: ' date ', description: ' title ', amount: ' amount ' })
  })

  it('returns null for empty headers', () => {
    const result = detectBankProfile([])
    expect(result).toBeNull()
  })

  it('matches when headers have extra columns', () => {
    const result = detectBankProfile(['date', 'title', 'amount', 'extra_col'])
    expect(result).toEqual({ date: 'date', description: 'title', amount: 'amount' })
  })
})

// ─── parseCSV ───────────────────────────────────────────────────────────────────

describe('parseCSV', () => {
  it('parses a simple CSV with headers', () => {
    const csv = 'date,title,amount\n2024-01-15,Compra,100.50\n2024-01-16,Venda,-50.00'
    const { headers, rows } = parseCSV(csv)
    expect(headers).toEqual(['date', 'title', 'amount'])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ date: '2024-01-15', title: 'Compra', amount: '100.50' })
  })

  it('trims header whitespace', () => {
    const csv = ' date , title , amount \n2024-01-15,Test,10'
    const { headers } = parseCSV(csv)
    expect(headers).toEqual(['date', 'title', 'amount'])
  })

  it('skips empty lines', () => {
    const csv = 'date,title,amount\n2024-01-15,A,10\n\n2024-01-16,B,20\n'
    const { rows } = parseCSV(csv)
    expect(rows).toHaveLength(2)
  })

  it('returns empty rows for empty content', () => {
    const csv = 'date,title,amount\n'
    const { headers, rows } = parseCSV(csv)
    expect(headers).toEqual(['date', 'title', 'amount'])
    expect(rows).toHaveLength(0)
  })
})

// ─── mapTransactions ────────────────────────────────────────────────────────────

describe('mapTransactions', () => {
  const mapping: ColumnMapping = { date: 'date', description: 'title', amount: 'amount' }

  it('maps positive amounts as income', () => {
    const rows = [{ date: '2024-01-15', title: 'Salário', amount: '5000' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('income')
    expect(result[0].amount).toBe(5000)
    expect(result[0].description).toBe('Salário')
    expect(result[0].date).toBe('2024-01-15')
  })

  it('maps negative amounts as expense with absolute value', () => {
    const rows = [{ date: '2024-01-15', title: 'Compra', amount: '-150' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('expense')
    expect(result[0].amount).toBe(150)
  })

  it.each([
    ['4150.00', 4150], ['-182.40', 182.4], ['100.50', 100.5], ['0.99', 0.99],   // ponto decimal (Nubank, planilhas em inglês)
    ['4.150,00', 4150], ['-1.234,56', 1234.56], ['1.234.567,89', 1234567.89],  // milhar com ponto e vírgula decimal (BR)
    ['182,40', 182.4], ['R$ 1.200,00', 1200], ['4.150', 4150],                  // vírgula decimal simples, moeda, milhar sem decimais
  ])('lê o valor %s como %d (valor absoluto)', (bruto, esperado) => {
    const rows = [{ date: '2024-01-15', title: 'Teste', amount: bruto }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBeCloseTo(esperado, 2)
  })

  it('o sinal decide o tipo também com ponto decimal', () => {
    const rows = [
      { date: '2024-01-15', title: 'Salário', amount: '4150.00' },
      { date: '2024-01-16', title: 'Mercado', amount: '-182.40' },
    ]
    const result = mapTransactions(rows, mapping)
    expect(result.map(r => [r.type, r.amount])).toEqual([['income', 4150], ['expense', 182.4]])
  })

  it('handles DD/MM/YYYY date format', () => {
    const rows = [{ date: '15/01/2024', title: 'Test', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].date).toBe('2024-01-15')
  })

  it('handles DD-MM-YYYY date format', () => {
    const rows = [{ date: '15-01-2024', title: 'Test', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].date).toBe('2024-01-15')
  })

  it('handles YYYY-MM-DD date format', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].date).toBe('2024-01-15')
  })

  it('handles Brazilian currency format (1.234,56)', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: '1.234,56' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].amount).toBe(1234.56)
  })

  it('handles comma decimal format (1234,56)', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: '1234,56' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].amount).toBe(1234.56)
  })

  it('removes currency symbols from amount', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: 'R$ 100,00' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].amount).toBe(100)
  })

  it('skips rows with missing date', () => {
    const rows = [{ date: '', title: 'Test', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(0)
  })

  it('skips rows with missing amount', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: '' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(0)
  })

  it('skips rows with zero amount', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: '0' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(0)
  })

  it('skips rows with invalid date', () => {
    const rows = [{ date: 'not-a-date', title: 'Test', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(0)
  })

  it('skips rows with unparseable amount', () => {
    const rows = [{ date: '2024-01-15', title: 'Test', amount: 'abc' }]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(0)
  })

  it('uses "Sem descrição" for missing description', () => {
    const rows = [{ date: '2024-01-15', title: '', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].description).toBe('Sem descrição')
  })

  it('preserves rawRow', () => {
    const row = { date: '2024-01-15', title: 'Test', amount: '100', extra: 'data' }
    const result = mapTransactions([row], mapping)
    expect(result[0].rawRow).toBe(row)
  })

  it('handles DD.MM.YYYY date format', () => {
    const rows = [{ date: '15.01.2024', title: 'Test', amount: '100' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].date).toBe('2024-01-15')
  })

  it('handles plain decimal format (US style)', () => {
    // Regressão: a regex do formato BR não era ancorada no início e tratava o ponto decimal como milhar
    // ("100.50" virava 10050 e "4150.00" virava 415000). O ponto é decimal quando não forma grupos de 3 dígitos.
    const rows = [{ date: '2024-01-15', title: 'Test', amount: '100.50' }]
    const result = mapTransactions(rows, mapping)
    expect(result[0].amount).toBe(100.5)
  })

  it('processes multiple rows correctly', () => {
    const rows = [
      { date: '2024-01-15', title: 'Receita', amount: '1000' },
      { date: '2024-01-16', title: 'Despesa', amount: '-500' },
      { date: '2024-01-17', title: 'Extra', amount: '200' },
    ]
    const result = mapTransactions(rows, mapping)
    expect(result).toHaveLength(3)
    expect(result[0].type).toBe('income')
    expect(result[1].type).toBe('expense')
    expect(result[2].type).toBe('income')
  })
})
