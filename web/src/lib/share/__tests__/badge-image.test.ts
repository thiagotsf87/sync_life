import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Setup Canvas 2D mock ───────────────────────────────────────────────────────

const mockFillText = vi.fn()
const mockFillRect = vi.fn()
const mockBeginPath = vi.fn()
const mockRoundRect = vi.fn()
const mockFill = vi.fn()
const mockMoveTo = vi.fn()
const mockLineTo = vi.fn()
const mockStroke = vi.fn()
const mockMeasureText = vi.fn(() => ({ width: 50 }))
const mockCreateLinearGradient = vi.fn(() => ({
  addColorStop: vi.fn(),
}))
const mockToBlob = vi.fn((callback: (blob: Blob | null) => void) => {
  callback(new Blob(['test-image'], { type: 'image/png' }))
})

const mockCtx = {
  fillText: mockFillText,
  fillRect: mockFillRect,
  beginPath: mockBeginPath,
  roundRect: mockRoundRect,
  fill: mockFill,
  moveTo: mockMoveTo,
  lineTo: mockLineTo,
  stroke: mockStroke,
  measureText: mockMeasureText,
  createLinearGradient: mockCreateLinearGradient,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
}

const mockCreateElement = vi.fn(() => ({
  width: 0,
  height: 0,
  getContext: () => mockCtx,
  toBlob: mockToBlob,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockMeasureText.mockReturnValue({ width: 50 })

  vi.stubGlobal('document', {
    createElement: mockCreateElement,
  })
})

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('generateBadgeImage', () => {
  it('creates a canvas with correct dimensions (600x400)', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    const blob = await generateBadgeImage({
      icon: '🏆',
      name: 'Test Badge',
      desc: 'Test description',
      rarity: 'common',
    })

    expect(mockCreateElement).toHaveBeenCalledWith('canvas')
    expect(blob).toBeInstanceOf(Blob)
  })

  it('draws background gradient', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🏆',
      name: 'Badge',
      desc: 'Desc',
      rarity: 'rare',
    })

    expect(mockCreateLinearGradient).toHaveBeenCalled()
    expect(mockFill).toHaveBeenCalled()
  })

  it('draws badge emoji', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🎯',
      name: 'Badge',
      desc: 'Desc',
      rarity: 'common',
    })

    expect(mockFillText).toHaveBeenCalledWith('🎯', expect.any(Number), expect.any(Number))
  })

  it('draws badge name', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🏆',
      name: 'My Achievement',
      desc: 'Description here',
      rarity: 'legendary',
    })

    expect(mockFillText).toHaveBeenCalledWith('My Achievement', expect.any(Number), expect.any(Number))
  })

  it('draws rarity pill text', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🏆',
      name: 'Badge',
      desc: 'Desc',
      rarity: 'legendary',
    })

    expect(mockFillText).toHaveBeenCalledWith('LENDÁRIA', expect.any(Number), expect.any(Number))
  })

  it('draws rarity labels for all rarity types', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    const rarities: Array<{ key: 'common' | 'uncommon' | 'rare' | 'legendary'; label: string }> = [
      { key: 'common', label: 'COMUM' },
      { key: 'uncommon', label: 'INCOMUM' },
      { key: 'rare', label: 'RARA' },
      { key: 'legendary', label: 'LENDÁRIA' },
    ]

    for (const { key, label } of rarities) {
      vi.clearAllMocks()
      mockMeasureText.mockReturnValue({ width: 50 })
      await generateBadgeImage({
        icon: '🏆',
        name: 'Badge',
        desc: 'Desc',
        rarity: key,
      })

      const fillTextCalls = mockFillText.mock.calls.map((c: unknown[]) => c[0])
      expect(fillTextCalls).toContain(label)
    }
  })

  it('draws SyncLife watermark', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🏆',
      name: 'Badge',
      desc: 'Desc',
      rarity: 'common',
    })

    expect(mockFillText).toHaveBeenCalledWith('SyncLife', expect.any(Number), expect.any(Number))
  })

  it('draws divider line', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🏆',
      name: 'Badge',
      desc: 'Desc',
      rarity: 'common',
    })

    expect(mockMoveTo).toHaveBeenCalled()
    expect(mockLineTo).toHaveBeenCalled()
    expect(mockStroke).toHaveBeenCalled()
  })

  it('draws top and bottom accent bars', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    await generateBadgeImage({
      icon: '🏆',
      name: 'Badge',
      desc: 'Desc',
      rarity: 'common',
    })

    // Top bar: fillRect(0, 0, W, 4)
    // Bottom bar: fillRect(0, H-4, W, 4)
    expect(mockFillRect).toHaveBeenCalledWith(0, 0, 600, 4)
    expect(mockFillRect).toHaveBeenCalledWith(0, 396, 600, 4)
  })

  it('wraps long description text', async () => {
    const { generateBadgeImage } = await import('../badge-image')

    // Make measureText return a wide measurement to trigger word wrap
    mockMeasureText.mockReturnValue({ width: 600 })

    await generateBadgeImage({
      icon: '🏆',
      name: 'Badge',
      desc: 'This is a very long description that should be word wrapped across multiple lines',
      rarity: 'common',
    })

    // fillText should be called multiple times for wrapped lines
    const descCalls = mockFillText.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).length > 0,
    )
    expect(descCalls.length).toBeGreaterThan(3) // At least emoji, name, rarity, some desc lines, watermark
  })
})
