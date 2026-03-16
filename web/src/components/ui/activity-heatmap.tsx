'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface HeatmapDay {
  date: string     // ISO date string
  level: 0 | 1 | 2 | 3 | 4
  minutes?: number
}

interface ActivityHeatmapProps {
  days: HeatmapDay[]
  accentColor?: string  // base color for gradient
  className?: string
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Sem atividade',
  1: 'Leve (1–19 min)',
  2: 'Moderado (20–39 min)',
  3: 'Intenso (40–59 min)',
  4: 'Muito intenso (60+ min)',
}

function formatTooltipDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ActivityHeatmap({
  days,
  accentColor = '#f97316',
  className,
}: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use last 28 days in a single horizontal row (28 columns)
  const grid = days.slice(-28)
  // Pad to 28 if needed
  while (grid.length < 28) {
    grid.unshift({ date: '', level: 0 })
  }

  const handleCellMouseEnter = (day: HeatmapDay, e: React.MouseEvent<HTMLDivElement>) => {
    if (!day.date) return
    const mins = day.minutes ?? 0
    const label = LEVEL_LABELS[day.level]
    const text = mins > 0
      ? `${formatTooltipDate(day.date)}\n${mins} min de atividade\n${label}`
      : `${formatTooltipDate(day.date)}\n${label}`
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    setTooltip({
      text,
      x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
      y: rect.top - (containerRect?.top ?? 0) - 4,
    })
  }

  const handleCellMouseLeave = () => setTooltip(null)

  return (
    <div ref={containerRef} className={cn('sl-fade-up relative', className)}>
      {/* Day labels */}
      <div className="flex justify-between mb-2">
        <span className="text-[9px] text-[var(--sl-t3)]">Seg</span>
        <span className="text-[9px] text-[var(--sl-t3)]">Dom</span>
      </div>

      {/* 28-column horizontal grid */}
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: 'repeat(28, 1fr)' }}
      >
        {grid.map((day, i) => (
          <div
            key={day.date || `empty-${i}`}
            className="aspect-square rounded-[3px] transition-transform hover:scale-[1.3] hover:z-10 cursor-default"
            style={{
              background: level0Bg(day.level, accentColor),
            }}
            onMouseEnter={(e) => handleCellMouseEnter(day, e)}
            onMouseLeave={handleCellMouseLeave}
            title=""
            role="img"
            aria-label={day.date ? `${formatTooltipDate(day.date)}: ${day.minutes ?? 0} min` : ''}
          />
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 min-w-[200px] max-w-[260px] px-4 py-3 rounded-xl text-[12px] font-medium
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] shadow-lg
                     whitespace-pre-line text-left pointer-events-none
                     -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[9px] text-[var(--sl-t3)] mr-0.5">Menos</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ background: level0Bg(level, accentColor) }}
          />
        ))}
        <span className="text-[9px] text-[var(--sl-t3)] ml-0.5">Mais</span>
      </div>
    </div>
  )
}

function level0Bg(level: 0 | 1 | 2 | 3 | 4, accentColor: string): string {
  if (level === 0) return 'var(--sl-s3)'
  const opacities: Record<number, string> = {
    1: '33', // ~20%
    2: '66', // ~40%
    3: 'A6', // ~65%
    4: '', // 100%
  }
  return level === 4 ? accentColor : `${accentColor}${opacities[level]}`
}
