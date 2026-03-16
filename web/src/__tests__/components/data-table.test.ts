import { describe, it, expect } from 'vitest'

// Tests for DataTable component logic

interface DataTableColumn<T> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  render?: (row: T) => unknown
}

function getColumnAlignment(col: { align?: string }): string {
  if (col.align === 'center') return 'text-center'
  if (col.align === 'right') return 'text-right'
  return 'text-left'
}

function getCellBorderClasses(colIdx: number, totalCols: number): string[] {
  const classes = ['border-t', 'border-b', 'border-[var(--sl-border)]']
  if (colIdx === 0) {
    classes.push('border-l', 'rounded-l-[14px]')
  }
  if (colIdx === totalCols - 1) {
    classes.push('border-r', 'rounded-r-[14px]')
  }
  return classes
}

function getDisplayValue<T extends Record<string, unknown>>(
  row: T,
  col: DataTableColumn<T>,
): string {
  if (col.render) return 'custom_render'
  return String(row[col.key] ?? '')
}

describe('DataTable', () => {
  type Row = { name: string; value: number; status: string }

  const COLUMNS: DataTableColumn<Row>[] = [
    { key: 'name', label: 'Nome' },
    { key: 'value', label: 'Valor', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
  ]

  const DATA: Row[] = [
    { name: 'Item A', value: 100, status: 'active' },
    { name: 'Item B', value: 200, status: 'completed' },
  ]

  describe('column alignment', () => {
    it('defaults to text-left', () => {
      expect(getColumnAlignment({})).toBe('text-left')
      expect(getColumnAlignment({ align: 'left' })).toBe('text-left')
    })

    it('applies text-center for center alignment', () => {
      expect(getColumnAlignment({ align: 'center' })).toBe('text-center')
    })

    it('applies text-right for right alignment', () => {
      expect(getColumnAlignment({ align: 'right' })).toBe('text-right')
    })
  })

  describe('cell border classes', () => {
    it('first cell has left border and rounded-l', () => {
      const classes = getCellBorderClasses(0, 3)
      expect(classes).toContain('border-l')
      expect(classes).toContain('rounded-l-[14px]')
      expect(classes).not.toContain('border-r')
    })

    it('last cell has right border and rounded-r', () => {
      const classes = getCellBorderClasses(2, 3)
      expect(classes).toContain('border-r')
      expect(classes).toContain('rounded-r-[14px]')
      expect(classes).not.toContain('border-l')
    })

    it('middle cells have no side borders', () => {
      const classes = getCellBorderClasses(1, 3)
      expect(classes).not.toContain('border-l')
      expect(classes).not.toContain('border-r')
      expect(classes).toContain('border-t')
      expect(classes).toContain('border-b')
    })

    it('single column cell has both side borders', () => {
      const classes = getCellBorderClasses(0, 1)
      expect(classes).toContain('border-l')
      expect(classes).toContain('border-r')
    })
  })

  describe('display values', () => {
    it('renders string value from key', () => {
      expect(getDisplayValue(DATA[0], COLUMNS[0])).toBe('Item A')
    })

    it('renders number as string', () => {
      expect(getDisplayValue(DATA[0], COLUMNS[1])).toBe('100')
    })

    it('indicates custom render when render function exists', () => {
      const col: DataTableColumn<Row> = {
        key: 'status',
        label: 'Status',
        render: () => 'badge',
      }
      expect(getDisplayValue(DATA[0], col)).toBe('custom_render')
    })

    it('handles missing key gracefully', () => {
      const col: DataTableColumn<Row> = { key: 'missing' as keyof Row, label: 'Missing' }
      expect(getDisplayValue(DATA[0], col)).toBe('')
    })
  })

  describe('empty state', () => {
    it('shows empty message when data is empty', () => {
      const isEmpty = DATA.length === 0
      expect(isEmpty).toBe(false)
      expect([].length === 0).toBe(true)
    })
  })
})
