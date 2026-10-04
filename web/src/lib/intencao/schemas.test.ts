import { describe, it, expect } from 'vitest'
import {
  RegistroSchema,
  PropostaSchema,
  AplicarInput,
  DesfazerInput,
  IntencaoInput,
  filtrarRegistrosValidos,
  HREF_POR_TABELA,
} from './schemas'

const trilha = {
  tabela: 'study_tracks',
  name: 'Inglês para conversação',
  target_date: '2027-06-30',
  cost: 180,
  rotulo: 'Trilha de inglês',
  href: '/mente/trilhas',
}

const evento = {
  tabela: 'agenda_events',
  title: 'Aula de inglês',
  date: '2026-10-06',
  start_time: '20:00',
  end_time: '21:00',
  rotulo: 'Terça 20h',
  href: '/tempo/agenda',
}

const recorrente = {
  tabela: 'recurring_transactions',
  name: 'Curso de inglês',
  amount: 180,
  day_of_month: 10,
  rotulo: 'R$ 180/mês',
  href: '/financas/recorrentes',
}

const skill = {
  tabela: 'skills',
  name: 'Inglês',
  rotulo: 'Habilidade Inglês',
  href: '/carreira/habilidades',
}

const goal = {
  tabela: 'goals',
  name: 'Fluência até 2027',
  target_date: '2027-12-31',
  rotulo: 'Meta de fluência',
  href: '/futuro',
}

const caminho = (id: string, registros: unknown[]) => ({
  id,
  titulo: 'Começar agora',
  resumo: 'Duas noites por semana, R$ 180 por mês.',
  registros,
  efeitos: [
    { area: '03', texto: 'Tempo: 2 noites, ter e qui 20h' },
    { area: '02', texto: 'Finanças: R$ 180/mês, margem cai para R$ 310' },
  ],
})

describe('intencao/schemas · registros', () => {
  it('aceita um payload bom de cada tabela da whitelist', () => {
    for (const reg of [trilha, evento, recorrente, skill, goal]) {
      const r = RegistroSchema.safeParse(reg)
      expect(r.success, JSON.stringify(reg)).toBe(true)
    }
  })

  it('rejeita tabela fora da whitelist (profiles)', () => {
    const r = RegistroSchema.safeParse({ ...skill, tabela: 'profiles' })
    expect(r.success).toBe(false)
  })

  it('rejeita amount negativo na recorrente', () => {
    expect(RegistroSchema.safeParse({ ...recorrente, amount: -1 }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...recorrente, amount: 0 }).success).toBe(false)
  })

  it('rejeita day_of_month fora de 1..31 ou não inteiro', () => {
    expect(RegistroSchema.safeParse({ ...recorrente, day_of_month: 0 }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...recorrente, day_of_month: 32 }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...recorrente, day_of_month: 10.5 }).success).toBe(false)
  })

  it('rejeita start_time fora de HH:MM', () => {
    expect(RegistroSchema.safeParse({ ...evento, start_time: '20h' }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...evento, end_time: '25:00' }).success).toBe(false)
  })

  it('rejeita data fora de YYYY-MM-DD', () => {
    expect(RegistroSchema.safeParse({ ...evento, date: '06/10/2026' }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...trilha, target_date: '2027-13-01' }).success).toBe(false)
  })

  it('rejeita cost negativo na trilha e aceita zero', () => {
    expect(RegistroSchema.safeParse({ ...trilha, cost: -10 }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...trilha, cost: 0 }).success).toBe(true)
  })

  it('rejeita name vazio ou acima de 120 caracteres', () => {
    expect(RegistroSchema.safeParse({ ...skill, name: '' }).success).toBe(false)
    expect(RegistroSchema.safeParse({ ...skill, name: 'a'.repeat(121) }).success).toBe(false)
  })
})

describe('intencao/schemas · filtrarRegistrosValidos', () => {
  it('descarta o inválido no meio e devolve só os válidos, na ordem', () => {
    const out = filtrarRegistrosValidos([trilha, { ...recorrente, amount: -1 }, evento])
    expect(out).toHaveLength(2)
    expect(out.map(r => r.tabela)).toEqual(['study_tracks', 'agenda_events'])
  })

  it('não corrige nada: tabela desconhecida e lixo são descartados', () => {
    const out = filtrarRegistrosValidos([null, 'x', { tabela: 'profiles', name: 'a' }, skill])
    expect(out).toEqual([skill])
  })

  it('lista vazia devolve lista vazia', () => {
    expect(filtrarRegistrosValidos([])).toEqual([])
  })
})

