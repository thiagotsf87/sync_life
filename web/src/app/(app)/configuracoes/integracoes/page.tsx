'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { saveUserPreferences, setCachedIntegrationSettings } from '@/lib/user-preferences'

// RN-CRP-37 / RN-EXP-30 / RN-MNT-24 / RN-PTR-22 / RN-CAR-18:
// Página central de integrações opt-in entre módulos

const INTEGRATIONS_KEY = 'sl_integrations_settings'

interface IntegrationSettings {
  // Corpo
  crp_consulta_agenda: boolean   // RN-CRP-01
  crp_atividade_agenda: boolean  // RN-CRP-33
  crp_consulta_financas: boolean // RN-CRP-07
  crp_cardapio_financas: boolean // RN-CRP-25

  // Experiências
  exp_viagem_agenda: boolean     // RN-EXP-02
  exp_viagem_financas: boolean   // RN-EXP-03

  // Mente
  mnt_pomodoro_agenda: boolean   // RN-MNT-13
  mnt_trilha_financas: boolean   // RN-MNT-09

  // Patrimônio
  ptr_provento_financas: boolean // RN-PTR-12

  // Carreira
  car_salario_financas: boolean  // RN-CAR-01
  car_roadmap_futuro: boolean    // RN-CAR-17

  // Tempo
  tmp_evento_financas: boolean   // RN-TMP-09
  tmp_tarefa_futuro: boolean     // RN-TMP-12

  // Futuro
  fut_objetivo_agenda: boolean   // RN-FUT-35
  fut_viagem_futuro: boolean     // RN-EXP-08/FUT-50
}

const DEFAULT_SETTINGS: IntegrationSettings = {
  crp_consulta_agenda: true,
  crp_atividade_agenda: true,
  crp_consulta_financas: true,
  crp_cardapio_financas: true,
  exp_viagem_agenda: true,
  exp_viagem_financas: true,
  mnt_pomodoro_agenda: true,
  mnt_trilha_financas: true,
  ptr_provento_financas: true,
  car_salario_financas: true,
  car_roadmap_futuro: false,
  tmp_evento_financas: false,
  tmp_tarefa_futuro: false,
  fut_objetivo_agenda: true,
  fut_viagem_futuro: true,
}

interface IntegrationRowProps {
  from: string
  to: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function IntegrationRow({ from, to, label, description, checked, onChange }: IntegrationRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--sl-border)] last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[var(--sl-s3)] text-[var(--sl-t2)]">{from}</span>
          <span className="text-[var(--sl-t3)] text-[11px]">→</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[var(--sl-s3)] text-[var(--sl-t2)]">{to}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{label}</p>
          <p className="text-[11px] text-[var(--sl-t3)] leading-snug mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-9 h-5 rounded-full border shrink-0 mt-0.5 transition-colors',
          checked ? 'bg-[#10b981] border-[#10b981]' : 'bg-[var(--sl-s3)] border-[var(--sl-border)]'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

