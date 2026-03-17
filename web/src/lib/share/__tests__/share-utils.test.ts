import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock badge-image module
vi.mock('../badge-image', () => ({
  generateBadgeImage: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'image/png' }))),
}))

// ─── Setup global mocks for browser APIs ────────────────────────────────────────

const mockOpen = vi.fn()
const mockWriteText = vi.fn(() => Promise.resolve())
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  // Mock window and window.open
  vi.stubGlobal('window', {
    open: mockOpen,
  })
  vi.stubGlobal('open', mockOpen)

  // Mock navigator
  vi.stubGlobal('navigator', {
    clipboard: { writeText: mockWriteText },
    canShare: undefined,
    share: undefined,
  })

  // Patch URL static methods without replacing the constructor
  globalThis.URL.createObjectURL = mockCreateObjectURL
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL

  // Mock document.createElement for fallback download
  vi.stubGlobal('document', {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: mockClick,
    })),
  })

  // Mock File constructor
  vi.stubGlobal('File', class MockFile {
    name: string
    type: string
    constructor(parts: BlobPart[], name: string, opts?: { type?: string }) {
      this.name = name
      this.type = opts?.type ?? ''
    }
  })
})

// ─── Tests ──────────────────────────────────────────────────────────────────────

const badge = {
  icon: '🏆',
  name: 'Primeiro Passo',
  desc: 'Complete sua primeira tarefa',
  rarity: 'common' as const,
}

describe('shareToWhatsApp', () => {
  it('opens WhatsApp URL with encoded text', async () => {
    const { shareToWhatsApp } = await import('../share-utils')
    shareToWhatsApp(badge)

    expect(mockOpen).toHaveBeenCalledTimes(1)
    const url = mockOpen.mock.calls[0][0] as string
    expect(url).toContain('https://wa.me/?text=')
    expect(url).toContain(encodeURIComponent('Primeiro Passo'))
    expect(mockOpen.mock.calls[0][1]).toBe('_blank')
  })
})

describe('shareToTwitter', () => {
  it('opens Twitter intent URL with encoded text', async () => {
    const { shareToTwitter } = await import('../share-utils')
    shareToTwitter(badge)

    expect(mockOpen).toHaveBeenCalledTimes(1)
    const url = mockOpen.mock.calls[0][0] as string
    expect(url).toContain('https://twitter.com/intent/tweet?text=')
    expect(url).toContain(encodeURIComponent('Primeiro Passo'))
    expect(mockOpen.mock.calls[0][1]).toBe('_blank')
  })
})

describe('copyBadgeLink', () => {
  it('copies badge text to clipboard', async () => {
    const { copyBadgeLink } = await import('../share-utils')
    await copyBadgeLink(badge)

    expect(mockWriteText).toHaveBeenCalledTimes(1)
    const text = (mockWriteText.mock.calls[0] as unknown[])[0] as string
    expect(text).toContain('Primeiro Passo')
    expect(text).toContain('Complete sua primeira tarefa')
  })
})

describe('shareBadgeImage', () => {
  it('falls back to download when canShare is not available', async () => {
    const { shareBadgeImage } = await import('../share-utils')
    await shareBadgeImage(badge)

    // Should create download link
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
  })
})
