'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { CARREIRA_PRIMARY } from '@/lib/carreira-colors'
import type { Skill, SkillCategory } from '@/hooks/use-carreira'

type FilterTab = 'all' | SkillCategory

interface SkillMock {
  name: string
  pct: number
  label?: string
  category: SkillCategory
}

const MOCK_SKILLS: SkillMock[] = [
  { name: 'React', pct: 88, category: 'hard_skill' },
  { name: 'TypeScript', pct: 76, category: 'hard_skill' },
  { name: 'Node.js', pct: 58, category: 'hard_skill' },
  { name: 'PostgreSQL', pct: 70, category: 'hard_skill' },
  { name: 'AWS', pct: 60, category: 'hard_skill' },
  { name: 'Arquitetura', pct: 32, category: 'hard_skill' },
  { name: 'Comunicação', pct: 80, category: 'soft_skill' },
  { name: 'Liderança', pct: 55, category: 'soft_skill' },
  { name: 'Mentoria', pct: 40, category: 'soft_skill' },
  { name: 'Português', pct: 100, label: 'Nativo', category: 'language' },
  { name: 'Inglês', pct: 64, label: 'B2+', category: 'language' },
]

function getSkillColor(pct: number): string {
  if (pct >= 70) return '#10b981'
  if (pct >= 40) return '#f59e0b'
  return '#f43f5e'
}

interface CarreiraTabHabilidadesProps {
  skills: Skill[]
  onAddSkill: () => void
}