export default function IntegracoesPage() {
  const [settings, setSettings] = useState<IntegrationSettings>(DEFAULT_SETTINGS)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTEGRATIONS_KEY)
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    } catch (err) { console.warn('[Settings] Falha ao ler integrações do localStorage:', err) }
    isInitialLoad.current = false
  }, [])

  // Dual-write: localStorage (retrocompat/FOUC) + Supabase (multi-device)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    // Skip on initial load (just read, don't write back)
    if (isInitialLoad.current) return

    try {
      localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(settings))
    } catch (err) { console.warn('[Settings] Falha ao salvar integrações no localStorage:', err) }

    // Update in-memory cache immediately
    setCachedIntegrationSettings(settings as unknown as Record<string, boolean>)

    // Debounced write to Supabase
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        saveUserPreferences(user.id, { integration_settings: settings as unknown as Record<string, boolean> }).catch(() => {})
      }
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [settings])

  function set(key: keyof IntegrationSettings, val: boolean) {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  const groups = [
    {
      label: '🏃 Corpo',
      items: [
        { key: 'crp_consulta_agenda' as const, from: 'Corpo', to: 'Agenda', label: 'Consulta médica → Evento na Agenda', description: 'Cria automaticamente um evento de saúde na Agenda ao registrar uma consulta.' },
        { key: 'crp_atividade_agenda' as const, from: 'Corpo', to: 'Agenda', label: 'Atividade física → Evento na Agenda', description: 'Registra atividades físicas como eventos concluídos na Agenda.' },
        { key: 'crp_consulta_financas' as const, from: 'Corpo', to: 'Finanças', label: 'Custo de consulta → Transação em Finanças', description: 'Registra automaticamente o custo de consultas médicas como despesa.' },
        { key: 'crp_cardapio_financas' as const, from: 'Corpo', to: 'Finanças', label: 'Orçamento do cardápio → Transação em Finanças', description: 'Registra o orçamento alimentar semanal como despesa em Finanças.' },
      ],
    },
    {
      label: '✈️ Experiências',
      items: [
        { key: 'exp_viagem_agenda' as const, from: 'Experiências', to: 'Agenda', label: 'Viagem → Eventos de Partida/Retorno na Agenda', description: 'Cria dois eventos na Agenda (ida e volta) ao criar uma viagem.' },
        { key: 'exp_viagem_financas' as const, from: 'Experiências', to: 'Finanças', label: 'Orçamento de viagem → Transação em Finanças', description: 'Registra o orçamento total da viagem como despesa em Finanças.' },
      ],
    },
    {
      label: '📚 Mente',
      items: [
        { key: 'mnt_pomodoro_agenda' as const, from: 'Mente', to: 'Agenda', label: 'Sessão Pomodoro → Bloco de Estudo na Agenda', description: 'Registra cada sessão Pomodoro concluída como evento de estudo.' },
        { key: 'mnt_trilha_financas' as const, from: 'Mente', to: 'Finanças', label: 'Custo de trilha → Transação em Finanças', description: 'Registra o custo de cursos/trilhas de estudo como despesa educacional.' },
      ],
    },
    {
      label: '📈 Patrimônio',
      items: [
        { key: 'ptr_provento_financas' as const, from: 'Patrimônio', to: 'Finanças', label: 'Provento recebido → Receita em Finanças', description: 'Registra dividendos e rendimentos como receitas em Finanças.' },
      ],
    },
    {
      label: '💼 Carreira',
      items: [
        { key: 'car_salario_financas' as const, from: 'Carreira', to: 'Finanças', label: 'Atualização de salário → Receita em Finanças', description: 'Sincroniza atualizações de salário no perfil de carreira com a renda mensal em Finanças.' },
        { key: 'car_roadmap_futuro' as const, from: 'Carreira', to: 'Futuro', label: 'Passo de roadmap concluído → Meta no Futuro', description: 'Ao concluir um passo do roadmap, cria automaticamente uma meta concluída no módulo Futuro.' },
      ],
    },
    {
      label: '📅 Tempo',
      items: [
        { key: 'tmp_evento_financas' as const, from: 'Tempo', to: 'Finanças', label: 'Evento com custo → Transação em Finanças', description: 'Ao criar um evento com custo, registra automaticamente a despesa em Finanças.' },
        { key: 'tmp_tarefa_futuro' as const, from: 'Tempo', to: 'Futuro', label: 'Tarefa concluída → Progresso em Meta', description: 'Ao marcar uma tarefa vinculada a uma meta como concluída, atualiza o progresso da meta no Futuro.' },
      ],
    },
    {
      label: '🔮 Futuro',
      items: [
        { key: 'fut_objetivo_agenda' as const, from: 'Futuro', to: 'Agenda', label: 'Prazo de objetivo → Lembrete na Agenda', description: 'Cria um evento lembrete na data de prazo de cada objetivo criado.' },
        { key: 'fut_viagem_futuro' as const, from: 'Experiências', to: 'Futuro', label: 'Viagem criada → Sugestão de Objetivo no Futuro', description: 'Ao criar uma viagem, sugere criar um objetivo no módulo Futuro para acompanhar o progresso.' },
      ],
    },
  ]

  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl mb-1 text-sl-grad">
        Integrações
      </h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Configure quais ações em um módulo criam dados automaticamente em outros. Todas as integrações são opt-in e geram dados com a tag <strong className="text-[var(--sl-t2)]">Auto —</strong>.
      </p>

      <div className="flex flex-col gap-3">
        {groups.map(group => (
          <div key={group.label} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 hover:border-[var(--sl-border-h)] transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-3">
              {group.label}
            </p>
            {group.items.map(item => (
              <IntegrationRow
                key={item.key}
                from={item.from}
                to={item.to}
                label={item.label}
                description={item.description}
                checked={settings[item.key]}
                onChange={(v) => set(item.key, v)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl">
        <p className="text-[11px] text-[var(--sl-t3)] leading-relaxed">
          💡 <strong className="text-[var(--sl-t2)]">Como funciona:</strong> ao realizar ações nos módulos (registrar consulta, criar viagem, etc.), os itens marcados como ativos acima serão criados automaticamente. Os dados gerados ficam marcados com <strong className="text-[var(--sl-t2)]">Auto — [Módulo]</strong> para fácil identificação.
        </p>
      </div>
    </div>
  )
}
