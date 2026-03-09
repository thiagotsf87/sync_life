'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT, FUTURO_GRAD } from '@/lib/futuro-colors'
import { CoachCard } from '@/components/futuro/mobile/CoachCard'
import { ScenarioCard } from '@/components/futuro/mobile/ScenarioCard'

interface FuturoSimuladorMobileProps {
  objectiveName: string
  open: boolean
  onClose: () => void
  onApply?: (scenarioId: string) => void
}

const SCENARIOS = [
  {
    id: 'cut',
    icon: '✂️',
    iconBg: 'rgba(16,185,129,0.12)',
    name: 'Cortar gastos',
    tag: 'Menor sacrifício',
    tagColor: '#10b981',
    description: 'Reduzir Lazer R$ 120 + Assinaturas R$ 80 = R$ 200 extras/mês. Baixíssimo impacto.',
    stats: [
      { label: 'Novo prazo', value: 'Dez 2028 ✓', color: '#10b981' },
      { label: 'Esforço', value: '+R$ 200/mês' },
      { label: 'Impacto', value: 'Baixo', color: '#10b981' },
    ],
    lifeScoreImpact: 'Life Score Futuro: 58 → 66 pts em 3 meses',
  },
  {
    id: 'income',
    icon: '📈',
    iconBg: 'rgba(244,63,94,0.12)',
    name: 'Aumentar renda',
    tag: 'Requer esforço em Carreira',
    tagColor: '#f43f5e',
    description: 'Renda extra de R$ 400/mês. Mais esforço, aceleração maior.',
    stats: [
      { label: 'Novo prazo', value: 'Nov 2028 ✓', color: '#10b981' },
      { label: 'Renda extra', value: '+R$ 400/mês' },
      { label: 'Impacto', value: 'Médio', color: '#f59e0b' },
    ],
    lifeScoreImpact: 'Life Score Futuro: 58 → 72 pts em 3 meses',
  },
  {
    id: 'adjust',
    icon: '📅',
    iconBg: 'rgba(110,144,184,0.1)',
    name: 'Ajustar prazo',
    tag: 'Sem mudanças',
    tagColor: 'var(--sl-t3)',
    description: 'Continuar com R$ 800/mês e aceitar Fev 2029.',
    stats: [
      { label: 'Novo prazo', value: 'Fev 2029', color: '#f59e0b' },
      { label: 'Mudança', value: 'Nenhuma' },
      { label: 'Impacto', value: 'Zero', color: '#10b981' },
    ],
    lifeScoreImpact: 'Life Score Futuro: 58 → 60 pts em 3 meses',
  },
]

export function FuturoSimuladorMobile({ objectiveName, open, onClose, onApply }: FuturoSimuladorMobileProps) {
  const [selected, setSelected] = useState('cut')

  if (!open) return null

  const selectedScenario = SCENARIOS.find(s => s.id === selected)

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col overflow-y-auto lg:hidden">
      {/* Back header */}
      <div className="flex items-center gap-2 px-5 pt-[11px] pb-2">
        <button
          onClick={onClose}
          className="flex items-center gap-[5px] text-[13px] font-semibold"
          style={{ color: FUTURO_PRIMARY_LIGHT }}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          {objectiveName.replace('Comprar ', '')}
        </button>
      </div>

      {/* Coach intro */}
      <CoachCard
        label="Coach Sync — Simulador"
        message={
          <>Analisei sua vida e <strong>encontrei 3 formas</strong> de recuperar esses 2 meses. Cada caminho tem impacto diferente no seu Life Score.</>
        }
      />

      {/* Title */}
      <div className="px-5 pb-[11px]">
        <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[2px]">
          3 caminhos para sua missão
        </p>
        <p className="text-[12px] text-[var(--sl-t2)]">
          IA recomenda o Caminho A:
        </p>
      </div>

      {/* Scenario cards */}
      <div className="flex-1">
        {SCENARIOS.map((scenario, i) => (
          <ScenarioCard
            key={scenario.id}
            icon={scenario.icon}
            iconBg={scenario.iconBg}
            name={scenario.name}
            tag={scenario.tag}
            tagColor={scenario.tagColor}
            description={scenario.description}
            stats={scenario.stats}
            selected={selected === scenario.id}
            isRecommended={i === 0}
            lifeScoreImpact={scenario.lifeScoreImpact}
            onSelect={() => setSelected(scenario.id)}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={() => onApply?.(selected)}
          className="w-full h-[50px] rounded-[14px] text-[14px] font-semibold text-white"
          style={{ background: FUTURO_GRAD }}
        >
          {`Aplicar: ${selectedScenario?.name ?? ''} → +8 pts`}
        </button>
      </div>
    </div>
  )
}
