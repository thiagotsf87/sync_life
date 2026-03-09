import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import '@/app/landing.css'
import { Navbar } from '@/components/landing/Navbar'
import { SocialStrip } from '@/components/landing/SocialStrip'
import { ScrollReveal } from '@/components/landing/ScrollReveal'
import { LifeScoreSection } from '@/components/landing/LifeScoreSection'
import { SyncLifeIcon, SyncLifeBrand } from '@/components/shell/icons'

export const metadata: Metadata = {
  title: 'SyncLife — O sistema operacional da sua vida',
  description: 'Finanças, metas, agenda, corpo, mente e mais — 9 módulos num único app. Dois modos de uso para quem quer evoluir, não só acompanhar.',
  keywords: ['finanças pessoais', 'controle financeiro', 'metas pessoais', 'agenda', 'planejamento financeiro', 'investimentos', 'carreira', 'saúde'],
  openGraph: {
    title: 'SyncLife — O sistema operacional da sua vida',
    description: '9 módulos — finanças, metas, agenda, corpo, mente e mais — com Life Sync Score.',
    url: 'https://synclife.com.br',
    siteName: 'SyncLife',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}


const chartBars = [
  { h: 55, type: 'income' }, { h: 35, type: 'expense' },
  { h: 70, type: 'income' }, { h: 45, type: 'expense' },
  { h: 60, type: 'income' }, { h: 30, type: 'expense' },
  { h: 80, type: 'income' }, { h: 50, type: 'expense' },
  { h: 65, type: 'income' }, { h: 40, type: 'expense' },
  { h: 75, type: 'income' }, { h: 35, type: 'expense' },
]

const planningMonths = [
  { l: 'Fev', v: '1,8k', c: 'pos' }, { l: 'Mar', v: '2,2k', c: 'pos' },
  { l: 'Abr', v: '620', c: 'neg' },  { l: 'Mai', v: '1,9k', c: 'pos' },
  { l: 'Jun', v: '3,4k', c: 'pos' }, { l: 'Jul', v: '2,8k', c: 'pos' },
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* ══════ HERO ══════ */}
      <section className="hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />

        <div className="hero-badge">
          <div className="hero-badge-dot" />
          MVP v2 — Beta aberto
        </div>

        <h1 className="hero-title">
          <span>O sistema operacional</span>
          <span className="grad-main">da sua vida.</span>
        </h1>

        <p className="hero-sub">
          Finanças, metas, agenda, corpo, mente e mais — 9 módulos num único app. Dois modos de uso para quem quer evoluir, não só acompanhar.
        </p>

        <div className="hero-actions">
          <Link href="/cadastro" className="btn-primary hero-btn">
            Começar grátis <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link href="#features" className="btn-secondary">
            Ver funcionalidades
          </Link>
        </div>

        <p className="hero-disclaimer">Grátis para começar · Sem cartão de crédito · Cancele quando quiser</p>

        {/* App preview mockup */}
        <div className="hero-preview">
          <div className="hero-preview-frame">
            <div className="preview-topbar">
              <div className="preview-dots">
                <span className="preview-dot-red" />
                <span className="preview-dot-yellow" />
                <span className="preview-dot-green" />
              </div>
              <div className="preview-url">app.synclife.com.br/dashboard</div>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="preview-icon"><SyncLifeIcon size={28} animated={false} /></div>
                <div className="preview-icon active" style={{ fontSize: 18 }}>💰</div>
                <div className="preview-icon" style={{ fontSize: 18, opacity: 0.4 }}>🎯</div>
                <div className="preview-icon" style={{ fontSize: 18, opacity: 0.4 }}>📅</div>
                <div style={{ flex: 1 }} />
                <div className="preview-icon" style={{ fontSize: 18, opacity: 0.4 }}>⚙️</div>
              </div>
              <div className="preview-content">
                <div className="preview-header">
                  <div>
                    <div className="preview-header-title">Boa tarde, Thiago! ✨</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Fevereiro 2026</div>
                  </div>
                  <div className="preview-period">Fev 2026 ▼</div>
                </div>
                <div className="preview-score">
                  <div className="score-num">74</div>
                  <div style={{ flex: 1 }}>
                    <div className="score-label">Life Sync Score</div>
                    <div className="score-phrase">Você está consistente!</div>
                    <div className="score-bar-wrap"><div className="score-bar-fill" /></div>
                  </div>
                </div>
                <div className="preview-cards">
                  <div className="preview-card">
                    <div className="preview-card-label">Receitas</div>
                    <div className="preview-card-value positive">+R$5.000</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card-label">Despesas</div>
                    <div className="preview-card-value negative">R$3.200</div>
                  </div>
                  <div className="preview-card">
                    <div className="preview-card-label">Saldo</div>
                    <div className="preview-card-value positive">+R$1.800</div>
                  </div>
                </div>
                <div className="preview-chart">
                  {chartBars.map((bar, i) => (
                    <div key={i} className={`chart-bar ${bar.type}`} style={{ height: `${bar.h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SOCIAL PROOF ══════ */}
      <SocialStrip />

      {/* ══════ FEATURES ══════ */}
      <section className="features-section" id="features">
        <div className="lp-container">
          <div className="features-header">
            <ScrollReveal>
              <div className="section-label centered">Funcionalidades</div>
              <h2 className="section-title" style={{ textAlign: 'center' }}>9 módulos. Uma vida sincronizada.</h2>
              <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>
                Cada módulo se integra com os outros. Finanças alimentam seu patrimônio. Metas aparecem na agenda. Corpo e mente evoluem juntos. Tudo conectado.
              </p>
            </ScrollReveal>
          </div>
          <div className="modules-grid modules-grid-v3">
            {[
              {
                cls: 'fin', icon: '💰', label: 'Finanças', color: '#10b981',
                title: 'Controle total do seu dinheiro',
                desc: 'Entender o futuro do seu caixa e tomar decisões hoje que impactam amanhã.',
                features: ['Planejamento futuro 12 meses', 'Orçamentos por envelopes', 'Calendário financeiro visual', 'Relatórios e exportação'],
              },
              {
                cls: 'fut', icon: '🔮', label: 'Futuro', color: '#8b5cf6',
                title: 'Objetivos que você realmente atinge',
                desc: 'Crie metas com prazo, acompanhe o ritmo real e saiba o que fazer hoje para chegar lá.',
                features: ['Projeção automática de conclusão', 'Registro de progresso com histórico', 'Alertas de ritmo abaixo', 'Milestones por objetivo'],
              },
              {
                cls: 'tmp', icon: '⏳', label: 'Tempo', color: '#06b6d4',
                title: 'Organize seu tempo com intenção',
                desc: 'Agenda conectada às suas metas e ao seu planejamento financeiro.',
                features: ['Visão semanal e mensal', 'Eventos vinculados a metas', 'Blocos de foco', 'Lembretes inteligentes'],
              },
              {
                cls: 'crp', icon: '🏃', label: 'Corpo', color: '#f97316',
                title: 'Sua saúde física em dados',
                desc: 'Acompanhe atividades, peso, medidas e alimentação com suporte de IA.',
                features: ['Registro de atividades', 'Peso e medidas com gráficos', 'Cardápio sugerido por IA', 'Saúde preventiva'],
              },
              {
                cls: 'mnt', icon: '🧠', label: 'Mente', color: '#eab308',
                title: 'Foco, meditação e leitura',
                desc: 'Cultive seus hábitos mentais com trilhas de aprendizado e sessões de foco.',
                features: ['Timer Pomodoro', 'Trilhas de aprendizado', 'Biblioteca pessoal', 'Sessões de meditação'],
              },
              {
                cls: 'ptr', icon: '📈', label: 'Patrimônio', color: '#3b82f6',
                title: 'Investimentos e patrimônio líquido',
                desc: 'Acompanhe carteira, proventos e simule sua independência financeira.',
                features: ['Carteira de investimentos', 'Proventos e dividendos', 'Evolução patrimonial', 'Simulador de IF'],
              },
              {
                cls: 'car', icon: '💼', label: 'Carreira', color: '#f43f5e',
                title: 'Evolução profissional contínua',
                desc: 'Roadmap de carreira, habilidades e histórico de realizações.',
                features: ['Perfil profissional', 'Roadmap de crescimento', 'Habilidades e certificações', 'Histórico de conquistas'],
              },
              {
                cls: 'exp', icon: '✈️', label: 'Experiências', color: '#ec4899',
                title: 'Viagens e experiências de vida',
                desc: 'Planeje viagens com itinerário, orçamento e checklist integrados.',
                features: ['Planejamento de viagens', 'Itinerário dia a dia', 'Orçamento de viagem', 'Sugestões com IA'],
              },
              {
                cls: 'conq', icon: '🏆', label: 'Conquistas', color: '#f59e0b',
                title: 'Gamificação da sua evolução',
                desc: 'Badges, ranking e celebração de cada marco na sua jornada.',
                features: ['33 badges desbloqueáveis', 'Ranking pessoal', 'Life Sync Score', 'Streaks e desafios'],
              },
            ].map((mod, i) => (
              <ScrollReveal key={mod.cls} delay={Math.min(i + 1, 3) as 1 | 2 | 3}>
                <div className={`module-card ${mod.cls}`}>
                  <div className="module-icon" style={{ background: `${mod.color}18` }}>{mod.icon}</div>
                  <span className="module-color" style={{ color: mod.color }}>{mod.label}</span>
                  <h3 className="module-title">{mod.title}</h3>
                  <p className="module-desc">{mod.desc}</p>
                  <ul className="module-features">
                    {mod.features.map((f, j) => <li key={j} style={{ '--mod-color': mod.color } as React.CSSProperties}>{f}</li>)}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MODOS ══════ */}
      <section className="modes-section lp-section" id="modos">
        <div className="modes-bg" />
        <div className="lp-container">
          <div className="modes-inner">
            <div className="modes-header">
              <ScrollReveal>
                <div className="section-label">Personalização</div>
                <h2 className="section-title">Um app, duas personalidades.</h2>
                <p className="section-sub">Você decide como quer enxergar sua vida. Dados objetivos ou motivação diária — e pode trocar quando quiser.</p>
                <div className="modes-toggle">
                  <div className="mode-toggle-btn active-foco">
                    <span style={{ fontSize: 20 }}>🎯</span>
                    <div><div className="mtb-name">Modo Foco</div><div className="mtb-desc">Dados precisos, sem distrações</div></div>
                  </div>
                  <div className="mode-toggle-btn active-jornada">
                    <span style={{ fontSize: 20 }}>🌱</span>
                    <div><div className="mtb-name">Modo Jornada</div><div className="mtb-desc">Motivação e progresso visual</div></div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Card Foco */}
            <ScrollReveal delay={1}>
              <div className="mode-card foco">
                <div className="mode-card-header">
                  <span className="mode-card-badge foco">🎯 Modo Foco</span>
                  <div className="mode-card-title">Fevereiro 2026</div>
                  <div className="mode-card-sub">Dashboard financeiro</div>
                </div>
                <div className="mode-card-body">
                  <div className="foco-panel">
                    <div className="foco-row"><span className="foco-row-label">receita_total</span><span className="foco-row-val pos">+R$ 5.000,00</span></div>
                    <div className="foco-row"><span className="foco-row-label">despesa_total</span><span className="foco-row-val neg">−R$ 3.200,00</span></div>
                    <div className="foco-row"><span className="foco-row-label">saldo_mes</span><span className="foco-row-val pos">+R$ 1.800,00</span></div>
                    {[
                      { l: 'alimentacao', p: 87, w: '87%', c: 'var(--orange)' },
                      { l: 'transporte', p: 54, w: '54%', c: 'var(--green)' },
                      { l: 'lazer', p: 38, w: '38%', c: 'var(--green)' },
                    ].map(b => (
                      <div key={b.l} className="foco-bar-row">
                        <div className="foco-bar-top">
                          <span className="foco-bar-label">{b.l}</span>
                          <span className="foco-bar-pct" style={{ color: b.c }}>{b.p}%</span>
                        </div>
                        <div className="foco-bar"><div className="foco-bar-fill" style={{ width: b.w, background: b.c }} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="mode-traits">
                    <div className="mode-trait"><span style={{ fontSize: 16 }}>📊</span><div><span className="trait-label">Interface compacta</span><span className="trait-desc">Só o que importa. Sem animações, sem distrações.</span></div></div>
                    <div className="mode-trait"><span style={{ fontSize: 16 }}>🔢</span><div><span className="trait-label">Números em destaque</span><span className="trait-desc">Tipografia mono para precisão técnica total.</span></div></div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Card Jornada */}
            <ScrollReveal delay={2}>
              <div className="mode-card jornada">
                <div className="mode-card-header">
                  <span className="mode-card-badge jornada">🌱 Modo Jornada</span>
                  <div className="mode-card-title">Boa tarde, Thiago! ✨</div>
                  <div className="mode-card-sub">Você está evoluindo. Continue assim! 🌟</div>
                </div>
                <div className="mode-card-body">
                  <div className="jornada-panel">
                    <div className="j-score-block">
                      <div className="j-score-num">74</div>
                      <div>
                        <div className="j-score-title">Life Sync Score</div>
                        <div className="j-score-phrase">Você está consistente!</div>
                        <div className="j-score-var">↑ +3 esta semana</div>
                      </div>
                    </div>
                    <div className="jornada-goal">
                      <div className="jornada-goal-header">
                        <div className="jornada-goal-name">✈️ Viagem Europa</div>
                        <span className="status-risk">⚠️ Em risco</span>
                      </div>
                      <div className="goal-bar"><div className="goal-bar-fill" /></div>
                      <div className="goal-foot"><span>28% — R$4.200 / R$15.000</span><span>Dez 2026</span></div>
                    </div>
                    <div className="j-insight">
                      <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                      <div className="j-insight-text">Se você adicionar <strong>R$200/mês</strong> a mais em Viagem Europa, atinge sua meta <strong>2 meses antes</strong>. Quer ajustar?</div>
                    </div>
                  </div>
                  <div className="mode-traits">
                    <div className="mode-trait"><span style={{ fontSize: 16 }}>🏆</span><div><span className="trait-label">Conquistas e badges</span><span className="trait-desc">Celebra cada marco da sua jornada.</span></div></div>
                    <div className="mode-trait"><span style={{ fontSize: 16 }}>🤖</span><div><span className="trait-label">Insights com IA</span><span className="trait-desc">Sugestões personalizadas baseadas nos seus dados.</span></div></div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════ LIFE SYNC SCORE ══════ */}
      <LifeScoreSection />

      {/* ══════ PLANEJAMENTO FUTURO ══════ */}
      <section className="planning-section lp-section">
        <div className="lp-container">
          <div className="planning-inner">
            <ScrollReveal>
              <div className="planning-visual">
                <div className="planning-vis-header">
                  <div className="planning-vis-title">📈 Planejamento Futuro</div>
                  <div className="planning-vis-tabs">
                    <span className="pv-tab">3m</span>
                    <span className="pv-tab active">6m</span>
                    <span className="pv-tab">12m</span>
                  </div>
                </div>
                <div className="planning-chart-area">
                  <svg className="planning-svg" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="planning-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <path d="M 0 90 C 30 85, 60 70, 80 65 C 100 60, 130 55, 160 50 C 180 55, 190 90, 230 90 C 255 85, 280 60, 320 50 C 350 40, 380 45, 400 42 L 400 120 L 0 120 Z" fill="url(#planning-grad)" />
                    <path d="M 0 90 C 30 85, 60 70, 80 65 C 100 60, 130 55, 160 50" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 160 50 C 180 55, 190 90, 230 90" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 230 90 C 255 85, 280 60, 320 50 C 350 40, 380 45, 400 42" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="155" y="38" width="52" height="16" rx="4" fill="rgba(244,63,94,0.15)" stroke="rgba(244,63,94,0.4)" strokeWidth="1" />
                    <text x="181" y="49" fontSize="9" fill="#f43f5e" textAnchor="middle">⚠ IPVA</text>
                    <circle cx="0" cy="90" r="4" fill="#10b981" />
                    <circle cx="80" cy="65" r="4" fill="#10b981" />
                    <circle cx="160" cy="50" r="4" fill="#f43f5e" />
                    <circle cx="320" cy="50" r="4" fill="#10b981" />
                    <circle cx="400" cy="42" r="4" fill="#10b981" />
                  </svg>
                </div>
                <div className="planning-months">
                  {planningMonths.map(m => (
                    <div key={m.l} className="planning-month">
                      <div className="planning-month-label">{m.l}</div>
                      <div className={`planning-month-val ${m.c}`}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="planning-events">
                  <div className="planning-event"><div className="event-dot green" /><span className="event-name">Salário — todo dia 28</span><span className="event-val pos">+R$5.000</span><span className="event-badge recorrente">recorrente</span></div>
                  <div className="planning-event"><div className="event-dot blue" /><span className="event-name">Aluguel — todo dia 5</span><span className="event-val neg">−R$1.500</span><span className="event-badge recorrente">recorrente</span></div>
                  <div className="planning-event"><div className="event-dot purple" /><span className="event-name">IPVA — Abril</span><span className="event-val neg">−R$1.200</span><span className="event-badge planejado">planejado</span></div>
                  <div className="planning-event"><div className="event-dot yellow" /><span className="event-name">Meta: Viagem Europa</span><span className="event-val neg">−R$800/mês</span><span className="event-badge meta-badge">meta</span></div>
                </div>
                <div className="planning-insight">
                  <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                  <div className="planning-insight-text">Em abril seu saldo cai para <strong>R$620</strong> por causa do IPVA. Quer criar um envelope de reserva agora para suavizar esse impacto?</div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={1}>
              <div className="planning-content">
                <div className="section-label">Planejamento Futuro</div>
                <h2 className="section-title">Veja seu dinheiro daqui a 12 meses.</h2>
                <p className="section-sub">
                  A funcionalidade mais estratégica do SyncLife. Responde a pergunta que todo app brasileiro evita: <em>&ldquo;Como vai estar meu dinheiro daqui a 6 meses?&rdquo;</em>
                </p>
                <div className="planning-tags">
                  <div className="planning-tag"><div className="tag-dot" style={{ background: 'var(--em)' }} />Receitas recorrentes</div>
                  <div className="planning-tag"><div className="tag-dot" style={{ background: '#3b82f6' }} />Despesas recorrentes</div>
                  <div className="planning-tag"><div className="tag-dot" style={{ background: '#8b5cf6' }} />Eventos planejados</div>
                  <div className="planning-tag"><div className="tag-dot" style={{ background: 'var(--yellow)' }} />Contribuições de metas</div>
                </div>
                <div className="planning-traits">
                  {[
                    { icon: '📅', title: 'Horizonte de 3, 6 ou 12 meses', desc: 'Ajuste o quanto quer ver à frente conforme sua necessidade.' },
                    { icon: '⚠️', title: 'Alertas de saldo negativo', desc: 'Quando o saldo projetado fica vermelho, o app sugere ações concretas.' },
                    { icon: '🤖', title: 'Insights automáticos com IA', desc: 'Análise contextual baseada nos seus dados reais, não em templates genéricos.' },
                  ].map(t => (
                    <div key={t.title} className="planning-trait">
                      <span className="planning-trait-icon">{t.icon}</span>
                      <div>
                        <div className="planning-trait-title">{t.title}</div>
                        <div className="planning-trait-desc">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════ DEPOIMENTOS ══════ */}
      <section className="testimonials-section lp-section">
        <div className="lp-container">
          <div className="testimonials-header">
            <ScrollReveal>
              <div className="section-label centered">Depoimentos</div>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Quem já está usando.</h2>
            </ScrollReveal>
          </div>
          <div className="testimonials-grid">
            {[
              { letter: 'R', name: 'Rafael M.', role: 'Engenheiro de Software, 32 anos', score: '🎯 Score: 81 ↑', text: '"Finalmente um app que mostra o futuro do meu dinheiro. A função de planejamento mudou completamente como eu tomo decisões financeiras."' },
              { letter: 'A', name: 'Ana C.', role: 'Designer, 27 anos', score: '🌱 Score: 67 ↑ +8', text: '"O Modo Jornada me motivou de um jeito que nenhum outro app conseguiu. Desbloqueei minha primeira conquista em 3 dias e não parei mais."' },
              { letter: 'M', name: 'Marcos T.', role: 'Analista Financeiro, 38 anos', score: '🎯 Score: 91', text: '"Uso no Modo Foco e é exatamente o que quero: dados objetivos sem frescura. A visão de orçamentos por envelope é a melhor que já vi em app brasileiro."' },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={(i + 1) as 1 | 2 | 3}>
                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">{t.letter}</div>
                    <div><div className="author-name">{t.name}</div><div className="author-role">{t.role}</div></div>
                  </div>
                  <div className="testimonial-score">{t.score}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section className="pricing-section lp-section" id="precos">
        <div className="lp-container">
          <div className="pricing-header">
            <ScrollReveal>
              <div className="section-label centered">Preços</div>
              <h2 className="section-title" style={{ textAlign: 'center' }}>Simples e transparente.</h2>
              <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>Comece grátis. Escale quando sua vida exigir mais.</p>
            </ScrollReveal>
          </div>
          <div className="pricing-grid">
            <ScrollReveal delay={1}>
              <div className="pricing-card">
                <span className="pricing-badge free">✦ Grátis</span>
                <div className="pricing-price">
                  <span className="price-currency">R$</span>
                  <span className="price-num">0</span>
                  <span className="price-period">/mês</span>
                </div>
                <p className="pricing-desc">Tudo que você precisa para começar a organizar sua vida financeira.</p>
                <div className="pricing-divider" />
                <ul className="pricing-features">
                  {[
                    { ok: true, t: 'Transações ilimitadas' },
                    { ok: true, t: 'Dashboard financeiro completo' },
                    { ok: true, t: 'Módulo Futuro (até 3 objetivos)' },
                    { ok: true, t: 'Módulo Tempo (agenda básica)' },
                    { ok: true, t: '5 recorrentes ativas' },
                    { ok: true, t: 'Planejamento futuro (3 meses)' },
                    { ok: false, t: 'Life Sync Score' },
                    { ok: false, t: 'Exportação PDF/Excel' },
                  ].map((f, i) => (
                    <li key={i} className="pricing-feature" style={{ opacity: f.ok ? 1 : 0.4 }}>
                      <span style={{ flexShrink: 0 }}>{f.ok ? '✅' : '⬜'}</span>
                      <span className={f.ok ? 'pf-strong' : ''}>{f.t}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastro" className="btn-secondary">Criar conta grátis</Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="pricing-card pro">
                <span className="pricing-recommended">Recomendado</span>
                <span className="pricing-badge pro-badge">🚀 PRO</span>
                <div className="pricing-price">
                  <span className="price-currency">R$</span>
                  <span className="price-num grad-em">29</span>
                  <span className="price-period">/mês</span>
                </div>
                <p className="pricing-desc">Para quem leva a sério a organização da vida. Desbloqueie tudo.</p>
                <div className="pricing-divider" />
                <ul className="pricing-features">
                  {['Tudo do plano Grátis', 'Life Sync Score com histórico', 'Todos os 9 módulos completos', 'Objetivos e recorrentes ilimitados', 'Planejamento futuro até 12 meses', 'Relatórios + Exportação PDF e Excel', 'Insights com IA', 'Suporte prioritário'].map((f, i) => (
                    <li key={i} className="pricing-feature">
                      <span style={{ flexShrink: 0 }}>✅</span>
                      <span className="pf-strong">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastro?plan=pro" className="btn-primary">Começar PRO — 14 dias grátis</Link>
                <p className="pricing-note">Sem compromisso. Cancele quando quiser.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════ CTA FINAL ══════ */}
      <section className="cta-section lp-section">
        <div className="cta-bg" />
        <div className="cta-grid" />
        <div className="lp-container" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal>
            <h2 className="cta-title">
              Sua vida organizada começa <span className="grad-main">hoje.</span>
            </h2>
            <p className="cta-sub">Crie sua conta em menos de 2 minutos. Comece grátis. Sem cartão de crédito.</p>
            <div className="cta-actions">
              <Link href="/cadastro" className="btn-primary">
                Criar conta grátis <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <Link href="#features" className="btn-secondary">Explorar funcionalidades</Link>
            </div>
            <p className="cta-note">Já tem uma conta? <Link href="/login">Entrar →</Link></p>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="footer-inner">
            <div>
              <div className="footer-logo">
                <SyncLifeBrand size="sm" animated={false} />
              </div>
              <p className="footer-tagline">O sistema operacional da sua vida. 9 módulos integrados num único lugar.</p>
            </div>
            <div>
              <div className="footer-col-title">Produto</div>
              <ul className="footer-links">
                <li><a href="#features">Funcionalidades</a></li>
                <li><a href="#modos">Modo Foco</a></li>
                <li><a href="#modos">Modo Jornada</a></li>
                <li><a href="#score">Life Sync Score</a></li>
                <li><a href="#precos">Preços</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Empresa</div>
              <ul className="footer-links">
                <li><a href="#">Sobre nós</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Changelog</a></li>
                <li><a href="#">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Suporte</div>
              <ul className="footer-links">
                <li><a href="#">Central de ajuda</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 SyncLife. Todos os direitos reservados.</span>
            <div className="footer-legal">
              <a href="#">Termos de Uso</a>
              <a href="#">Política de Privacidade</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
