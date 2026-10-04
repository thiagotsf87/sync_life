import { describe, it, expect } from 'vitest'
import { buildFallbackMeuDia, textoFontes } from './brief-fallback'
import type { PanoramaContext } from '@/lib/coach/context'

const PROIBIDAS = /—|edi[çc][aã]o|folha|manchete|colof[aã]o|jornal|byline|reda[çc][aã]o|di[aá]rio|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b/i

/** Contexto equivalente ao mock dos protótipos (outubro, lazer 410 de 420). */
const MOCK: PanoramaContext = {
  financas: {
    income: 5000, expenses: 3160, balance: 1840, savingsRate: 37, txCount: 34,
    topCategories: [{ name: 'Moradia', total: 1240 }, { name: 'Mercado', total: 520 }, { name: 'Lazer', total: 410 }],
  },
  score: {
    total: 78, financas: 83, futuro: 79, tempo: 71, corpo: 69, mente: 58, patrimonio: 76,
    carreira: 69, experiencias: 78, recorded_date: '2026-10-03',
  },
  orcamentos: [
    { category: 'Lazer', gasto: 410, limite: 420, pct: 98 },
    { category: 'Mercado', gasto: 520, limite: 650, pct: 80 },
    { category: 'Moradia', gasto: 1240, limite: 1800, pct: 69 },
  ],
  metas: [{ name: 'Viagem Itália', current_amount: 8600, target_amount: 12700, target_date: '2027-01-04' }],
}

const VAZIO: PanoramaContext = {
  financas: { income: 0, expenses: 0, balance: 0, savingsRate: 0, txCount: 0, topCategories: [] },
}

/** Separa frases por ponto final seguido de espaço + maiúscula (ignora "R$ 1.840,00"). */
const frases = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/)

const todasStrings = (b: ReturnType<typeof buildFallbackMeuDia>) =>
  [b.fala, ...b.recs.flatMap(r => [r.title, r.detail])]

describe('buildFallbackMeuDia', () => {
  it('orçamento em 98%: a fala começa por esse orçamento, com os números', () => {
    const b = buildFallbackMeuDia(MOCK, 'outubro 2026')
    expect(b.fala.startsWith('O orçamento de Lazer')).toBe(true)
    expect(b.fala).toContain('98%')
    expect(b.fala).toContain('R$ 10,00')
    expect(b.recs[0].title).toBe('Segurar Lazer')
  })

  it('fala tem 2 frases e sempre 3 recs', () => {
    for (const ctx of [MOCK, VAZIO]) {
      const b = buildFallbackMeuDia(ctx, 'outubro 2026')
      expect(frases(b.fala)).toHaveLength(2)
      expect(b.recs).toHaveLength(3)
    }
  })

  it('sem transações: a fala fala de começar', () => {
    const b = buildFallbackMeuDia(VAZIO, 'outubro 2026')
    expect(b.fala.toLowerCase()).toContain('começar')
    expect(b.fala).toContain('outubro 2026')
  })

  it('saldo negativo vem antes da poupança quando nenhum orçamento passa de 85%', () => {
    const ctx: PanoramaContext = {
      financas: { income: 2000, expenses: 2500, balance: -500, savingsRate: -25, txCount: 10, topCategories: [] },
      orcamentos: [{ category: 'Mercado', gasto: 500, limite: 650, pct: 77 }],
    }
    const b = buildFallbackMeuDia(ctx, 'outubro 2026')
    expect(b.fala.startsWith('As despesas do mês passaram as receitas')).toBe(true)
    expect(b.fala).toContain('R$ 500,00')
  })

  it('poupança ≥ 20% sem tensão abre a fala', () => {
    const ctx: PanoramaContext = {
      financas: { income: 5000, expenses: 3000, balance: 2000, savingsRate: 40, txCount: 12, topCategories: [] },
    }
    expect(buildFallbackMeuDia(ctx, 'outubro 2026').fala.startsWith('Você está guardando 40%')).toBe(true)
  })

  it('nenhuma string contém em-dash nem palavra proibida (coach, diário, edição...)', () => {
    for (const ctx of [MOCK, VAZIO]) {
      for (const s of todasStrings(buildFallbackMeuDia(ctx, 'outubro 2026'))) {
        expect(s).not.toMatch(PROIBIDAS)
      }
    }
  })

  it('rec de preenchimento usa "Falar com Sy", nunca coach', () => {
    const b = buildFallbackMeuDia(VAZIO, 'outubro 2026')
    expect(b.recs.map(r => r.title)).toContain('Falar com Sy')
  })
})

describe('textoFontes', () => {
  it('junta hora SP e fontes em pt-BR', () => {
    // 10:12 UTC = 07:12 em São Paulo (UTC-3)
    expect(textoFontes(['34 transações', '3 orçamentos', '1 meta'], '2026-10-04T10:12:00Z'))
      .toBe('Atualizado às 7h12 · fontes: 34 transações, 3 orçamentos e 1 meta')
  })

  it('sem fontes: só a hora', () => {
    expect(textoFontes([], '2026-10-04T10:12:00Z')).toBe('Atualizado às 7h12')
  })
})
