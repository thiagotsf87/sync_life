import { describe, it, expect } from 'vitest'
import {
  saldoAcumuladoPorDia, leituras12, recuos, pathFluxo, prosaFluxo, textoDe,
  type TxFluxo,
} from './fluxo'

const tx = (date: string, amount: number, type: TxFluxo['type'], is_future = false): TxFluxo =>
  ({ date, amount, type, is_future })

describe('saldoAcumuladoPorDia', () => {
  it('acumula receitas menos despesas por dia até hoje, ignorando transferências e futuras', () => {
    const r = saldoAcumuladoPorDia(
      [
        tx('2026-10-01', 100, 'expense'),
        tx('2026-10-02', 1000, 'income'),
        tx('2026-10-02', 500, 'transfer'),
        tx('2026-10-03', 50, 'expense'),
        tx('2026-10-03', 999, 'expense', true),
        tx('2026-10-10', 999, 'income'),
        tx('2026-09-30', 999, 'income'),
      ],
      2026, 10, '2026-10-04',
    )
    expect(r).toEqual([-100, 900, 850, 850])
  })

  it('mês passado vai até o último dia; mês futuro devolve vazio', () => {
    expect(saldoAcumuladoPorDia([], 2026, 9, '2026-10-04')).toHaveLength(30)
    expect(saldoAcumuladoPorDia([], 2026, 11, '2026-10-04')).toEqual([])
  })
})

describe('leituras12', () => {
  it('amostra 12 pontos de uma série longa, primeiro e último preservados, escala 0..100 centrada no zero', () => {
    const serie = Array.from({ length: 31 }, (_, i) => i * 10) // 0..300
    const l = leituras12(serie)
    expect(l).toHaveLength(12)
    expect(l[0]).toBe(50)
    expect(l[11]).toBe(90) // máximo com folga de 25%: 50 + 50 * 300 / 375
    l.forEach(v => { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100) })
  })

  it('série curta não inventa leituras; série zerada fica no meio', () => {
    expect(leituras12([10, 20, 30])).toHaveLength(3)
    expect(leituras12([0, 0])).toEqual([50, 50])
    expect(leituras12([])).toEqual([])
  })

  it('saldo negativo fica abaixo de 50', () => {
    const l = leituras12([-100, 100])
    expect(l[0]).toBe(10)
    expect(l[1]).toBe(90)
  })
})

describe('recuos', () => {
  it('índices das leituras que caíram em relação à anterior', () => {
    expect(recuos([42, 48, 45, 52, 58, 54])).toEqual([2, 5])
    expect(recuos([1, 2, 3])).toEqual([])
  })
})

describe('pathFluxo', () => {
  it('reproduz a geometria do protótipo (y = 170 − 1,5·v, x em 600/11)', () => {
    const p = pathFluxo([42, 48, 45, 52, 58, 54, 61, 66, 63, 71, 74, 78])
    expect(p.linha.startsWith('M0 107 L54.5 98 L109.1 102.5 L163.6 92')).toBe(true)
    expect(p.linha.endsWith('L600 53')).toBe(true)
    expect(p.area).toBe(p.linha + ' L600 170 L0 170 Z')
    expect(p.pontos[2]).toEqual({ x: 109.1, y: 102.5 }) // protótipo arredondou à mão para 109
    expect(p.fim).toEqual({ x: 596, y: 53 })
  })

  it('uma leitura só vira uma linha reta', () => {
    const p = pathFluxo([50])
    expect(p.linha).toBe('M0 95 L600 95')
  })
})

describe('prosaFluxo', () => {
  const l = [42, 48, 45, 52, 58, 54, 61, 66, 63, 71, 74, 78]

  it('desktop: frase do protótipo com os números reais', () => {
    expect(textoDe(prosaFluxo(l, 'desktop'))).toBe(
      'Saldo acumulado do mês em 12 leituras, numa escala de 0 a 100: começou em 42 e chegou a 78. ' +
      'Três recuos pequenos no caminho (3ª, 6ª e 9ª leituras), nenhum maior que 4 pontos, todos recuperados na leitura seguinte.',
    )
  })

  it('mobile: versão curta do protótipo', () => {
    expect(textoDe(prosaFluxo(l, 'mobile'))).toBe(
      'Saldo acumulado do mês em 12 leituras, de 42 a 78 numa escala de 0 a 100. ' +
      'Três recuos pequenos (3ª, 6ª e 9ª leituras), nenhum maior que 4 pontos, todos recuperados na leitura seguinte.',
    )
  })

  it('números em negrito vêm marcados', () => {
    const partes = prosaFluxo(l, 'desktop')
    expect(partes.filter(p => p.b).map(p => p.t)).toEqual(['12', '42', '78', '4'])
  })

  it('sem recuos', () => {
    expect(textoDe(prosaFluxo([40, 50, 60], 'desktop'))).toBe(
      'Saldo acumulado do mês em 3 leituras, numa escala de 0 a 100: começou em 40 e chegou a 60. Nenhum recuo no caminho.',
    )
  })

  it('um recuo grande e não recuperado', () => {
    expect(textoDe(prosaFluxo([60, 70, 50, 55], 'desktop'))).toBe(
      'Saldo acumulado do mês em 4 leituras, numa escala de 0 a 100: começou em 60 e chegou a 55. ' +
      'Um recuo no caminho (3ª leitura), de 20 pontos, ainda não recuperado.',
    )
  })

  it('recuos parcialmente recuperados', () => {
    expect(textoDe(prosaFluxo([50, 48, 52, 40, 41], 'desktop'))).toBe(
      'Saldo acumulado do mês em 5 leituras, numa escala de 0 a 100: começou em 50 e chegou a 41. ' +
      'Dois recuos no caminho (2ª e 4ª leituras), nenhum maior que 12 pontos, 1 recuperado na leitura seguinte.',
    )
  })

  it('uma leitura só', () => {
    expect(textoDe(prosaFluxo([50], 'desktop'))).toBe('Saldo acumulado do mês em 1 leitura até agora: 50 numa escala de 0 a 100.')
  })
})
