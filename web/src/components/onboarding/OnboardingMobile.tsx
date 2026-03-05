'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Check } from 'lucide-react'

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

export function OnboardingMobile({ userName }: OnboardingMobileProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED)
  const [mode, setMode] = useState<'foco' | 'jornada'>('foco')
  const [isLoading, setIsLoading] = useState(false)

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
          mode: mode,
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
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px]"
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-[Syne] text-[22px] font-extrabold text-[var(--sl-t1)]">SyncLife</span>
        </div>

        {/* Step 1: Module selection */}
        {step === 1 && (
          <>
            <p className="text-[12px] text-[var(--sl-t2)] mb-2">Passo 1 de 3</p>
            <h1 className="font-[Syne] text-[26px] font-bold text-[var(--sl-t1)] leading-[1.25] mb-2">
              O que você quer sincronizar?
            </h1>
            <p className="text-[14px] text-[var(--sl-t2)] leading-[1.6] mb-7">
              Selecione o que é mais importante agora. Você pode ativar mais módulos a qualquer momento.
            </p>

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

        {/* Step 2: Mode selection */}
        {step === 2 && (
          <>
            <p className="text-[12px] text-[var(--sl-t2)] mb-2">Passo 2 de 3</p>
            <h1 className="font-[Syne] text-[26px] font-bold text-[var(--sl-t1)] leading-[1.25] mb-2">
              Como quer ver os dados?
            </h1>
            <p className="text-[14px] text-[var(--sl-t2)] leading-[1.6] mb-7">
              Escolha o estilo de interface. Pode mudar a qualquer hora.
            </p>

            <div className="flex flex-col gap-3 mb-7">
              <button
                onClick={() => setMode('foco')}
                className="p-4 rounded-[14px] border text-left transition-all"
                style={{
                  background: mode === 'foco' ? 'rgba(16,185,129,0.15)' : 'var(--sl-s1)',
                  borderColor: mode === 'foco' ? 'rgba(16,185,129,0.5)' : 'var(--sl-border)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[24px]">🎯</span>
                  <span className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">Modo Foco</span>
                </div>
                <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5]">
                  Interface objetiva, dados densos, sem distrações. Direto ao ponto.
                </p>
              </button>

              <button
                onClick={() => setMode('jornada')}
                className="p-4 rounded-[14px] border text-left transition-all"
                style={{
                  background: mode === 'jornada' ? 'rgba(16,185,129,0.15)' : 'var(--sl-s1)',
                  borderColor: mode === 'jornada' ? 'rgba(16,185,129,0.5)' : 'var(--sl-border)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[24px]">🌱</span>
                  <span className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">Modo Jornada</span>
                </div>
                <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5]">
                  Insights, conquistas e motivação. O app celebra com você cada vitória.
                </p>
              </button>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full flex items-center justify-center h-[52px] rounded-[14px]
                         text-[15px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              Continuar →
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-[13px] text-[var(--sl-t2)] mt-3 py-2"
            >
              ← Voltar
            </button>
          </>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <>
            <p className="text-[12px] text-[var(--sl-t2)] mb-2">Passo 3 de 3</p>
            <h1 className="font-[Syne] text-[26px] font-bold text-[var(--sl-t1)] leading-[1.25] mb-2">
              Tudo pronto{userName ? `, ${userName}` : ''}!
            </h1>
            <p className="text-[14px] text-[var(--sl-t2)] leading-[1.6] mb-7">
              {mode === 'jornada'
                ? 'Vamos acompanhar sua evolução juntos. Cada passo conta!'
                : 'Seu painel está configurado. Vamos começar.'}
            </p>

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
              <p className="text-[12px] text-[var(--sl-t2)] mt-3">
                Modo: {mode === 'foco' ? '🎯 Foco' : '🌱 Jornada'}
              </p>
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
              onClick={() => setStep(2)}
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
