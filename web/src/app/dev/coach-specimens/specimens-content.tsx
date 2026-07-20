'use client'

import { KpiStrip, CoachWhisper, ProgressList, Timeline, Donut } from '@/components/coach'
import { KbdChip } from '@/components/ui/kbd-chip'

export function SpecimensContent() {
  return (
    <div className="mx-auto max-w-[900px] space-y-8 p-10">
      <div className="flex items-center gap-2">
        <KbdChip>⌘K</KbdChip>
        <KbdChip>⌘J</KbdChip>
        <KbdChip>?</KbdChip>
        <KbdChip>esc</KbdChip>
      </div>

      <KpiStrip
        items={[
          { label: 'Saldo', value: 'R$ 1.840', delta: '+12%', up: true },
          { label: 'Receitas', value: 'R$ 5.000', delta: '+8%', up: true },
          { label: 'Despesas', value: 'R$ 3.160', delta: '63%' },
          { label: 'Poupança', value: '37%', delta: 'meta 30%', up: true },
        ]}
      />

      <CoachWhisper bold="Você gastou 18% acima" text="da média em Lazer este mês." action="Ver categoria" variant="solid" />
      <CoachWhisper bold="Dia 28 concentra R$ 1.240" text="em despesas. Vale antecipar a reserva." />

      <div className="grid grid-cols-2 gap-5">
        <ProgressList
          title="Metas ativas"
          rows={[
            { label: 'Reserva', current: 12, target: 18, color: 'var(--sl-mod-fut)', currentLabel: 'R$ 12k', targetLabel: 'R$ 18k', check: true },
            { label: 'Sono', current: 9, target: 8, color: 'var(--sl-mod-crp)', unit: 'h', invert: true, badge: 'ATENÇÃO' },
            { label: 'Curso', current: 90, target: 100, color: 'var(--sl-mod-car)', unit: '%' },
          ]}
        />
        <Timeline
          title="Roadmap Q2"
          items={[
            { when: 'abr', title: 'Projeto Atlas', meta: 'concluído', done: true },
            { when: 'mai', title: 'Curso arquitetura', meta: '90%', current: true },
            { when: 'jun', title: 'Certificação cloud', color: 'var(--sl-mod-car)' },
          ]}
        />
      </div>

      <Donut
        title="Gastos por categoria"
        center="R$ 3.160"
        centerSub="maio"
        slices={[
          { label: 'Moradia', share: 42, color: 'var(--sl-mod-fin)' },
          { label: 'Lazer', share: 18, color: 'var(--sl-mod-exp)' },
          { label: 'Transporte', share: 22, color: 'var(--sl-mod-tmp)' },
          { label: 'Outros', share: 18, color: 'var(--sl-mod-fut)' },
        ]}
      />
    </div>
  )
}
