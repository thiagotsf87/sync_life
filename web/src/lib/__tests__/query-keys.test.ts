import { describe, it, expect } from 'vitest'
import { queryKeys } from '../query-keys'

describe('queryKeys', () => {
  it('transactions.all returns base key', () => {
    expect(queryKeys.transactions.all).toEqual(['transactions'])
  })

  it('transactions.list returns key with filters', () => {
    const filters = { month: 3, year: 2026, type: 'expense' as string }
    expect(queryKeys.transactions.list(filters)).toEqual(['transactions', 'list', filters])
  })

  it('corpo.dashboard returns key with userId', () => {
    expect(queryKeys.corpo.dashboard('user123')).toEqual(['corpo', 'dashboard', 'user123'])
  })

  it('corpo.profile returns key with userId', () => {
    expect(queryKeys.corpo.profile('user123')).toEqual(['corpo', 'profile', 'user123'])
  })

  it('corpo.activities returns key with userId', () => {
    expect(queryKeys.corpo.activities('u1')).toEqual(['corpo', 'activities', 'u1'])
  })

  it('corpo.appointments returns key with userId and optional status', () => {
    expect(queryKeys.corpo.appointments('u1', 'agendada')).toEqual(['corpo', 'appointments', 'u1', 'agendada'])
    expect(queryKeys.corpo.appointments('u1')).toEqual(['corpo', 'appointments', 'u1', undefined])
  })

  it('notifications.list returns key with userId', () => {
    expect(queryKeys.notifications.list('u1')).toEqual(['notifications', 'list', 'u1'])
  })

  it('financas.budgets returns key with userId', () => {
    expect(queryKeys.financas.budgets('u1')).toEqual(['financas', 'budgets', 'u1'])
  })

  it('futuro.objectives returns key with userId', () => {
    expect(queryKeys.futuro.objectives('u1')).toEqual(['futuro', 'objectives', 'u1'])
  })

  it('tempo.events returns key with userId and optional week', () => {
    expect(queryKeys.tempo.events('u1', '2026-W10')).toEqual(['tempo', 'events', 'u1', '2026-W10'])
  })

  it('patrimonio.assets returns key with userId', () => {
    expect(queryKeys.patrimonio.assets('u1')).toEqual(['patrimonio', 'assets', 'u1'])
  })

  it('experiencias.trips returns key with userId', () => {
    expect(queryKeys.experiencias.trips('u1')).toEqual(['experiencias', 'trips', 'u1'])
  })

  it('billing.plan returns key with userId', () => {
    expect(queryKeys.billing.plan('u1')).toEqual(['billing', 'plan', 'u1'])
  })

  it('all top-level "all" keys are distinct', () => {
    const allKeys = [
      queryKeys.transactions.all,
      queryKeys.corpo.all,
      queryKeys.notifications.all,
      queryKeys.financas.all,
      queryKeys.futuro.all,
      queryKeys.tempo.all,
      queryKeys.patrimonio.all,
      queryKeys.experiencias.all,
      queryKeys.billing.all,
    ]
    const stringified = allKeys.map(k => JSON.stringify(k))
    const unique = new Set(stringified)
    expect(unique.size).toBe(allKeys.length)
  })
})
