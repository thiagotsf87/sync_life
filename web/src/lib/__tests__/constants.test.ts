import { describe, it, expect } from 'vitest'
import {
  MODULE_BAR_W,
  SB_OPEN,
  SB_COLLAPSED,
  SB_CLOSED,
  HEADER_H,
  BOTTOM_BAR_H,
  CONTENT_PADDING,
} from '../constants'

describe('Shell layout constants', () => {
  it('MODULE_BAR_W is 72', () => {
    expect(MODULE_BAR_W).toBe(72)
  })

  it('SB_OPEN is 228', () => {
    expect(SB_OPEN).toBe(228)
  })

  it('SB_COLLAPSED is 56', () => {
    expect(SB_COLLAPSED).toBe(56)
  })

  it('SB_CLOSED is 0', () => {
    expect(SB_CLOSED).toBe(0)
  })

  it('HEADER_H is 54', () => {
    expect(HEADER_H).toBe(54)
  })

  it('BOTTOM_BAR_H is 64', () => {
    expect(BOTTOM_BAR_H).toBe(64)
  })

  it('CONTENT_PADDING is 22', () => {
    expect(CONTENT_PADDING).toBe(22)
  })

  it('all values are positive numbers', () => {
    const values = [MODULE_BAR_W, SB_OPEN, SB_COLLAPSED, SB_CLOSED, HEADER_H, BOTTOM_BAR_H, CONTENT_PADDING]
    for (const val of values) {
      expect(typeof val).toBe('number')
      expect(val).toBeGreaterThanOrEqual(0)
    }
  })
})
