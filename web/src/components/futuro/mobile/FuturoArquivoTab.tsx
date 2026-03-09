'use client'

import { useState } from 'react'
import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT, FUTURO_PRIMARY_BG } from '@/lib/futuro-colors'
import { MOCK_ARCHIVED } from '@/lib/futuro-mock-data'

type FilterTab = 'all' | 'completed' | 'paused'

interface FuturoArquivoTabProps {
  onResume?: (id: string) => void
  onArchive?: (id: string) => void
}

export function FuturoArquivoTab({ onResume, onArchive }: FuturoArquivoTabProps) {
  const [filter, setFilter] = useState<FilterTab>('all')

  const completedCount = MOCK_ARCHIVED.filter(o => o.status === 'completed').length
  const totalXp = MOCK_ARCHIVED.reduce((sum, o) => sum + (o.xpEarned ?? 0), 0)

  const filtered = MOCK_ARCHIVED.filter(o => {
    if (filter === 'all') return true
    return o.status === filter
  })

  return (
    <div>
      {/* Banner */}
      <div
        className="mx-4 mb-[14px] p-[13px_15px] rounded-[16px] flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(16,185,129,0.08))',
          border: '1px solid rgba(139,92,246,0.25)',
        }}
      >
        <div className="text-[30px]">🏆</div>
        <div>
          <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
            {completedCount} missões épicas concluídas
          </p>
          <p className="text-[12px] text-[var(--sl-t2)] mt-[3px]">
            R$ 42.400 acumulados · <span style={{ color: FUTURO_PRIMARY_LIGHT }}>+{totalXp} XP ganhos</span>
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 px-4 pb-3 flex-wrap">
        {(['all', 'completed', 'paused'] as FilterTab[]).map(tab => {
          const labels = { all: 'Todos', completed: 'Concluídos', paused: 'Pausados' }
          const isActive = filter === tab
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3 py-[5px] rounded-[20px] text-[11px] font-medium transition-colors"
              style={{
                background: isActive ? FUTURO_PRIMARY_BG : 'var(--sl-s2)',
                border: isActive
                  ? '1px solid rgba(139,92,246,0.3)'
                  : '1px solid var(--sl-border)',
                color: isActive ? FUTURO_PRIMARY_LIGHT : 'var(--sl-t2)',
              }}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      {filtered.map(obj => (
        <div
          key={obj.id}
          className="mx-4 mb-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px] relative overflow-hidden"
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: obj.status === 'completed'
                ? 'linear-gradient(90deg, #10b981, #10b981)'
                : 'var(--sl-t3)',
            }}
          />

          {/* Header */}
          <div className="flex items-center gap-[11px] mb-[10px]">
            <div
              className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[20px]"
              style={{ background: obj.iconBg }}
            >
              {obj.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
                {obj.jornadaName}
              </p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-[1px]">{obj.dateRange}</p>
            </div>
            <span
              className="text-[10px] font-bold self-start pt-[2px]"
              style={{ color: obj.status === 'completed' ? '#10b981' : 'var(--sl-t3)' }}
            >
              {obj.status === 'completed'
                ? '✓ Épico'
                : '⏸ Pausado'
              }
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {obj.stats.map((stat, i) => (
              <div key={i}>
                <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-[0.5px] mb-[2px]">{stat.label}</p>
                <p className="font-[DM_Mono] text-[12px] font-medium" style={{ color: stat.color ?? 'var(--sl-t2)' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress bar for completed */}
          {obj.status === 'completed' && (
            <div className="mt-2 h-[5px] rounded-full overflow-hidden bg-[var(--sl-s3)]">
              <div className="h-full rounded-full" style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #10b981)' }} />
            </div>
          )}

          {/* XP badge */}
          {obj.xpEarned && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]">
                ✦ +{obj.xpEarned} XP{obj.levelUnlocked ? ` · ${obj.levelUnlocked}` : ' ganhos nesta missão'}
              </span>
            </div>
          )}

          {/* Paused actions */}
          {obj.status === 'paused' && (
            <div className="flex gap-2 mt-[10px]">
              <button
                onClick={() => onResume?.(obj.id)}
                className="flex-1 py-[7px] rounded-[10px] text-[11px] font-semibold text-[var(--sl-t1)] bg-[var(--sl-s2)] border border-[var(--sl-border-h)]"
              >
                Retomar
              </button>
              <button
                onClick={() => onArchive?.(obj.id)}
                className="flex-1 py-[7px] rounded-[10px] text-[11px] font-semibold text-[var(--sl-t1)] bg-[var(--sl-s2)] border border-[var(--sl-border-h)]"
              >
                Arquivar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
