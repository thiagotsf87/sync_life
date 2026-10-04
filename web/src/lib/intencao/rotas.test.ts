import { describe, it, expect } from 'vitest'
import {
  falaDaProposta, juntarContextos, mensagemDesfeito, mensagemFeito, montarRespostaIntencao,
  normalizarRegistrosParaAplicar, ehIntencaoInvalida, type ModeloProposta,
} from './rotas'
import { HREF_POR_TABELA, PropostaSchema, type Registro } from './schemas'

const HOJE = '2026-10-04'

function caminhoModelo(id: string, extra: ModeloProposta['caminhos'][number]['registros'] = []) {
  return {
    id, titulo: `Caminho ${id}`, resumo: 'Duas noites por semana — terça e quinta.',
    registros: [
      { tabela: 'study_tracks', rotulo: 'Mente · trilha', name: 'Inglês', target_date: '2027-12-31', cost: 180 },
      { tabela: 'skills', rotulo: 'Carreira · Inglês', name: 'Inglês' },
      ...extra,
    ],
    efeitos: [
      { area: '05', texto: 'Mente · primeira trilha' },
      { area: '99', texto: 'área que não existe' },
    ],
  }
}

describe('montarRespostaIntencao', () => {
  it('sem modelo cai no fallback', () => {
    const r = montarRespostaIntencao(null, {}, HOJE)
    expect(r.fallback).toBe(true)
    expect(r.proposta.caminhos).toHaveLength(3)
  })

  it('descarta registros fora da whitelist, sobrescreve href, limpa em-dash e áreas inválidas', () => {
    const modelo: ModeloProposta = {
      caminhos: [
        caminhoModelo('agora', [
          { tabela: 'profiles', rotulo: 'invasão', name: 'x' },
          { tabela: 'recurring_transactions', rotulo: 'Finanças · R$ 180/mês', name: 'Curso', amount: -1, day_of_month: 4 },
          { tabela: 'agenda_events', rotulo: 'Tempo · ter 20h', title: 'Aula', date: '2026-10-06', start_time: '20:00', end_time: '21:00' },
        ]),
        caminhoModelo('menor'),
      ],
    }
    const r = montarRespostaIntencao(modelo, {}, HOJE)
    expect(r.fallback).toBe(false)
    expect(PropostaSchema.safeParse(r.proposta).success).toBe(true)
    const agora = r.proposta.caminhos[0]
    expect(agora.registros.map(x => x.tabela)).toEqual(['study_tracks', 'skills', 'agenda_events'])
    for (const reg of agora.registros) expect(reg.href).toBe(HREF_POR_TABELA[reg.tabela])
    expect(agora.resumo).not.toContain('—')
    expect(agora.efeitos).toEqual([{ area: '05', texto: 'Mente · primeira trilha' }])
  })

  it('se sobrar menos de 2 caminhos válidos, usa o fallback', () => {
    const vazio = { ...caminhoModelo('menor'), registros: [{ tabela: 'profiles', rotulo: 'x' }] }
    const r = montarRespostaIntencao({ caminhos: [caminhoModelo('agora'), vazio] }, {}, HOJE)
    expect(r.fallback).toBe(true)
    expect(r.proposta.caminhos.map(c => c.id)).toEqual(['agora', 'menor', 'esperar'])
  })
})

describe('falaDaProposta', () => {
  it('conta os caminhos', () => {
    const p = montarRespostaIntencao(null, {}, HOJE).proposta
    expect(falaDaProposta(p)).toBe('Li suas cinco áreas. Dá para começar de três jeitos.')
    expect(falaDaProposta({ ...p, caminhos: p.caminhos.slice(0, 2) })).toContain('dois jeitos')
  })
})

describe('juntarContextos', () => {
  it('une os pacotes das áreas e dedupa fontes', () => {
    const r = juntarContextos([
      { ctx: { tempo: { eventosSemana: 3 }, foco: { minutosSemana: 60 } }, fontes: ['agenda da semana', '1h de foco'] },
      { ctx: { financas: { balance: 10 } }, fontes: ['3 transações'] },
      { ctx: { trilhas: [{}], foco: { minutosSemana: 999 } }, fontes: ['1h de foco', '1 trilha de estudo'] },
    ])
    expect(Object.keys(r.ctx)).toEqual(['tempo', 'foco', 'financas', 'trilhas'])
    expect(r.ctx.foco).toEqual({ minutosSemana: 60 })
    expect(r.fontes).toEqual(['agenda da semana', '1h de foco', '3 transações', '1 trilha de estudo'])
  })
})

describe('normalizarRegistrosParaAplicar', () => {
  it('sobrescreve href pelo mapa e mantém só a primeira skill', () => {
    const regs: Registro[] = [
      { tabela: 'skills', name: 'Inglês', rotulo: 'a', href: 'https://evil.example' },
      { tabela: 'goals', name: 'Fluência', target_date: '2027-12-31', rotulo: 'b', href: '/x' },
      { tabela: 'skills', name: 'English', rotulo: 'c', href: '/y' },
    ]
    const out = normalizarRegistrosParaAplicar(regs)
    expect(out.map(r => [r.tabela, r.href])).toEqual([
      ['skills', '/carreira/habilidades'],
      ['goals', '/futuro'],
    ])
  })
})

describe('mensagens de ação', () => {
  it('Feito conta registros e áreas', () => {
    expect(mensagemFeito([
      { tabela: 'study_tracks' }, { tabela: 'agenda_events' }, { tabela: 'agenda_events' },
      { tabela: 'recurring_transactions' }, { tabela: 'skills' }, { tabela: 'goals' },
    ])).toBe('Feito · 6 registros em 5 áreas')
    expect(mensagemFeito([{ tabela: 'goals' }])).toBe('Feito · 1 registro em 1 área')
  })

  it('Desfeito diz o que ficou', () => {
    expect(mensagemDesfeito(0)).toBe('Desfeito · nada mudou')
    expect(mensagemDesfeito(1)).toBe('Desfeito · 1 registro ficou porque você já o editou')
    expect(mensagemDesfeito(2)).toBe('Desfeito · 2 registros ficaram porque você já os editou')
  })

  it('reconhece intencao_invalida', () => {
    expect(ehIntencaoInvalida({ message: 'intencao_invalida' })).toBe(true)
    expect(ehIntencaoInvalida({ message: 'outra coisa' })).toBe(false)
    expect(ehIntencaoInvalida(null)).toBe(false)
  })
})
