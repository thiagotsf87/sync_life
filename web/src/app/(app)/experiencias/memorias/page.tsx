'use client'

import { useState } from 'react'
import { useTripMemories, useTrips } from '@/hooks/use-experiencias'
import type { Trip } from '@/hooks/use-experiencias'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'
import { ExpTabMemorias } from '@/components/experiencias/mobile/ExpTabMemorias'
import { ExpMemoryFormMobile } from '@/components/experiencias/mobile/ExpMemoryFormMobile'

export default function MemoriasPage() {
  const [memoryFormTrip, setMemoryFormTrip] = useState<Trip | null>(null)

  const { memories, loading: memoriesLoading, reload: reloadMemories } = useTripMemories()
  const { trips } = useTrips()

  const memoriesMap = Object.fromEntries(memories.map(m => [m.trip_id, true]))
  const tripsWithoutMemory = trips.filter(t => t.status === 'completed' && !memoriesMap[t.id])

  const avgRating = memories.length > 0
    ? (memories.reduce((s, m) => s + m.rating, 0) / memories.length).toFixed(1)
    : null

  return (
    <>
      {/* Mobile */}
      <ExperienciasMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

        {/* Topbar */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
            📸 Diário do Explorador
          </h1>
        </div>

        {/* Jornada insight */}
        <JornadaInsight
          text={
            memories.length > 0
              ? <>Você registrou <strong className="text-[#ec4899]">{memories.length} entradas no diário</strong> com média de <strong className="text-[var(--sl-t1)]">⭐ {avgRating}</strong>. {tripsWithoutMemory.length > 0 && <>{tripsWithoutMemory.length} viagem(ns) ainda sem registro!</>}</>
              : <>Conclua viagens e registre suas memórias para construir seu diário de aventuras.</>
          }
        />

        {/* Content */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-[680px]">
          <ExpTabMemorias
            onOpenDetail={() => {}}
            memories={memories}
            loading={memoriesLoading}
            tripsWithoutMemory={tripsWithoutMemory}
            onOpenMemoryForm={setMemoryFormTrip}
          />
        </div>
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
