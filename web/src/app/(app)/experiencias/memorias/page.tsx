'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Globe, MapPin, Star, Plus } from 'lucide-react'
import { useTripMemories, useTrips } from '@/hooks/use-experiencias'
import type { Trip } from '@/hooks/use-experiencias'
import { ModuleHeader } from '@/components/ui/module-header'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'
import { ExpMemoryFormMobile } from '@/components/experiencias/mobile/ExpMemoryFormMobile'

export default function MemoriasPage() {
  const router = useRouter()
  const [memoryFormTrip, setMemoryFormTrip] = useState<Trip | null>(null)

  const { memories, loading: memoriesLoading, reload: reloadMemories } = useTripMemories()
  const { trips } = useTrips()

  const memoriesMap = Object.fromEntries(memories.map(m => [m.trip_id, true]))
  const tripsWithoutMemory = trips.filter(t => t.status === 'completed' && !memoriesMap[t.id])

  function formatMemoryDate(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  function getMemoryText(m: typeof memories[0]): string {
    const texts = [m.favorite_moment, m.best_food, m.most_beautiful, m.lesson_learned].filter(Boolean)
    return texts[0] ?? ''
  }

  return (
    <>
      {/* Mobile */}
      <ExperienciasMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* Module Header */}
        <ModuleHeader
          icon={BookOpen}
          iconBg="rgba(236,72,153,.1)"
          iconColor="#ec4899"
          title="Memorias de Viagem"
          subtitle="Reviva suas experiencias mais marcantes"
        >
          <button
            onClick={() => router.push('/experiencias/passaporte')}
            className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] bg-transparent hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            <Globe size={16} />
            Passaporte
          </button>
        </ModuleHeader>

        {/* Content */}
        {memoriesLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[140px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            ))}
          </div>
        ) : memories.length === 0 && tripsWithoutMemory.length === 0 ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-16 text-center">
            <BookOpen size={40} className="text-[var(--sl-t3)] mx-auto mb-4" />
            <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-2">Nenhuma memoria registrada</h3>
            <p className="text-[13px] text-[var(--sl-t2)] max-w-sm mx-auto">
              Conclua viagens e registre suas memorias para construir seu diario de aventuras.
            </p>
          </div>
        ) : (
          /* Memory Timeline */
          <div className="relative pl-[40px] sl-fade-up sl-delay-2">
            {/* Vertical line */}
            <div
              className="absolute left-[15px] top-0 bottom-0 w-[2px]"
              style={{ background: 'linear-gradient(to bottom, #ec4899, #a855f7, transparent)' }}
            />

            {/* Memory entries */}
            {memories.map((m, i) => {
              const tripName = m.trip?.name ?? 'Viagem'
              const tripDest = m.trip?.destinations?.join(', ') ?? ''
              const text = getMemoryText(m)

              return (
                <div key={m.id} className="relative mb-7">
                  {/* Dot on timeline */}
                  <div
                    className="absolute w-[12px] h-[12px] rounded-full bg-[#ec4899] z-[1]"
                    style={{ left: '-33px', top: '8px', border: '3px solid var(--sl-bg)' }}
                  />

                  {/* Memory card */}
                  <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 hover:border-[var(--sl-border-h)] transition-colors">
                    <div className="text-[11px] text-[var(--sl-t3)] font-semibold uppercase tracking-[.08em] mb-2">
                      {formatMemoryDate(m.created_at)}
                    </div>
                    <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1">
                      {tripName}
                    </h3>
                    {tripDest && (
                      <div className="flex items-center gap-[6px] text-[12px] text-[var(--sl-t2)] mb-[10px]">
                        <MapPin size={12} className="text-[var(--sl-t3)]" />
                        {tripDest}
                      </div>
                    )}
                    {text && (
                      <div className="text-[13px] text-[var(--sl-t2)] leading-[1.7] italic">
                        {'\u201C'}{text}{'\u201D'}
                      </div>
                    )}

                    {/* Stars */}
                    <div className="flex gap-[2px] mt-3">
                      {Array.from({ length: 5 }, (_, si) => (
                        <Star
                          key={si}
                          size={14}
                          fill={si < m.rating ? '#f59e0b' : 'var(--sl-s3)'}
                          stroke={si < m.rating ? '#f59e0b' : 'var(--sl-t3)'}
                          strokeWidth={1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Trips without memory */}
            {tripsWithoutMemory.map(t => (
              <div key={t.id} className="relative mb-7 opacity-60">
                {/* Dot on timeline */}
                <div
                  className="absolute w-[12px] h-[12px] rounded-full bg-[var(--sl-t3)] z-[1]"
                  style={{ left: '-33px', top: '8px', border: '3px solid var(--sl-bg)' }}
                />

                {/* Empty state card */}
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] border-dashed rounded-[18px] p-8 text-center">
                  <BookOpen size={28} className="text-[var(--sl-t3)] mx-auto mb-3" />
                  <div className="text-[13px] text-[var(--sl-t3)] mb-3">
                    {t.name} ainda nao tem memoria
                  </div>
                  <button
                    onClick={() => setMemoryFormTrip(t)}
                    className="inline-flex items-center gap-[5px] px-4 py-[7px] rounded-[10px] text-[12px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] bg-transparent hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                  >
                    <Plus size={14} />
                    Adicionar Memoria
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Memory form overlay */}
      {memoryFormTrip && (
        <ExpMemoryFormMobile
          open
          onClose={() => setMemoryFormTrip(null)}
          onSaved={() => { setMemoryFormTrip(null); reloadMemories() }}
          trip={memoryFormTrip}
        />
      )}
    </>
  )
}
