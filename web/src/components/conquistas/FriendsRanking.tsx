'use client'

import { ArrowRight } from 'lucide-react'

export interface RankingEntry {
  position: number
  name:     string
  level:    number
  xp:       number
  isYou?:   boolean
}

interface FriendsRankingProps {
  entries: RankingEntry[]
  title?:  string
  onSeeAll?: () => void
}

export function FriendsRanking({
  entries,
  title = 'Amigos',
  onSeeAll,
}: FriendsRankingProps) {
  return (
    <article className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px]">
      <header className="flex justify-between items-baseline mb-4">
        <h3 className="font-[Syne] font-semibold text-[16px] tracking-tight text-[var(--sl-t1)] m-0">
          {title}
        </h3>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[12px] text-[var(--sl-em)] inline-flex items-center gap-1 cursor-pointer hover:underline"
          >
            Ranking completo <ArrowRight size={11} />
          </button>
        )}
      </header>

      <ul className="flex flex-col gap-2">
        {entries.map((p) => (
          <li
            key={`${p.position}-${p.name}`}
            className="flex items-center gap-3 px-3 py-[10px] rounded-[12px]"
            style={{
              background: p.isYou ? 'var(--sl-em-soft)' : 'transparent',
              border: `1px solid ${p.isYou ? 'var(--sl-border-em)' : 'transparent'}`,
            }}
          >
            <div
              className="sl-num-strong w-6 text-[13px] text-center shrink-0"
              style={{
                color: p.position === 1 ? 'var(--sl-gold)' : 'var(--sl-t3)',
              }}
            >
              #{p.position}
            </div>
            <div
              className="w-8 h-8 rounded-full shrink-0 inline-flex items-center justify-center font-[Syne] font-bold text-[13px]"
              style={{
                background: p.isYou ? 'var(--sl-em)' : 'var(--sl-s3)',
                color: p.isYou ? '#0B0F14' : 'var(--sl-t1)',
              }}
            >
              {initialsOf(p.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[13px] truncate"
                style={{
                  color: 'var(--sl-t1)',
                  fontWeight: p.isYou ? 600 : 500,
                }}
              >
                {p.name}
              </div>
              <div className="sl-num text-[10.5px] text-[var(--sl-t3)]">Nível {p.level}</div>
            </div>
            <div
              className="sl-num-strong text-[14px] shrink-0"
              style={{ color: p.isYou ? 'var(--sl-em)' : 'var(--sl-t1)' }}
            >
              {p.xp.toLocaleString('pt-BR')}{' '}
              <span className="text-[10px] font-normal text-[var(--sl-t4)]">SuperPaws</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
