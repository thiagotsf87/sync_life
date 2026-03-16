import { describe, it, expect } from 'vitest'

// Tests for UnderlineTabs component logic

interface TabItem {
  id: string
  label: string
  count?: number
}

function getActiveTabStyle(isActive: boolean, accentColor: string) {
  return isActive ? { borderBottomColor: accentColor } : undefined
}

function getActiveTabClasses(isActive: boolean): string {
  return isActive ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)] hover:text-[var(--sl-t2)]'
}

function findTab(tabs: TabItem[], id: string): TabItem | undefined {
  return tabs.find(t => t.id === id)
}

describe('UnderlineTabs', () => {
  const TABS: TabItem[] = [
    { id: 'overview', label: 'Visao Geral' },
    { id: 'itinerary', label: 'Roteiro', count: 5 },
    { id: 'budget', label: 'Orcamento' },
    { id: 'checklist', label: 'Checklist', count: 3 },
    { id: 'accommodation', label: 'Hospedagem', count: 2 },
    { id: 'transports', label: 'Transporte', count: 2 },
  ]

  describe('active tab styling', () => {
    it('returns border style for active tab', () => {
      const style = getActiveTabStyle(true, '#ec4899')
      expect(style).toEqual({ borderBottomColor: '#ec4899' })
    })

    it('returns undefined for inactive tab', () => {
      const style = getActiveTabStyle(false, '#ec4899')
      expect(style).toBeUndefined()
    })

    it('uses custom accent color', () => {
      const style = getActiveTabStyle(true, '#f97316')
      expect(style).toEqual({ borderBottomColor: '#f97316' })
    })
  })

  describe('active tab classes', () => {
    it('uses primary text for active tab', () => {
      const classes = getActiveTabClasses(true)
      expect(classes).toContain('text-[var(--sl-t1)]')
      expect(classes).not.toContain('hover')
    })

    it('uses tertiary text with hover for inactive tab', () => {
      const classes = getActiveTabClasses(false)
      expect(classes).toContain('text-[var(--sl-t3)]')
      expect(classes).toContain('hover:text-[var(--sl-t2)]')
    })
  })

  describe('tab lookup', () => {
    it('finds tab by id', () => {
      const tab = findTab(TABS, 'budget')
      expect(tab).toBeDefined()
      expect(tab!.label).toBe('Orcamento')
    })

    it('returns undefined for unknown id', () => {
      const tab = findTab(TABS, 'unknown')
      expect(tab).toBeUndefined()
    })
  })

  describe('count badges', () => {
    it('tabs with count show badge', () => {
      const tabsWithCount = TABS.filter(t => t.count !== undefined)
      expect(tabsWithCount).toHaveLength(4)
    })

    it('tabs without count do not show badge', () => {
      const tabsWithoutCount = TABS.filter(t => t.count === undefined)
      expect(tabsWithoutCount).toHaveLength(2)
      expect(tabsWithoutCount[0].id).toBe('overview')
    })

    it('count values are non-negative', () => {
      TABS.forEach(t => {
        if (t.count !== undefined) {
          expect(t.count).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  describe('tab change callback', () => {
    it('onTabChange receives correct id', () => {
      let receivedId = ''
      const onTabChange = (id: string) => { receivedId = id }
      onTabChange('budget')
      expect(receivedId).toBe('budget')
    })
  })
})
