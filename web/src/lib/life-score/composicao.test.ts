import { describe, it, expect } from 'vitest'
import type { ModuleScoreDetail } from '@/lib/score-utils'
import {
  compor, comoMelhorar, deltaSemana, maisPesou, pesosEfetivos, serieComHoje,
  indiceMaisFraco, sinal, fmt1, semanaIso, type RegistroScore,
} from './composicao'

// o caso do protótipo life-score-v2: 4 áreas ativas
const MODS: ModuleScoreDetail[] = [
  { module: 'financas', score: 83, weight: 0.2, components: {}, detalhes: [
    { chave: 'budgetScore', nome: 'Orçamento do mês', peso: 0.4, valor: 90 },
    { chave: 'registrationScore', nome: 'Registro de transações', peso: 0.3, valor: 75 },
    { chave: 'trendScore', nome: 'Tendência de saldo', peso: 0.3, valor: 80 },
  ] },
  { module: 'futuro', score: 79, weight: 0.2, components: {}, detalhes: [
    { chave: 'progressScore', nome: 'Progresso dos objetivos', peso: 0.5, valor: 88 },
    { chave: 'completedScore', nome: 'Objetivos concluídos no trimestre', peso: 0.5, valor: 70 },
  ] },
  { module: 'corpo', score: 69, weight: 0.15, components: {}, detalhes: [
    { chave: 'activityScore', nome: 'Atividades da semana', peso: 0.3, valor: 75 },
    { chave: 'appointmentScore', nome: 'Consulta agendada', peso: 0.3, valor: 80 },
    { chave: 'weightScore', nome: 'Registros de peso', peso: 0.2, valor: 50 },
    { chave: 'hydrationScore', nome: 'Hidratação', peso: 0.2, valor: 60 },
  ] },
  { module: 'experiencias', score: 78, weight: 0.05, components: {}, detalhes: [
    { chave: 'tripScore', nome: 'Viagens planejadas e feitas', peso: 0.6, valor: 90 },
    { chave: 'bucketScore', nome: 'Bucket list', peso: 0.4, valor: 60 },
  ] },
]

const reg = (d: number, score: number, extra: Partial<RegistroScore> = {}): RegistroScore =>
  ({ score, recorded_date: `2026-10-${String(d).padStart(2, '0')}`, ...extra })

describe('pesosEfetivos', () => {
  it('redistribui os pesos do motor entre as ativas', () => {
    const p = pesosEfetivos(['financas', 'futuro', 'corpo', 'experiencias'])
    expect(p.financas).toBeCloseTo(1 / 3, 10)
    expect(p.corpo).toBeCloseTo(0.25, 10)
    expect(p.experiencias).toBeCloseTo(1 / 12, 10)
    expect(Object.values(p).reduce((s, v) => s + (v ?? 0), 0)).toBeCloseTo(1, 10)
  })
  it('com as 8 ativas, vale o peso do motor', () => {
    const p = pesosEfetivos(['financas', 'futuro', 'tempo', 'corpo', 'mente', 'patrimonio', 'carreira', 'experiencias'])
    expect(p.financas).toBeCloseTo(0.2, 10)
    expect(p.experiencias).toBeCloseTo(0.05, 10)
  })
})

describe('compor', () => {
  it('contribuições do protótipo (27,7 · 26,3 · 17,3 · 6,5 = 77,8) e inativas na linha quieta', () => {
    const c = compor(MODS, [])
    expect(c.ativas.map((a) => fmt1(a.contrib))).toEqual(['27,7', '26,3', '17,3', '6,5'])
    expect(fmt1(c.somaParcelas)).toBe('77,8')
    expect(c.inativas.map((a) => a.n)).toEqual(['03', '05', '06', '07'])
    expect(c.ativas.every((a) => a.delta === null)).toBe(true)
  })
})

describe('deltaSemana e maisPesou', () => {
  const serie = [
    reg(7, 78, { financas_score: 83, futuro_score: 79, corpo_score: 69, experiencias_score: 78 }),
    reg(6, 77), reg(5, 77), reg(4, 76), reg(3, 76), reg(2, 75),
    reg(1, 75, { financas_score: 81, futuro_score: 78, corpo_score: 72, experiencias_score: 78 }),
  ]
  it('delta do total e por área usam o 7º registro', () => {
    expect(deltaSemana(serie, null)).toBe(3)
    expect(deltaSemana(serie, 'corpo')).toBe(-3)
    expect(deltaSemana(serie, 'mente')).toBeNull()
    expect(deltaSemana(serie.slice(0, 6), null)).toBeNull()
  })
  it('a área de maior |delta| é a que mais pesou (queda conta)', () => {
    const a = maisPesou(compor(MODS, serie))
    expect(a?.key).toBe('corpo')
    expect(a?.delta).toBe(-3)
  })
  it('sem histórico, nenhuma área pesou', () => {
    expect(maisPesou(compor(MODS, []))).toBeNull()
  })
})

describe('serieComHoje', () => {
  it('substitui o registro do mesmo dia e põe hoje no topo', () => {
    const s = serieComHoje([reg(3, 70), reg(2, 69)], reg(3, 72))
    expect(s.map((r) => r.score)).toEqual([72, 69])
    expect(serieComHoje([reg(2, 69)], reg(3, 72)).map((r) => r.score)).toEqual([72, 69])
  })
})

describe('comoMelhorar', () => {
  it('3 componentes mais fracos com ganho = (100 − valor) × peso interno × peso efetivo', () => {
    const m = comoMelhorar(MODS)
    expect(m.map((x) => x.chave)).toEqual(['weightScore', 'hydrationScore', 'bucketScore'])
    expect(m[0].ganho).toBeCloseTo(2.5, 10)   // (100−50) × .2 × .25
    expect(m[1].ganho).toBeCloseTo(2, 10)     // (100−60) × .2 × .25
    expect(m[0].area.n).toBe('04')
    expect(m[0].sub).toBe('Registros de peso vale 20% do score de Corpo e está em 50.')
  })
  it('componente já em 100 não entra', () => {
    const m = comoMelhorar([{ module: 'tempo', score: 100, weight: 0.1, components: {}, detalhes: [
      { chave: 'completionScore', nome: 'Compromissos concluídos', peso: 0.5, valor: 100 },
      { chave: 'consistencyScore', nome: 'Constância da agenda', peso: 0.5, valor: 100 },
    ] }])
    expect(m).toEqual([])
  })
})

describe('helpers', () => {
  it('mais fraco, sinal com en-dash, semana ISO', () => {
    expect(indiceMaisFraco(MODS[2])).toBe(2)
    expect(sinal(3)).toBe('+3')
    expect(sinal(-2)).toBe('–2')
    expect(sinal(1.5)).toBe('+1,5')
    expect(semanaIso('2026-10-03')).toBe(40)
    expect(semanaIso('2026-10-05')).toBe(41)
  })
})
