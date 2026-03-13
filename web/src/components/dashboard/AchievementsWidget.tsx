'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AchievementsWidget() {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏆 Conquistas Recentes</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/conquistas')}>Ver todas →</button>
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
