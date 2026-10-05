import { describe, it, expect } from 'vitest'
import {
  estadoEnvelope, pctEnvelope, subEnvelope, totaisOrcamento, foraDeEnvelope, diasRestantes,
  parseValor, valorCampo, falaOrcamentos, textoPartes, efeitosTeto, opcoesTeto, copiaLab,
  ordenarEnvelopes, passaFiltro, regra5030, fontesOrcamentos, type EnvelopeCalc, type EntradaLab,
} from './orcamentos'

const N = ' '
const env = (categoria: string, gasto: number, limiteBase: number, alerta = 85, sobra = 0): EnvelopeCalc =>
  ({ categoria, gasto, limiteBase, sobra, alerta })

const MOCK = [
  env('Moradia', 1240, 1800),
  env('Mercado', 520, 650),
  env('Lazer', 410, 420, 80),
  env('Transporte', 310, 400),
  env('Saúde', 180, 250, 85, 50),
  env('Assinaturas', 200, 220, 90),
]

describe('estado do envelope (um só critério: alert_threshold)', () => {
  it('ok, atenção e estourado', () => {
    expect(estadoEnvelope(env('Mercado', 520, 650))).toBe('ok') // 80% < 85%
    expect(estadoEnvelope(env('Lazer', 410, 420, 80))).toBe('atencao') // 98%
    expect(estadoEnvelope(env('Assinaturas', 200, 220, 90))).toBe('atencao') // 91%
    expect(estadoEnvelope(env('Lazer', 470, 420, 80))).toBe('estourado') // 112%
    expect(estadoEnvelope(env('Lazer', 420, 420, 100))).toBe('estourado') // 100% e alerta 100
  })

  it('o limite efetivo inclui a sobra do rollover', () => {
    const saude = env('Saúde', 180, 250, 85, 50)
    expect(pctEnvelope(saude)).toBe(60)
    expect(estadoEnvelope(saude)).toBe('ok')
  })

  it('limite zero com gasto conta como estourado', () => {
    expect(estadoEnvelope(env('X', 10, 0))).toBe('estourado')
    expect(estadoEnvelope(env('X', 0, 0))).toBe('ok')
  })

  it('filtros', () => {
    expect(MOCK.filter(e => passaFiltro(e, 'atencao')).map(e => e.categoria)).toEqual(['Lazer', 'Assinaturas'])
    expect(MOCK.filter(e => passaFiltro(e, 'ok'))).toHaveLength(4)
    expect(MOCK.filter(e => passaFiltro(e, 'todos'))).toHaveLength(6)
  })
})

describe('subEnvelope', () => {
  it('sobram, passou e sem folga', () => {
    expect(subEnvelope(env('Lazer', 410, 420, 80), 28)).toBe(`98% · sobram R$${N}10,00 · 28 dias · alerta em 80%`)
    expect(subEnvelope(env('Lazer', 470, 420, 80), 28)).toBe(`112% · passou R$${N}50,00 · 28 dias · alerta em 80%`)
    expect(subEnvelope(env('Lazer', 420, 420, 100), 1)).toBe('100% · sem folga · 1 dia · alerta em 100%')
  })
  it('mês encerrado não conta dias', () => {
    expect(subEnvelope(env('Moradia', 1240, 1800), 0)).toBe(`69% · sobram R$${N}560,00 · alerta em 85%`)
  })
})

describe('totais e não alocado', () => {
  it('bate com o protótipo', () => {
    const t = totaisOrcamento(MOCK, 5000)
    expect(t.orcado).toBe(3790)
    expect(t.gasto).toBe(2860)
    expect(t.disponivel).toBe(930)
    expect(t.naoAlocado).toBe(1210)
    expect(t.pctGasto).toBe(75)
    expect(t.qtdAtencao).toBe(2)
    expect(t.qtdOk).toBe(4)
  })
  it('orçamento maior que a renda dá não alocado negativo', () => {
    expect(totaisOrcamento([env('A', 0, 5400)], 5000).naoAlocado).toBe(-400)
  })
  it('lista vazia', () => {
    expect(totaisOrcamento([], 0)).toMatchObject({ orcado: 0, gasto: 0, pctGasto: 0, qtd: 0 })
  })
})

describe('ordem e fora de envelope', () => {
  it('ordena pelo limite efetivo, maior primeiro', () => {
    expect(ordenarEnvelopes([...MOCK].reverse()).map(e => e.categoria)).toEqual(
      ['Moradia', 'Mercado', 'Lazer', 'Transporte', 'Saúde', 'Assinaturas'],
    )
  })
  it('só categorias sem envelope e com gasto', () => {
    const gastos = [
      { categoriaId: 'a', nome: 'Investimento', valor: 300 },
      { categoriaId: 'b', nome: 'Moradia', valor: 1240 },
      { categoriaId: 'c', nome: 'Impostos', valor: 0 },
    ]
    expect(foraDeEnvelope(gastos, new Set(['b']))).toEqual([{ categoriaId: 'a', nome: 'Investimento', valor: 300 }])
  })
})

describe('diasRestantes', () => {
  it('mês corrente, futuro e passado', () => {
    expect(diasRestantes(10, 2026, '2026-10-03')).toBe(28)
    expect(diasRestantes(10, 2026, '2026-10-31')).toBe(0)
    expect(diasRestantes(11, 2026, '2026-10-03')).toBe(30)
    expect(diasRestantes(9, 2026, '2026-10-03')).toBe(0)
    expect(diasRestantes(1, 2027, '2026-10-03')).toBe(31)
  })
})

