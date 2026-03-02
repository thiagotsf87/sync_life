'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, TrendingUp } from 'lucide-react'

interface ModuleScore {
  id: string
  emoji: string
  label: string
  score: number | null
  note?: string
}

const MODULE_SCORES: ModuleScore[] = [
  { id: 'financas',     emoji: '💰', label: 'Finanças',   score: 84 },
  { id: 'tempo',        emoji: '⏳', label: 'Tempo',       score: 61 },
  { id: 'futuro',       emoji: '🔮', label: 'Futuro',      score: 58 },
  { id: 'corpo',        emoji: '🏃', label: 'Corpo',       score: null, note: 'Ative no v3' },
  { id: 'mente',        emoji: '🧠', label: 'Mente',       score: null, note: 'Ative no v3' },
  { id: 'patrimonio',   emoji: '📈', label: 'Patrimônio',  score: null, note: 'Ative no v3' },
  { id: 'carreira',     emoji: '💼', label: 'Carreira',    score: null, note: 'Ative no v3' },
  { id: 'experiencias', emoji: '✈️', label: 'Experiências',score: null, note: 'Ative no v3' },
]

const LIFE_SCORE = 72
const DELTA      = '+4'

function ScoreRing({ score }: { score: number }) {
  const size  = 180
  const sw    = 14
  const r     = (size / 2) - sw
  const circ  = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const gradId = 'score-grad'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0055ff" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--sl-s3)" strokeWidth={sw} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#${gradId})`} strokeWidth={sw} strokeLinecap="round"
          style={{
            strokeDasharray: circ,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[Syne] font-extrabold text-[52px] leading-none text-sl-grad">
          {score}
        </span>
        <span className="text-[11px] text-[var(--sl-t3)] uppercase tracking-widest">de 100</span>
      </div>
    </div>
  )
}

function ModuleBar({ mod }: { mod: ModuleScore }) {
  const pct = mod.score ?? 0
  const barColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2 w-[110px] shrink-0">
        <span className="text-base">{mod.emoji}</span>
        <span className="text-[12px] font-medium text-[var(--sl-t2)]">{mod.label}</span>
      </div>
      {mod.score !== null ? (
        <>
          <div className="flex-1 h-2 bg-[var(--sl-s3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: `${mod.score}%`, background: barColor }}
            />
          </div>
          <span className="text-[12px] font-[DM_Mono] font-medium text-[var(--sl-t1)] w-8 text-right shrink-0">
            {mod.score}%
          </span>
        </>
      ) : (
        <>
          <div className="flex-1 h-2 bg-[var(--sl-s3)] rounded-full" />
          <span className="text-[10px] text-[var(--sl-t3)] shrink-0">{mod.note}</span>
        </>
      )}
    </div>
  )
}

export default function LifeScorePage() {
  const router = useRouter()
  const activeModules = MODULE_SCORES.filter(m => m.score !== null)
  const lowestModule  = [...activeModules].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]

  return (
    <div className="max-w-[520px] mx-auto px-4 py-6 pb-32">

      {/* Back header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--sl-s2)] text-[var(--sl-t2)]"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)]">Life Score</h1>
      </div>

      {/* Score hero */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-3xl p-6 mb-5 flex flex-col items-center gap-3 sl-fade-up">
        <ScoreRing score={LIFE_SCORE} />
        <div className="flex items-center gap-2 text-[13px] text-[#10b981] font-medium">
          <TrendingUp size={15} />
          <span>{DELTA} pontos esta semana · Melhor semana do mês!</span>
        </div>
      </div>

      {/* Por módulo */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-5 py-4 mb-5 sl-fade-up sl-delay-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
          Por Módulo
        </p>
        {MODULE_SCORES.map(mod => (
          <ModuleBar key={mod.id} mod={mod} />
        ))}
      </div>

      {/* Dica IA */}
      {lowestModule && (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0">🎯</span>
            <div>
              <p className="text-[12px] font-bold text-[var(--sl-t1)] mb-1">Como melhorar</p>
              <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
                Seu módulo{' '}
                <strong className="text-[var(--sl-t1)]">{lowestModule.label}</strong>
                {' '}está em {lowestModule.score}%. Dedique 15 minutos hoje para{' '}
                {lowestModule.id === 'tempo' ? 'agendar a revisão semanal toda segunda e' : 'acessar este módulo e'}
                {' '}adicionar{' '}
                <strong className="text-[#10b981]">+8 pontos</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
