'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Clock,
  Target,
  Activity,
  Brain,
  Briefcase,
} from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'
import { TextField } from '@/components/ui/text-field'
import { SectionHeader } from '@/components/ui/section-header'

type ModuleId =
  | 'financas'
  | 'tempo'
  | 'futuro'
  | 'corpo'
  | 'mente'
  | 'carreira'

const MODULES: ReadonlyArray<{
  value: ModuleId
  Icon: typeof Wallet
  color: string
  name: string
  desc: string
  bg: string
}> = [
  { value: 'financas', Icon: Wallet,    color: '#0F766E', name: 'Finanças', desc: 'Despesas, orçamento, planejamento', bg: 'rgba(15,118,110,0.15)' },
  { value: 'tempo',    Icon: Clock,     color: '#3CA0B5', name: 'Tempo',    desc: 'Agenda e compromissos',             bg: 'rgba(60,160,181,0.15)' },
  { value: 'futuro',   Icon: Target,    color: '#0B2D34', name: 'Futuro',   desc: 'Objetivos e metas de vida',         bg: 'rgba(11,45,52,0.18)' },
  { value: 'corpo',    Icon: Activity,  color: '#D97534', name: 'Corpo',    desc: 'Atividades, peso e saúde',          bg: 'rgba(217,117,52,0.15)' },
  { value: 'mente',    Icon: Brain,     color: '#D9962E', name: 'Mente',    desc: 'Foco, meditação e leitura',         bg: 'rgba(217,150,46,0.15)' },
  { value: 'carreira', Icon: Briefcase, color: '#DB6478', name: 'Carreira', desc: 'Evolução profissional',             bg: 'rgba(219,100,120,0.15)' },
]

const DEFAULT_SELECTED: ModuleId[] = ['financas', 'tempo']

interface OnboardingMobileProps {
  userName?: string
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex gap-2 mb-5">
      {[1, 2].map(i => (
        <div
          key={i}
          className="h-[5px] rounded-full transition-all duration-300"
          style={{
            width: i <= current ? 28 : 16,
            background: i <= current ? 'var(--sl-em)' : 'var(--sl-s3)',
          }}
        />
      ))}
    </div>
  )
}