describe('valores digitados', () => {
  it('parseValor e valorCampo', () => {
    expect(parseValor('1.240,50')).toBe(1240.5)
    expect(parseValor('R$ 420')).toBe(420)
    expect(parseValor('abc')).toBe(0)
    expect(parseValor('')).toBe(0)
    expect(valorCampo(1240.5)).toBe('1.240,50')
  })
  it('50-30-20', () => {
    expect(regra5030(5000)).toEqual({ necessidades: 2500, desejos: 1500, poupanca: 1000 })
  })
})

describe('fala de Sy', () => {
  it('dois envelopes pedem atenção', () => {
    expect(textoPartes(falaOrcamentos(MOCK, 28, 'outubro')))
      .toBe(`Lazer e Assinaturas passaram do alerta. Lazer tem R$${N}10 para 28 dias.`)
  })
  it('um envelope', () => {
    expect(textoPartes(falaOrcamentos([env('Lazer', 410, 420, 80), env('Moradia', 100, 1800)], 28, 'outubro')))
      .toBe(`Lazer passou do alerta. Lazer tem R$${N}10 para 28 dias.`)
  })
  it('estourado fala do que passou', () => {
    expect(textoPartes(falaOrcamentos([env('Lazer', 470, 420, 80)], 28, 'outubro')))
      .toBe(`Lazer passou do alerta. Lazer passou R$${N}50 do limite.`)
  })
  it('nenhum acima do alerta e sem envelopes', () => {
    expect(textoPartes(falaOrcamentos([env('Moradia', 100, 1800)], 28, 'outubro')))
      .toBe('Nenhum envelope passou do alerta em outubro. Você usou 6% do orçado.')
    expect(textoPartes(falaOrcamentos([], 28, 'novembro'))).toContain('Ainda não há envelopes em novembro')
  })
  it('fontes', () => {
    expect(fontesOrcamentos({ envelopes: 6, transacoes: 34 }, 'outubro')).toBe('6 orçamentos, 34 transações, receitas de outubro')
    expect(fontesOrcamentos({ envelopes: 0, transacoes: 0 }, 'outubro')).toBe('receitas de outubro')
  })
})

describe('laboratório do teto', () => {
  const base: EntradaLab = {
    tetoAtual: 420, teto: 420, sobra: 0, gasto: 410, alerta: 80, dias: 28,
    receitas: 5000, saldoMes: 1950, fechamentoBase: 2120,
    meta: { nome: 'Viagem Itália', atual: 8600, alvo: 12700, aporteFixo: 580 },
  }

  it('manter o teto não muda nada', () => {
    const x = efeitosTeto(base)
    expect(x.delta).toBe(0)
    expect(x.resto).toBe(10)
    expect(x.pct).toBe(98)
    expect(x.fechamento).toBe(2120)
    expect(x.poupancaPct).toBe(39)
    expect(x.aporteExtra).toBe(1370) // 1950 − 580
  })

  it('cada R$ 1 a mais sai do fechamento, do poupado e do aporte extra', () => {
    const x = efeitosTeto({ ...base, teto: 470 })
    expect(x.delta).toBe(50)
    expect(x.fechamento).toBe(2070)
    expect(x.poupado).toBe(1900)
    expect(x.poupancaPct).toBe(38)
    expect(x.aporteExtra).toBe(1320)
    expect(x.resto).toBe(60)
    expect(x.pct).toBe(87)
    expect(x.acimaDoAlerta).toBe(true) // 87% >= 80%
    expect(efeitosTeto({ ...base, teto: 520 }).acimaDoAlerta).toBe(false) // 79%
  })

  it('aporte extra é limitado ao que falta na meta e nunca negativo', () => {
    const quase = efeitosTeto({ ...base, meta: { nome: 'Viagem', atual: 12500, alvo: 12700, aporteFixo: 100 } })
    expect(quase.aporteExtra).toBe(100) // falta 12700 − 12500 − 100
    expect(efeitosTeto({ ...base, saldoMes: 300 }).aporteExtra).toBe(0)
  })

  it('sem meta o efeito 02 some; sem projeção o 01 de fechamento some', () => {
    const x = efeitosTeto({ ...base, meta: null, fechamentoBase: null })
    expect(x.aporteExtra).toBeNull()
    expect(x.fechamento).toBeNull()
  })

  it('sem receitas não há percentual de poupança', () => {
    expect(efeitosTeto({ ...base, receitas: 0 }).poupancaPct).toBeNull()
  })

  it('o limite efetivo inclui a sobra', () => {
    const x = efeitosTeto({ ...base, sobra: 50 })
    expect(x.resto).toBe(60)
  })

  it('opções e copy', () => {
    expect(opcoesTeto(420)).toEqual([420, 470, 520])
    const c0 = textoPartes(copiaLab(base, efeitosTeto(base), 'Lazer'))
    expect(c0).toContain('Você mantém o teto.')
    expect(c0).toContain(`Lazer fica com R$${N}10 para 28 dias`)
    expect(c0).toContain('para antecipar Viagem Itália')
    const i1 = { ...base, teto: 470 }
    expect(textoPartes(copiaLab(i1, efeitosTeto(i1), 'Lazer'))).toContain('continua acima do alerta de 80% (87%)')
    const i2 = { ...base, teto: 520 }
    expect(textoPartes(copiaLab(i2, efeitosTeto(i2), 'Lazer'))).toContain('volta para baixo do alerta')
    expect(textoPartes(copiaLab({ ...base, meta: null, fechamentoBase: null }, efeitosTeto({ ...base, meta: null, fechamentoBase: null }), 'Lazer')))
      .not.toContain('antecipar')
  })
})
