import { describe, it, expect } from 'vitest'
import { propostaFallback } from './classificar'
import {
  aplicarEdicao, areasDosRegistros, contarMarcados, editavelDe, efeitosComEstado,
  montarPayloadAplicar, rotuloCriar, rotuloFeito, separarRotulo, tituloDaProposta, valorDoCaminho,
} from './proposta'
import type { Registro } from './schemas'

const HOJE = '2026-10-04'
const ID = '7d3b8a59-2f0e-4a51-9c1e-0b6f7c1a2d34'
const proposta = propostaFallback({}, HOJE)
const agora = proposta.caminhos[0]
const esperar = proposta.caminhos[2]

describe('contagem de registros marcados', () => {
  it('conta só os marcados e o botão acompanha', () => {
    expect(contarMarcados([true, false, true])).toBe(2)
    expect(rotuloCriar(0)).toBe('Marque ao menos um registro')
    expect(rotuloCriar(1)).toBe('Criar 1 registro')
    expect(rotuloCriar(6)).toBe('Criar 6 registros')
  })
})

describe('montarPayloadAplicar', () => {
  it('manda só os marcados, com o caminho escolhido', () => {
    const marc = agora.registros.map((_, i) => i !== 1)
    const r = montarPayloadAplicar(ID, agora, marc, [])
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.body.caminho).toBe('agora')
    expect(r.body.intencaoId).toBe(ID)
    expect(r.body.registros).toHaveLength(agora.registros.length - 1)
  })

  it('aplica o valor editado da recorrente e reescreve o rótulo', () => {
    const iRec = agora.registros.findIndex(r => r.tabela === 'recurring_transactions')
    const valores: (string | undefined)[] = []
    valores[iRec] = '200'
    const r = montarPayloadAplicar(ID, agora, agora.registros.map(() => true), valores)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const rec = r.body.registros.find(x => x.tabela === 'recurring_transactions')
    expect(rec && rec.tabela === 'recurring_transactions' && rec.amount).toBe(200)
    expect(rec?.rotulo).toContain('R$ 200,00')
  })

  it('nenhum marcado não monta payload', () => {
    const r = montarPayloadAplicar(ID, agora, agora.registros.map(() => false), [])
    expect(r.ok).toBe(false)
  })

  it('valor inválido devolve erro nomeando a área', () => {
    const iRec = agora.registros.findIndex(r => r.tabela === 'recurring_transactions')
    const valores: (string | undefined)[] = []
    valores[iRec] = '0'
    const r = montarPayloadAplicar(ID, agora, agora.registros.map(() => true), valores)
    expect(r).toEqual({ ok: false, erro: 'Confira o valor de Finanças.' })
  })

  it('id que não é uuid não passa no schema do servidor', () => {
    const r = montarPayloadAplicar('x', agora, agora.registros.map(() => true), [])
    expect(r.ok).toBe(false)
  })
})

describe('aplicarEdicao', () => {
  const trilha = agora.registros.find(r => r.tabela === 'study_tracks') as Registro
  const evento = agora.registros.find(r => r.tabela === 'agenda_events') as Registro

  it('ano do prazo da trilha', () => {
    const r = aplicarEdicao(trilha, '2028')
    expect(r && r.tabela === 'study_tracks' && r.target_date).toBe('2028-12-31')
    expect(r?.rotulo).toContain('2028')
    expect(aplicarEdicao(trilha, '28')).toBeNull()
  })

  it('horário do evento mantém a duração', () => {
    const r = aplicarEdicao(evento, '19:30')
    expect(r && r.tabela === 'agenda_events' && [r.start_time, r.end_time]).toEqual(['19:30', '20:30'])
    expect(r?.rotulo).toContain('19h30')
    expect(aplicarEdicao(evento, '25:00')).toBeNull()
  })

  it('vazio ou igual mantém', () => {
    expect(aplicarEdicao(trilha, '')).toBe(trilha)
    expect(aplicarEdicao(trilha, editavelDe(trilha)?.valor)).toBe(trilha)
  })
})

describe('efeitos e rótulos', () => {
  it('efeito da área sem registro marcado fica off', () => {
    const marc = agora.registros.map(r => r.tabela !== 'skills')
    const ef = efeitosComEstado(agora, marc)
    expect(ef.find(e => e.area === '07')?.off).toBe(true)
    expect(ef.find(e => e.area === '05')?.off).toBe(false)
  })

  it('áreas na ordem, sem repetir (2 eventos = 1 área)', () => {
    expect(areasDosRegistros(agora.registros)).toEqual(['05', '03', '01', '07', '02'])
    expect(rotuloFeito([{ tabela: 'agenda_events' }, { tabela: 'agenda_events' }, { tabela: 'goals' }])).toBe('3 registros em 2 áreas')
  })

  it('valor do caminho: custo mensal ou mês de início', () => {
    expect(valorDoCaminho(agora, HOJE)).toBe('R$ 180/mês')
    expect(valorDoCaminho(esperar, HOJE)).toBe('janeiro')
  })

  it('título e rótulo', () => {
    expect(tituloDaProposta('Quero começar um curso de inglês')).toBe('Proposta · curso de inglês')
    expect(separarRotulo('Mente · trilha X · Y')).toEqual({ area: 'Mente', resto: 'trilha X · Y' })
  })
})

describe('partesNumericas', () => {
  it('marca moeda (com NBSP), hora e números', async () => {
    const { partesNumericas } = await import('./proposta')
    expect(partesNumericas('Finanças · cai de R$ 1.840,00 para R$ 1.660,00, ter 20:00')).toEqual([
      { t: 'Finanças · cai de ', num: false },
      { t: 'R$ 1.840,00', num: true },
      { t: ' para ', num: false },
      { t: 'R$ 1.660,00', num: true },
      { t: ', ter ', num: false },
      { t: '20:00', num: true },
    ])
    expect(partesNumericas('sem número')).toEqual([{ t: 'sem número', num: false }])
  })
})
