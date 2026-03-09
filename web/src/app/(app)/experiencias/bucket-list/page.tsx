'use client'

import { cn } from '@/lib/utils'
import { useBucketList } from '@/hooks/use-experiencias'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'
import { ExpTabBucketList } from '@/components/experiencias/mobile/ExpTabBucketList'

export default function BucketListPage() {
  const { items, loading, reload } = useBucketList()

  const totalCost = items.reduce((s, b) => s + (b.estimated_budget ?? 0), 0)
  const pending = items.filter(b => b.status === 'pending').length

  return (
    <>
      {/* Mobile */}
      <ExperienciasMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

        {/* Topbar */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
            🗺️ Lista de Aventuras
          </h1>
        </div>

        {/* Jornada insight */}
        <JornadaInsight
          text={
            items.length > 0
              ? <>Você tem <strong className="text-[#ec4899]">{pending} aventuras pendentes</strong> com custo total estimado de <strong className="text-[var(--sl-t1)]">R$ {totalCost.toLocaleString('pt-BR')}</strong>.</>
              : <>Adicione destinos dos seus sonhos e transforme-os em viagens reais!</>
          }
        />

        {/* Content */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-[680px]">
          <ExpTabBucketList
            items={items}
            loading={loading}
            onReload={reload}
          />
        </div>
      </div>
    </>
  )
}
