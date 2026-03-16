'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AchievementsWidget() {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-[18px] sl-fade-up sl-delay-2 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center gap-2 mb-[14px]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,179,8,.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
        </div>
        <span className="text-[12px] font-semibold text-[var(--sl-t2)]">Conquistas Recentes</span>
      </div>
      <div className="flex gap-2.5 flex-wrap mb-4">
        {[
          { emoji: '🔥', name: '7 dias seguidos', locked: false },
          { emoji: '💚', name: 'Mês no verde', locked: false },
          { emoji: '📊', name: 'Planejador', locked: false },
          { emoji: '🏅', name: 'Meta concluída', locked: true },
          { emoji: '💎', name: '3 meses top', locked: true },
        ].map((b, i) => (
          <div key={i}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2.5 rounded-[12px] min-w-[64px]',
              'border border-[var(--sl-border)] bg-[var(--sl-s2)] cursor-pointer',
              'transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-0.5',
              b.locked && 'opacity-35 grayscale'
            )}>
            <span className="text-[22px]">{b.emoji}</span>
            <span className="text-[9px] text-[var(--sl-t3)] text-center font-medium">{b.name}</span>
          </div>
        ))}
      </div>
      <div className="p-2.5 rounded-[10px]" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)' }}>
        <div className="text-[11px] font-semibold mb-1" style={{ color: '#10b981' }}>Próxima conquista</div>
        <div className="text-[12px] text-[var(--sl-t2)]">
          🎯 Meta concluída — conclua a <strong>Reserva de Emergência</strong> para desbloquear
        </div>
        <div className="mt-2 h-1 rounded-full overflow-hidden bg-[var(--sl-s3)]">
          <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg, #10b981, #0055ff)' }} />
        </div>
      </div>
    </div>
  )
}
