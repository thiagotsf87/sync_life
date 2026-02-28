'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Crown, Sparkles, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature?: 'jornada' | 'theme'
  themeName?: string
}

const FEATURE_COPY = {
  jornada: {
    icon: Sparkles,
    title: 'Modo Jornada',
    description: 'Desbloqueie insights de IA, gamificação, reviews semanais e celebrações de progresso.',
    features: ['Insights IA personalizados', 'Life Sync Score', 'Gamificação e conquistas', 'Reviews semanais'],
  },
  theme: {
    icon: Palette,
    title: 'Temas Premium',
    description: 'Personalize o SyncLife com temas exclusivos criados para uma experiência única.',
    features: ['Obsidian — luxo discreto', 'Rosewood — elegância quente', 'Arctic — minimalismo escandinavo', 'Graphite — neutro universal', 'Twilight — criativo inovador', 'Sahara — acolhedor orgânico'],
  },
}

export function UpgradeModal({ open, onClose, feature = 'jornada', themeName }: UpgradeModalProps) {
  const router = useRouter()
  const copy = FEATURE_COPY[feature]
  const Icon = copy.icon

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={cn(
          'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-[400px] w-full shadow-2xl',
          'animate-[modalUp_0.3s_ease_both]',
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,85,255,0.15))' }}
        >
          <Icon size={24} className="text-[#10b981]" />
        </div>

        {/* Title */}
        <h3 className="font-[Syne] font-extrabold text-lg text-[var(--sl-t1)] mb-1">
          {themeName ? `Tema ${themeName}` : copy.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed mb-4">
          {copy.description}
        </p>

        {/* Feature list */}
        <div className="flex flex-col gap-2 mb-5">
          {copy.features.map((feat) => (
            <div key={feat} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[rgba(16,185,129,0.12)] flex items-center justify-center shrink-0">
                <Crown size={10} className="text-[#10b981]" />
              </div>
              <span className="text-[12px] text-[var(--sl-t2)]">{feat}</span>
            </div>
          ))}
        </div>

        {/* PRO badge */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]">
          <Crown size={14} className="text-[#f59e0b]" />
          <span className="text-[12px] font-semibold text-[var(--sl-t1)]">
            Disponivel no plano PRO
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            Depois
          </button>
          <button
            onClick={() => {
              onClose()
              router.push('/configuracoes/plano')
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
          >
            Ver planos
          </button>
        </div>
      </div>
    </div>
  )
}
