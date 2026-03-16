'use client'

import { cn } from '@/lib/utils'

interface DataTableColumn<T> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  onRowClick?: (row: T, index: number) => void
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps<T>) {
  return (
    <div className={cn('sl-fade-up', className)}>
      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 6px' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)]',
                  'px-4 pb-2 text-left',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-[13px] text-[var(--sl-t3)]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                'group',
                onRowClick && 'cursor-pointer',
              )}
              onClick={() => onRowClick?.(row, rowIdx)}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key}
                  className={cn(
                    'bg-[var(--sl-s1)] px-4 py-4 text-[13px]',
                    'border-t border-b border-[var(--sl-border)]',
                    'transition-colors group-hover:bg-[var(--sl-s2)]',
                    colIdx === 0 && 'border-l rounded-l-[14px]',
                    colIdx === columns.length - 1 && 'border-r rounded-r-[14px]',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                  )}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
