import { describe, it, expect } from 'vitest'
import {
  semanaSP, rotuloSemana, brl0, horasMin, financasSemana, compromissosSemana, focoSemana,
  scoreSemana, oQueMudou, tituloSemana, payloadFechamento, semanaIsoNum, diaCurto,
  type RegistroSemana,
} from './semana'

describe('semanaSP', () => {
  it('segunda a domingo no fuso de SP (segunda 5 out 2026, 20h)', () => {
    const s = semanaSP(new Date('2026-10-05T23:10:00Z')) // segunda 5 out, 20:10 em SP
    expect(s.hoje).toBe('2026-10-05')
    expect(s.inicio).toBe('2026-10-05')
    expect(s.fim).toBe('2026-10-11')
  })
  it('domingo pertence à semana que começou na segunda anterior', () => {
    const s = semanaSP(new Date('2026-10-04T23:30:00Z')) // domingo 4 out, 20:30 em SP
    expect(s.hoje).toBe('2026-10-04')
    expect(s.inicio).toBe('2026-09-28')
    expect(s.fim).toBe('2026-10-04')
    expect(s.diasDeDados).toBe(7)
    expect(s.semDados).toBe(false)
  })
  it('usa a data de SP, não a UTC (02h UTC de terça ainda é segunda em SP)', () => {
    const s = semanaSP(new Date('2026-10-06T02:00:00Z'))
    expect(s.hoje).toBe('2026-10-05')
    expect(s.diasDeDados).toBe(1)
  })
  it('sem leitura antes de quinta: faltam N dias', () => {
    expect(semanaSP(new Date('2026-09-28T15:00:00Z'))).toMatchObject({ semDados: true, faltam: 3 })   // segunda
    expect(semanaSP(new Date('2026-09-30T15:00:00Z'))).toMatchObject({ semDados: true, faltam: 1 })   // quarta
    expect(semanaSP(new Date('2026-10-01T15:00:00Z'))).toMatchObject({ semDados: false, faltam: 0 })  // quinta
  })
})

describe('formatação', () => {
  it('rótulo da semana, dia curto e semana ISO', () => {
    expect(rotuloSemana('2026-09-29', '2026-10-05')).toBe('29 set a 5 out')
    expect(rotuloSemana('2026-10-05', '2026-10-11')).toBe('5 a 11 out')
    expect(diaCurto('2026-10-03')).toBe('sáb')
    expect(semanaIsoNum('2026-09-28')).toBe(40)
  })
  it('R$ com NBSP, sem centavos; negativo com en-dash', () => {
    expect(brl0(1850)).toBe('R$ 1.850')
    expect(brl0(-320.4)).toBe('– R$ 320')
  })
  it('horas de foco', () => {
    expect(horasMin(390)).toBe('6h30')
    expect(horasMin(60)).toBe('1h')
    expect(horasMin(45)).toBe('45min')
    expect(horasMin(0)).toBe('0h')
  })
})

describe('agregados', () => {
  it('entradas e saídas ignoram transferências e lançamentos futuros', () => {
    expect(financasSemana([
      { amount: 1500, type: 'income' }, { amount: 350, type: 'income' },
      { amount: 940, type: 'expense' }, { amount: 200, type: 'transfer' },
      { amount: 999, type: 'expense', is_future: true },
    ])).toEqual({ entradas: 1850, saidas: 940, n: 3 })
  })
  it('compromissos: feitos/total sem cancelados, pendentes ordenados (máx. 3)', () => {
    const ev = (id: string, date: string, status: string, start_time?: string) => ({ id, title: id, date, status, start_time })
    const r = compromissosSemana([
      ev('a', '2026-09-29', 'concluido'), ev('b', '2026-09-30', 'pendente', '14:00'),
      ev('c', '2026-09-30', 'pendente', '09:00'), ev('d', '2026-10-01', 'cancelado'),
      ev('e', '2026-10-02', 'pendente'), ev('f', '2026-10-03', 'pendente'),
      ev('g', '2026-10-06', 'concluido'),
    ], '2026-09-28', '2026-10-04')
    expect(r.feitos).toBe(1)
    expect(r.total).toBe(5)
    expect(r.pendentes.map((p) => p.id)).toEqual(['c', 'b', 'e'])
  })
  it('foco só conta sessões da semana', () => {
    expect(focoSemana([
      { date: '2026-09-27', duration_minutes: 100 },
      { date: '2026-09-28', duration_minutes: 240 },
      { date: '2026-10-02', duration_minutes: 150 },
    ], '2026-09-28', '2026-10-04')).toEqual({ minutos: 390, sessoes: 2 })
  })
})

