'use client'

import { cn } from '@/lib/utils'
import { MapPin, FilePlus, Star } from 'lucide-react'

interface MemoryEntry {
  id: string
  date: string       // "Setembro 2025"
  title: string
  location: string
  text: string
  rating: number     // 0-5
}

interface MemoryTimelineProps {
  memories: MemoryEntry[]
  emptyTripName?: string
  onAddMemory?: () => void
  className?: string
}

export function MemoryTimeline({
  memories,
  emptyTripName,
  onAddMemory,
  className,
}: MemoryTimelineProps) {
  return (
    <div className={cn('relative pl-10 sl-fade-up sl-delay-1', className)}>
      {/* Timeline line */}
      <div
        className="absolute left-[15px] top-0 bottom-0 w-[2px]"
        style={{ background: 'linear-gradient(to bottom, #ec4899, #a855f7, transparent)' }}
      />

      {memories.map((mem) => (
        <div key={mem.id} className="relative mb-7">
          {/* Dot */}
          <div className="absolute left-[-33px] top-2 w-3 h-3 rounded-full bg-[#ec4899] border-[3px] border-[var(--sl-bg)] z-[1]" />

          {/* Card */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="text-[11px] text-[var(--sl-t3)] font-semibold uppercase tracking-[.08em] mb-2">
              {mem.date}
            </div>
            <div className="font-[Syne] font-bold text-[16px] mb-1">
              {mem.title}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--sl-t2)] mb-[10px]">
              <MapPin size={12} className="text-[var(--sl-t3)]" />
              {mem.location}
            </div>
            <p className="text-[13px] text-[var(--sl-t2)] leading-[1.7] italic">
              &ldquo;{mem.text}&rdquo;
            </p>
            {/* Stars */}
            <div className="flex gap-0.5 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={cn(
                    s <= mem.rating
                      ? 'fill-[#f59e0b] text-[#f59e0b]'
                      : 'fill-[var(--sl-s3)] text-[var(--sl-t3)]',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {emptyTripName && (
        <div className="relative mb-7 opacity-60">
          <div className="absolute left-[-33px] top-2 w-3 h-3 rounded-full bg-[var(--sl-t3)] border-[3px] border-[var(--sl-bg)] z-[1]" />
          <div className="bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl p-8 text-center">
            <FilePlus size={28} className="text-[var(--sl-t3)] mx-auto mb-3" />
            <div className="text-[13px] text-[var(--sl-t3)] mb-3">
              {emptyTripName} ainda nao tem memoria
            </div>
            {onAddMemory && (
              <button
                onClick={onAddMemory}
                className="px-4 py-[7px] rounded-[11px] text-[12px] font-semibold text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
              >
                Adicionar Memoria
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
