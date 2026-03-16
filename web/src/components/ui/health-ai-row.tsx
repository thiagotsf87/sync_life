'use client'

import { cn } from '@/lib/utils'
import { Sparkles, Send } from 'lucide-react'

interface Pill {
  label: string
  type: 'success' | 'warning' | 'danger' | 'info'
}

interface Insight {
  title: string
  description: string
}

interface HealthAIRowProps {
  score: number
  title: string
  pills: Pill[]
  insights: Insight[]
  accentColor?: string
  onAsk?: (question: string) => void
  className?: string
}

const PILL_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  success: { bg: 'rgba(16,185,129,.08)', text: '#10b981', icon: '\u2713' },
  warning: { bg: 'rgba(245,158,11,.08)', text: '#f59e0b', icon: '\u26A0' },
  danger: { bg: 'rgba(244,63,94,.08)', text: '#f43f5e', icon: '\u2716' },
  info: { bg: 'rgba(6,182,212,.08)', text: '#06b6d4', icon: '\u2139' },
}

export function HealthAIRow({
  score,
  title,
  pills,
  insights,
  accentColor = '#10b981',
  className,
}: HealthAIRowProps) {
  const size = 72
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const gradId = `health-ring-${score}`

  return (
    <div className={cn('grid grid-cols-[1fr_1fr] gap-3.5 sl-fade-up', 'max-lg:grid-cols-1', className)}>
      {/* Health Score */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 relative overflow-hidden transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.15)]">
        <div
          className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b"
          style={{ background: `linear-gradient(90deg, ${accentColor}, #0055ff)` }}
        />
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="shrink-0 relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0055ff" />
                </linearGradient>
              </defs>
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--sl-s3)" strokeWidth={strokeWidth} />
              <circle
                cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[DM_Mono] font-medium text-[20px] leading-none text-[var(--sl-t1)]">{score}</span>
            </div>
          </div>

          {/* Pills */}
          <div className="flex-1 min-w-0">
            <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">{title}</p>
            <div className="flex flex-wrap gap-1.5">
              {pills.map((pill, i) => {
                const s = PILL_STYLES[pill.type]
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-md text-[11px] font-semibold"
                    style={{ background: s.bg, color: s.text }}
                  >
                    <span className="text-[10px]">{s.icon}</span>
                    {pill.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights — gradient border via wrapper technique */}
      <div
        className="rounded-[19px] p-px relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.15)]"
        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,.18), rgba(0,85,255,.10))' }}
      >
        <div className="bg-[var(--sl-s1)] rounded-[18px] p-6 relative overflow-hidden">
          {/* Radial glow */}
          <div className="absolute top-[-40px] right-[-40px] w-[140px] h-[140px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(168,85,247,.06),transparent_70%)]" />

          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[#a855f7]" />
            <span className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)]">
              Insights IA
            </span>
            <span className="ml-1 px-1.5 py-[1px] rounded text-[9px] font-bold bg-[rgba(168,85,247,.12)] text-[#a855f7]">
              IA
            </span>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {insights.map((insight, i) => (
              <div key={i} className="bg-[var(--sl-s2)] rounded-xl px-3 py-2.5">
                <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-0.5">{insight.title}</p>
                <p className="text-[11px] text-[var(--sl-t2)] leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Pergunte algo..."
              className="w-full pl-3 pr-9 py-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] text-[12px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)] transition-colors"
            />
            <Send size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
