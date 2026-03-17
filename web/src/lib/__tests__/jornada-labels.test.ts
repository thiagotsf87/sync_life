import { describe, it, expect } from 'vitest'
import { LABELS, jornadaLabel } from '../jornada-labels'

// ─── LABELS dictionary ─────────────────────────────────────────────────────────

describe('LABELS', () => {
  it('has all 10 module keys', () => {
    const expected = [
      'financas', 'futuro', 'corpo', 'mente', 'experiencias',
      'carreira', 'tempo', 'patrimonio', 'panorama', 'configuracoes',
    ]
    for (const key of expected) {
      expect(LABELS).toHaveProperty(key)
    }
  })

  it('each module has a "module" key with a display name', () => {
    expect(LABELS.financas.module).toBe('Finanças')
    expect(LABELS.futuro.module).toBe('Futuro')
    expect(LABELS.corpo.module).toBe('Corpo')
    expect(LABELS.mente.module).toBe('Mente')
    expect(LABELS.experiencias.module).toBe('Experiências')
    expect(LABELS.carreira.module).toBe('Carreira')
    expect(LABELS.tempo.module).toBe('Tempo')
    expect(LABELS.patrimonio.module).toBe('Patrimônio')
    expect(LABELS.panorama.module).toBe('Panorama')
    expect(LABELS.configuracoes.module).toBe('Configurações')
  })

  it('financas has expected sub-labels', () => {
    expect(LABELS.financas.transacoes).toBe('Transações')
    expect(LABELS.financas.receitas).toBe('Receitas')
    expect(LABELS.financas.despesas).toBe('Despesas')
    expect(LABELS.financas.orcamentos).toBe('Orçamentos')
    expect(LABELS.financas.recorrentes).toBe('Recorrentes')
    expect(LABELS.financas.planejamento).toBe('Planejamento')
    expect(LABELS.financas.relatorios).toBe('Relatórios')
    expect(LABELS.financas.calendario).toBe('Calendário')
    expect(LABELS.financas.saldo).toBe('Saldo')
  })

  it('futuro has expected sub-labels', () => {
    expect(LABELS.futuro.objetivos).toBe('Objetivos')
    expect(LABELS.futuro.metas).toBe('Metas')
    expect(LABELS.futuro.checkin).toBe('Check-in')
    expect(LABELS.futuro.aporte).toBe('Aporte')
    expect(LABELS.futuro.milestone).toBe('Marco')
  })

  it('corpo has expected sub-labels', () => {
    expect(LABELS.corpo.atividades).toBe('Atividades')
    expect(LABELS.corpo.peso).toBe('Peso & Medidas')
    expect(LABELS.corpo.consultas).toBe('Saúde Preventiva')
    expect(LABELS.corpo.cardapio).toBe('Cardápio')
  })

  it('configuracoes has all settings labels', () => {
    expect(LABELS.configuracoes.perfil).toBe('Perfil')
    expect(LABELS.configuracoes.aparencia).toBe('Aparência')
    expect(LABELS.configuracoes.notificacoes).toBe('Notificações')
    expect(LABELS.configuracoes.categorias).toBe('Categorias')
    expect(LABELS.configuracoes.integracoes).toBe('Integrações')
    expect(LABELS.configuracoes.plano).toBe('Plano')
  })
})

// ─── jornadaLabel ───────────────────────────────────────────────────────────────

describe('jornadaLabel', () => {
  it('returns the correct label for a known module and key', () => {
    expect(jornadaLabel('financas', 'module', 'fallback')).toBe('Finanças')
    expect(jornadaLabel('financas', 'transacoes', 'fallback')).toBe('Transações')
  })

  it('returns the default label for an unknown key', () => {
    expect(jornadaLabel('financas', 'unknown_key', 'My Default')).toBe('My Default')
  })

  it('returns the default label for an unknown module key within a valid module', () => {
    expect(jornadaLabel('corpo', 'nonexistent', 'Fallback')).toBe('Fallback')
  })

  it('works with all module keys', () => {
    expect(jornadaLabel('panorama', 'dashboard', 'x')).toBe('Dashboard')
    expect(jornadaLabel('mente', 'trilhas', 'x')).toBe('Trilhas')
    expect(jornadaLabel('patrimonio', 'carteira', 'x')).toBe('Carteira')
    expect(jornadaLabel('experiencias', 'viagens', 'x')).toBe('Viagens')
    expect(jornadaLabel('carreira', 'roadmap', 'x')).toBe('Roadmap')
    expect(jornadaLabel('tempo', 'agenda', 'x')).toBe('Agenda')
  })
})
