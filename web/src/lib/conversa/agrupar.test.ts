import { describe, it, expect } from 'vitest'
import {
  agruparConversa, contagem, diaSP, filtrarDias, filtrando, horaSP, passaFiltro,
  resumoIntencoes, rotuloDiaLista, rotuloDiaThread, type IntencaoRow, type MensagemRow,
} from './agrupar'

const HOJE = '2026-10-03'

let n = 0
function msg(p: Partial<MensagemRow> & Pick<MensagemRow, 'role' | 'content' | 'created_at'>): MensagemRow {
  return { id: `m${++n}`, module_id: null, fontes: null, kind: 'mensagem', ref_id: null, ...p }
}

const INT: IntencaoRow = {
  id: 'i1', texto: 'Quero começar um curso de inglês', tipo: 'iniciar_curso',
  proposta: { caminhos: [{ id: 'agora', titulo: 'Começar agora, 2 noites', registros: [
    { tabela: 'study_tracks', rotulo: 'Mente · trilha Inglês' },
    { tabela: 'recurring_transactions', rotulo: 'Finanças · recorrente R$ 180,00/mês' },
  ] }] },
  caminho: null, aplicado: [], status: 'em_aberto',
  created_at: '2026-10-02T23:41:00Z', aplicada_em: null, desfeita_em: null,
}

// 3 out 10:12 UTC = 07:12 SP; 2 out 23:40 UTC = 20:40 SP (ainda dia 2 em SP)
const MSGS: MensagemRow[] = [
  msg({ role: 'assistant', kind: 'nota', content: 'Outubro está 4 pontos acima. Resto.', created_at: '2026-10-03T10:12:00Z', fontes: ['3 orçamentos'] }),
  msg({ role: 'user', content: 'Quanto ainda posso gastar em lazer?', created_at: '2026-10-03T17:02:00Z', module_id: 'financas' }),
  msg({ role: 'assistant', content: 'Quase nada: R$ 10 até quinta.', created_at: '2026-10-03T17:02:05Z', module_id: 'financas', fontes: ['orçamento Lazer'] }),
  msg({ role: 'user', content: 'Quero começar um curso de inglês', created_at: '2026-10-02T23:40:59Z' }),
  msg({ role: 'assistant', kind: 'intencao', ref_id: 'i1', content: 'Li suas cinco áreas.', created_at: '2026-10-02T23:41:00Z' }),
  msg({ role: 'assistant', kind: 'acao', ref_id: 'i1', content: 'Feito · 2 registros em 2 áreas', created_at: '2026-10-02T23:50:00Z' }),
]

describe('datas em SP', () => {
  it('dia e hora no fuso de São Paulo', () => {
    expect(diaSP('2026-10-03T02:00:00Z')).toBe('2026-10-02')
    expect(horaSP('2026-10-03T10:12:00Z')).toBe('07:12')
  })
  it('rótulos de dia', () => {
    expect(rotuloDiaLista('2026-10-03', HOJE)).toEqual({ hoje: true, resto: 'sábado, 3 out' })
    expect(rotuloDiaLista('2026-10-02', HOJE)).toEqual({ hoje: false, resto: 'Sexta · 2 out' })
    expect(rotuloDiaThread('2026-09-30', HOJE)).toEqual({ hoje: false, resto: 'Quarta · 30 de setembro' })
  })
})

describe('agruparConversa', () => {
  const dias = agruparConversa(MSGS, [INT], HOJE)

  it('agrupa por dia em SP, mais recente primeiro', () => {
    expect(dias.map(d => d.dia)).toEqual(['2026-10-03', '2026-10-02'])
    expect(dias[0].hoje).toBe(true)
  })

  it('monta nota e pergunta com resposta no mesmo dia', () => {
    const [nota, perg] = dias[0].entradas
    expect(nota.tipo).toBe('nota')
    expect(nota.hora).toBe('07:12')
    expect(perg.tipo).toBe('pergunta')
    expect(perg.bolhas.map(b => b.role)).toEqual(['user', 'assistant'])
    expect(perg.areas).toEqual(['01'])
    expect(dias[0].frase).toBe('Outubro está 4 pontos acima.')
  })

  it('mescla a intenção no dia de created_at, depois da fala que a apresentou', () => {
    const tipos = dias[1].entradas.map(e => e.tipo)
    expect(tipos).toEqual(['pergunta', 'intencao', 'acao'])
    const perg = dias[1].entradas[0]
    expect(perg.bolhas).toHaveLength(2)
    expect(perg.areas).toEqual(['05', '01'])
    expect(dias[1].entradas[1].intencao?.id).toBe('i1')
  })
})

describe('filtros', () => {
  const dias = agruparConversa(MSGS, [INT], HOJE)
  const base = { tipo: 'tudo' as const, area: 'todas' as const, q: '' }

  it('tipo', () => {
    expect(filtrarDias(dias, { ...base, tipo: 'intencao' }).map(d => d.dia.dia)).toEqual(['2026-10-02'])
    expect(filtrarDias(dias, { ...base, tipo: 'acao' })[0].visiveis).toHaveLength(1)
    expect(filtrarDias(dias, { ...base, tipo: 'pergunta' }).flatMap(d => d.visiveis)).toHaveLength(2)
  })

  it('por área', () => {
    const r = filtrarDias(dias, { ...base, area: '01' })
    expect(r.map(d => d.dia.dia)).toEqual(['2026-10-03', '2026-10-02'])
    expect(filtrarDias(dias, { ...base, area: '04' })).toHaveLength(0)
  })

  it('busca local sem acento e com NBSP', () => {
    const r = filtrarDias(dias, { ...base, q: 'INGLES' })
    expect(r).toHaveLength(1)
    expect(passaFiltro(dias[0].entradas[1], { ...base, q: 'r$ 10' })).toBe(true)
    expect(filtrarDias(dias, { ...base, q: 'viagem' })).toHaveLength(0)
  })

  it('contagens', () => {
    expect(filtrando(base)).toBe(false)
    expect(filtrando({ ...base, q: ' x ' })).toBe(true)
    expect(contagem(3, 3, false)).toBe('3 entradas')
    expect(contagem(1, 3, true)).toBe('1 de 3 entradas')
    expect(contagem(1, 1, false)).toBe('1 entrada')
  })

  it('resumo das intenções', () => {
    expect(resumoIntencoes([INT, { ...INT, id: 'i2', status: 'aplicada' }])).toEqual({ aplicada: 1, em_aberto: 1, desfeita: 0 })
  })
})

describe('composicaoDoDia', () => {
  it('conta por tipo, na ordem nota, pergunta, ação, intenção', async () => {
    const { composicaoDoDia } = await import('./agrupar')
    const dias = agruparConversa(MSGS, [INT], HOJE)
    expect(composicaoDoDia(dias[1].entradas)).toEqual([
      { n: 1, t: 'pergunta' }, { n: 1, t: 'ação' }, { n: 1, t: 'intenção' },
    ])
    expect(composicaoDoDia(dias[0].entradas)).toEqual([{ n: 1, t: 'nota' }, { n: 1, t: 'pergunta' }])
  })
})
