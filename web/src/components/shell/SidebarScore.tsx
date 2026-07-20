'use client'

import { useEffect, useState } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { useScoreEngine } from '@/hooks/use-score-engine'
import { useXP } from '@/hooks/use-xp'
import { useBudgets } from '@/hooks/use-budgets'
import { fmtBRL, fmtDelta } from '@/lib/format/currency'
import type { ModuleId } from '@/types/shell'
import type { ModuleKey } from '@/lib/score-utils'

// ─── PURE PRESENTATIONAL COMPONENT ────────────────────────────────────────────

interface SidebarScoreProps {
  eyebrow: string
  value:   string | number
  delta?:  string
  color?:  string
  /** progress 0-100, used only when score-like (Panorama/Conquistas/per-module score) */
  progress?: number
}

function SidebarScoreView({ eyebrow, value, delta, color, progress }: SidebarScoreProps) {
  return (
    <div className="sl-sb-score mx-3 mb-3 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
        {eyebrow}
      </p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className="sl-num-strong text-2xl leading-none"
          style={{ color: color ?? 'var(--sl-t1)' }}
        >
          {value}
        </span>
        {delta && (
          <span className="text-[11px] text-[var(--sl-t3)]">{delta}</span>
        )}
      </div>
      {typeof progress === 'number' && (
        <div className="mt-2 h-[5px] w-full rounded-full bg-[var(--sl-s3)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
              background: 'linear-gradient(90deg, #0F766E, #0B2D34)',
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── MODULE → PROPS MAP ───────────────────────────────────────────────────────

const MODULE_COLOR: Record<ModuleId, string> = {
  panorama:      'var(--sl-em)',
  financas:      'var(--sl-em)',          // Verde Esmeralda
  futuro:        '#8B7BD4',
  tempo:         '#3CA0B5',
  corpo:         '#D97534',
  mente:         '#D9962E',
  patrimonio:    '#4F88D4',
  carreira:      '#DB6478',
  experiencias:  '#C76795',
  conquistas:    'var(--sl-em)',
  configuracoes: 'var(--sl-t1)',
}

const MODULE_TO_SCORE_KEY: Partial<Record<ModuleId, ModuleKey>> = {
  financas:     'financas',
  futuro:       'futuro',
  tempo:        'tempo',
  corpo:        'corpo',
  mente:        'mente',
  patrimonio:   'patrimonio',
  carreira:     'carreira',
  experiencias: 'experiencias',
}

// ─── CONTAINER: derives props per active module ───────────────────────────────

export function SidebarScore() {
  const activeModule = useShellStore((s) => s.activeModule)

  // configurações: hide entirely
  if (activeModule === 'configuracoes') return null

  if (activeModule === 'financas')   return <FinancasScore />
  if (activeModule === 'conquistas') return <ConquistasScore />

  // Panorama + all other modules → score-engine derived
  return <PanoramaOrModuleScore module={activeModule} />
}

// ─── Panorama / generic module score ──────────────────────────────────────────

function PanoramaOrModuleScore({ module }: { module: ModuleId }) {
  const { result, loading } = useScoreEngine()

  if (loading || !result) return null

  // Panorama → total LIFE SYNC SCORE
  if (module === 'panorama') {
    return (
      <SidebarScoreView
        eyebrow="LIFE SYNC SCORE"
        value={Math.round(result.total)}
        delta={result.label}
        color="var(--sl-em)"
        progress={result.total}
      />
    )
  }

  // Other modules → their own component score
  const key = MODULE_TO_SCORE_KEY[module]
  if (!key) return null
  const mod = result.modules.find((m) => m.module === key)
  if (!mod) return null

  return (
    <SidebarScoreView
      eyebrow="SCORE DO MÓDULO"
      value={Math.round(mod.score)}
      delta={`peso ${Math.round(mod.weight * 100)}%`}
      color={MODULE_COLOR[module]}
      progress={mod.score}
    />
  )
}

// ─── Finanças → saldo do mês ──────────────────────────────────────────────────

function FinancasScore() {
  const today = new Date()
  const { receitasMes, totalDespesas, isLoading } = useBudgets({
    month: today.getMonth() + 1,
    year:  today.getFullYear(),
  })

  // Previous month balance comparison
  const [prevBalance, setPrevBalance] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchPrev() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient() as any
        const { data: { user } } = await sb.auth.getUser()
        if (!user || cancelled) return

        const prev = new Date()
        prev.setMonth(prev.getMonth() - 1)
        const start = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-01`
        const end   = new Date(prev.getFullYear(), prev.getMonth() + 1, 0).toISOString().slice(0, 10)

        const { data } = await sb
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id)
          .eq('is_future', false)
          .gte('date', start)
          .lte('date', end)

        if (cancelled || !data) return
        let inc = 0, exp = 0
        for (const t of data as { amount: number; type: string }[]) {
          if (t.type === 'income')  inc += t.amount
          if (t.type === 'expense') exp += t.amount
        }
        setPrevBalance(inc - exp)
      } catch {
        // silent
      }
    }
    fetchPrev()
    return () => { cancelled = true }
  }, [])

  if (isLoading) return null

  const saldo = receitasMes - totalDespesas
  const deltaVsPrev = prevBalance !== null ? saldo - prevBalance : null

  return (
    <SidebarScoreView
      eyebrow="SALDO DO MÊS"
      value={fmtBRL(saldo, { compact: Math.abs(saldo) >= 10000 })}
      delta={deltaVsPrev !== null ? `${fmtDelta(deltaVsPrev, 'brl')} vs mês passado` : undefined}
      color={saldo >= 0 ? 'var(--sl-em)' : 'var(--sl-danger)'}
    />
  )
}

// ─── Conquistas → nível + XP ──────────────────────────────────────────────────

function ConquistasScore() {
  const { level, totalXP, loading } = useXP()
  if (loading) return null
  return (
    <SidebarScoreView
      eyebrow="NÍVEL"
      value={level}
      delta={`${totalXP.toLocaleString('pt-BR')} SuperPaws`}
      color="var(--sl-em)"
    />
  )
}
