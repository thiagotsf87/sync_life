'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { EXP_GRAD } from '@/lib/exp-colors'

interface ExpCelebrationModalProps {
  open: boolean
  onClose: () => void
  onRegisterMemory?: () => void
  tripName?: string
  xpAwarded?: number
}

export function ExpCelebrationModal({
  open,
  onClose,
  onRegisterMemory,
  tripName,
  xpAwarded = 50,
}: ExpCelebrationModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!open || !mounted) return null

  const CONFETTI_COLORS = ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#0055ff', '#f472b6']
  const confettiPieces = Array.from({ length: 18 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${(i * 5.5) % 100}%`,
    delay: `${(i * 0.07) % 0.9}s`,
    size: i % 3 === 0 ? 10 : i % 3 === 1 ? 7 : 5,
  }))

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999, background: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-[88%] max-w-[360px] rounded-[24px] p-6 text-center relative overflow-hidden"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((c, i) => (
            <div
              key={i}
              className="absolute top-0"
              style={{
                left: c.left,
                width: c.size,
                height: c.size,
                background: c.color,
                borderRadius: i % 2 === 0 ? '50%' : '2px',
                animation: `confettiFall 2.5s ${c.delay} ease-in forwards`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>

        {/* Trophy */}
        <div
          className="w-20 h-20 rounded-[24px] flex items-center justify-center text-[40px] mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))',
          }}
        >
          🏆
        </div>

        {/* Title */}
        <h3 className="font-[Syne] text-[22px] font-extrabold mb-2">
          <span style={{
            background: EXP_GRAD,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Missão Concluída!
          </span>
        </h3>

        {tripName && (
          <p className="text-[14px] text-[var(--sl-t2)] mb-3">{tripName}</p>
        )}

        {/* XP badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-[6px] rounded-[20px] mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <span className="text-[16px]">⭐</span>
          <span className="font-[DM_Mono] font-bold text-[16px]" style={{ color: '#c4b5fd' }}>
            +{xpAwarded} XP
          </span>
        </div>

        <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-[1.5]">
          Parabéns, Explorador! Registre as memórias dessa aventura épica.
        </p>

        {/* CTAs */}
        {onRegisterMemory && (
          <button
            onClick={() => { onRegisterMemory(); onClose() }}
            className="w-full rounded-[14px] h-[50px] text-[15px] font-bold text-white mb-2"
            style={{ background: EXP_GRAD }}
          >
            📝 Registrar Diário
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full h-[42px] text-[13px] text-[var(--sl-t3)]"
        >
          Depois
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(360px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>,
    document.body
  )
}
