'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  FileText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userName?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
  { href: '/transacoes', icon: Receipt, label: 'Transações', active: true },
  { href: '#', icon: PieChart, label: 'Orçamentos', active: false, soon: true },
  { href: '#', icon: FileText, label: 'Relatórios', active: false, soon: true },
]

const accountItems = [
  { href: '/configuracoes', icon: Settings, label: 'Configurações', active: true },
]

export function Sidebar({
  userName = 'Usuário',
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
    router.refresh()
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col flex-shrink-0 h-full bg-slate-900 border-r border-slate-800 transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-slate-800 flex-shrink-0',
          collapsed ? 'justify-center p-4' : 'p-6'
        )}
      >
        <Logo size="md" href="/dashboard" showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto min-h-0">
        {!collapsed && (
          <div className="px-4 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </span>
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          if (!item.active) {
            return (
              <div
                key={item.label}
                title={collapsed ? `${item.label} (Em breve)` : undefined}
                className={cn(
                  'nav-item flex items-center text-slate-400 opacity-50 cursor-not-allowed',
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-6 py-3'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    <span className="ml-auto text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                      Em breve
                    </span>
                  </>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item flex items-center transition-colors',
                isActive ? 'text-white' : 'text-slate-400 hover:text-white',
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-6 py-3'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive && 'text-[var(--color-sync-400)]'
                )}
              />
              {!collapsed && (
                <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
              )}
            </Link>
          )
        })}

        {!collapsed && (
          <div className="px-4 mt-8 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conta
            </span>
          </div>
        )}

        {accountItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item flex items-center transition-colors',
                isActive ? 'text-white' : 'text-slate-400 hover:text-white',
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-6 py-3'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive && 'text-[var(--color-sync-400)]'
                )}
              />
              {!collapsed && (
                <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Toggle collapse button */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors',
              collapsed ? 'justify-center px-0' : 'px-3'
            )}
            title={collapsed ? 'Expandir menu' : 'Retrair menu'}
          >
            {collapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span className="text-sm font-medium">Retrair menu</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User profile - sempre visível no rodapé da sidebar */}
      <div
        className={cn(
          'flex-shrink-0 p-4 border-t border-slate-800',
          collapsed && 'flex justify-center px-2'
        )}
      >
        <div
          className={cn(
            'flex items-center rounded-xl hover:bg-slate-800/50 transition-colors',
            collapsed ? 'justify-center p-2' : 'gap-3 p-2'
          )}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-[var(--color-sync-400)] to-[var(--color-sync-600)] rounded-full flex items-center justify-center text-white font-semibold">
            {getInitial(userName)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">Plano Free</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full flex justify-center p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