describe('intencao/schemas · proposta', () => {
  it('rejeita proposta com 1 caminho', () => {
    const r = PropostaSchema.safeParse({ tipo: 'iniciar_curso', caminhos: [caminho('a', [trilha])] })
    expect(r.success).toBe(false)
  })

  it('aceita proposta com 3 caminhos', () => {
    const r = PropostaSchema.safeParse({
      tipo: 'iniciar_curso',
      caminhos: [caminho('a', [trilha, evento]), caminho('b', [recorrente]), caminho('c', [skill, goal])],
    })
    expect(r.success).toBe(true)
  })

  it('rejeita proposta com 4 caminhos', () => {
    const r = PropostaSchema.safeParse({
      tipo: 'iniciar_curso',
      caminhos: [caminho('a', [trilha]), caminho('b', [trilha]), caminho('c', [trilha]), caminho('d', [trilha])],
    })
    expect(r.success).toBe(false)
  })

  it('rejeita tipo fora da whitelist', () => {
    const r = PropostaSchema.safeParse({ tipo: 'outro', caminhos: [caminho('a', [trilha]), caminho('b', [trilha])] })
    expect(r.success).toBe(false)
  })

  it('rejeita caminho sem registros ou com registro inválido', () => {
    expect(PropostaSchema.safeParse({ tipo: 'iniciar_curso', caminhos: [caminho('a', []), caminho('b', [trilha])] }).success).toBe(false)
    expect(
      PropostaSchema.safeParse({ tipo: 'iniciar_curso', caminhos: [caminho('a', [{ ...recorrente, amount: -1 }]), caminho('b', [trilha])] }).success,
    ).toBe(false)
  })

  it('rejeita efeito com area fora de 01..08', () => {
    const c = { ...caminho('a', [trilha]), efeitos: [{ area: '09', texto: 'x' }] }
    expect(PropostaSchema.safeParse({ tipo: 'iniciar_curso', caminhos: [c, caminho('b', [trilha])] }).success).toBe(false)
  })
})

describe('intencao/schemas · inputs das rotas', () => {
  const uuid = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

  it('AplicarInput exige uuid, caminho e 1..8 registros válidos', () => {
    expect(AplicarInput.safeParse({ intencaoId: uuid, caminho: 'a', registros: [trilha] }).success).toBe(true)
    expect(AplicarInput.safeParse({ intencaoId: 'nao-uuid', caminho: 'a', registros: [trilha] }).success).toBe(false)
    expect(AplicarInput.safeParse({ intencaoId: uuid, caminho: 'a', registros: [] }).success).toBe(false)
    expect(AplicarInput.safeParse({ intencaoId: uuid, caminho: 'a', registros: Array(9).fill(trilha) }).success).toBe(false)
  })

  it('DesfazerInput exige uuid', () => {
    expect(DesfazerInput.safeParse({ intencaoId: uuid }).success).toBe(true)
    expect(DesfazerInput.safeParse({ intencaoId: '123' }).success).toBe(false)
  })

  it('IntencaoInput exige texto 3..500 e moduleId', () => {
    expect(IntencaoInput.safeParse({ texto: 'Quero começar um curso de inglês', moduleId: 'dashboard' }).success).toBe(true)
    expect(IntencaoInput.safeParse({ texto: 'oi', moduleId: 'dashboard' }).success).toBe(false)
    expect(IntencaoInput.safeParse({ texto: 'a'.repeat(501), moduleId: 'dashboard' }).success).toBe(false)
    expect(IntencaoInput.safeParse({ texto: 'Quero começar um curso', moduleId: '' }).success).toBe(false)
  })
})

describe('intencao/schemas · HREF_POR_TABELA', () => {
  it('mapeia cada tabela da whitelist para a rota real', () => {
    expect(HREF_POR_TABELA).toEqual({
      recurring_transactions: '/financas/recorrentes',
      goals: '/futuro',
      agenda_events: '/tempo/agenda',
      study_tracks: '/mente/trilhas',
      skills: '/carreira/habilidades',
    })
  })
})