const reg = (d: string, score: number, extra: Partial<RegistroSemana> = {}): RegistroSemana =>
  ({ score, recorded_date: d, ...extra })

const SERIE: RegistroSemana[] = [
  reg('2026-10-04', 78.2, { financas_score: 83, futuro_score: 79, corpo_score: 69, experiencias_score: 78, mente_score: null }),
  reg('2026-10-03', 77), reg('2026-10-02', 77), reg('2026-10-01', 76), reg('2026-09-30', 76), reg('2026-09-29', 75),
  reg('2026-09-28', 74.8, { financas_score: 80, futuro_score: 75, corpo_score: 70, experiencias_score: 74 }),
]

describe('score da semana e o que mudou', () => {
  it('início = 7º registro, fim = mais recente', () => {
    expect(scoreSemana(SERIE)).toEqual({ inicio: 75, fim: 78, delta: 3 })
    expect(scoreSemana(SERIE.slice(0, 3))).toEqual({ inicio: null, fim: 78, delta: null })
    expect(scoreSemana([])).toEqual({ inicio: null, fim: null, delta: null })
  })
  it('só áreas ativas com os dois registros, na ordem das áreas', () => {
    const m = oQueMudou(SERIE, ['financas', 'futuro', 'corpo', 'experiencias', 'mente'])
    expect(m.map((x) => `${x.n} ${x.de}→${x.para}`)).toEqual(['01 80→83', '02 75→79', '04 70→69', '08 74→78'])
  })
  it('inativa não entra, mesmo com score na série', () => {
    expect(oQueMudou(SERIE, ['financas']).map((x) => x.key)).toEqual(['financas'])
  })
  it('semana que caiu ordena da maior queda para a menor', () => {
    const caiu = [{ ...SERIE[0], score: 70 }, ...SERIE.slice(1)]
    expect(oQueMudou(caiu, ['financas', 'futuro', 'corpo', 'experiencias']).map((x) => x.key)[0]).toBe('corpo')
  })
  it('sem 7 registros, nada mudou ainda', () => {
    expect(oQueMudou(SERIE.slice(0, 6), ['financas'])).toEqual([])
  })
  it('título', () => {
    expect(tituloSemana(true, 3)).toBe('A semana ainda está em curso')
    expect(tituloSemana(false, -2)).toBe('A semana recuou')
    expect(tituloSemana(false, null)).toBe('A semana em números')
  })
})

describe('payloadFechamento', () => {
  it('monta a linha de weekly_reviews da migration 029', () => {
    expect(payloadFechamento({
      userId: 'u1', semana: { inicio: '2026-09-28', fim: '2026-10-04' }, agoraIso: '2026-10-04T23:30:00.000Z',
      scoreInicio: 75, scoreFim: 78, entradas: 1850, saidas: 940, feitos: 11, total: 14, focoMin: 390,
    })).toEqual({
      user_id: 'u1', week_start: '2026-09-28', week_end: '2026-10-04', completed_at: '2026-10-04T23:30:00.000Z',
      score_inicio: 75, score_fim: 78, score_gained: 50,
      data: { entradas: 1850, saidas: 940, feitos: 11, total: 14, focoMin: 390 },
    })
  })
})
