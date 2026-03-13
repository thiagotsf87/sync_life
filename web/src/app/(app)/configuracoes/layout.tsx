'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { User, Palette, Bell, Tags, Link2, Crown } from 'lucide-react'
import { useUserPlan } from '@/hooks/use-user-plan'

interface CfgNavItem {
  id: string
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  href: string
  badgeKey?: 'plan'
}

const CFG_GROUPS: { label: string; items: CfgNavItem[] }[] = [
  {
    label: 'Conta',
    items: [
      { id: 'perfil',    label: 'Perfil',      Icon: User,     href: '/configuracoes' },
      { id: 'aparencia', label: 'Aparência',   Icon: Palette,  href: '/configuracoes/aparencia' },
    ],
  },
  {
    label: 'Preferências',
    items: [
      { id: 'notif', label: 'Notificações', Icon: Bell, href: '/configuracoes/notificacoes' },
      { id: 'cat', label: 'Categorias', Icon: Tags, href: '/configuracoes/categorias' },
      { id: 'integracoes', label: 'Integrações', Icon: Link2, href: '/configuracoes/integracoes' },
    ],
  },
  {
    label: 'Plano',
    items: [
      { id: 'plano', label: 'Meu Plano', Icon: Crown, href: '/configuracoes/plano', badgeKey: 'plan' },
    ],
  },
]

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isPro } = useUserPlan()

  const planBadge = isPro ? 'Pro' : 'Free'

  return (
    <div className="flex gap-7">
      {/* cfg-menu — secondary nav, desktop only */}
      <aside className="hidden lg:flex w-[200px] shrink-0 flex-col gap-0.5 sticky top-0 self-start">
        {CFG_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] px-3 pt-3 pb-1.5 first:pt-0">
              {group.label}
            </p>
            {group.items.map(({ id, label, Icon, href, badgeKey }) => {
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
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-[rgba(100,116,139,0.14)] text-[var(--sl-t1)] font-semibold'
                      : 'text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]',
                  )}
                >
                  <Icon size={15} className="shrink-0 opacity-80" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-md',
                        badge === 'Pro'
                          ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981]'
                          : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]',
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </aside>

      {/* cfg-content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
