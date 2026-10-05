import { describe, it, expect } from 'vitest'
import {
  projetar, analisar, mediaVariavel, candidatoLab, datasLab, efeitosLab, somarMeses, idxMes, nomeMes,
  recorrentesDoMes, fracaoRestante, curvaSaldo, rotuloEixo, hojeSP,
  falaPlanejamento, textoDe, reais, reais2, dataLonga, nomeMesDe,
  type EntradaProjecao, type EventoPlan, type RecorrentePlan,
} from './planejamento'

const HOJE = '2026-10-03'

const ev = (id: string, tipo: 'in' | 'out', valor: number, data: string, nome = id): EventoPlan => ({
  id, nome, tipo, valor, data, confirmado: false, categoria: null, nota: null,
})
const rec = (
  nome: string, tipo: RecorrentePlan['tipo'], valor: number, frequencia: RecorrentePlan['frequencia'],
  extra: Partial<RecorrentePlan> = {},
): RecorrentePlan => ({ nome, tipo, valor, frequencia, inicio: '2026-01-01', fim: null, ...extra })

function base(extra: Partial<EntradaProjecao> = {}): EntradaProjecao {
  return { hoje: HOJE, saldoHoje: 1000, recorrentes: [], rendaVariavel: 0, gastoVariavel: 0, eventos: [], ...extra }
}

describe('datas', () => {
  it('idxMes e nomeMes contam a partir do mês de hoje', () => {
    expect(idxMes('2026-10-24', HOJE)).toBe(0)
    expect(idxMes('2027-03-15', HOJE)).toBe(5)
    expect(nomeMes(HOJE, 0)).toBe('outubro de 2026')
    expect(nomeMes(HOJE, 3)).toBe('janeiro')
    expect(nomeMes(HOJE, 12)).toBe('outubro de 2027')
    expect(nomeMes(HOJE, 5)).toBe('março')
    expect(nomeMes(HOJE, 5, true)).toBe('março de 2027')
    expect(rotuloEixo(HOJE, 0)).toBe('out 26')
    expect(rotuloEixo(HOJE, 1)).toBe('nov')
    expect(rotuloEixo(HOJE, 3)).toBe('jan 27')
  })
  it('somarMeses mantém o dia ou cai no último dia do mês', () => {
    expect(somarMeses('2027-03-15', -3)).toBe('2026-12-15')
    expect(somarMeses('2026-11-30', 3)).toBe('2027-02-28')
  })
  it('hojeSP devolve a data do fuso de São Paulo', () => {
    expect(hojeSP(new Date('2026-10-04T02:00:00Z'))).toBe('2026-10-03')
  })
})

describe('mediaVariavel', () => {
  it('média dos meses cheios, só lançamentos não recorrentes e sem transferência', () => {
    const nr = null
    const txs = [
      { amount: 600, type: 'income' as const, date: '2026-07-10', recurring_transaction_id: nr },
      { amount: 600, type: 'income' as const, date: '2026-08-10', recurring_transaction_id: nr },
      { amount: 600, type: 'income' as const, date: '2026-09-10', recurring_transaction_id: nr },
      { amount: 900, type: 'expense' as const, date: '2026-07-11', recurring_transaction_id: nr },
      { amount: 860, type: 'expense' as const, date: '2026-08-11', recurring_transaction_id: nr },
      { amount: 880, type: 'expense' as const, date: '2026-09-11', recurring_transaction_id: nr },
      { amount: 3000, type: 'expense' as const, date: '2026-09-05', recurring_transaction_id: 'r1' },
      { amount: 500, type: 'transfer' as const, date: '2026-09-06', recurring_transaction_id: nr },
      { amount: 99, type: 'expense' as const, date: '2026-10-01', recurring_transaction_id: nr },
      { amount: 99, type: 'expense' as const, date: '2026-06-30', recurring_transaction_id: nr },
    ]
    const m = mediaVariavel(txs, HOJE)
    expect(m.renda).toBeCloseTo(600)
    expect(m.gasto).toBeCloseTo(880)
    expect(m.meses).toBe(3)
  })
  it('sem histórico dá zero, sem dividir por zero', () => {
    expect(mediaVariavel([], HOJE)).toEqual({ renda: 0, gasto: 0, meses: 0 })
  })
})

