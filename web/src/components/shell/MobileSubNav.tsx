'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES, getActiveNavItem } from '@/lib/modules'
import { cn } from '@/lib/utils'

export function MobileSubNav() {
  const router = useRouter()
  const pathname = usePathname()
  const activeModule = useShellStore((s) => s.activeModule)

  const mod = MODULES[activeModule]
  const activeNavId = getActiveNavItem(pathname, activeModule)

  // Only show if module has more than 1 nav item
  if (mod.navItems.length <= 1) return null

  return (
    <div className="lg:hidden overflow-x-auto border-b border-[var(--sl-border)] bg-[var(--sl-s1)]">
      <div className="flex min-w-max px-4 gap-1">
        {mod.navItems.map((item) => {
          const isActive = activeNavId === item.id

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'px-3 py-2.5 text-[12px] font-medium whitespace-nowrap',
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
    </div>
  )
}
