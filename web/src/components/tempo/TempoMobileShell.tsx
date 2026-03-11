'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Search, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jornadaLabel } from '@/lib/jornada-labels'

const TABS: { label: string; key: string; href: string; pro?: boolean }[] = [
  { label: 'Dashboard', key: 'dashboard', href: '/tempo' },
  { label: 'Agenda',    key: 'agenda',    href: '/tempo/agenda' },
  { label: 'Semanal',   key: 'semanal',   href: '/tempo/semanal' },
  { label: 'Mensal',    key: 'mensal',    href: '/tempo/mensal' },
  { label: 'Review',    key: 'review',    href: '/tempo/review', pro: true },
  { label: 'Foco',      key: 'foco',      href: '/tempo/foco', pro: true },
]

const PAGE_TITLES: Record<string, string> = {
  '/tempo':         'Tempo',
  '/tempo/agenda':  'Agenda',
  '/tempo/semanal': 'Semanal',
  '/tempo/mensal':  'Mensal',
  '/tempo/review':  'Review',
  '/tempo/foco':    'Foco',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || (path !== '/tempo' && pathname.startsWith(path))) return title
  }
  return 'Tempo'
}

interface TempoMobileShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  rightAction?: React.ReactNode
}

export function TempoMobileShell({
  children,
  title,
  subtitle,
  rightAction,
}: TempoMobileShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const rawTitle = title ?? getPageTitle(pathname)
  const pageTitle = jornadaLabel('tempo', rawTitle.toLowerCase(), rawTitle)

  return (
    <div className="lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-3">
        <div>
          <p className="text-[12px] font-semibold text-[#06b6d4] mb-[2px]">✦ {jornadaLabel('tempo', 'module', 'Tempo')}</p>
          <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            {pageTitle}
          </h1>
          {subtitle && <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{subtitle}</p>}
        </div>
        {rightAction ?? (
          <button
            type="button"
            aria-label="Buscar"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
          >
            <Search size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-4 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/tempo' && pathname.startsWith(tab.href))
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              className={cn(
                'px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors',
                isActive ? 'text-[var(--sl-t1)] font-semibold border-b-[#06b6d4]' : 'text-[var(--sl-t3)] border-b-transparent'
              )}
            >
              {jornadaLabel('tempo', tab.key, tab.label)}
              {tab.pro && (
                <Crown size={8} className="ml-1 inline text-[#f59e0b] align-super" />
              )}
            </button>
          )
        })}
      </div>

      {children}
    </div>
  )
}
