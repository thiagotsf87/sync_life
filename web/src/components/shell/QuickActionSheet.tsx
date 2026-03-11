'use client'

import { useRouter } from 'next/navigation'
import { X, DollarSign, CalendarPlus, Target, Dumbbell, Timer, TrendingUp, Briefcase, Plane, Repeat, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

/** Altura da barra inferior — sheet emerge do topo da barra */
const BOTTOM_BAR_HEIGHT = 68

interface QuickActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeModule: ModuleId
  /** Callback para abrir o Quick Entry de transação (quando usuário escolhe "Transação rápida" no menu) */
  onOpenQuickEntry?: () => void
}

/** Ações rápidas por módulo — navega para a tela de criação correspondente */
const MODULE_ACTIONS: Record<string, { label: string; href: string; icon: typeof DollarSign; color: string }[]> = {
  financas: [
    { label: 'Transação rápida', href: '__financas__', icon: DollarSign, color: '#10b981' },
    { label: 'Transações', href: '/financas/transacoes', icon: DollarSign, color: '#10b981' },
    { label: 'Recorrentes', href: '/financas/recorrentes', icon: Repeat, color: '#10b981' },
    { label: 'Orçamentos', href: '/financas/orcamentos', icon: PieChart, color: '#10b981' },
  ],
  tempo: [
    { label: 'Novo evento', href: '/tempo/novo', icon: CalendarPlus, color: '#06b6d4' },
    { label: 'Blocos de Foco', href: '/tempo/foco', icon: Timer, color: '#06b6d4' },
  ],
  futuro: [
    { label: 'Novo objetivo', href: '/futuro/novo', icon: Target, color: '#8b5cf6' },
  ],
  corpo: [
    { label: 'Nova atividade', href: '/corpo/atividades', icon: Dumbbell, color: '#f97316' },
    { label: 'Registrar peso', href: '/corpo/peso', icon: Dumbbell, color: '#f97316' },
  ],
  mente: [
    { label: 'Timer Foco', href: '/mente/timer', icon: Timer, color: '#eab308' },
    { label: 'Nova trilha', href: '/mente/trilhas', icon: Target, color: '#eab308' },
  ],
  patrimonio: [
    { label: 'Novo ativo', href: '/patrimonio/carteira', icon: TrendingUp, color: '#3b82f6' },
  ],
  carreira: [
    { label: 'Nova habilidade', href: '/carreira/habilidades', icon: Briefcase, color: '#f43f5e' },
  ],
  experiencias: [
    { label: 'Nova viagem', href: '/experiencias/nova', icon: Plane, color: '#ec4899' },
  ],
  panorama: [
    { label: 'Transação rápida', href: '__financas__', icon: DollarSign, color: '#10b981' },
    { label: 'Novo evento', href: '/tempo/novo', icon: CalendarPlus, color: '#06b6d4' },
    { label: 'Novo objetivo', href: '/futuro/novo', icon: Target, color: '#8b5cf6' },
  ],
  conquistas: [
    { label: 'Transação rápida', href: '__financas__', icon: DollarSign, color: '#10b981' },
    { label: 'Novo evento', href: '/tempo/novo', icon: CalendarPlus, color: '#06b6d4' },
  ],
  configuracoes: [
    { label: 'Transação rápida', href: '__financas__', icon: DollarSign, color: '#10b981' },
  ],
}

export function QuickActionSheet({ open, onOpenChange, activeModule, onOpenQuickEntry }: QuickActionSheetProps) {
  const router = useRouter()

  const actions = MODULE_ACTIONS[activeModule] ?? MODULE_ACTIONS.panorama

  const handleAction = (href: string) => {
    onOpenChange(false)
    if (href === '__financas__') {
      onOpenQuickEntry?.()
    } else {
      router.push(href)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop — fecha ao tocar fora */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 lg:hidden animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      {/* Bottom sheet — emerge do topo do MobileBottomBar, altura conforme opções */}
      <div
        className={cn(
          'fixed left-0 right-0 z-[101] lg:hidden',
          'bg-[var(--sl-s1)] border-t border-[var(--sl-border)] rounded-t-[24px]',
          'animate-in slide-in-from-bottom duration-300',
          'pb-4',
        )}
        style={{ bottom: `calc(${BOTTOM_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px))` }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-[var(--sl-s3)]" />
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">
              Ação rápida
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-[10px]
                         bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-[12px] text-[var(--sl-t3)] mb-3">
            O que deseja criar?
          </p>

          <div className="flex flex-col gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.href)}
                  className={cn(
                    'flex items-center gap-4 w-full px-4 py-3.5 rounded-[16px]',
                    'border border-[var(--sl-border)] bg-[var(--sl-s2)]',
                    'transition-colors hover:border-[var(--sl-border-h)] active:scale-[0.99]',
                  )}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0"
                    style={{ background: `${action.color}20`, color: action.color }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--sl-t1)]">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
