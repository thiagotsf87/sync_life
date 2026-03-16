import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, LayoutGrid, Activity, Zap, UserPlus, Settings, CircleCheck } from 'lucide-react'
import '@/app/landing.css'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { ScrollReveal } from '@/components/landing/ScrollReveal'
import { SyncLifeIcon } from '@/components/shell/icons'

export const metadata: Metadata = {
  title: 'SyncLife — O sistema operacional da sua vida',
  description: 'Finanças, saúde, carreira, metas, agenda e patrimônio. 8 dimensões da sua vida integradas com um score inteligente.',
  keywords: ['finanças pessoais', 'controle financeiro', 'metas pessoais', 'agenda', 'planejamento financeiro', 'investimentos', 'carreira', 'saúde'],
  openGraph: {
    title: 'SyncLife — O sistema operacional da sua vida',
    description: '8 dimensões da vida integradas com Life Sync Score.',
    url: 'https://synclife.com.br',
    siteName: 'SyncLife',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const MODULES = [
  { name: 'Finanças', desc: 'Controle de receitas, despesas, orçamento por envelopes e visão completa do seu dinheiro.', color: '#10b981', bgAlpha: 'rgba(16,185,129,.1)', pills: ['Envelopes', 'Recorrentes', 'Projeção'], iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { name: 'Tempo', desc: 'Agenda semanal, blocos de foco, eventos e gerenciamento inteligente da sua rotina.', color: '#06b6d4', bgAlpha: 'rgba(6,182,212,.1)', pills: ['Pomodoro', 'Agenda', 'Blocos'], iconType: 'clock' },
  { name: 'Futuro', desc: 'Defina objetivos de longo prazo, acompanhe progresso e planeje marcos importantes.', color: '#0055ff', bgAlpha: 'rgba(0,85,255,.1)', pills: ['Objetivos', 'Milestones', 'Aportes'], iconType: 'target' },
  { name: 'Corpo', desc: 'Registre peso, exercícios, alimentação e acompanhe a evolução da sua saúde física.', color: '#f97316', bgAlpha: 'rgba(249,115,22,.1)', pills: ['Peso', 'Exercícios', 'Nutrição'], iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { name: 'Mente', desc: 'Diário de humor, hábitos, meditação e cuidados com o bem-estar mental.', color: '#eab308', bgAlpha: 'rgba(234,179,8,.1)', pills: ['Humor', 'Hábitos', 'Diário'], iconPath: 'M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z' },
  { name: 'Patrimônio', desc: 'Acompanhe investimentos, ativos, proventos e a evolução do seu patrimônio.', color: '#3b82f6', bgAlpha: 'rgba(59,130,246,.1)', pills: ['Carteira', 'Proventos', 'Evolução'], iconType: 'trending' },
  { name: 'Carreira', desc: 'Gerencie projetos profissionais, certificações, networking e evolução de carreira.', color: '#f43f5e', bgAlpha: 'rgba(244,63,94,.1)', pills: ['Projetos', 'Skills', 'Network'], iconType: 'briefcase' },
  { name: 'Experiências', desc: 'Planeje viagens, organize roteiros, orçamento e checklists de aventuras.', color: '#ec4899', bgAlpha: 'rgba(236,72,153,.1)', pills: ['Viagens', 'Roteiros', 'Budget'], iconType: 'plane' },
]

function ModuleIcon({ mod }: { mod: typeof MODULES[number] }) {
  const stroke = mod.color
  if (mod.iconType === 'clock') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  if (mod.iconType === 'target') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  if (mod.iconType === 'trending') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  if (mod.iconType === 'briefcase') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  if (mod.iconType === 'plane') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d={mod.iconPath ?? ''}/></svg>
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />

      {/* ══════ HERO ══════ */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge anim d1">
                <span className="pulse" />
                100% gratis durante o beta
              </div>
              <h1 className="anim d2">
                O sistema<br />operacional<br />da sua <span className="grad-main">vida.</span>
              </h1>
              <p className="hero-desc anim d3">
                Financas, saude, carreira, metas, agenda e patrimonio. 8 dimensoes da sua vida integradas com um score inteligente que mostra o equilibrio entre todas elas.
              </p>
              <div className="hero-ctas anim d4">
                <Link href="/cadastro" className="btn-primary-lg">
                  Comecar gratis
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link href="/login" className="btn-ghost-lg">Ja tenho conta</Link>
              </div>
              <div className="hero-info anim d5">
                <span className="hero-info-item">
                  <Check size={14} color="#10b981" strokeWidth={2} />
                  Sem cartao de credito
                </span>
                <span className="hero-info-item">
                  <Check size={14} color="#10b981" strokeWidth={2} />
                  8 dimensoes da vida
                </span>
                <span className="hero-info-item">
                  <Check size={14} color="#10b981" strokeWidth={2} />
                  12 temas visuais
                </span>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="hero-visual anim d3">
              <div className="dash-preview">
                <div className="dp-header">
                  <div>
                    <div className="dp-greeting">Bom dia, Thiago</div>
                    <div className="dp-date">Seg, 15 Mar 2026</div>
                  </div>
                  <div className="dp-tasks-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    3 tarefas hoje
                  </div>
                </div>
                <div className="dp-score">
                  <div className="score-ring">
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="var(--s3)" strokeWidth="5"/>
                      <circle cx="36" cy="36" r="30" fill="none" stroke="url(#sg-hero)" strokeWidth="5" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="52" transform="rotate(-90 36 36)"/>
                      <defs><linearGradient id="sg-hero" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--green)"/><stop offset="100%" stopColor="var(--cyan)"/></linearGradient></defs>
                    </svg>
                    <span className="score-num">72</span>
                  </div>
                  <div className="score-detail">
                    <div className="score-label">Life Sync Score</div>
                    <div className="score-val">72 <span className="score-val-suffix">/100</span></div>
                    <div className="score-change">+4 pts esta semana</div>
                  </div>
                </div>
                <div className="dp-modules">
                  {[
                    { name: 'Financas', val: '85', color: 'var(--green)', bg: 'rgba(16,185,129,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                    { name: 'Tempo', val: '68', color: 'var(--cyan)', bg: 'rgba(6,182,212,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                    { name: 'Corpo', val: '74', color: 'var(--orange)', bg: 'rgba(249,115,22,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
                    { name: 'Futuro', val: '61', color: 'var(--el)', bg: 'rgba(0,85,255,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--el)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
                  ].map(m => (
                    <div key={m.name} className="dp-mod">
                      <div className="dp-mod-icon" style={{ background: m.bg }}>{m.icon}</div>
                      <div className="dp-mod-name">{m.name}</div>
                      <div className="dp-mod-val" style={{ color: m.color }}>{m.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ STATS BAND ══════ */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '8', label: 'Dimensoes da vida' },
              { num: '12', label: 'Temas visuais' },
              { num: '1', label: 'Score unificado' },
              { num: '100%', label: 'Gratis no beta' },
            ].map(s => (
              <ScrollReveal key={s.num + s.label}>
                <div className="stat-item">
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MODULES ══════ */}
      <section className="section" id="features">
        <div className="container">
          <ScrollReveal>
            <div className="section-tag">
              <LayoutGrid size={14} />
              Dimensoes
            </div>
            <h2 className="section-title">Tudo o que voce precisa,<br />num unico lugar.</h2>
            <p className="section-desc">Cada dimensao da sua vida tem espaco proprio, mas ganha superpoderes quando conectada com as outras.</p>
          </ScrollReveal>

          <div className="modules-grid">
            {MODULES.map((mod, i) => (
              <ScrollReveal key={mod.name} delay={Math.min(i % 4 + 1, 3) as 1 | 2 | 3}>
                <div className="mod-card">
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px', background: mod.color }} />
                  <div className="mod-card-icon" style={{ background: mod.bgAlpha }}>
                    <ModuleIcon mod={mod} />
                  </div>
                  <h3>{mod.name}</h3>
                  <p>{mod.desc}</p>
                  <div className="features">
                    {mod.pills.map(p => <span key={p} className="feat-pill">{p}</span>)}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ LIFE SYNC SCORE ══════ */}
      <section className="section score-section" id="score">
        <div className="container">
          <div className="score-layout">
            <ScrollReveal>
              <div className="score-visual">
                <div className="big-ring">
                  <svg width="260" height="260" viewBox="0 0 260 260">
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--s3)" strokeWidth="8"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--green)" strokeWidth="8" strokeLinecap="round" strokeDasharray="86.4 604.5" strokeDashoffset="0" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--cyan)" strokeWidth="8" strokeLinecap="round" strokeDasharray="86.4 604.5" strokeDashoffset="-86.4" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--el)" strokeWidth="8" strokeLinecap="round" strokeDasharray="86.4 604.5" strokeDashoffset="-172.8" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--orange)" strokeWidth="8" strokeLinecap="round" strokeDasharray="86.4 604.5" strokeDashoffset="-259.2" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--yellow)" strokeWidth="8" strokeLinecap="round" strokeDasharray="86.4 604.5" strokeDashoffset="-345.6" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--blue)" strokeWidth="8" strokeLinecap="round" strokeDasharray="86.4 604.5" strokeDashoffset="-432" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--rose)" strokeWidth="8" strokeLinecap="round" strokeDasharray="50 640.9" strokeDashoffset="-518.4" transform="rotate(-90 130 130)" opacity=".9"/>
                    <circle cx="130" cy="130" r="110" fill="none" stroke="var(--pink)" strokeWidth="8" strokeLinecap="round" strokeDasharray="50 640.9" strokeDashoffset="-570" transform="rotate(-90 130 130)" opacity=".9"/>
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div className="big-ring-num">72</div>
                    <div className="big-ring-label">Life Sync Score</div>
                  </div>
                </div>
                <div className="ring-modules">
                  <div className="ring-mod" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    <span className="rm-dot" style={{ background: 'var(--green)' }} /> Financas 85
                  </div>
                  <div className="ring-mod" style={{ top: '60px', right: 0 }}>
                    <span className="rm-dot" style={{ background: 'var(--cyan)' }} /> Tempo 68
                  </div>
                  <div className="ring-mod" style={{ bottom: '60px', right: '10px' }}>
                    <span className="rm-dot" style={{ background: 'var(--orange)' }} /> Corpo 74
                  </div>
                  <div className="ring-mod" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    <span className="rm-dot" style={{ background: 'var(--yellow)' }} /> Mente 70
                  </div>
                  <div className="ring-mod" style={{ top: '60px', left: 0 }}>
                    <span className="rm-dot" style={{ background: 'var(--blue)' }} /> Patrimonio 65
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <div>
                <div className="section-tag">
                  <Activity size={14} />
                  Exclusivo
                </div>
                <h2 className="section-title">Seu Life Sync<br />Score pessoal.</h2>
                <p className="section-desc" style={{ marginBottom: 28 }}>
                  Um numero de 0 a 100 que mostra o equilibrio entre todas as areas da sua vida. Inspirado nos Activity Rings da Apple, mas para a vida inteira.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="score-info-item">
                    <div className="score-info-icon" style={{ background: 'rgba(16,185,129,.08)' }}>
                      <Activity size={16} color="var(--green)" />
                    </div>
                    <div>
                      <div className="score-info-title">Visao holistica</div>
                      <div className="score-info-desc">Cada dimensao contribui para o score de forma ponderada e personalizada.</div>
                    </div>
                  </div>
                  <div className="score-info-item">
                    <div className="score-info-icon" style={{ background: 'rgba(6,182,212,.08)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                    </div>
                    <div>
                      <div className="score-info-title">Evolucao semanal</div>
                      <div className="score-info-desc">Veja seu progresso semana a semana e identifique tendencias.</div>
                    </div>
                  </div>
                  <div className="score-info-item">
                    <div className="score-info-icon" style={{ background: 'rgba(99,102,241,.08)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div>
                      <div className="score-info-title">Panorama inteligente</div>
                      <div className="score-info-desc">Insights automaticos sobre quais areas precisam de mais atencao.</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="section" id="como">
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <div className="section-tag" style={{ justifyContent: 'center' }}>
              <CircleCheck size={14} />
              Simples
            </div>
            <h2 className="section-title">Comece em 2 minutos.</h2>
            <p className="section-desc" style={{ margin: '0 auto 44px' }}>Tres passos simples para ter o controle total da sua vida.</p>
          </ScrollReveal>

          <div className="steps-grid">
            {[
              { num: '01', title: 'Crie sua conta', desc: 'Cadastro rapido com e-mail ou Google. Sem burocracia, sem cartao de credito.', icon: <UserPlus size={22} color="var(--green)" /> },
              { num: '02', title: 'Configure o basico', desc: 'Informe seus objetivos e areas de foco em um onboarding guiado de 4 passos.', icon: <Settings size={22} color="var(--green)" /> },
              { num: '03', title: 'Gerencie tudo', desc: 'Explore as 8 dimensoes, acompanhe seu Life Score e veja sua vida evoluir.', icon: <Activity size={22} color="var(--green)" /> },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={(i + 1) as 1 | 2 | 3}>
                <div className="step-card">
                  <span className="step-num">{step.num}</span>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ BETA CTA ══════ */}
      <section className="beta-cta">
        <div className="container">
          <ScrollReveal>
            <div className="beta-badge">
              <Zap size={14} />
              Beta aberto
            </div>
            <h2>Pronto para organizar<br />a sua vida?</h2>
            <p>Junte-se ao beta e tenha acesso a todas as dimensoes, todos os temas e todas as funcionalidades. Sem pagar nada.</p>
            <Link href="/cadastro" className="btn-primary-lg">
              Criar minha conta gratis
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="lp-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <SyncLifeIcon size={20} animated={false} />
              SyncLife &copy; 2026
            </div>
            <div className="footer-links">
              <a href="#">Termos de uso</a>
              <a href="#">Politica de privacidade</a>
              <a href="#">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
