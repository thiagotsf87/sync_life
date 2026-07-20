import { describe, it, expect } from 'vitest'
import { summarizeFinancas, MODULE_PERSONA } from './context'

describe('coach/context', () => {
  it('summarizeFinancas calcula saldo e taxa de poupança', () => {
    const s = summarizeFinancas(
      [
        { amount: 5000, type: 'income', category: null },
        { amount: 3000, type: 'expense', category: { name: 'Moradia' } },
      ] as never,
    )
    expect(s.income).toBe(5000)
    expect(s.expenses).toBe(3000)
    expect(s.balance).toBe(2000)
    expect(s.savingsRate).toBe(40)
  })

  it('MODULE_PERSONA tem persona para finanças com label e cor', () => {
    expect(MODULE_PERSONA.financas.label).toBe('Finanças')
    expect(MODULE_PERSONA.financas.color).toMatch(/^#/)
    expect(MODULE_PERSONA.financas.system.length).toBeGreaterThan(20)
  })
})
