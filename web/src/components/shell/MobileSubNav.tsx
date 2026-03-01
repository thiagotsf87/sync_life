'use client'

import { useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES, getActiveNavItem } from '@/lib/modules'
import { cn } from '@/lib/utils'

export function MobileSubNav() {
  const router = useRouter()
  const pathname = usePathname()
  const activeModule = useShellStore((s) => s.activeModule)
  const scrollRef = useRef<HTMLDivElement>(null)

  const mod = MODULES[activeModule]
  const activeNavId = getActiveNavItem(pathname, activeModule)

  // Auto-scroll active tab into view when pathname changes
  useEffect(() => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const activeBtn = container.querySelector('[data-active="true"]') as HTMLElement
    if (activeBtn) {
      const tabCenter = activeBtn.offsetLeft + activeBtn.offsetWidth / 2
      container.scrollLeft = tabCenter - container.clientWidth / 2
    }
  }, [pathname])

  // Only show if module has more than 1 nav item
  if (mod.navItems.length <= 1) return null

  return (
    <div className="lg:hidden relative border-b border-[var(--sl-border)] bg-[var(--sl-s1)]">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-4 gap-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {mod.navItems.map((item) => {
          const isActive = activeNavId === item.id

          return (
            <button
              key={item.id}
              data-active={isActive}
              onClick={() => router.push(item.href)}
              className={cn(
                'shrink-0 px-3 py-2.5 text-[12px] font-medium whitespace-nowrap',
                'border-b-2 transition-colors duration-150',
                isActive
                  ? 'text-[var(--sl-t1)]'
                  : 'border-transparent text-[var(--sl-t3)] hover:text-[var(--sl-t2)]',
              )}
              style={isActive ? { borderBottomColor: mod.color, color: mod.color } : undefined}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {/* Fade mask — indica overflow à direita */}
      <div
        className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, var(--sl-s1))' }}
      />
    </div>
  )
}
