'use client'

import { cn } from '@/lib/utils'
import { Clock, MapPin, Users, ChevronRight, CheckSquare } from 'lucide-react'

interface TripHeroProps {
  countdownDays: number
  name: string
  dates: string
  destination: string
  travelers: number
  status: string
  statusColor: string
  budget: number
  spent: number
  checklistPct: number
  onViewDetails?: () => void
  onChecklist?: () => void
  className?: string
}

export function TripHero({
  countdownDays,
  name,
  dates,
  destination,
  travelers,
  status,
  statusColor,
  budget,
  spent,
  checklistPct,
  onViewDetails,
  onChecklist,
  className,
}: TripHeroProps) {
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0

  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden relative sl-fade-up sl-delay-2',
        className,
      )}
    >
      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7, #ec4899)' }}
      />

      {/* Glow effects */}
      <div className="absolute top-[-60px] right-[-20px] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,.1) 0%, transparent 65%)' }}
      />
      <div className="absolute bottom-[-80px] left-[-40px] w-[240px] h-[240px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,.06) 0%, transparent 65%)' }}
      />

      <div className="flex items-center">
        {/* Left: Countdown */}
        <div
          className="flex flex-col items-center justify-center min-w-[160px] py-8 px-9 border-r border-[var(--sl-border)] relative"
          style={{ background: 'linear-gradient(135deg, rgba(236,72,153,.06), rgba(168,85,247,.04))' }}
        >
          <div
            className="font-[Syne] font-extrabold text-[64px] leading-none"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 12px rgba(236,72,153,.3))',
            }}
          >
            {countdownDays}
          </div>
          <div className="text-[13px] text-[var(--sl-t2)] font-bold uppercase tracking-[.14em] mt-2">
            dias
          </div>
          <div className="text-[11px] text-[var(--sl-t3)] mt-1">para decolar</div>
        </div>

        {/* Mid: Trip info */}
        <div className="flex-1 py-7 px-8">
          <div className="flex items-center gap-[10px] mb-[10px]">
            <span className="px-[10px] py-1 rounded-lg text-[10px] font-bold uppercase tracking-[.06em] bg-[rgba(236,72,153,.1)] text-[#ec4899]">
              Proxima Viagem
            </span>
          </div>
          <div className="font-[Syne] font-extrabold text-[22px] mb-2">{name}</div>
          <div className="flex items-center gap-4 text-[12.5px] text-[var(--sl-t2)] mb-4">
            <span className="flex items-center gap-[5px]">
              <Clock size={14} className="text-[#ec4899]" />
              {dates}
            </span>
            <span className="flex items-center gap-[5px]">
              <MapPin size={14} className="text-[#ec4899]" />
              {destination}
            </span>
            <span className="flex items-center gap-[5px]">
              <Users size={14} className="text-[#ec4899]" />
              {travelers} viajantes
            </span>
            <span
              className="px-[10px] py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: `${statusColor}18`, color: statusColor }}
            >
              {status}
            </span>
          </div>

          {/* Budget bar */}
          <div className="grid items-center gap-4" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
            <div>
              <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-[3px]">
                Orcamento
              </div>
              <div className="font-[DM_Mono] text-[17px] font-medium">
                R$ {budget.toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[var(--sl-t3)] mb-[5px]">
                <span>R$ {spent.toLocaleString('pt-BR')} gastos</span>
                <span className="text-[#ec4899] font-semibold">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                <div
                  className="h-full rounded-[3px] transition-[width] duration-1000"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em] mb-[3px]">
                Checklist
              </div>
              <div className="font-[DM_Mono] text-[17px] font-medium text-[#10b981]">
                {checklistPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 py-7 px-8 border-l border-[var(--sl-border)]">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-[7px] px-[22px] py-[9px] rounded-[11px] text-[12px] font-semibold bg-[#ec4899] text-white w-full hover:brightness-110 hover:-translate-y-px transition-all"
          >
            <ChevronRight size={14} /> Ver detalhes
          </button>
          <button
            onClick={onChecklist}
            className="flex items-center gap-[7px] px-[22px] py-[9px] rounded-[11px] text-[12px] font-semibold text-[var(--sl-t2)] border border-[var(--sl-border)] w-full hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            <CheckSquare size={14} /> Checklist
          </button>
        </div>
      </div>
    </div>
  )
}
