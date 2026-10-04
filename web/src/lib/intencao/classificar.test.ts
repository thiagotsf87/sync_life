import { describe, it, expect } from 'vitest'
import { classificarIntencao, propostaFallback, proximoDiaSemana } from './classificar'
import { HREF_POR_TABELA, PropostaSchema } from './schemas'

const HOJE = '2026-10-04' // domingo

describe('classificarIntencao', () => {
  it('reconhece curso de idioma', () => {
    expect(classificarIntencao('quero começar um curso de inglês')).toBe('iniciar_curso')
    expect(classificarIntencao('Quero aprender espanhol')).toBe('iniciar_curso')
    expect(classificarIntencao('aulas de francês às terças')).toBe('iniciar_curso')
    expect(classificarIntencao('inglês: achei um curso bom')).toBe('iniciar_curso')
  })

  it('devolve null para o resto', () => {
    expect(classificarIntencao('quanto gastei')).toBeNull()
    expect(classificarIntencao('quero fazer um curso de culinária')).toBeNull()
    expect(classificarIntencao('como está meu orçamento de lazer?')).toBeNull()
  })
})

describe('proximoDiaSemana', () => {
  it('é estritamente depois de hoje', () => {
    expect(proximoDiaSemana(HOJE, 2)).toBe('2026-10-06')
    expect(proximoDiaSemana(HOJE, 4)).toBe('2026-10-08')
    expect(proximoDiaSemana('2026-10-06', 2)).toBe('2026-10-13') // terça → próxima terça
    expect(proximoDiaSemana('2026-12-31', 2)).toBe('2027-01-05') // vira o ano
  })
})

describe('propostaFallback', () => {
  it('passa no PropostaSchema com 3 caminhos; o terceiro tem 4 registros e nenhuma agenda', () => {
    const p = propostaFallback({}, HOJE)
    expect(PropostaSchema.safeParse(p).success).toBe(true)
    expect(p.caminhos.map(c => c.id)).toEqual(['agora', 'menor', 'esperar'])
    expect(p.caminhos[0].registros).toHaveLength(6)
    expect(p.caminhos[1].registros).toHaveLength(5)
    const esperar = p.caminhos[2]
    expect(esperar.registros).toHaveLength(4)
    expect(esperar.registros.some(r => r.tabela === 'agenda_events')).toBe(false)
  })

  it('esperar: a recorrente só começa em janeiro do ano seguinte', () => {
    const p = propostaFallback({}, HOJE)
    const rec = p.caminhos[2].registros.find(r => r.tabela === 'recurring_transactions')
    expect(rec && 'start_date' in rec ? rec.start_date : undefined).toBe('2027-01-04')
    const recAgora = p.caminhos[0].registros.find(r => r.tabela === 'recurring_transactions')
    expect(recAgora && 'start_date' in recAgora ? recAgora.start_date : undefined).toBeUndefined()
  })

  it('esperar: só fala em viagem quando existe meta de viagem', () => {
    expect(propostaFallback({}, HOJE).caminhos[2].titulo).toBe('Começar em janeiro')
    const comViagem = propostaFallback(
      { metas: [{ name: 'Viagem Itália', current_amount: 8600, target_amount: 12700, target_date: '2026-12-31' }] },
      HOJE,
    )
    expect(comViagem.caminhos[2].titulo).toBe('Esperar a Itália passar')
    expect(comViagem.caminhos[2].resumo).toContain('depois da viagem')
  })

  it('calcula datas a partir de hoje e usa o mapa de href', () => {
    const p = propostaFallback({}, HOJE)
    const agora = p.caminhos[0]
    const eventos = agora.registros.filter(r => r.tabela === 'agenda_events')
    expect(eventos.map(e => e.tabela === 'agenda_events' && [e.date, e.start_time, e.end_time])).toEqual([
      ['2026-10-06', '20:00', '21:00'],
      ['2026-10-08', '20:00', '21:00'],
    ])
    for (const c of p.caminhos) {
      for (const r of c.registros) {
        expect(r.href).toBe(HREF_POR_TABELA[r.tabela])
        if (r.tabela === 'study_tracks' || r.tabela === 'goals') expect(r.target_date).toBe('2027-12-31')
        if (r.tabela === 'recurring_transactions') expect(r.day_of_month).toBe(4)
      }
    }
    const custos = p.caminhos.map(c => c.registros.find(r => r.tabela === 'recurring_transactions'))
      .map(r => (r && r.tabela === 'recurring_transactions' ? r.amount : null))
    expect(custos).toEqual([180, 120, 180])
  })

  it('usa os números do ctx quando existem e nunca usa em-dash', () => {
    const p = propostaFallback({
      financas: { income: 5000, expenses: 3160, balance: 1840, savingsRate: 37, txCount: 34, topCategories: [] },
      tempo: { eventosSemana: 5 },
      metas: [{ name: 'Viagem Itália', current_amount: 8600, target_amount: 12700, target_date: null }],
      trilhas: [],
      skills: [],
    }, HOJE)
    const fin = (i: number) => p.caminhos[i].efeitos.find(e => e.area === '01')?.texto
    expect(fin(0)).toBe('Finanças · margem de outubro cai de R$ 1.840,00 para R$ 1.660,00')
    expect(fin(1)).toBe('Finanças · margem de outubro cai de R$ 1.840,00 para R$ 1.720,00')
    expect(fin(2)).toContain('não muda')
    expect(p.caminhos[0].efeitos.find(e => e.area === '03')?.texto).toContain('5 eventos')
    expect(JSON.stringify(p)).not.toContain('—')
  })

  it('sem dado de Finanças não inventa margem', () => {
    const p = propostaFallback({}, HOJE)
    expect(p.caminhos[0].efeitos.find(e => e.area === '01')?.texto).not.toContain('margem')
  })
})
