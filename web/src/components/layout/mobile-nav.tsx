'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  LayoutDashboard,
  Receipt,
  PieChart,
  FileText,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MobileNavProps {
  userName?: string
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
  { href: '/transacoes', icon: Receipt, label: 'Transações', active: true },
  { href: '#', icon: PieChart, label: 'Orçamentos', active: false, soon: true },
  { href: '#', icon: FileText, label: 'Relatórios', active: false, soon: true },
  { href: '/configuracoes', icon: Settings, label: 'Configurações', active: true },
]

export function MobileNav({ userName = 'Usuário' }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 text-slate-400 hover:text-white -ml-2">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-slate-900 border-r border-slate-800 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Logo size="md" href="/dashboard" />
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            if (!item.active) {
              return (
                <div
                  key={item.label}
                  className="nav-item flex items-center gap-3 px-6 py-3 text-slate-400 opacity-50 cursor-not-allowed"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.soon && (
                    <span className="ml-auto text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                      Em breve
                    </span>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`nav-item flex items-center gap-3 px-6 py-3 ${
                  isActive ? 'active text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-sync-400)]' : ''}`} />
                <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-sync-400)] to-[var(--color-sync-600)] rounded-full flex items-center justify-center text-white font-semibold">
              {getInitial(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500">Plano Free</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
