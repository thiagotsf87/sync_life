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
    <div className="lg:hidden bg-[var(--sl-s1)] border-b border-[var(--sl-border)]">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto px-3 gap-1.5 py-2"
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
                'shrink-0 px-3 py-1.5 text-[12px] whitespace-nowrap rounded-full transition-all duration-150',
                isActive
                  ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981] font-semibold'
                  : 'font-medium text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]',
              )}
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
