'use client'

import { useRouter } from 'next/navigation'
import { LifeMapRadar } from '@/components/futuro/LifeMapRadar'
import type { LifeDimension } from '@/hooks/use-life-map'

export interface LifeMapWidgetProps {
  lifeDimensions: LifeDimension[]
  realScore: number
  lifeLoading: boolean
}

export function LifeMapWidget({ lifeDimensions, realScore, lifeLoading }: LifeMapWidgetProps) {
  const router = useRouter()

  return (
    <div className="mt-4">
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up
                      hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🗺️ Mapa da Vida</h3>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Equilíbrio entre todas as dimensões da sua vida</p>
          </div>
          <button
            onClick={() => router.push('/futuro')}
            className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          >
            Ver detalhes →
          </button>
        </div>
        <LifeMapRadar
          dimensions={lifeDimensions}
          overallScore={realScore}
          loading={lifeLoading}
          compact
        />
      </div>
    </div>
  )
}