export function OnboardingMobile({ userName: initialName }: OnboardingMobileProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(initialName ?? '')
  const [selected, setSelected] = useState<ModuleId[]>(DEFAULT_SELECTED)
  const [isLoading, setIsLoading] = useState(false)

  const displayName = name.trim().split(' ')[0] || ''

  const toggleModule = useCallback((value: ModuleId) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }, [])

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: name.trim() || null,
          mode: 'jornada',
          active_modules: selected.length > 0 ? selected : ['financas'],
          onboarding_completed: true,
        })

      toast.success('Bem-vindo ao SyncLife.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-[var(--sl-bg)] overflow-y-auto">
      <div className="px-5 pt-8 pb-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <SyncLifeIcon size={42} animated={false} />
          <span className="font-[Syne] text-[22px] font-extrabold">
            <span className="text-[var(--sl-t1)]">Sync</span>
            <span className="text-[var(--sl-em)]">Life</span>
          </span>
        </div>

        {/* Progress dots */}
        <ProgressDots current={step} />

        {/* Step 1: Name + Module selection */}
        {step === 1 && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-2 font-[DM_Sans]">
              Passo 1 de 2
            </p>

            <SectionHeader
              eyebrow="01 · IDENTIDADE"
              title="O que você quer sincronizar?"
              sub="Selecione o que é mais importante agora. Você pode ativar mais módulos a qualquer momento."
              className="mb-6 [&>h2]:font-[Syne] [&>h2]:text-[26px] [&>h2]:font-bold [&>h2]:leading-[1.25]"
            />

            {/* Name input via TextField */}
            <div className="mb-6">
              <TextField
                label="Seu nome"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                hint="É assim que vamos te cumprimentar no app."
              />
            </div>

            {/* Section eyebrow for modules */}
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)] mb-3 font-[Syne]">
              02 · MÓDULOS
            </p>

            <div className="flex flex-col gap-2.5 mb-7">
              {MODULES.map((mod) => {
                const isSelected = selected.includes(mod.value)
                const { Icon } = mod
                return (
                  <button
                    key={mod.value}
                    onClick={() => toggleModule(mod.value)}
                    className="flex items-center gap-3.5 p-3.5 rounded-[10px] border transition-all text-left"
                    style={{
                      background: isSelected ? 'rgba(15,118,110,0.15)' : 'var(--sl-s1)',
                      borderColor: isSelected ? 'var(--sl-em)' : 'var(--sl-border)',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[11px] shrink-0"
                      style={{ background: mod.bg }}
                    >
                      <Icon size={18} color={mod.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--sl-t1)] font-[DM_Sans]">{mod.name}</p>
                      <p className="text-[12px] text-[var(--sl-t2)] mt-0.5 font-[DM_Sans]">{mod.desc}</p>
                    </div>
                    <div
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 shrink-0"
                      style={{
                        background: isSelected ? 'var(--sl-em)' : 'transparent',
                        borderColor: isSelected ? 'var(--sl-em)' : 'var(--sl-border-h)',
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} color="white" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selected.length === 0}
              className="w-full flex items-center justify-center gap-2 h-[52px] rounded-[14px]
                         text-[15px] font-semibold text-white transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed font-[DM_Sans]
                         hover:opacity-90"
              style={{ background: 'var(--sl-em)' }}
            >
              Continuar
              <ArrowRight size={16} />
            </button>
            <p className="text-center text-[12px] text-[var(--sl-t3)] mt-3 font-[DM_Sans]">
              Você pode ativar mais módulos depois
            </p>
          </>
        )}

        {/* Step 2: Summary + Life Score */}
        {step === 2 && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-2 font-[DM_Sans]">
              Passo 2 de 2
            </p>

            <SectionHeader
              eyebrow="03 · PRONTO"
              title={`Tudo pronto${displayName ? `, ${displayName}` : ''}.`}
              sub="Vamos acompanhar sua evolução juntos. Cada passo conta."
              className="mb-6 [&>h2]:font-[Syne] [&>h2]:text-[26px] [&>h2]:font-bold [&>h2]:leading-[1.25]"
            />

            {/* Life Sync Score preview (RingProgress: exceção G-03) */}
            <div
              className="flex items-center gap-4 p-4 rounded-[14px] mb-5"
              style={{
                background: 'var(--sl-s-hero)',
                border: '1px solid var(--sl-border-em)',
              }}
            >
              <div className="relative w-[52px] h-[52px] shrink-0">
                <svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={26} cy={26} r={22} fill="none" stroke="var(--sl-s3)" strokeWidth={5} />
                  <circle
                    cx={26} cy={26} r={22} fill="none"
                    stroke="url(#ob-score-grad)" strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={138} strokeDashoffset={138}
                  />
                  <defs>
                    <linearGradient id="ob-score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0F766E" />
                      <stop offset="100%" stopColor="#0B2D34" />
                    </linearGradient>
                  </defs>
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center font-[Syne] text-[16px] font-extrabold sl-num-strong text-[var(--sl-em)]"
                >
                  0
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[var(--sl-t1)] font-[DM_Sans]">
                  Seu Life Sync Score
                </p>
                <p className="text-[12px] text-[var(--sl-t2)] mt-0.5 font-[DM_Sans]">
                  Começa do zero e cresce com você
                </p>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)] mb-3 font-[Syne]">
                Seus módulos
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map(val => {
                  const mod = MODULES.find(m => m.value === val)
                  if (!mod) return null
                  const { Icon } = mod
                  return (
                    <span key={val} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px]
                                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] font-[DM_Sans]">
                      <Icon size={13} color={mod.color} strokeWidth={2} />
                      {mod.name}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* "O que acontece agora" */}
            <div className="mb-6">
              <p className="text-[13px] font-semibold text-[var(--sl-t1)] mb-3 font-[DM_Sans]">
                O que acontece agora:
              </p>
              {[
                'Dashboard personalizado com seus módulos',
                'Dados de exemplo para você explorar',
                'Tudo configurável depois em Ajustes',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 mb-2">
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--sl-em-soft)] shrink-0 mt-0.5">
                    <Check size={10} strokeWidth={3} color="var(--sl-em)" />
                  </div>
                  <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5] font-[DM_Sans]">{item}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-[52px] rounded-[14px]
                         text-[15px] font-semibold text-white transition-all
                         disabled:opacity-60 font-[DM_Sans]
                         hover:opacity-90"
              style={{ background: 'var(--sl-em)' }}
            >
              {isLoading ? 'Preparando...' : 'Começar minha jornada'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-1.5 text-[13px] text-[var(--sl-t2)] mt-3 py-2 font-[DM_Sans] hover:text-[var(--sl-t1)] transition-colors"
            >
              <ArrowLeft size={13} />
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
