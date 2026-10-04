import { describe, it, expect } from 'vitest'
import {
  falaFinancas, subOrcamento, tagRecorrente, proximaAcao, fontesFinancas, deltaPct,
  fracaoExecutada, textoFala, brlInt, brl, type OrcResumo,
} from './hub'

const N = ' '
const orc = (nome: string, gasto: number, limite: number): OrcResumo =>
  ({ nome, gasto, limite, pct: Math.round((gasto / limite) * 100) })

describe('formatos', () => {
  it('NBSP depois de R$ e en-dash no negativo', () => {
    expect(brlInt(1840)).toBe(`R$${N}1.840`)
    expect(brlInt(-320)).toBe(`– R$${N}320`)
    expect(brl(89.9)).toBe(`R$${N}89,90`)
  })
})

describe('fracaoExecutada', () => {
  it('dia / dias do mês', () => {
    expect(fracaoExecutada('2026-10-31')).toBe(1)
    expect(Math.round(fracaoExecutada('2026-10-26') * 100)).toBe(84)
  })
})

describe('falaFinancas', () => {
  const base = { pctExecutado: 83, mesNome: 'outubro', temRegistros: true }

  it('um orçamento acima de 85%', () => {
    const f = falaFinancas({ ...base, orcamentos: [orc('Moradia', 1240, 1800), orc('Lazer', 410, 420)] })
    expect(textoFala(f)).toBe(`O mês está 83% executado. Só o orçamento de lazer pede atenção: R$${N}10 até o fim do mês.`)
    expect(f.find(p => p.w)?.t).toBe(`R$${N}10`)
  })

  it('nenhum acima de 85%', () => {
    expect(textoFala(falaFinancas({ ...base, orcamentos: [orc('Moradia', 1240, 1800)] })))
      .toBe('O mês está 83% executado e nenhum orçamento passou de 85%.')
  })

  it('estourado e mais de um em risco', () => {
    expect(textoFala(falaFinancas({ ...base, orcamentos: [orc('Lazer', 440, 420), orc('Mercado', 600, 650)] })))
      .toBe(`O mês está 83% executado. Dois orçamentos pedem atenção, o de lazer primeiro: passou R$${N}20 do limite.`)
  })

  it('sem orçamentos e sem registros', () => {
    expect(textoFala(falaFinancas({ ...base, orcamentos: [] })))
      .toBe('O mês está 83% executado. Ainda não há orçamentos para acompanhar.')
    expect(textoFala(falaFinancas({ ...base, temRegistros: false, orcamentos: [] })))
      .toBe('Ainda não há registros em outubro. Comece por + Registrar.')
  })
})

describe('subOrcamento', () => {
  it('três faixas', () => {
    expect(subOrcamento(orc('Moradia', 1240, 1800))).toBe(`69% · sobram R$${N}560`)
    expect(subOrcamento(orc('Lazer', 410, 420))).toBe(`98% · restam R$${N}10 até o fim do mês`)
    expect(subOrcamento(orc('Lazer', 440, 420))).toBe(`105% · passou R$${N}20`)
  })
})

describe('tagRecorrente', () => {
  const qua = new Date(2026, 9, 7) // quarta
  it('despesa conta os dias e é due em até 3', () => {
    expect(tagRecorrente({ daysLeft: 3, date: qua, type: 'expense' })).toEqual({ tag: 'EM 3 DIAS', due: true })
    expect(tagRecorrente({ daysLeft: 5, date: qua, type: 'expense' })).toEqual({ tag: 'EM 5 DIAS', due: false })
    expect(tagRecorrente({ daysLeft: 0, date: qua, type: 'expense' })).toEqual({ tag: 'HOJE', due: true })
  })
  it('aporte mostra o dia da semana, depois a data', () => {
    expect(tagRecorrente({ daysLeft: 5, date: qua, type: 'transfer' })).toEqual({ tag: 'QUA', due: false })
    expect(tagRecorrente({ daysLeft: 12, date: new Date(2026, 9, 15), type: 'income' })).toEqual({ tag: '15 OUT', due: false })
  })
})

describe('proximaAcao', () => {
  it('maior risco com poupança projetada no ritmo atual', () => {
    const p = proximaAcao({
      orcamentos: [orc('Moradia', 1240, 1800), orc('Lazer', 410, 420)],
      receitas: 5000, despesas: 2500, fracao: 0.8, mesNome: 'outubro',
    })
    expect(textoFala(p)).toBe('Revisar o orçamento de lazer: fecha o mês em 38% poupado.')
  })
  it('sem risco, sem orçamento, sem receita', () => {
    expect(textoFala(proximaAcao({ orcamentos: [orc('Moradia', 100, 1800)], receitas: 5000, despesas: 4900, fracao: 0.5, mesNome: 'outubro' })))
      .toBe('Manter o ritmo: no ritmo atual, o mês fecha sem poupar.')
    expect(textoFala(proximaAcao({ orcamentos: [], receitas: 0, despesas: 0, fracao: 0.5, mesNome: 'outubro' })))
      .toBe('Criar os orçamentos de outubro: sem eles não dá para ver onde aperta.')
    expect(textoFala(proximaAcao({ orcamentos: [orc('Lazer', 400, 420)], receitas: 0, despesas: 400, fracao: 0.5, mesNome: 'outubro' })))
      .toBe('Revisar o orçamento de lazer: o mês ainda não tem receita registrada.')
  })
})

describe('fontesFinancas e deltaPct', () => {
  it('fontes no formato do protótipo', () => {
    expect(fontesFinancas({ orcamentos: 3, transacoes: 34, metas: 3 })).toBe('3 orçamentos, 34 transações, 3 metas')
    expect(fontesFinancas({ orcamentos: 0, transacoes: 1, metas: 0 })).toBe('1 transação')
    expect(fontesFinancas({ orcamentos: 0, transacoes: 0, metas: 0 })).toBe('nenhum registro ainda')
  })
  it('delta sem base é null', () => {
    expect(deltaPct(5400, 5000)).toBe(8)
    expect(deltaPct(100, 0)).toBeNull()
    expect(deltaPct(-50, -100)).toBe(50)
  })
})
