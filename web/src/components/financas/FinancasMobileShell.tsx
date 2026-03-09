'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jornadaLabel } from '@/lib/jornada-labels'

const TABS: { label: string; key: string; href: string }[] = [
  { label: 'Dashboard', key: 'dashboard', href: '/financas' },
  { label: 'Transações', key: 'transacoes', href: '/financas/transacoes' },
  { label: 'Recorrentes', key: 'recorrentes', href: '/financas/recorrentes' },
  { label: 'Orçamentos', key: 'orcamentos', href: '/financas/orcamentos' },
  { label: 'Calendário', key: 'calendario', href: '/financas/calendario' },
  { label: 'Planejamento', key: 'planejamento', href: '/financas/planejamento' },
  { label: 'Relatórios', key: 'relatorios', href: '/financas/relatorios' },
]

const PAGE_TITLES: Record<string, { label: string; key: string }> = {
  '/financas': { label: 'Finanças', key: 'module' },
  '/financas/transacoes': { label: 'Transações', key: 'transacoes' },
  '/financas/recorrentes': { label: 'Recorrentes', key: 'recorrentes' },
  '/financas/orcamentos': { label: 'Orçamentos', key: 'orcamentos' },
  '/financas/calendario': { label: 'Calendário', key: 'calendario' },
  '/financas/planejamento': { label: 'Planejamento', key: 'planejamento' },
  '/financas/relatorios': { label: 'Relatórios', key: 'relatorios' },
}

function getPageTitle(pathname: string): string {
  for (const [path, { label, key }] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || (path !== '/financas' && pathname.startsWith(path))) {
      return jornadaLabel('financas', key, label)
    }
  }
  return jornadaLabel('financas', 'module', 'Finanças')
}

interface FinancasMobileShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  rightAction?: React.ReactNode
}

export function FinancasMobileShell({
  children,
  title,
  subtitle,
  rightAction,
}: FinancasMobileShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const pageTitle = title ?? getPageTitle(pathname)

  return (
    <div className="lg:hidden">
      {/* Header — padrão Carreira */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-3">
        <div>
          <p className="text-[12px] font-semibold text-[#a7f3d0] mb-[2px]">✦ {jornadaLabel('financas', 'module', 'Finanças')}</p>
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

      {/* Tabs below title */}
      <div className="flex gap-0 px-4 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/financas' && pathname.startsWith(tab.href))
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              className={cn(
                'px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors',
                isActive ? 'text-[var(--sl-t1)] font-semibold border-b-[#10b981]' : 'text-[var(--sl-t3)] border-b-transparent'
              )}
            >
              {jornadaLabel('financas', tab.key, tab.label)}
              {tab.href === '/financas/planejamento' && (
                <span className="ml-1 text-[8px] font-bold text-[#f59e0b] align-super">PRO</span>
              )}
            </button>
          )
        })}
      </div>

      {children}
    </div>
  )
}
