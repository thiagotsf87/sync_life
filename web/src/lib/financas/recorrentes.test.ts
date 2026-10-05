import { describe, it, expect } from 'vitest'
import {
  normalizarMensal, usaDiaDoMes, diaParaSalvar, addMeses, proxima, ocorrencias, quando, totais, agrupar,
  proximos30, proximaSaida, listaEncerradas, encerrada, dataCurta, diaSemana, brl, brlInt, sinal, lerValor,
  valorParaCampo, emQuanto, type RecItem,
} from './recorrentes'

const N = ' '
const HOJE = '2026-10-03'

const rec = (p: Partial<RecItem> & Pick<RecItem, 'id' | 'nome' | 'valor' | 'freq'>): RecItem => ({
  tipo: 'expense', dia: null, inicio: '2026-01-01', fim: null, pausada: false, categoria: null, nota: null, ...p,
})

const aluguel = rec({ id: 'r2', nome: 'Aluguel', valor: 1200, freq: 'monthly', dia: 6 })
const aporte = rec({ id: 'r3', nome: 'Aporte', valor: 580, freq: 'monthly', dia: 8 })
const salario = rec({ id: 'r1', nome: 'Salário', valor: 4150, freq: 'monthly', dia: 30, tipo: 'income' })
const faxina = rec({ id: 'r7', nome: 'Faxina', valor: 180, freq: 'biweekly', inicio: '2026-09-30' })
const mei = rec({ id: 'r9', nome: 'Contador', valor: 240, freq: 'quarterly', dia: 20, inicio: '2026-07-20' })
const seguro = rec({ id: 'r8', nome: 'Seguro', valor: 1680, freq: 'annual', dia: 10, inicio: '2025-03-10' })
const idiomas = rec({ id: 'r10', nome: 'Idiomas', valor: 39.9, freq: 'monthly', dia: 22, pausada: true })
const todas = [aluguel, aporte, salario, faxina, mei, seguro, idiomas]

describe('normalização mensal', () => {
  it('fatores por frequência', () => {
    expect(normalizarMensal(180, 'biweekly')).toBe(390.6)
    expect(normalizarMensal(240, 'quarterly')).toBe(80)
    expect(normalizarMensal(1680, 'annual')).toBe(140)
    expect(normalizarMensal(100, 'weekly')).toBe(433)
    expect(normalizarMensal(1200, 'monthly')).toBe(1200)
  })
})

describe('dia do mês por frequência', () => {
  it('só mensal, trimestral e anual usam o dia', () => {
    expect(usaDiaDoMes('monthly')).toBe(true)
    expect(usaDiaDoMes('quarterly')).toBe(true)
    expect(usaDiaDoMes('annual')).toBe(true)
    expect(usaDiaDoMes('weekly')).toBe(false)
    expect(usaDiaDoMes('biweekly')).toBe(false)
  })
  it('grava null onde não se aplica e valida 1 a 31', () => {
    expect(diaParaSalvar('weekly', 12)).toBeNull()
    expect(diaParaSalvar('biweekly', 12)).toBeNull()
    expect(diaParaSalvar('monthly', 6)).toBe(6)
    expect(diaParaSalvar('monthly', 0)).toBeNull()
    expect(diaParaSalvar('annual', 32)).toBeNull()
    expect(diaParaSalvar('quarterly', Number.NaN)).toBeNull()
  })
})

describe('datas', () => {
  it('addMeses prende ao último dia do mês', () => {
    expect(addMeses('2026-01-01', 1, 31)).toBe('2026-02-28')
    expect(addMeses('2026-11-01', 3, 31)).toBe('2027-02-28')
    expect(addMeses('2026-10-01', 0, 6)).toBe('2026-10-06')
  })
  it('formatos curtos', () => {
    expect(dataCurta('2026-10-06', HOJE)).toBe('6 out')
    expect(dataCurta('2027-03-10', HOJE)).toBe('10 mar 2027')
    expect(diaSemana('2026-10-06')).toBe('ter')
  })
})

