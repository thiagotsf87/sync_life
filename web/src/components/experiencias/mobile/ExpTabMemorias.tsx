'use client'

import { useState } from 'react'
import type { TripMemory, Trip } from '@/hooks/use-experiencias'

interface ExpTabMemoriasProps {
  onOpenDetail: (memoryId: string) => void
  memories: TripMemory[]
  loading: boolean
  tripsWithoutMemory: Trip[]
  onOpenMemoryForm: (trip: Trip) => void
}

export function ExpTabMemorias({
  onOpenDetail,
  memories,
  loading,
  tripsWithoutMemory,
  onOpenMemoryForm,
}: ExpTabMemoriasProps) {
  const accentLight = '#c4b5fd'

  const registered = memories.length
  const pending = tripsWithoutMemory.length
  const avgRating = memories.length > 0
    ? (memories.reduce((s, m) => s + m.rating, 0) / memories.length).toFixed(1)
    : '—'

  // Highlights: best food, most beautiful, best learned
  const bestFood = memories.find(m => m.best_food)
  const mostBeautiful = memories.find(m => m.most_beautiful)
  const bestLesson = memories.find(m => m.lesson_learned)

  const highlights = [
    bestFood    ? { emoji: '🍝', label: bestFood.trip?.name?.split('—')[0]?.trim() ?? 'Viagem', sub: 'Melhor comida' }    : null,
    mostBeautiful ? { emoji: '📸', label: mostBeautiful.trip?.name?.split('—')[0]?.trim() ?? 'Viagem', sub: 'Lugar mais bonito' } : null,
    bestLesson  ? { emoji: '💡', label: bestLesson.trip?.name?.split('—')[0]?.trim() ?? 'Viagem', sub: 'Maior aprendizado' }  : null,
  ].filter(Boolean) as { emoji: string; label: string; sub: string }[]

  if (loading) {
    return (
      <div className="px-5">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[60px] rounded-[12px] animate-pulse" style={{ background: 'var(--sl-s2)' }} />
          ))}
        </div>
        <div className="h-[120px] rounded-[12px] animate-pulse mb-3" style={{ background: 'var(--sl-s2)' }} />
      </div>
    )
  }

  return (
    <div className="px-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-[14px]">
        {[
          { val: String(registered), label: 'Registradas' },
          { val: String(pending),    label: 'Pendentes' },
          { val: `⭐ ${avgRating}`,  label: 'Média' },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-[12px] py-[10px] px-2 text-center"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <p className="font-[DM_Mono] text-[20px] font-medium leading-none" style={{ color: accentLight }}>
              {s.val}
            </p>
            <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <>
          <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[10px]">
            Highlights
          </p>
          <div className="grid grid-cols-3 gap-2 mb-[14px]">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="rounded-[12px] py-[10px] px-2 text-center"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              >
                <div className="text-[24px] mb-1">{h.emoji}</div>
                <p className="font-[DM_Mono] text-[12px] font-medium text-[var(--sl-t1)] leading-none truncate">
                  {h.label}
                </p>
                <p className="text-[9px] text-[var(--sl-t3)] mt-[3px] leading-[1.2]">{h.sub}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Trips without memory — pending */}
      {tripsWithoutMemory.length > 0 && (
        <>
          <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[10px]">
            Missões sem diário
          </p>
          <div
            className="rounded-[12px] px-3 mb-[14px]"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            {tripsWithoutMemory.map((trip, i) => (
              <div
                key={trip.id}
                className="flex items-center gap-[10px] py-[10px]"
                style={{ borderBottom: i < tripsWithoutMemory.length - 1 ? '1px solid var(--sl-border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[20px] shrink-0"
                  style={{ background: 'var(--sl-s2)' }}>
                  ✈️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{trip.name}</p>
                  <p className="text-[11px] text-[var(--sl-t3)] mt-[2px]">{trip.end_date}</p>
                </div>
                <button
                  onClick={() => onOpenMemoryForm(trip)}
                  className="text-[10px] font-semibold px-[10px] py-1 rounded-[10px] shrink-0"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    color: '#c4b5fd',
                  }}
                >
                  📝 Registrar
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Memory list */}
      {memories.length === 0 && tripsWithoutMemory.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[36px] mb-3">📸</p>
          <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-1">
            Nenhum diário ainda
          </p>
          <p className="text-[12px] text-[var(--sl-t2)]">
            Conclua uma viagem e registre suas memórias!
          </p>
        </div>
      )}

      {memories.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-[10px]">
            <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
              Missões Registradas
            </p>
          </div>
          <div
            className="rounded-[12px] px-3 mb-4"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            {memories.map((mem, i) => (
              <div
                key={mem.id}
                className="flex items-center gap-[10px] py-[10px]"
                style={{ borderBottom: i < memories.length - 1 ? '1px solid var(--sl-border)' : 'none' }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[22px] shrink-0"
                  style={{ background: 'var(--sl-s2)' }}
                >
                  ✈️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                    ✅ {mem.trip?.name ?? 'Viagem'}
                  </p>
                  <p className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                    {mem.trip?.start_date ?? mem.created_at.slice(0, 10)} · +{mem.xp_awarded} XP
                  </p>
                  {mem.emotion_tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {mem.emotion_tags.slice(0, 3).map((tag, j) => (
                        <span
                          key={j}
                          className="text-[9px] px-[6px] py-[2px] rounded-[8px]"
                          style={{ background: 'var(--sl-s3)', color: 'var(--sl-t2)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onOpenDetail(mem.id)}
                  className="text-[12px] shrink-0"
                  style={{ color: '#f59e0b' }}
                >
                  ⭐ {mem.rating}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
