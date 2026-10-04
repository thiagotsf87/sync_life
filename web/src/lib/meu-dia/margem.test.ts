import { describe, it, expect } from 'vitest'
import { janelaLivre, minutosLivres, hhmmToMin, fmtMinutos } from './margem'

const h = (hh: number, mm = 0) => hh * 60 + mm
const OFF8 = ['off', 'off', 'off', 'off', 'off', 'off', 'off', 'off']

describe('janelaLivre', () => {
  it('sem eventos: toda a faixa 14h a 22h fica livre', () => {
    const r = janelaLivre([], h(14))
    expect(r.livreMin).toBe(480)
    expect(r.inicio).toBe('14:00')
    expect(r.fim).toBe('22:00')
    expect(r.segmentos8).toEqual(['on', 'on', 'on', 'on', 'on', 'on', 'on', 'on'])
  })

  it('evento 15:00-16:30 e evento 20:00 sem fim: janela 16:30 a 20:00, 210 min', () => {
    const r = janelaLivre(
      [
        { start_time: '15:00', end_time: '16:30' },
        { start_time: '20:00', end_time: null },
      ],
      h(14),
    )
    expect(r.livreMin).toBe(210)
    expect(r.inicio).toBe('16:30')
    expect(r.fim).toBe('20:00')
    // fatias com >= 30 min livres em 16:30-20:00: 16-17 (30), 17-18, 18-19, 19-20
    expect(r.segmentos8).toEqual(['off', 'off', 'on', 'on', 'on', 'on', 'off', 'off'])
  })

  it('agora depois das 22h: nada livre', () => {
    const r = janelaLivre([], h(22, 30))
    expect(r.livreMin).toBe(0)
    expect(r.inicio).toBeNull()
    expect(r.fim).toBeNull()
    expect(r.segmentos8).toEqual(OFF8)
  })

  it('eventos fora da faixa (manhã e madrugada) não ocupam nada', () => {
    const r = janelaLivre(
      [
        { start_time: '07:30', end_time: '08:30' },
        { start_time: '23:00', end_time: '23:59' },
      ],
      h(14),
    )
    expect(r.livreMin).toBe(480)
    expect(r.inicio).toBe('14:00')
    expect(r.fim).toBe('22:00')
  })

  it('all_day, cancelados e eventos sem start_time são ignorados', () => {
    const r = janelaLivre(
      [
        { start_time: '15:00', end_time: '21:00', all_day: true },
        { start_time: '15:00', end_time: '21:00', status: 'cancelado' },
        { start_time: null, end_time: null },
      ],
      h(14),
    )
    expect(r.livreMin).toBe(480)
  })

  it('agora depois das 14h encurta a faixa pela esquerda e vence o maior intervalo', () => {
    const r = janelaLivre([{ start_time: '19:00', end_time: '20:00' }], h(16, 30))
    // 16:30-19:00 = 150, 20:00-22:00 = 120
    expect(r.livreMin).toBe(150)
    expect(r.inicio).toBe('16:30')
    expect(r.fim).toBe('19:00')
    // igual ao protótipo: janela 16:30-19:00 acende 16h, 17h e 18h
    expect(r.segmentos8).toEqual(['off', 'off', 'on', 'on', 'on', 'off', 'off', 'off'])
  })

  it('antes das 14h a faixa começa em 14h (inicioMin), não em agora', () => {
    const r = janelaLivre([], h(9))
    expect(r.livreMin).toBe(480)
    expect(r.inicio).toBe('14:00')
  })

  it('evento que atravessa o fim da faixa é cortado em 22h', () => {
    const r = janelaLivre([{ start_time: '21:30', end_time: '23:30' }], h(14))
    expect(r.livreMin).toBe(450)
    expect(r.inicio).toBe('14:00')
    expect(r.fim).toBe('21:30')
    // 21-22 tem 30 min livres (21:00-21:30), acende
    expect(r.segmentos8).toEqual(['on', 'on', 'on', 'on', 'on', 'on', 'on', 'on'])
  })

  it('eventos sobrepostos são fundidos', () => {
    const r = janelaLivre(
      [
        { start_time: '15:00', end_time: '16:00' },
        { start_time: '15:30', end_time: '17:00' },
      ],
      h(14),
    )
    // 14-15 = 60, 17-22 = 300
    expect(r.livreMin).toBe(300)
    expect(r.inicio).toBe('17:00')
    expect(r.fim).toBe('22:00')
  })

  it('faixa totalmente ocupada: zero, sem janela', () => {
    const r = janelaLivre([{ start_time: '13:00', end_time: '23:00' }], h(14))
    expect(r.livreMin).toBe(0)
    expect(r.inicio).toBeNull()
    expect(r.fim).toBeNull()
    expect(r.segmentos8).toEqual(OFF8)
  })

  it('aceita faixa customizada (inicioMin e fimMin)', () => {
    const r = janelaLivre([{ start_time: '10:00', end_time: '11:00' }], h(8), h(12), h(8))
    expect(r.livreMin).toBe(120)
    expect(r.inicio).toBe('08:00')
    expect(r.fim).toBe('10:00')
    // segmentos8 continua ancorado em 14h a 22h
    expect(r.segmentos8).toEqual(OFF8)
  })
})

describe('minutosLivres (soma, não maior intervalo)', () => {
  it('soma todos os buracos entre agora e o fim', () => {
    const livre = minutosLivres([{ start_time: '19:00', end_time: '20:00' }], h(16, 30))
    expect(livre).toBe(270)
  })
})

describe('helpers', () => {
  it('hhmmToMin converte e rejeita inválidos', () => {
    expect(hhmmToMin('16:30')).toBe(990)
    expect(hhmmToMin('16:30:00')).toBe(990)
    expect(hhmmToMin('25:00')).toBeNull()
    expect(hhmmToMin(null)).toBeNull()
  })
  it('fmtMinutos', () => {
    expect(fmtMinutos(150)).toBe('2h30')
    expect(fmtMinutos(120)).toBe('2h')
    expect(fmtMinutos(45)).toBe('45min')
  })
})
