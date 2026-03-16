'use client'

import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Car, Compass, Home, BookOpen,
  Utensils, Heart, Smartphone, Briefcase, Dumbbell, Shirt,
  Gift, Music, Gamepad2, Wallet, Package
} from 'lucide-react'
import { fmt, getBudgetColor } from '@/components/dashboard/dashboard-utils'
import { type LucideIcon } from 'lucide-react'

interface BudgetItem {
  id: string
  category: { icon?: string; name?: string; color?: string } | null
  amount: number
  gasto: number
  pct: number
}

export interface BudgetsWidgetProps {
  budgets: BudgetItem[]
  loading: boolean
}

const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  'alimentação': { icon: Utensils, color: '#10b981' },
  'alimentacao': { icon: Utensils, color: '#10b981' },
  'mercado': { icon: ShoppingCart, color: '#10b981' },
  'transporte': { icon: Car, color: '#06b6d4' },
  'lazer': { icon: Compass, color: '#f43f5e' },
  'moradia': { icon: Home, color: '#a855f7' },
  'educação': { icon: BookOpen, color: '#3b82f6' },
  'educacao': { icon: BookOpen, color: '#3b82f6' },
  'saúde': { icon: Heart, color: '#f97316' },
  'saude': { icon: Heart, color: '#f97316' },
  'tecnologia': { icon: Smartphone, color: '#6366f1' },
  'trabalho': { icon: Briefcase, color: '#64748b' },
  'fitness': { icon: Dumbbell, color: '#f97316' },
  'vestuário': { icon: Shirt, color: '#ec4899' },
  'vestuario': { icon: Shirt, color: '#ec4899' },
  'presentes': { icon: Gift, color: '#f59e0b' },
  'assinaturas': { icon: Music, color: '#a855f7' },
  'entretenimento': { icon: Gamepad2, color: '#f43f5e' },
  'investimentos': { icon: Wallet, color: '#3b82f6' },
}

function getCategoryIcon(name?: string): { Icon: LucideIcon; color: string } {
  if (!name) return { Icon: Package, color: '#6e90b8' }
  const key = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const match = CATEGORY_ICON_MAP[key]
  if (match) return { Icon: match.icon, color: match.color }
  // Partial match
  for (const [k, v] of Object.entries(CATEGORY_ICON_MAP)) {
    if (key.includes(k) || k.includes(key)) return { Icon: v.icon, color: v.color }
  }
  return { Icon: Package, color: '#6e90b8' }
}

export function BudgetsWidget({ budgets, loading }: BudgetsWidgetProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-2 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-[9px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
          Orçamentos
        </span>
        <button className="text-[12px] font-medium text-[#6366f1] hover:opacity-70 transition-opacity cursor-pointer"
          onClick={() => router.push('/financas/orcamentos')}>{budgets.length} categorias</button>
      </div>
      {loading
        ? <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}</div>
        : budgets.length === 0
          ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-6">Nenhum orçamento configurado</p>
          : (
            <div className="flex flex-col">
              {budgets.slice(0, 5).map((b, idx) => {
                const color = getBudgetColor(b.pct)
                const catName = b.category?.name ?? 'Categoria'
                const catColor = b.category?.color
                const { Icon, color: iconColor } = getCategoryIcon(catName)
                const effectiveColor = catColor || iconColor
                return (
                  <div key={b.id} className="flex items-center gap-2.5 py-2" style={idx < budgets.slice(0, 5).length - 1 ? { borderBottom: '1px solid rgba(120,165,220,.04)' } : undefined}>
                    <div
                      className="w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${effectiveColor}1a` }}
                    >
                      <Icon size={12} style={{ color: effectiveColor }} />
                    </div>
                    <span className="text-[12px] text-[var(--sl-t1)] w-[85px] shrink-0">{catName}</span>
                    <div className="flex-1 h-1 bg-[var(--sl-s3)] rounded-[2px] overflow-hidden">
                      <div className="h-full rounded-[2px] transition-[width] duration-700"
                        style={{ width: `${Math.min(b.pct, 100)}%`, background: color }} />
                    </div>
                    <span className="font-[DM_Mono] text-[11px] font-medium w-[36px] text-right" style={{ color }}>{b.pct}%</span>
                    <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-[100px] text-right">
                      {fmt(b.gasto)} / {fmt(b.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
