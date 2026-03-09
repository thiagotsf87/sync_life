'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'

const MODULES = [
  { value: 'financas', icon: '💰', name: 'Finanças', desc: 'Despesas, orçamento, planejamento', bg: 'rgba(16,185,129,0.15)' },
  { value: 'tempo',    icon: '⏳', name: 'Tempo',    desc: 'Agenda e compromissos',             bg: 'rgba(6,182,212,0.15)' },
  { value: 'futuro',   icon: '🔮', name: 'Futuro',   desc: 'Objetivos e metas de vida',         bg: 'rgba(0,85,255,0.15)' },
  { value: 'corpo',    icon: '🏃', name: 'Corpo',    desc: 'Atividades, peso e saúde',           bg: 'rgba(249,115,22,0.15)' },
  { value: 'mente',    icon: '🧠', name: 'Mente',    desc: 'Foco, meditação e leitura',          bg: 'rgba(139,92,246,0.15)' },
  { value: 'carreira', icon: '💼', name: 'Carreira',  desc: 'Evolução profissional',             bg: 'rgba(236,72,153,0.15)' },
]

const DEFAULT_SELECTED = ['financas', 'tempo']

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
            background: i < current
              ? '#10b981'
              : i === current
                ? 'linear-gradient(90deg, #10b981, #0055ff)'
                : 'var(--sl-s3)',
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
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED)
  const [isLoading, setIsLoading] = useState(false)

  const displayName = name.trim().split(' ')[0] || ''

  const toggleModule = useCallback((value: string) => {
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

      toast.success('Bem-vindo ao SyncLife!')
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
            <span
              style={{
                background: 'linear-gradient(135deg, #10b981, #0055ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Life
            </span>
          </span>
        </div>

        {/* Progress dots */}
        <ProgressDots current={step} />

        {/* Step 1: Name + Module selection */}
        {step === 1 && (
          <>
            <p className="text-[12px] text-[var(--sl-t2)] mb-2">Passo 1 de 2</p>
            <h1 className="font-[Syne] text-[26px] font-bold text-[var(--sl-t1)] leading-[1.25] mb-2">
              O que você quer sincronizar?
            </h1>
            <p className="text-[14px] text-[var(--sl-t2)] leading-[1.6] mb-6">
              Selecione o que é mais importante agora. Você pode ativar mais módulos a qualquer momento.
            </p>

            {/* Name input */}
            <div className="mb-6">
              <label className="text-[12px] font-medium text-[var(--sl-t2)] mb-1.5 block">
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="w-full h-[48px] px-4 rounded-[12px] bg-[var(--sl-s1)] border border-[var(--sl-border)]
                           text-[15px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]
                           focus:outline-none focus:border-[#10b981]/50 transition-colors"
              />
              <p className="text-[11px] text-[var(--sl-t3)] mt-1.5">
                É assim que vamos te cumprimentar no app.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-7">
              {MODULES.map((mod) => {
                const isSelected = selected.includes(mod.value)
                return (
                  <button
                    key={mod.value}
                    onClick={() => toggleModule(mod.value)}
                    className="flex items-center gap-3.5 p-3.5 rounded-[10px] border transition-all"
                    style={{
                      background: isSelected ? 'rgba(16,185,129,0.15)' : 'var(--sl-s1)',
                      borderColor: isSelected ? 'rgba(16,185,129,0.5)' : 'var(--sl-border)',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[11px] text-[20px] shrink-0"
                      style={{ background: mod.bg }}
                    >
                      {mod.icon}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--sl-t1)]">{mod.name}</p>
                      <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{mod.desc}</p>
                    </div>
                    <div
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 shrink-0"
                      style={{
                        background: isSelected ? '#10b981' : 'transparent',
                        borderColor: isSelected ? '#10b981' : 'var(--sl-border-h)',
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
              className="w-full flex items-center justify-center h-[52px] rounded-[14px]
                         text-[15px] font-semibold text-white transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              Continuar →
            </button>
            <p className="text-center text-[12px] text-[var(--sl-t3)] mt-3">
              Você pode ativar mais módulos depois
            </p>
          </>
        )}

        {/* Step 2: Summary + Life Score */}
        {step === 2 && (
          <>
            <p className="text-[12px] text-[var(--sl-t2)] mb-2">Passo 2 de 2</p>
            <h1 className="font-[Syne] text-[26px] font-bold text-[var(--sl-t1)] leading-[1.25] mb-2">
              Tudo pronto{displayName ? `, ${displayName}` : ''}!
            </h1>
            <p className="text-[14px] text-[var(--sl-t2)] leading-[1.6] mb-6">
              Vamos acompanhar sua evolução juntos. Cada passo conta!
            </p>

            {/* Life Sync Score preview */}
            <div
              className="flex items-center gap-4 p-4 rounded-[14px] mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,85,255,0.12))',
                border: '1px solid rgba(16,185,129,0.25)',
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
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#0055ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center font-[Syne] text-[16px] font-extrabold"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #0055ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  0
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[var(--sl-t1)]">
                  Seu Life Sync Score
                </p>
                <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">
                  Começa do zero e cresce com você
                </p>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-5">
              <p className="text-[12px] text-[var(--sl-t2)] mb-3">Seus módulos</p>
              <div className="flex flex-wrap gap-2">
                {selected.map(val => {
                  const mod = MODULES.find(m => m.value === val)
                  return (
                    <span key={val} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px]
                                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)]">
                      {mod?.icon} {mod?.name}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* "O que acontece agora" */}
            <div className="mb-6">
              <p className="text-[13px] font-semibold text-[var(--sl-t1)] mb-3">
                O que acontece agora:
              </p>
              {[
                'Dashboard personalizado com seus módulos',
                'Dados de exemplo para você explorar',
                'Tudo configurável depois em Ajustes',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 mb-2">
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#10b981]/20 shrink-0 mt-0.5">
                    <Check size={10} strokeWidth={3} color="#10b981" />
                  </div>
                  <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5]">{item}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="w-full flex items-center justify-center h-[52px] rounded-[14px]
                         text-[15px] font-semibold text-white transition-all
                         disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              {isLoading ? 'Preparando...' : 'Começar minha jornada 🚀'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-[13px] text-[var(--sl-t2)] mt-3 py-2"
            >
              ← Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
