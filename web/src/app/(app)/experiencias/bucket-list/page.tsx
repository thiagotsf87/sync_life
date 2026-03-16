'use client'

import { MapPin } from 'lucide-react'
import { useBucketList } from '@/hooks/use-experiencias'
import { ModuleHeader } from '@/components/ui/module-header'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'
import { ExpTabBucketList } from '@/components/experiencias/mobile/ExpTabBucketList'

export default function BucketListPage() {
  const { items, loading, reload } = useBucketList()

  const totalCost = items.reduce((s, b) => s + (b.estimated_budget ?? 0), 0)
  const pending = items.filter(b => b.status === 'pending').length
  const done = items.filter(b => b.status === 'visited').length

  return (
    <>
      {/* Mobile */}
      <ExperienciasMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* Module Header */}
        <ModuleHeader
          icon={MapPin}
          iconBg="rgba(236,72,153,.1)"
          iconColor="#ec4899"
          title="Lista de Aventuras"
          subtitle={items.length > 0 ? `${pending} pendentes \u00B7 ${done} concluidas \u00B7 R$ ${totalCost.toLocaleString('pt-BR')} estimado` : 'Adicione destinos dos seus sonhos'}
        />

        {/* Content */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 max-w-[680px] sl-fade-up sl-delay-2">
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
