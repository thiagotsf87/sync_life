'use client'

import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  count?: number
}

interface UnderlineTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (id: string) => void
  accentColor?: string
  className?: string
}

export function UnderlineTabs({
  tabs,
  activeTab,
  onTabChange,
  accentColor = '#ec4899',
  className,
}: UnderlineTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-0 border-b border-[var(--sl-border)] my-6',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-5 py-3 text-[12.5px] font-semibold border-b-2 border-transparent',
              'transition-all duration-200 flex items-center gap-1.5',
              'bg-transparent cursor-pointer',
              isActive
                ? 'text-[var(--sl-t1)]'
                : 'text-[var(--sl-t3)] hover:text-[var(--sl-t2)]',
            )}
            style={isActive ? { borderBottomColor: accentColor } : undefined}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-[7px] py-[2px] rounded-md',
                  isActive
                    ? 'text-[var(--sl-t2)]'
                    : 'text-[var(--sl-t2)]',
                  'bg-[var(--sl-s3)]',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
