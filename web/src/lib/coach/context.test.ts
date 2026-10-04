import { describe, it, expect } from 'vitest'
import { summarizeFinancas, MODULE_PERSONA, fontesDe, buildContextoComFontes } from './context'

describe('coach/context', () => {
  it('summarizeFinancas calcula saldo e taxa de poupança', () => {
    const s = summarizeFinancas(
      [
        { amount: 5000, type: 'income', category: null },
        { amount: 3000, type: 'expense', category: { name: 'Moradia' } },
      ] as never,
    )
    expect(s.income).toBe(5000)
    expect(s.expenses).toBe(3000)
    expect(s.balance).toBe(2000)
    expect(s.savingsRate).toBe(40)
  })

  it('MODULE_PERSONA tem persona para finanças com label e cor', () => {
    expect(MODULE_PERSONA.financas.label).toBe('Finanças')
    expect(MODULE_PERSONA.financas.color).toMatch(/^#/)
    expect(MODULE_PERSONA.financas.system.length).toBeGreaterThan(20)
  })
})

describe('coach/context fontesDe', () => {
  it('monta rótulos a partir de um ctx fixo (transações + orçamentos)', () => {
    const ctx = {
      financas: { income: 0, expenses: 0, balance: 0, savingsRate: 0, txCount: 34, topCategories: [] },
      orcamentos: [{}, {}, {}],
    }
    expect(fontesDe(ctx)).toEqual(['34 transações', '3 orçamentos'])
  })

  it('cobre os blocos do Panorama na ordem de leitura', () => {
    const ctx = {
      financas: { income: 0, expenses: 0, balance: 0, savingsRate: 0, txCount: 1, topCategories: [] },
      orcamentos: [{}],
      contas: [{}, {}, {}],
      metas: [{}, {}, {}],
      score: { total: 70 },
      checkin_ontem: { mood: 3, note: null },
      tempo: { eventosHoje: 2, janelaLivreMin: 180 },
      intencoes_em_aberto: { total: 1, ultima: 'Quero começar inglês' },
    }
    expect(fontesDe(ctx)).toEqual([
      '1 transação', '1 orçamento', '3 contas fixas', '3 metas',
      'seu Life Sync Score', 'check-in de ontem', 'agenda de hoje', '1 intenção em aberto',
    ])
  })

  it('cobre tempo, mente e carreira (agenda da semana, foco, trilhas, skills, roadmap)', () => {
    expect(fontesDe({
      tempo: { eventosHoje: [], eventosSemana: 5, janelaLivreMin: 120, janelaInicio: '14:00', janelaFim: '16:00', livreTotalMin: 200 },
      foco: { minutosSemana: 390, sessoes: 4 },
    })).toEqual(['agenda da semana', '6h30 de foco'])
    expect(fontesDe({
      trilhas: [{}, {}],
      foco: { minutosSemana: 120, sessoes: 2 },
    })).toEqual(['2h de foco', '2 trilhas de estudo'])
    expect(fontesDe({ skills: [{}, {}, {}, {}], roadmap: { name: 'Senior' } })).toEqual(['4 habilidades', 'seu roadmap de carreira'])
  })

  it('ignora blocos vazios ou zerados', () => {
    expect(fontesDe({})).toEqual([])
    expect(fontesDe({
      financas: { income: 0, expenses: 0, balance: 0, savingsRate: 0, txCount: 0, topCategories: [] },
      foco: { minutosSemana: 0, sessoes: 0 },
      intencoes_em_aberto: { total: 0, ultima: null },
    })).toEqual([])
  })
})

describe('coach/context buildContextoComFontes', () => {
  /** Supabase fake: toda query resolve em `{ data: null, error }` (tabela ausente). */
  function fakeSupabaseSemTabelas() {
    const chain: Record<string, unknown> = {}
    const self = () => chain
    for (const m of ['select', 'eq', 'neq', 'gte', 'lte', 'order', 'limit']) chain[m] = self
    chain.maybeSingle = () => Promise.resolve({ data: null, error: { message: 'relation does not exist' } })
    chain.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: null, count: null, error: { message: 'relation does not exist' } }).then(res)
    return { from: () => chain }
  }

  it('devolve ctx vazio e fontes vazias para módulo sem pacote', async () => {
    const r = await buildContextoComFontes(fakeSupabaseSemTabelas(), 'u1', 'corpo')
    expect(r).toEqual({ ctx: {}, fontes: [] })
  })

  it('tolera tabelas ausentes em todos os módulos novos (nenhum throw)', async () => {
    const sb = fakeSupabaseSemTabelas()
    for (const mod of ['tempo', 'futuro', 'mente', 'carreira'] as const) {
      const r = await buildContextoComFontes(sb, 'u1', mod)
      expect(r.ctx).toEqual({})
      expect(r.fontes).toEqual([])
    }
    const pan = await buildContextoComFontes(sb, 'u1', 'panorama')
    expect(Object.keys(pan.ctx)).toEqual(['financas'])
    expect(pan.fontes).toEqual([])
  })
})
