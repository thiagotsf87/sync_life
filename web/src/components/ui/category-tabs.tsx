'use client'

import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
}

interface CategoryTabsProps {
  tabs: Tab[]
  activeId: string
  onSelect: (id: string) => void
  accentColor?: string
  className?: string
}

export function CategoryTabs({
  tabs,
  activeId,
  onSelect,
  accentColor = '#f43f5e',
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn('flex gap-0 border-b border-[var(--sl-border)]', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'px-4 py-2.5 text-[13px] font-medium transition-colors relative',
              isActive
                ? 'text-[var(--sl-t1)]'
                : 'text-[var(--sl-t3)] hover:text-[var(--sl-t2)]'
            )}
          >
            {tab.label}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t"
                style={{ background: accentColor }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