describe('recorrentes normalizadas por mês', () => {
  it('semanal ×4,33, quinzenal ×2,17, trimestral ÷3, anual ÷12; transferência fica de fora', () => {
    const r = [
      rec('a', 'expense', 100, 'weekly'),
      rec('b', 'expense', 100, 'biweekly'),
      rec('c', 'expense', 300, 'quarterly'),
      rec('d', 'expense', 1200, 'annual'),
      rec('e', 'income', 1000, 'monthly'),
      rec('t', 'transfer', 999, 'monthly'),
    ]
    const [ent, sai] = recorrentesDoMes(r, HOJE, 1)
    expect(ent).toBe(1000)
    expect(sai).toBeCloseTo(433 + 217 + 100 + 100)
  })
  it('respeita início e fim', () => {
    const r = [
      rec('futura', 'expense', 100, 'monthly', { inicio: '2027-01-01' }),
      rec('acabou', 'expense', 50, 'monthly', { fim: '2026-10-31' }),
    ]
    expect(recorrentesDoMes(r, HOJE, 0)[1]).toBe(50)
    expect(recorrentesDoMes(r, HOJE, 1)[1]).toBe(0)
    expect(recorrentesDoMes(r, HOJE, 3)[1]).toBe(100)
  })
})

describe('projetar', () => {
  it('13 pontos; o mês corrente conta só a fração que falta', () => {
    const e = base({ recorrentes: [rec('luz', 'expense', 310, 'monthly')] })
    const s = projetar(e, 'realista')
    expect(s).toHaveLength(13)
    expect(fracaoRestante(HOJE)).toBeCloseTo(28 / 31)
    expect(s[0]).toBeCloseTo(1000 - 310 * (28 / 31))
    expect(s[1]).toBeCloseTo(s[0] - 310)
  })
  it('inclui renda e gasto variáveis médios', () => {
    const s = projetar(base({ rendaVariavel: 600, gastoVariavel: 880 }), 'realista')
    expect(s[1] - s[0]).toBeCloseTo(600 - 880)
  })
  it('cenários multiplicam recorrentes e variáveis, nunca os eventos', () => {
    const e = base({
      recorrentes: [rec('salário', 'income', 4000, 'monthly'), rec('aluguel', 'expense', 2000, 'monthly')],
      gastoVariavel: 1000,
      eventos: [ev('e1', 'out', 500, '2026-12-10')],
    })
    const p = projetar(e, 'pessimista')
    const r = projetar(e, 'realista')
    const o = projetar(e, 'otimista')
    expect(p[1] - p[0]).toBeCloseTo(4000 * 0.7 - (2000 + 1000) * 1.3)
    expect(r[1] - r[0]).toBeCloseTo(4000 - 3000)
    expect(o[1] - o[0]).toBeCloseTo(4000 * 1.3 - 3000 * 0.7)
    // dezembro (i = 2): o evento pesa 500 nos três cenários
    expect(p[2] - p[1]).toBeCloseTo(4000 * 0.7 - 3000 * 1.3 - 500)
    expect(o[2] - o[1]).toBeCloseTo(4000 * 1.3 - 3000 * 0.7 - 500)
  })
  it('evento no passado ou depois dos 13 meses não entra', () => {
    const s = projetar(base({ eventos: [ev('a', 'out', 100, '2026-10-02'), ev('b', 'out', 100, '2027-11-01')] }), 'realista')
    expect(s.every(v => v === 1000)).toBe(true)
  })
})

