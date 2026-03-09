'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Dashboard',  href: '/dashboard' },
  { label: 'Conquistas', href: '/conquistas' },
  { label: 'Ranking',    href: '/conquistas/ranking' },
] as const

interface PanoramaMobileShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function PanoramaMobileShell({
  children,
  title,
  subtitle,
}: PanoramaMobileShellProps) {
  const router    = useRouter()
  const pathname  = usePathname()

  return (
    <div className="lg:hidden">

      {/* ── Sub-nav tabs — direto no topo, sem header de módulo acima (como protótipo) */}
      <div className="flex gap-0 px-4 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/dashboard' && tab.href !== '/conquistas' && pathname.startsWith(tab.href))

          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              className={cn(
                'px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors',
                isActive
                  ? 'text-[#6366f1] border-b-[#6366f1]'
                  : 'text-[var(--sl-t3)] border-b-transparent',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Título opcional — aparece abaixo das tabs (usado por Conquistas, Ranking) */}
      {title && (
        <div className="px-5 pt-[14px] pb-3">
          <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {children}
    </div>
  )
}