describe('próxima ocorrência', () => {
  it('mensal, quinzenal, trimestral e anual a partir de hoje', () => {
    expect(proxima(aluguel, HOJE)).toBe('2026-10-06')
    expect(proxima(salario, HOJE)).toBe('2026-10-30')
    expect(proxima(faxina, HOJE)).toBe('2026-10-14')
    expect(proxima(mei, HOJE)).toBe('2026-10-20')
    expect(proxima(seguro, HOJE)).toBe('2027-03-10')
  })
  it('hoje conta; dia já passado vai para o mês seguinte', () => {
    expect(proxima({ ...aluguel, dia: 3 }, HOJE)).toBe('2026-10-03')
    expect(proxima({ ...aluguel, dia: 2 }, HOJE)).toBe('2026-11-02')
  })
  it('pausada e fim passado não têm próxima', () => {
    expect(proxima(idiomas, HOJE)).toBeNull()
    expect(proxima({ ...aluguel, fim: '2026-10-05' }, HOJE)).toBeNull()
  })
  it('ocorrências na janela: quinzenal repete', () => {
    expect(ocorrencias(faxina, HOJE)).toEqual(['2026-10-14', '2026-10-28'])
    expect(ocorrencias(seguro, HOJE)).toEqual([])
  })
  it('rótulos de quando', () => {
    expect(quando(aluguel)).toBe('dia 6')
    expect(quando(faxina)).toBe('a cada 14 dias')
    expect(quando(mei)).toBe('dia 20, a cada 3 meses')
    expect(quando(seguro)).toBe('10 de março')
    expect(emQuanto(0)).toBe('hoje')
    expect(emQuanto(1)).toBe('amanhã')
    expect(emQuanto(5)).toBe('em 5 dias')
  })
})

describe('totais e % comprometido', () => {
  it('soma ativas normalizadas e ignora pausadas', () => {
    const t = totais(todas, HOJE, 5000)
    expect(t.saida).toBe(1200 + 580 + 390.6 + 80 + 140)
    expect(t.entrada).toBe(4150)
    expect(t.liquido).toBe(4150 - 2390.6)
    expect(t.anual).toBe(Math.round(2390.6 * 12 * 100) / 100)
    expect(t.nSaidas).toBe(5)
    expect(t.nEntradas).toBe(1)
    expect(t.ativas).toBe(6)
    expect(t.pausadas).toBe(1)
    expect(t.pct).toBe(48)
  })
  it('sem renda no perfil não inventa percentual', () => {
    expect(totais(todas, HOJE, null).pct).toBeNull()
    expect(totais(todas, HOJE, 0).pct).toBeNull()
  })
  it('encerrada sai dos totais', () => {
    const fim = { ...aluguel, fim: '2026-09-30' }
    expect(encerrada(fim, HOJE)).toBe(true)
    const t = totais([fim], HOJE, 5000)
    expect(t.encerradas).toBe(1)
    expect(t.ativas).toBe(0)
    expect(listaEncerradas([fim, aluguel], HOJE)).toEqual([fim])
  })
})

describe('agrupar por frequência', () => {
  it('ordem dos grupos e total por grupo', () => {
    const g = agrupar(todas, HOJE)
    expect(g.map(x => x.freq)).toEqual(['monthly', 'biweekly', 'quarterly', 'annual'])
    expect(g[0].itens.map(i => i.id)).toEqual(['r2', 'r3', 'r10', 'r1'])
    expect(g[0].saida).toBe(1780)
    expect(g[0].entrada).toBe(4150)
    expect(g[1].saida).toBe(390.6)
  })
  it('grupo todo pausado', () => {
    expect(agrupar([idiomas], HOJE)[0].tudoPausado).toBe(true)
  })
})

describe('próximos 30 dias', () => {
  const p = proximos30(todas, HOJE)
  it('em ordem de data, com aviso só em saída a 7 dias ou menos', () => {
    expect(p.itens.map(o => `${o.data}:${o.nome}`)).toEqual([
      '2026-10-06:Aluguel', '2026-10-08:Aporte', '2026-10-14:Faxina',
      '2026-10-20:Contador', '2026-10-28:Faxina', '2026-10-30:Salário',
    ])
    expect(p.itens.filter(o => o.aviso).map(o => o.nome)).toEqual(['Aluguel', 'Aporte'])
    expect(p.ate).toBe('2026-11-02')
  })
  it('totais de saem e entram', () => {
    expect(p.saem).toBe(1200 + 580 + 180 + 240 + 180)
    expect(p.entram).toBe(4150)
  })
  it('entrada nunca leva aviso', () => {
    const s = proximos30([{ ...salario, dia: 5 }], HOJE)
    expect(s.itens[0].aviso).toBe(false)
  })
  it('próxima saída', () => {
    expect(proximaSaida(todas, HOJE)).toEqual({ nome: 'Aluguel', dias: 3 })
    expect(proximaSaida([salario], HOJE)).toBeNull()
  })
})

describe('formatos', () => {
  it('NBSP, en-dash e sinal', () => {
    expect(brl(1200)).toBe(`R$${N}1.200,00`)
    expect(brlInt(2656.4)).toBe(`R$${N}2.656`)
    expect(sinal('expense')).toBe('– ')
    expect(sinal('income')).toBe('+ ')
    expect(valorParaCampo(1200.5)).toBe('1.200,50')
  })
  it('lerValor aceita máscara pt-BR', () => {
    expect(lerValor('1.200,50')).toBe(1200.5)
    expect(lerValor('R$ 89,9')).toBe(89.9)
    expect(lerValor('abc')).toBe(0)
  })
})