describe('analisar', () => {
  it('mês crítico: queda maior que 30% vinda de saldo positivo, com a maior saída como motivo', () => {
    const e = base({
      eventos: [
        ev('i', 'out', 300, '2027-01-05', 'IPVA'),
        ev('v', 'out', 3000, '2027-01-20', 'Gastos na Itália'),
        ev('s', 'in', 5000, '2026-11-05'),
      ],
    })
    const s = projetar(e, 'realista')
    const a = analisar(s, e)
    expect(a.critico?.i).toBe(3)
    expect(a.critico?.motivo).toBe('Gastos na Itália')
    expect(a.critico?.de).toBeCloseTo(s[2])
    expect(a.critico?.para).toBeCloseTo(s[3])
  })
  it('sem queda grande não há mês crítico; ponto mais baixo e extremos', () => {
    const a = analisar([1000, 900, 800, 850, 900, 950, 1000, 1000, 1000, 1000, 1000, 1000, 1100], base())
    expect(a.critico).toBeNull()
    expect(a.min).toBe(800)
    expect(a.iMin).toBe(2)
    expect(a.max).toBe(1100)
    expect(a.s6).toBe(1000)
    expect(a.s12).toBe(1100)
    expect(a.negDesde).toBe(-1)
  })
  it('saldo que parte de negativo nunca é crítico e marca desde quando fica negativo', () => {
    const a = analisar([-10, -500, -900, -900, -900, -900, -900, -900, -900, -900, -900, -900, -900], base())
    expect(a.critico).toBeNull()
    expect(a.negDesde).toBe(0)
  })
  it('sem evento, a maior recorrente de saída explica o mês', () => {
    const e = base({ recorrentes: [rec('aluguel', 'expense', 2000, 'monthly'), rec('luz', 'expense', 100, 'monthly')] })
    const a = analisar([5000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50, 10], e)
    expect(a.critico?.motivo).toBe('aluguel')
  })
})

describe('laboratório', () => {
  const eventos = [
    ev('a', 'out', 4500, '2027-03-15', 'Troca do notebook'),
    ev('b', 'out', 800, '2026-12-01'),
    ev('c', 'in', 9000, '2027-02-01'),
  ]

  it('candidato é o maior evento de despesa dos próximos 12 meses', () => {
    expect(candidatoLab(eventos, HOJE)?.id).toBe('a')
  })
  it('sem despesa de valor alto, ou fora da janela, não há laboratório', () => {
    expect(candidatoLab([], HOJE)).toBeNull()
    expect(candidatoLab([ev('x', 'out', 120, '2026-11-01')], HOJE)).toBeNull()
    expect(candidatoLab([ev('x', 'out', 9000, '2028-01-01')], HOJE)).toBeNull()
    expect(candidatoLab([ev('x', 'in', 9000, '2026-11-01')], HOJE)).toBeNull()
  })
  it('datas: antecipar 3 meses, manter, adiar 3 meses; antecipar não passa de hoje', () => {
    const d = datasLab(eventos[0], HOJE)
    expect(d).toEqual({ antecipar: '2026-12-15', manter: '2027-03-15', adiar: '2027-06-15' })
    const perto = datasLab(ev('p', 'out', 900, '2026-11-20'), HOJE)
    expect(perto.antecipar).toBe(HOJE)
    expect(datasLab(ev('q', 'out', 900, HOJE), HOJE).antecipar).toBeNull()
  })
  it('os efeitos saem da projeção real, não de números do protótipo', () => {
    const e = base({
      saldoHoje: 6000,
      recorrentes: [rec('salário', 'income', 4000, 'monthly'), rec('custos', 'expense', 3800, 'monthly')],
      eventos,
    })
    const d = datasLab(eventos[0], HOJE)
    const meta = { nome: 'Itália', data: '2027-01-20' }
    const manter = efeitosLab(e, eventos[0], d.manter as string, meta)
    const antes = efeitosLab(e, eventos[0], d.antecipar as string, meta)
    const depois = efeitosLab(e, eventos[0], d.adiar as string, meta)
    // antecipar tira dinheiro mais cedo: o saldo em janeiro cai exatamente 4500
    expect((manter.viagem?.saldo ?? 0) - (antes.viagem?.saldo ?? 0)).toBeCloseTo(4500)
    // adiar não mexe em janeiro
    expect(depois.viagem?.saldo).toBeCloseTo(manter.viagem?.saldo ?? 0)
    expect(manter.viagem?.i).toBe(3)
    expect(antes.deslocamento).toBe(-3)
    expect(depois.deslocamento).toBe(3)
    expect(manter.chega).toBe('2027-03-15')
    expect(manter.serie).toEqual(projetar(e, 'realista'))
    // sem meta de viagem não há efeito de viagem
    expect(efeitosLab(e, eventos[0], d.manter as string, null).viagem).toBeNull()
  })
  it('adiar para além dos 13 meses tira o item da projeção', () => {
    const e = base({ eventos: [ev('z', 'out', 2000, '2027-09-10')] })
    const r = efeitosLab(e, e.eventos[0], '2027-12-10', null)
    expect(r.foraDaJanela).toBe(true)
    expect(r.serie.every(v => v === 1000)).toBe(true)
  })
})

