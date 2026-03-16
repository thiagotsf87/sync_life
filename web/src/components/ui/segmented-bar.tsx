'use client'

import { cn } from '@/lib/utils'

interface SegmentedBarProps {
  level: number
  maxLevel?: number
  color?: string
  className?: string
}

export function SegmentedBar({
  level,
  maxLevel = 5,
  color = '#f43f5e',
  className,
}: SegmentedBarProps) {
  return (
    <div className={cn('flex items-center gap-[3px]', className)}>
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className="w-5 h-2 rounded-[2px] transition-colors"
          style={{
            background: i < level ? color : 'var(--sl-s3)',
          }}
        />
      ))}
    </div>
  )
}
