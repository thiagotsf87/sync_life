'use client'

import { CARREIRA_PRIMARY, CARREIRA_PRIMARY_BG, CARREIRA_PRIMARY_BORDER, CARREIRA_GRAD } from '@/lib/carreira-colors'
import type { ProfessionalProfile, CareerRoadmap, Skill } from '@/hooks/use-carreira'
import { LEVEL_LABELS } from '@/hooks/use-carreira'

interface CarreiraTabDashboardProps {
  profile: ProfessionalProfile | null
  activeRoadmap: CareerRoadmap | null
  skills: Skill[]
  onTabChange: (tab: string) => void
}

export function CarreiraTabDashboard({
  profile,
  activeRoadmap,
  skills,
  onTabChange,
}: CarreiraTabDashboardProps) {
  const accent = CARREIRA_PRIMARY
  const bg = CARREIRA_PRIMARY_BG
  const border = CARREIRA_PRIMARY_BORDER
  const grad = CARREIRA_GRAD

  const salaryLabel = profile?.gross_salary
    ? `R$ ${profile.gross_salary.toLocaleString('pt-BR')}`
    : '—'
  const roadmapPct = activeRoadmap ? Math.round(activeRoadmap.progress) : 0
  const completedSteps = activeRoadmap?.steps?.filter(s => s.status === 'completed') ?? []
  const inProgressSteps = activeRoadmap?.steps?.filter(s => s.status === 'in_progress') ?? []
  const pendingSteps = activeRoadmap?.steps?.filter(s => s.status === 'pending') ?? []
  const levelLabel = profile?.level ? LEVEL_LABELS[profile.level] : 'Não configurado'

  return (
    <div>
      {/* Cargo hero card */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border"
        style={{ background: `linear-gradient(135deg, ${bg}, rgba(236,72,153,0.06))`, borderColor: border }}
      >
        <div className="flex gap-[14px] items-center">
          <div
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[26px] shrink-0"
            style={{ background: bg }}
          >
            👨‍💻
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px]">
              ✦ CAPÍTULO ATUAL
            </p>
            <p className="text-[16px] font-bold text-[var(--sl-t1)] mt-[2px]">
              {profile?.current_title || levelLabel}
            </p>
            <p className="text-[13px] text-[var(--sl-t2)]">
              {profile?.current_company || 'Empresa não informada'}{profile?.current_company ? ' · São Paulo' : ''}
            </p>
            <div className="flex gap-[6px] mt-[6px] flex-wrap">
              <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]">
                ⚡ +480 XP acumulados
              </span>
              <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(236,72,153,0.12)] text-[#f472b6]">
                Sênior em vista
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs 2x2 */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-3">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Salário atual</p>
          <p className="font-[DM_Mono] text-[19px] font-bold" style={{ color: accent }}>{salaryLabel}</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">
            <span className="text-[#c4b5fd]">Meta: R$ 14k · +52%</span>
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Próxima revisão</p>
          <p className="font-[DM_Mono] text-[16px] font-bold text-[var(--sl-t1)]">Jun 2026</p>
          <p className="text-[11px] mt-[2px]">
            <span className="text-[#c4b5fd]">⚡ +100 XP se promovido</span>
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Habilidades</p>
          <p className="font-[DM_Mono] text-[19px] font-bold text-[var(--sl-t1)]">{skills.length || 14}</p>
          <p className="text-[11px] mt-[2px]">
            <span className="text-[#c4b5fd]">6 dominadas · +XP cada</span>
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">
            Jornada do Herói
          </p>
          <p className="font-[DM_Mono] text-[19px] font-bold" style={{ color: '#8b5cf6' }}>{roadmapPct}%</p>
          <p className="text-[11px] mt-[2px]">
            <span className="text-[#c4b5fd]">Rumo ao Sênior</span>
          </p>
        </div>
      </div>

      {/* Simulador de promoção */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-1">
        SIMULADOR DE PROMOÇÃO
      </p>
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border"
        style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.06))', borderColor: 'rgba(236,72,153,0.2)' }}
      >
        <p className="text-[11px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[10px]">
          💰 Impacto Financeiro — Sênior
        </p>
        <div className="flex justify-between mb-[10px]">
          <div>
            <p className="text-[11px] text-[var(--sl-t2)]">Salário atual</p>
            <p className="font-[DM_Mono] text-[18px] text-[var(--sl-t1)] mt-[2px]">{salaryLabel}</p>
          </div>
          <div className="flex items-center text-[20px] text-[var(--sl-t3)]">→</div>
          <div className="text-right">
            <p className="text-[11px] text-[#c4b5fd]">Projeção sênior</p>
            <p className="font-[DM_Mono] text-[18px] mt-[2px]" style={{ color: accent }}>R$ 14.000</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 p-2 bg-[var(--sl-s2)] rounded-lg text-center">
            <p className="text-[10px] text-[var(--sl-t3)]">Ganho anual</p>
            <p className="font-[DM_Mono] text-[14px] text-[#10b981] mt-[2px]">+R$ 57.600</p>
          </div>
          <div className="flex-1 p-2 bg-[var(--sl-s2)] rounded-lg text-center">
            <p className="text-[10px] text-[var(--sl-t3)]">Impacto Patrimônio</p>
            <p className="font-[DM_Mono] text-[14px] text-[#8b5cf6] mt-[2px]">+R$ 4.800/mês</p>
          </div>
        </div>
        <p className="text-[10px] text-[#c4b5fd] font-semibold mt-2">
          ⚡ Promoção a Sênior vale +100 XP + badge "Evolução Salarial"
        </p>
      </div>

      {/* Milestone */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-1">
        PRÓXIMO MILESTONE
      </p>
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border"
        style={{ background: `rgba(236,72,153,0.07)`, borderColor: 'rgba(236,72,153,0.2)' }}
      >
        <div className="flex justify-between items-center mb-[10px]">
          <div>
            <p className="text-[14px] font-semibold text-[var(--sl-t1)]">
              {activeRoadmap?.target_title || 'Promoção a Sênior'}
            </p>
            <p className="text-[12px] text-[var(--sl-t2)]">
              Meta: Jun 2026 · Revisão anual
            </p>
          </div>
          <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(236,72,153,0.12)] text-[#f472b6]">
            {roadmapPct}%
          </span>
        </div>
        <div className="h-2 bg-[var(--sl-s3)] rounded overflow-hidden mb-2">
          <div className="h-full rounded" style={{ width: `${roadmapPct}%`, background: accent }} />
        </div>
        <div className="flex gap-[6px] flex-wrap">
          {completedSteps.slice(0, 2).map(s => (
            <span key={s.id} className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10b981]">
              ✓ {s.title}
            </span>
          ))}
          {inProgressSteps.slice(0, 1).map(s => (
            <span key={s.id} className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(236,72,153,0.1)]" style={{ color: accent }}>
              ⟳ {s.title}
            </span>
          ))}
          {pendingSteps.slice(0, 1).map(s => (
            <span key={s.id} className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(100,100,100,0.1)] text-[var(--sl-t3)]">
              ○ {s.title}
            </span>
          ))}
          {(!activeRoadmap || (activeRoadmap.steps?.length ?? 0) === 0) && (
            <>
              <span className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10b981]">✓ React avançado</span>
              <span className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10b981]">✓ Liderança técnica</span>
              <span className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(236,72,153,0.1)] text-[#ec4899]">⟳ Node.js avançado</span>
              <span className="text-[11px] px-2 py-[3px] rounded-lg bg-[rgba(100,100,100,0.1)] text-[var(--sl-t3)]">○ Arquitetura</span>
            </>
          )}
        </div>
      </div>

      {/* AI insight card */}
      <div className="mx-4 mb-3 flex gap-[11px] p-[13px_14px] rounded-2xl border border-[rgba(0,85,255,0.15)]"
        style={{ background: 'rgba(0,85,255,0.06)' }}
      >
        <span className="text-[18px] shrink-0">🤖</span>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5]">
          Sua trilha de React (Mente) está alinhada com o que o mercado exige para sênior. Complete em Março para chegar à revisão de Jun com a skill validada.{' '}
          <span style={{ color: accent }}>Chance +40%</span>.
        </p>
      </div>

      {/* Quick actions 2x2 */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-3">
        {[
          { icon: '👤', label: 'Perfil', tab: 'perfil', color: accent },
          { icon: '🗺', label: 'Roadmap', tab: 'roadmap', color: '#0055ff' },
          { icon: '⭐', label: 'Habilidades', tab: 'habilidades', color: '#8b5cf6' },
          { icon: '📜', label: 'Histórico', tab: 'historico', color: '#10b981' },
        ].map(a => (
          <button
            key={a.tab}
            onClick={() => onTabChange(a.tab)}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3 text-left hover:border-[var(--sl-border-h)] transition-colors"
          >
            <div className="h-[2px] w-6 rounded-full mb-[6px]" style={{ background: a.color }} />
            <p className="text-[13px] font-medium text-[var(--sl-t1)]">{a.icon} {a.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
