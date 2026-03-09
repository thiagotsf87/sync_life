'use client'

// Colors are passed via props, no color imports needed

interface ContribEntry {
  id: string
  name: string
  date: string
  value: string
  color: string
  dotColor: string
  isXpEvent?: boolean
}

interface ContribMonthBandProps {
  month: string
  total: string
  totalColor: string
  entries: ContribEntry[]
}

export function ContribMonthBand({ month, total, totalColor, entries }: ContribMonthBandProps) {
  return (
    <div className="mx-4 mb-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-[14px] py-[11px] border-b border-[var(--sl-border)]">
        <span className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">{month}</span>
        <span className="font-[DM_Mono] text-[14px] font-medium" style={{ color: totalColor }}>
          {total}
        </span>
      </div>

      {/* Entries */}
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          className="flex items-center gap-[11px] px-[14px] py-[9px]"
          style={{ borderBottom: i < entries.length - 1 ? '1px solid var(--sl-border)' : 'none' }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.dotColor }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{entry.name}</p>
            <p className="text-[10px] text-[var(--sl-t2)] mt-[1px]">{entry.date}</p>
          </div>
          <span
            className="font-[DM_Mono] text-[12px] font-medium shrink-0"
            style={{ color: entry.color }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}
