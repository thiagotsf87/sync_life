'use client'

import { ArrowLeft } from 'lucide-react'
import { MODULES } from '@/lib/modules'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

interface MobileFormHeaderProps {
  /** Módulo para cor e label (ex: corpo, mente, tempo) */
  moduleId: ModuleId
  /** Título principal da tela (ex: Timer Pomodoro, Nova Atividade) */
  title: string
  /** Subtítulo opcional */
  subtitle?: string
  /** Callback ao clicar em voltar — se não informado, não mostra botão */
  onBack?: () => void
  /** Ação à direita (botão, ícone) */
  rightAction?: React.ReactNode
  /** Em contexto de modal fullscreen — ajusta padding top para safe area */
  inModal?: boolean
  className?: string
}

const MODULE_COLORS: Record<ModuleId, string> = {
  panorama: '#6B6FD4',
  financas: '#0F766E',
  futuro: '#8B7BD4',
  tempo: '#3CA0B5',
  corpo: '#D97534',
  mente: '#D9962E',
  patrimonio: '#4F88D4',
  carreira: '#DB6478',
  experiencias: '#C76795',
  conquistas: '#D9962E',
  configuracoes: '#6F7986',
}

export function MobileFormHeader({
  moduleId,
  title,
  subtitle,
  onBack,
  rightAction,
  inModal,
  className,
}: MobileFormHeaderProps) {
  const mod = MODULES[moduleId]
  const color = mod?.color ?? MODULE_COLORS[moduleId] ?? '#0F766E'

  return (
    <div
      className={cn(
        'pb-3',
        inModal ? 'pt-[env(safe-area-inset-top,14px)] px-5' : 'pt-[14px]',
        className,
      )}
    >
      {/* Linha 1: botão Voltar no topo esquerdo */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-90 mb-3"
          style={{ color }}
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>
      )}

      {/* Linha 2: título + ação à direita (sem nome do módulo) */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
        )}
      </div>
    </div>
  )
}
