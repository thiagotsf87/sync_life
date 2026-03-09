'use client'

import { Check } from 'lucide-react'
import { CARREIRA_PRIMARY, CARREIRA_PRIMARY_BORDER, CARREIRA_GRAD } from '@/lib/carreira-colors'
import type { CareerRoadmap } from '@/hooks/use-carreira'

interface CarreiraTabRoadmapProps {
  activeRoadmap: CareerRoadmap | null
}

interface TimelineStep {
  label: string
  period: string
  salary?: string
  status: 'done' | 'current' | 'next' | 'future' | 'vision'
  skills?: { name: string; status: 'done' | 'in_progress' | 'pending' }[]
  xp?: string
  badge?: string
  progress?: number
}

const MOCK_STEPS: TimelineStep[] = [
  { label: 'Desenvolvedor Junior', period: 'Jan 2020 → Fev 2022', status: 'done', xp: '+200 XP', badge: 'Primeira Promoção' },
  { label: 'Desenvolvedor Pleno', period: 'Mar 2022 → presente', status: 'current', progress: 55,
    skills: [
      { name: 'React Avançado', status: 'done' },
      { name: 'Liderança técnica', status: 'done' },
      { name: 'Node.js Avançado', status: 'in_progress' },
      { name: 'Arquitetura', status: 'pending' },
    ],
    xp: '+280 XP', badge: 'Agora',
  },
  { label: 'Desenvolvedor Sênior', period: 'Meta: Jun 2026 · R$ 12–16k', status: 'next',
    skills: [
      { name: 'React', status: 'done' },
      { name: 'Liderança', status: 'done' },
      { name: 'Node.js', status: 'in_progress' },
      { name: 'Arquitetura', status: 'pending' },
      { name: 'Mentoria', status: 'pending' },
    ],
    xp: '+100 XP', badge: 'Evolução',
  },
  { label: 'Tech Lead / Staff Engineer', period: '2028+ · R$ 20–30k', status: 'future', xp: '+200 XP', badge: 'Líder' },
  { label: 'CTO / Founder', period: 'Visão de longo prazo · 2032+', status: 'vision', xp: '+500 XP', badge: 'Arquiteto do Futuro' },
]