export function CarreiraTabHabilidades({ skills, onAddSkill }: CarreiraTabHabilidadesProps) {
  const accent = CARREIRA_PRIMARY
  const [filter, setFilter] = useState<FilterTab>('all')

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'hard_skill', label: 'Técnicas' },
    { key: 'soft_skill', label: 'Soft Skills' },
    { key: 'language', label: 'Idiomas' },
  ]

  const filtered = filter === 'all' ? MOCK_SKILLS : MOCK_SKILLS.filter(s => s.category === filter)

  const groupedCategories = ([
    { key: 'hard_skill' as SkillCategory, title: 'TÉCNICAS', jTitle: 'TÉCNICAS — +45 XP disponíveis', skills: filtered.filter(s => s.category === 'hard_skill') },
    { key: 'soft_skill' as SkillCategory, title: 'SOFT SKILLS', skills: filtered.filter(s => s.category === 'soft_skill') },
    { key: 'language' as SkillCategory, title: 'IDIOMAS', skills: filtered.filter(s => s.category === 'language') },
  ] as { key: SkillCategory; title: string; jTitle?: string; skills: SkillMock[] }[]).filter(g => g.skills.length > 0)

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-[6px] px-4 mb-3 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-[14px] py-[7px] rounded-full text-[12px] font-medium whitespace-nowrap shrink-0"
              style={{
                background: active ? '#8b5cf6' : 'var(--sl-s1)',
                color: active ? '#fff' : 'var(--sl-t2)',
                border: active ? 'none' : '1px solid var(--sl-border)',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-3">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">
            Arsenal total
          </p>
          <p className="font-[DM_Mono] text-[19px] font-bold" style={{ color: accent }}>14</p>
          <p className="text-[11px] mt-[2px]">
            <span className="text-[#c4b5fd]">6 dominadas · +30 XP cada</span>
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">
            Em treinamento
          </p>
          <p className="font-[DM_Mono] text-[19px] font-bold text-[#f59e0b]">8</p>
          <p className="text-[11px] mt-[2px]">
            <span className="text-[#c4b5fd]">⚡ +15 XP ao dominar cada</span>
          </p>
        </div>
      </div>

      {/* Radar chart */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border text-center"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))', borderColor: 'rgba(139,92,246,0.2)' }}
      >
        <p className="text-[11px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[10px]">
          ✦ RADAR DE HABILIDADES
        </p>
        <div className="relative w-[180px] h-[180px] mx-auto rounded-full border border-[rgba(139,92,246,0.2)] flex items-center justify-center">
          <div className="absolute w-[120px] h-[120px] rounded-full border border-dashed border-[rgba(139,92,246,0.15)]" />
          <div className="absolute w-[60px] h-[60px] rounded-full border border-dashed border-[rgba(139,92,246,0.1)]" />
          <div className="absolute top-[-8px] text-[9px] font-semibold" style={{ color: accent }}>React 88%</div>
          <div className="absolute right-[-14px] top-[40%] text-[9px] font-semibold" style={{ color: accent }}>TS 76%</div>
          <div className="absolute bottom-[-8px] text-[9px] font-semibold text-[#f59e0b]">Node 58%</div>
          <div className="absolute left-[-14px] top-[40%] text-[9px] font-semibold text-[#f59e0b]">Lead 55%</div>
          <div className="absolute top-[20%] right-[10px] text-[9px] font-semibold text-[#10b981]">SQL 70%</div>
          <div className="absolute bottom-[20%] left-[10px] text-[9px] font-semibold text-[#f43f5e]">Arq 32%</div>
          <div
            className="w-[100px] h-[100px] rounded-full opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.15))' }}
          />
        </div>
        <p className="text-[10px] text-[var(--sl-t2)] mt-[10px]">
          Área forte: Frontend · Gap: Arquitetura, Mentoria
        </p>
      </div>

      {/* Skills by category */}
      {groupedCategories.map(group => (
        <div key={group.key}>
          <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-1">
            {group.jTitle ? (
              <>{group.title} — <span className="text-[#c4b5fd]">+45 XP disponíveis</span></>
            ) : group.title}
          </p>
          <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            {group.skills.map((sk, i) => {
              const barColor = sk.pct >= 70 ? accent : sk.pct >= 40 ? '#f59e0b' : '#f43f5e'
              const textColor = getSkillColor(sk.pct)
              return (
                <div key={sk.name} className={`flex items-center gap-[10px] ${i < group.skills.length - 1 ? 'mb-[10px]' : ''}`}>
                  <span className="text-[12px] text-[var(--sl-t2)] w-[100px] shrink-0">{sk.name}</span>
                  <div className="flex-1 h-2 bg-[var(--sl-s3)] rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${sk.pct}%`, background: barColor }} />
                  </div>
                  <span className="font-[DM_Mono] text-[11px] w-9 text-right shrink-0" style={{ color: textColor }}>
                    {sk.label || `${sk.pct}%`}
                  </span>
                </div>
              )
            })}
            {group.key === 'hard_skill' && (
              <p className="text-[10px] text-[#c4b5fd] font-semibold mt-[6px]">
                ⚡ Dominar Arquitetura = +15 XP + desbloqueia Sênior
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Coach */}
      <div className="mx-4 mb-3 flex gap-[11px] p-[13px_14px] rounded-2xl border border-[rgba(139,92,246,0.25)]"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))' }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] shrink-0"
          style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[3px]">Coach Skills</p>
          <p className="text-[12px] text-[var(--sl-t2)] leading-[1.55]">
            Seu ponto forte é <strong className="text-[var(--sl-t1)]">Frontend</strong> (88%). Para Sênior, invista em <strong className="text-[var(--sl-t1)]">Arquitetura</strong> (32%) — trilha no Mente está disponível e vale <strong className="text-[var(--sl-t1)]">+15 XP</strong>.
          </p>
          <button className="inline-flex items-center gap-1 mt-[6px] text-[11px] font-bold text-[#c4b5fd]">
            Iniciar trilha Arquitetura →
          </button>
        </div>
      </div>

      {/* Link Mente */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border"
        style={{ background: 'rgba(139,92,246,0.07)', borderColor: 'rgba(139,92,246,0.2)' }}
      >
        <div className="flex gap-[10px] items-center">
          <span className="text-[20px]">🧠</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">3 habilidades vinculadas a Mente</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[2px]">React, Node.js e Inglês têm trilhas ativas</p>
          </div>
          <ChevronRight size={14} className="text-[#8b5cf6] shrink-0" />
        </div>
      </div>
    </div>
  )
}