describe('curvaSaldo', () => {
  it('14 vértices e a linha do zero dentro do viewBox', () => {
    const g = curvaSaldo(projetar(base({ gastoVariavel: 200 }), 'realista'), 1000)
    expect(g.d.split('L')).toHaveLength(14)
    expect(g.y0).toBeGreaterThan(0)
    expect(g.y0).toBeLessThan(240)
    expect(g.area.endsWith('Z')).toBe(true)
  })
  it('série reta não quebra a escala', () => {
    const g = curvaSaldo(new Array(13).fill(0), 0)
    expect(Number.isFinite(g.y0)).toBe(true)
  })
})

describe('texto', () => {
  const e = base({
    eventos: [ev('v', 'out', 3000, '2027-01-20', 'Gastos na Itália'), ev('s', 'in', 5000, '2026-11-05')],
  })
  const s = projetar(e, 'realista')
  const a = analisar(s, e)
  it('a fala de Sy cita o mês crítico e o motivo, sem travessão', () => {
    const t = falaPlanejamento(a, HOJE).map(p => p.t).join('')
    expect(t).toContain('Janeiro é o mês que aperta')
    expect(t).toContain('Gastos na Itália leva o saldo de')
    expect(t).not.toContain('—')
  })
  it('sem mês crítico a fala diz isso e dá o ponto mais baixo', () => {
    const sem = analisar([1000, 900, 800, 850, 900, 950, 1000, 1000, 1000, 1000, 1000, 1000, 1100], base())
    const t = falaPlanejamento(sem, HOJE).map(p => p.t).join('')
    expect(t).toContain('Nenhum mês crítico neste cenário')
    expect(textoDe(sem, HOJE).map(p => p.t).join('')).toContain('nenhum mês crítico neste cenário')
  })
  it('saldo negativo vira coral e diz desde quando', () => {
    const neg = analisar([500, -100, -400, -400, -400, -400, -400, -400, -400, -400, -400, -400, -400], base())
    const f = falaPlanejamento(neg, HOJE)
    expect(f.some(p => p.w)).toBe(true)
    expect(f.map(p => p.t).join('')).toContain('fica negativo já em novembro de 2026')
  })
  it('formatação de moeda e datas', () => {
    expect(reais(1840)).toBe('R$ 1.840')
    expect(reais(-320)).toBe('– R$ 320')
    expect(reais2(1840)).toBe('R$ 1.840,00')
    expect(dataLonga('2027-03-15')).toBe('15 de março')
    expect(nomeMesDe('2027-03-15', true)).toBe('março de 2027')
  })
})