export function CarreiraTabRoadmap({ activeRoadmap }: CarreiraTabRoadmapProps) {
  const accent = CARREIRA_PRIMARY
  const border = CARREIRA_PRIMARY_BORDER
  const grad = CARREIRA_GRAD
  const roadmapPct = activeRoadmap ? Math.round(activeRoadmap.progress) : 55

  return (
    <div>
      {/* Position indicator / Hero banner */}
      <div
        className="mx-4 mb-3 rounded-2xl p-[14px] border text-center"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(236,72,153,0.08))', borderColor: 'rgba(139,92,246,0.28)' }}
      >
        <p className="text-[11px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[6px]">
          ✦ JORNADA DO HERÓI — ATO 2
        </p>
        <p className="font-[Syne] text-[18px] font-extrabold text-[var(--sl-t1)] mb-1">
          De Pleno a Sênior
        </p>
        <p className="text-[12px] text-[var(--sl-t2)]">
          Você completou {roadmapPct}% do caminho · Faltam 2 skills
        </p>
        <div className="h-[10px] bg-[var(--sl-s3)] rounded-[5px] overflow-hidden mt-2">
          <div className="h-full rounded-[5px]" style={{ width: `${roadmapPct}%`, background: grad }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 pt-2">
        {MOCK_STEPS.map((step, idx) => {
          const isLast = idx === MOCK_STEPS.length - 1

          return (
            <div key={idx} className="flex gap-4">
              {/* Left: dot + line */}
              <div className="flex flex-col items-center">
                {step.status === 'done' ? (
                  <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                ) : step.status === 'current' ? (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#8b5cf6', boxShadow: '0 0 14px rgba(139,92,246,0.45)' }}
                  >
                    <div className="w-[10px] h-[10px] rounded-full bg-white" />
                  </div>
                ) : step.status === 'vision' ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-[1.5px] border-dashed border-[rgba(245,158,11,0.4)]"
                    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(236,72,153,0.1))' }}>
                    <span className="text-[16px]">🌟</span>
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2"
                    style={{
                      background: 'var(--sl-s2)',
                      borderColor: step.status === 'next'
                        ? 'rgba(139,92,246,0.3)'
                        : 'var(--sl-border)',
                    }}
                  >
                    <span className="text-[14px]" style={{ color: step.status === 'next' ? '#c4b5fd' : 'var(--sl-t3)' }}>
                      {idx + 1}
                    </span>
                  </div>
                )}

                {!isLast && (
                  <div
                    className="w-[2px] flex-1 mt-1"
                    style={{
                      minHeight: step.status === 'current' || step.status === 'next' ? '80px' : '50px',
                      background: step.status === 'done' ? '#10b981'
                        : step.status === 'current'
                          ? 'linear-gradient(180deg, rgba(139,92,246,0.4), var(--sl-border))'
                          : 'var(--sl-border)',
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-5'}`}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[14px] font-semibold"
                    style={{
                      color: step.status === 'done' ? '#10b981'
                        : step.status === 'current' ? '#c4b5fd'
                        : step.status === 'vision' ? '#f59e0b'
                        : step.status === 'next' ? 'var(--sl-t1)'
                        : 'var(--sl-t3)',
                      fontWeight: step.status === 'current' ? 700 : 600,
                    }}
                  >
                    {step.status === 'vision' ? `Ato Final — ${step.label}` : `Ato ${idx + 1} — ${step.label.split(' ').pop()}`}
                  </span>
                  {step.status === 'done' && (
                    <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(16,185,129,0.12)] text-[#10b981]">
                      ✓ Conquistado
                    </span>
                  )}
                  {step.status === 'current' && (
                    <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
                      style={{ background: 'rgba(139,92,246,0.12)', color: '#c4b5fd' }}>
                      ✦ Agora
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--sl-t3)]">{step.period}</p>

                {step.status === 'current' && step.progress != null && (
                  <div className="mt-[6px]">
                    <div className="h-[6px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${step.progress}%`, background: grad }} />
                    </div>
                    <p className="text-[11px] mt-[3px] font-semibold" style={{ color: '#c4b5fd' }}>
                      {step.progress}% · {step.xp} · Faltam: Node.js, Arquitetura
                    </p>
                  </div>
                )}

                {step.status === 'next' && step.skills && (
                  <>
                    {step.xp && (
                      <p className="text-[10px] text-[#c4b5fd] font-bold mt-1">
                        ⚡ {step.xp} ao completar · Badge "{step.badge}"
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-[6px]">
                      {step.skills.map(sk => (
                        <span
                          key={sk.name}
                          className="text-[11px] px-[7px] py-[2px] rounded-lg"
                          style={{
                            background: sk.status === 'done' ? 'rgba(16,185,129,0.1)'
                              : sk.status === 'in_progress' ? 'rgba(139,92,246,0.1)'
                              : 'rgba(100,100,100,0.1)',
                            color: sk.status === 'done' ? '#10b981'
                              : sk.status === 'in_progress' ? '#c4b5fd'
                              : 'var(--sl-t3)',
                          }}
                        >
                          {sk.status === 'done' ? '✓' : sk.status === 'in_progress' ? '⟳' : '○'} {sk.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {(step.status === 'done' || step.status === 'future') && step.xp && (
                  <p className="text-[10px] mt-[3px] font-semibold" style={{ color: step.status === 'done' ? '#10b981' : 'var(--sl-t3)' }}>
                    {step.status === 'done' ? '✅' : '⚡'} {step.xp} · Badge "{step.badge}"
                  </p>
                )}

                {step.status === 'vision' && step.xp && (
                  <p className="text-[10px] text-[#c4b5fd] mt-[3px] font-semibold">
                    ⚡ {step.xp} · Badge Lendário "{step.badge}"
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
