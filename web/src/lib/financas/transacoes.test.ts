import { describe, it, expect } from 'vitest'
import {
  agruparPorDia, assinado, ariaLinha, contagemTela, ctTxt, dataCurta, deslocarMes, descricaoTransferencia,
  intervaloMes, linhaDeTransacao, maskValor, ordenacaoServidor, parseValor, rotuloDia, somaLinhas,
  textoPrevistos, totaisDoMes, linhaDeOcorrencia, ocorrenciaPassa, mesclarPrevistos, valorCampo, valorTxt, type TxLinha, type TransacaoDb,
} from './transacoes'

const base: TxLinha = {
  id: 'a', date: '2026-10-03', desc: 'Mercado Central', tipo: 'out', valor: 182.4, categoriaId: 'c1', categoriaNome: 'Mercado',
  metodo: 'pix', obs: '', recorrente: false, previsto: false, contaDeId: null, contaParaId: null, contaDeNome: '', contaParaNome: '',
}
const l = (p: Partial<TxLinha>): TxLinha => ({ ...base, ...p })

describe('formatação', () => {
  it('assinado usa en-dash no negativo e NBSP depois do R$', () => {
    expect(assinado(-182.4)).toBe('– R$ 182,40')
    expect(assinado(850)).toBe('+ R$ 850,00')
  })
  it('valorTxt: transferência sem sinal', () => {
    expect(valorTxt(l({ tipo: 'tr', valor: 300 }))).toBe('R$ 300,00')
    expect(valorTxt(l({ tipo: 'in', valor: 850 }))).toBe('+ R$ 850,00')
    expect(valorTxt(base)).toBe('– R$ 182,40')
  })
  it('ctTxt e aria', () => {
    expect(ctTxt(base)).toBe('Mercado')
    expect(ctTxt(l({ tipo: 'tr', contaDeNome: 'Nubank', contaParaNome: 'Inter' }))).toBe('Nubank → Inter')
    expect(ariaLinha(l({ previsto: true }))).toBe('Editar Mercado Central, – R$ 182,40, previsto')
  })
  it('dataCurta e rotuloDia pelo calendário real', () => {
    expect(dataCurta('2026-10-03')).toBe('3 out')
    expect(rotuloDia('2026-10-03', false)).toBe('Sábado')
    expect(rotuloDia('2026-10-02', true)).toBe('Sexta · 2 out')
  })
  it('descrição de transferência', () => {
    expect(descricaoTransferencia('Nubank', 'Inter')).toBe('Nubank → Inter')
    expect(descricaoTransferencia('', 'Inter')).toBe('Transferência')
  })
})

describe('valor digitado', () => {
  it('parseValor', () => {
    expect(parseValor('1.234,50')).toBe(1234.5)
    expect(parseValor('R$ 12')).toBe(12)
    expect(parseValor('')).toBe(0)
    expect(parseValor('abc')).toBe(0)
    expect(parseValor('-5,5')).toBe(5.5)
  })
  it('maskValor', () => {
    expect(maskValor('1234')).toBe('1.234')
    expect(maskValor('1234,567')).toBe('1.234,56')
    expect(maskValor('0012')).toBe('12')
    expect(maskValor(',5')).toBe('0,5')
    expect(maskValor('')).toBe('')
  })
  it('valorCampo', () => {
    expect(valorCampo(1234.5)).toBe('1.234,50')
  })
})

describe('mês', () => {
  it('deslocarMes vira o ano', () => {
    expect(deslocarMes({ ano: 2026, mes: 1 }, -1)).toEqual({ ano: 2025, mes: 12 })
    expect(deslocarMes({ ano: 2026, mes: 12 }, 1)).toEqual({ ano: 2027, mes: 1 })
    expect(deslocarMes({ ano: 2026, mes: 10 }, -1)).toEqual({ ano: 2026, mes: 9 })
  })
  it('intervaloMes respeita o último dia', () => {
    expect(intervaloMes({ ano: 2026, mes: 2 })).toEqual({ inicio: '2026-02-01', fim: '2026-02-28' })
    expect(intervaloMes({ ano: 2028, mes: 2 }).fim).toBe('2028-02-29')
  })
})

describe('ordenação', () => {
  it('mapeia a ordem para coluna e sentido', () => {
    expect(ordenacaoServidor('recente')).toEqual({ col: 'date', asc: false })
    expect(ordenacaoServidor('antigo')).toEqual({ col: 'date', asc: true })
    expect(ordenacaoServidor('maior')).toEqual({ col: 'amount', asc: false })
    expect(ordenacaoServidor('menor')).toEqual({ col: 'amount', asc: true })
  })
})

