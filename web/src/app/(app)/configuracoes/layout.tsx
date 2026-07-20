'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Settings,
  User,
  Palette,
  Tags,
  Bell,
  Link2,
  Crown,
  Landmark,
} from 'lucide-react'
import { useUserPlan } from '@/hooks/use-user-plan'

interface CfgNavItem {
  id: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  href: string
  badgeKey?: 'plan'
}

const CFG_ITEMS: CfgNavItem[] = [
  { id: 'perfil',       label: 'Perfil',        Icon: User,     href: '/configuracoes' },
  { id: 'aparencia',    label: 'Aparência',     Icon: Palette,  href: '/configuracoes/aparencia' },
  { id: 'categorias',   label: 'Categorias',    Icon: Tags,     href: '/configuracoes/categorias' },
  { id: 'contas',       label: 'Contas',        Icon: Landmark, href: '/configuracoes/contas' },
  { id: 'notificacoes', label: 'Notificações',  Icon: Bell,     href: '/configuracoes/notificacoes' },
  { id: 'integracoes',  label: 'Integrações',   Icon: Link2,    href: '/configuracoes/integracoes' },
  { id: 'plano',        label: 'Plano',         Icon: Crown,    href: '/configuracoes/plano', badgeKey: 'plan' },
]

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isPro } = useUserPlan()
  const planBadge = isPro ? 'PRO' : 'FREE'

  return (
    <div className="flex gap-6">
      {/* cfg sub-nav (sidebar 240px) */}
      <aside
        className="hidden lg:flex w-[240px] shrink-0 flex-col gap-4 sticky top-0 self-start py-5"
        style={{ background: 'var(--sl-bg)' }}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2.5 px-1.5">
          <Settings size={16} className="text-[var(--sl-t2)]" />
          <span className="font-[Space_Grotesk] text-[15px] font-semibold text-[var(--sl-t1)]">
            Configurações
          </span>
        </div>

        {/* Nav items (single flat list) */}
        <nav className="flex flex-col gap-0.5">
          {CFG_ITEMS.map(({ id, label, Icon, href, badgeKey }) => {
            const isActive =
              href === '/configuracoes'
                ? pathname === '/configuracoes'
                : pathname.startsWith(href)
            const badge = badgeKey === 'plan' ? planBadge : undefined
            return (
              <Link
                key={id}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors',
                  isActive
                    ? 'bg-[var(--sl-s2)] text-[var(--sl-t1)] font-semibold'
                    : 'text-[var(--sl-t2)] font-medium hover:bg-[var(--sl-s2)]/40 hover:text-[var(--sl-t1)]',
                )}
              >
                <Icon
                  size={14}
                  className={cn(
                    'shrink-0',
                    isActive ? 'text-[var(--sl-em)]' : 'text-[var(--sl-t3)]',
                  )}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span
                    className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-md',
                      badge === 'PRO'
                        ? 'bg-[rgba(15,118,110,0.15)] text-[var(--sl-em)]'
                        : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]',
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Version footer */}
        <div
          className="mt-auto pt-3 px-1.5 text-[11px] text-[var(--sl-t4)] border-t border-[var(--sl-border)]"
        >
          SyncLife · v0.9.4
        </div>
      </aside>

      {/* cfg-content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
