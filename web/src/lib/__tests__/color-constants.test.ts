import { describe, it, expect } from 'vitest'
import {
  EXP_PRIMARY,
  EXP_PRIMARY_LIGHT,
  EXP_PRIMARY_BG,
  EXP_PRIMARY_DIM,
  EXP_PRIMARY_BORDER,
  EXP_PRIMARY_GLOW,
  EXP_PRIMARY_TAG,
  EXP_GRAD,
} from '../exp-colors'
import {
  FUTURO_PRIMARY,
  FUTURO_PRIMARY_LIGHT,
  FUTURO_PRIMARY_BG,
  FUTURO_PRIMARY_BORDER,
  FUTURO_PRIMARY_GLOW,
  FUTURO_GRAD,
  FUTURO_SECONDARY,
} from '../futuro-colors'
import {
  CARREIRA_PRIMARY,
  CARREIRA_PRIMARY_LIGHT,
  CARREIRA_PRIMARY_BG,
  CARREIRA_PRIMARY_BORDER,
  CARREIRA_PRIMARY_GLOW,
  CARREIRA_GRAD,
} from '../carreira-colors'

describe('Experiencias colors', () => {
  it('EXP_PRIMARY is pink (#C76795)', () => {
    expect(EXP_PRIMARY).toBe('#C76795')
  })

  it('EXP_PRIMARY_LIGHT is a lighter pink', () => {
    expect(EXP_PRIMARY_LIGHT).toBe('#f472b6')
  })

  it('background colors contain rgba', () => {
    expect(EXP_PRIMARY_BG).toContain('rgba')
    expect(EXP_PRIMARY_DIM).toContain('rgba')
  })

  it('border and glow contain rgba', () => {
    expect(EXP_PRIMARY_BORDER).toContain('rgba')
    expect(EXP_PRIMARY_GLOW).toContain('rgba')
    expect(EXP_PRIMARY_TAG).toContain('rgba')
  })

  it('gradient is a linear-gradient', () => {
    expect(EXP_GRAD).toContain('linear-gradient')
    expect(EXP_GRAD).toContain('#C76795')
  })
})

describe('Futuro colors', () => {
  it('FUTURO_PRIMARY is violet (#8B7BD4)', () => {
    expect(FUTURO_PRIMARY).toBe('#8B7BD4')
  })

  it('FUTURO_SECONDARY is blue (#0B2D34)', () => {
    expect(FUTURO_SECONDARY).toBe('#0B2D34')
  })

  it('gradient contains both primary and secondary', () => {
    expect(FUTURO_GRAD).toContain('#8B7BD4')
    expect(FUTURO_GRAD).toContain('#0B2D34')
  })

  it('all constants are strings', () => {
    expect(typeof FUTURO_PRIMARY).toBe('string')
    expect(typeof FUTURO_PRIMARY_LIGHT).toBe('string')
    expect(typeof FUTURO_PRIMARY_BG).toBe('string')
    expect(typeof FUTURO_PRIMARY_BORDER).toBe('string')
    expect(typeof FUTURO_PRIMARY_GLOW).toBe('string')
  })
})

describe('Carreira colors', () => {
  it('CARREIRA_PRIMARY is rose (#DB6478)', () => {
    expect(CARREIRA_PRIMARY).toBe('#DB6478')
  })

  it('CARREIRA_PRIMARY_LIGHT is a lighter rose', () => {
    expect(CARREIRA_PRIMARY_LIGHT).toBe('#fb7185')
  })

  it('gradient contains both primary and light', () => {
    expect(CARREIRA_GRAD).toContain('#DB6478')
    expect(CARREIRA_GRAD).toContain('#fb7185')
  })

  it('all constants are strings', () => {
    expect(typeof CARREIRA_PRIMARY_BG).toBe('string')
    expect(typeof CARREIRA_PRIMARY_BORDER).toBe('string')
    expect(typeof CARREIRA_PRIMARY_GLOW).toBe('string')
  })
})
