'use client'

import { CARREIRA_PRIMARY_BG, CARREIRA_PRIMARY_BORDER } from '@/lib/carreira-colors'
import type { ProfessionalProfile, CareerHistoryEntry } from '@/hooks/use-carreira'

interface CarreiraTabPerfilProps {
  profile: ProfessionalProfile | null
  history: CareerHistoryEntry[]
}

export function CarreiraTabPerfil({ profile, history }: CarreiraTabPerfilProps) {
  const bg = CARREIRA_PRIMARY_BG
  const border = CARREIRA_PRIMARY_BORDER

  return (
    <div>
      {/* Profile header */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4 border"
        style={{
          background: 'linear-gradient(160deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))',
          borderColor: border,
        }}
      >
        <div className="flex gap-[14px] items-start mb-[14px]">
          <div
            className="w-16 h-16 rounded-[20px] border-2 flex items-center justify-center text-[32px] shrink-0"
            style={{ background: bg, borderColor: border }}
          >
            👨‍💻
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#c4b5fd] uppercase">✦ HERÓI EM EVOLUÇÃO</p>
            <p className="text-[17px] font-bold text-[var(--sl-t1)] mt-[2px]">
              {profile?.current_title ? 'Thiago Mendes' : 'Seu nome'}
            </p>
            <p className="text-[13px] text-[#ec4899] mt-[2px]">
              {profile?.current_title || 'Dev Pleno'} · Full Stack
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[2px]">
              {profile?.current_company || 'TechCorp'} · São Paulo
            </p>
          </div>
        </div>
        <div className="pt-3 border-t" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
          <p className="text-[13px] text-[var(--sl-t2)] leading-[1.6]">
            Desenvolvedor full stack em evolução constante. <strong className="text-[var(--sl-t1)]">5 anos de jornada</strong>, 2 promoções conquistadas, rumo ao Sênior em 2026.
          </p>
          <div className="flex gap-[6px] mt-2 flex-wrap">
            <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(139,92,246,0.12)] text-[#c4b5fd]">⚡ 720 XP totais</span>
            <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(16,185,129,0.12)] text-[#10b981]">2 promoções</span>
            <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">🔥 28 dias streak</span>
          </div>
        </div>
      </div>

      {/* Experience section */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-1">
        CAPÍTULOS DA JORNADA
      </p>
      <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
        {/* Current position */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)]">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            🏆
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">
              Capítulo 2 — Pleno
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
              {profile?.current_company || 'TechCorp'} · Full Stack · Mar 2022 → atual
            </p>
            <p className="text-[10px] font-bold text-[#c4b5fd] mt-[2px]">⚡ +280 XP ganhos neste capítulo</p>
          </div>
          <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(236,72,153,0.12)] text-[#f472b6]">
            Atual
          </span>
        </div>
        {/* Past position */}
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0 bg-[rgba(100,100,100,0.1)]">
            📖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">
              Capítulo 1 — Junior
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">StartupXYZ · Frontend · Jan 2020 → Fev 2022</p>
            <p className="text-[10px] text-[#10b981] font-semibold mt-[2px]">✅ +200 XP · Badge "Primeiro Emprego"</p>
          </div>
          <span className="inline-flex px-2 py-[3px] rounded-[10px] text-[10px] font-semibold bg-[rgba(16,185,129,0.12)] text-[#10b981]">Concluído</span>
        </div>
      </div>

      {/* Formação */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-3">
        CONQUISTAS ACADÊMICAS
      </p>
      <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)]">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
            style={{ background: 'rgba(139,92,246,0.08)' }}>
            🎓
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">Ciência da Computação</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">USP · Bacharel · 2015–2019</p>
            <p className="text-[10px] text-[#10b981] font-semibold mt-[2px]">✅ +50 XP · Badge "Formado"</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
            style={{ background: 'rgba(139,92,246,0.08)' }}>
            📜
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-[var(--sl-t1)]">AWS Solutions Architect</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">Amazon · Certificação 2023</p>
            <p className="text-[10px] text-[#10b981] font-semibold mt-[2px]">✅ +30 XP · Badge "Certificado AWS"</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 mb-2 mt-3">
        LINKS PROFISSIONAIS
      </p>
      <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
        {[
          { icon: '💼', name: 'LinkedIn', url: 'linkedin.com/in/thiagomendes', bg: 'rgba(0,119,181,0.15)' },
          { icon: '🐙', name: 'GitHub', url: 'github.com/thiago-dev', bg: 'rgba(100,100,100,0.15)' },
          { icon: '🌐', name: 'Portfolio', url: 'thiago.dev', bg: 'rgba(100,100,100,0.15)' },
        ].map((link, i, arr) => (
          <div key={link.name} className={`flex items-center gap-3 px-5 py-3 ${i < arr.length - 1 ? 'border-b border-[var(--sl-border)]' : ''}`}>
            <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0" style={{ background: link.bg }}>
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[var(--sl-t1)]">{link.name}</p>
              <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">{link.url}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