describe('agrupamento e totais', () => {
  const ls = [
    l({ id: '1', date: '2026-10-03', valor: 182.4 }),
    l({ id: '2', date: '2026-10-02', tipo: 'in', valor: 850 }),
    l({ id: '3', date: '2026-10-02', tipo: 'tr', valor: 300 }),
    l({ id: '4', date: '2026-10-02', valor: 300 }),
  ]
  it('agrupa por dia mantendo a ordem e soma sem transferência', () => {
    const g = agruparPorDia(ls, false)
    expect(g.map(x => x.date)).toEqual(['2026-10-03', '2026-10-02'])
    expect(g[0].soma).toBe(-182.4)
    expect(g[1].soma).toBe(550)
    expect(g[1].linhas).toHaveLength(3)
  })
  it('dia só com transferência não tem valor', () => {
    expect(somaLinhas([l({ tipo: 'tr' })]).temValor).toBe(false)
  })
  it('totais do mês inteiro ignoram transferência nas somas e contam na quantidade', () => {
    const t = totaisDoMes([
      { type: 'income', amount: '5000' }, { type: 'expense', amount: 3160 },
      { type: 'transfer', amount: 300 },
    ])
    expect(t).toEqual({ entradas: 5000, saidas: 3160, saldo: 1840, quantidade: 3 })
  })
  it('contagem na tela', () => {
    expect(contagemTela(4, 34)).toBe('4 de 34')
    expect(contagemTela(1, null)).toBe('1 exibida')
  })
  it('texto dos previstos', () => {
    expect(textoPrevistos(9, false)).toBe('Ver os 9 previstos')
    expect(textoPrevistos(9, true)).toBe('Mostrar só os próximos 3')
  })
})

describe('linhaDeTransacao', () => {
  const db: TransacaoDb = {
    id: 'x', amount: '300.00', type: 'transfer', description: null, date: '2026-10-02', payment_method: 'xx', notes: null,
    is_future: false, recurring_transaction_id: 'r1', category: null,
    account_from: { id: 'a1', name: 'Nubank' }, account_to: { id: 'a2', name: 'Inter' },
  }
  it('normaliza tipo, método inválido e contas', () => {
    const r = linhaDeTransacao(db)
    expect(r.tipo).toBe('tr')
    expect(r.valor).toBe(300)
    expect(r.metodo).toBe('pix')
    expect(r.recorrente).toBe(true)
    expect(r.desc).toBe('')
    expect(ctTxt(r)).toBe('Nubank → Inter')
  })
})

describe('ocorrências de recorrentes nos previstos', () => {
  const alug = linhaDeOcorrencia({ id: 'rec-1-2026-10-06', data: '2026-10-06', desc: 'Aluguel', cat: 'Moradia', valor: -1200 })
  const sal = linhaDeOcorrencia({ id: 'rec-2-2026-10-10', data: '2026-10-10', desc: 'Salário', cat: 'Renda', valor: 5000 })
  it('vira linha prevista, recorrente e marcada como ocorrência', () => {
    expect(alug).toMatchObject({ tipo: 'out', valor: 1200, previsto: true, recorrente: true, ocorrencia: true })
    expect(sal.tipo).toBe('in')
  })
  it('subtotal do bloco soma entradas e saídas previstas', () => {
    expect(somaLinhas([alug, sal]).soma).toBe(3800)
  })
  it('filtros: tipo, categoria por nome e busca', () => {
    const f = { tipo: 'todas' as const, categoriaNome: '', q: '' }
    expect(ocorrenciaPassa(alug, f)).toBe(true)
    expect(ocorrenciaPassa(alug, { ...f, tipo: 'in' })).toBe(false)
    expect(ocorrenciaPassa(alug, { ...f, tipo: 'tr' })).toBe(false)
    expect(ocorrenciaPassa(alug, { ...f, categoriaNome: 'Lazer' })).toBe(false)
    expect(ocorrenciaPassa(alug, { ...f, q: 'alug' })).toBe(true)
  })
  it('mescla com lançamentos futuros por data', () => {
    const fut = l({ id: 'f', date: '2026-10-08', previsto: true })
    expect(mesclarPrevistos([fut], [sal, alug]).map(x => x.date)).toEqual(['2026-10-06', '2026-10-08', '2026-10-10'])
  })
})
