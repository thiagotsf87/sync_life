'use client'

import { useMemo, useState } from 'react'
import { BadgeCard } from './BadgeCard'
import type { UiBadge } from './types'

interface FilterOption {
  id: string
  label: string
}

interface BadgeCollectionProps {
  badges: UiBadge[]
  filters?: FilterOption[]
  defaultFilter?: string
  showLocked?: boolean
  onShowLockedChange?: (next: boolean) => void
  onBadgeClick?: (badge: UiBadge) => void
}

export function BadgeCollection({
  badges,
  filters,
  defaultFilter = 'all',
  showLocked = true,
  onShowLockedChange,
  onBadgeClick,
}: BadgeCollectionProps) {
  const [activeFilter, setActiveFilter] = useState(defaultFilter)

  // Derive default filter list from category labels when none provided
  const filterList: FilterOption[] = useMemo(() => {
    if (filters && filters.length > 0) return filters
    const seen = new Map<string, string>()
    badges.forEach((b) => {
      if (!seen.has(b.category)) seen.set(b.category, b.categoryLabel)
    })
    return [{ id: 'all', label: 'Todas' }, ...Array.from(seen, ([id, label]) => ({ id, label }))]
  }, [filters, badges])

  const filtered = useMemo(() => {
    const byCat = activeFilter === 'all' ? badges : badges.filter((b) => b.category === activeFilter)
    return showLocked ? byCat : byCat.filter((b) => b.unlocked)
  }, [badges, activeFilter, showLocked])

  return (
    <section className="flex flex-col gap-3.5">
      <header className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="font-[Syne] font-semibold text-[18px] tracking-tight text-[var(--sl-t1)] m-0">
          Coleção completa
        </h2>
        <label className="flex items-center gap-2 text-[12px] text-[var(--sl-t3)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => onShowLockedChange?.(e.target.checked)}
            className="accent-[var(--sl-em)] cursor-pointer"
          />
          Mostrar bloqueadas
        </label>
      </header>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterList.map((f) => {
          const isActive = activeFilter === f.id
          const pool = f.id === 'all' ? badges : badges.filter((b) => b.category === f.id)
          const done = pool.filter((b) => b.unlocked).length
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border text-[12px] font-medium transition-all ${
                isActive
                  ? 'border-[var(--sl-border-em)] bg-[var(--sl-em-soft)] text-[var(--sl-em)]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)]'
              }`}
            >
              {f.label}
              <span className="font-[IBM_Plex_Mono] text-[10px] opacity-70">
                {done}/{pool.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid 6 cols desktop, 4 md, 2 sm */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        {filtered.map((b) => (
          <BadgeCard key={b.id} badge={b} onClick={() => onBadgeClick?.(b)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-[13px] text-[var(--sl-t3)] py-8">
          Nenhuma conquista nessa categoria ainda.
        </div>
      )}
    </section>
  )
}
