'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { EXP_PRIMARY, EXP_GRAD } from '@/lib/exp-colors'

interface ExpUpgradeModalProps {
  open: boolean
  onClose: () => void
  feature?: string
  limitDescription?: string
}

export function ExpUpgradeModal({
  open,
  onClose,
  feature = 'este recurso',
  limitDescription,
}: ExpUpgradeModalProps) {
  const [mounted, setMounted] = useState(false)
  const accent = EXP_PRIMARY

  useEffect(() => { setMounted(true) }, [])
  if (!open || !mounted) return null

  const defaultDesc = `Você atingiu o limite de aventuras do Explorador Iniciante. Faça upgrade para desbloquear missões ilimitadas!`

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ zIndex: 99999, background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-[24px] p-6 pb-8"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--sl-s3)' }} />

        {/* Icon */}
        <div className="text-center mb-4">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center text-[32px] mx-auto mb-3"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          >
            ⚡
          </div>
          <h3 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-2">
            Limite de Explorador
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5]">
            {limitDescription ?? defaultDesc}
          </p>
        </div>

        {/* Benefits */}
        <div
          className="rounded-[14px] p-4 mb-5"
          style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
            Com o plano PRO:
          </p>
          {[
            '🚀 Missões ilimitadas',
            '🗺️ Aventuras de bucket list ilimitadas',
            '🤖 IA de sugestões avançadas',
            '📊 Relatórios detalhados de viagem',
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="text-[12px]">{b}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="w-full rounded-[14px] h-[52px] text-[15px] font-bold text-white mb-3"
          style={{ background: EXP_GRAD }}
        >
          Ver Planos PRO
        </button>
        <button
          onClick={onClose}
          className="w-full h-[44px] text-[14px] text-[var(--sl-t3)]"
        >
          Agora não
        </button>
      </div>
    </div>,
    document.body
  )
}
