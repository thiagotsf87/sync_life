'use client'

import { useState, type ReactNode, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Target,
  Clock,
  Heart,
  Brain,
  TrendingUp,
  Briefcase,
  Plane,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  Send,
  Search,
  FileText,
} from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'

/* ════════════════════════════════════════════════════════════════
   SyncLife — Landing page v3 (1:1 port do protótipo)
   Fonte: docs/prototypes-v3/landing/*
════════════════════════════════════════════════════════════════ */

const FONT_DISPLAY = 'var(--font-syne), var(--font-space-grotesk), sans-serif'
const FONT_BODY = 'var(--font-dm-sans), system-ui, sans-serif'

const MODULE_COLORS = {
  fin: '#0F766E',
  fut: '#8B7BD4',
  tmp: '#3CA0B5',
  crp: '#D97534',
  mnt: '#D9962E',
  ptr: '#4F88D4',
  car: '#DB6478',
  exp: '#C76795',
}

export function LandingClient() {
  return (
    <div style={{ background: 'var(--sl-bg)', minHeight: '100vh', color: 'var(--sl-t1)' }}>
      <TopNav />
      <Hero />
      <SocialProof />
      <DomainsSection />
      <IASection />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   TOP NAV
──────────────────────────────────────────────────────────────── */
function TopNav() {
  const links: { label: string; href: string }[] = [
    { label: 'Produto', href: '#produto' },
    { label: 'Preços', href: '#precos' },
    { label: 'Manifesto', href: '#manifesto' },
    { label: 'FAQ', href: '#faq' },
  ]
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 40px',
        backgroundColor: 'color-mix(in srgb, var(--sl-bg) 80%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--sl-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <SyncLifeIcon size={36} animated={false} />
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: 'var(--sl-t1)' }}>Sync</span>
          <span style={{ color: 'var(--sl-em)' }}>Life</span>
        </span>
      </Link>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 28 }}
        className="lp3-nav-links"
      >
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            style={{
              fontSize: 13.5,
              color: 'var(--sl-t2)',
              cursor: 'pointer',
              fontFamily: FONT_BODY,
              textDecoration: 'none',
              transition: 'color .2s',
            }}
          >
            {l.label}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href="/login"
          style={{
            fontSize: 13.5,
            color: 'var(--sl-t2)',
            cursor: 'pointer',
            textDecoration: 'none',
            fontFamily: FONT_BODY,
          }}
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: 'none',
            background: 'var(--sl-em)',
            color: '#0B0F14',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT_BODY,
            boxShadow: '0 0 24px -6px var(--sl-em-soft)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Começar grátis
        </Link>
      </div>
    </nav>
  )
}

/* ────────────────────────────────────────────────────────────────
   HERO
──────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '88px 40px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 60,
        alignItems: 'center',
        maxWidth: 1280,
        margin: '0 auto',
      }}
      className="lp3-hero"
    >
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px 6px 10px',
            borderRadius: 999,
            background: 'var(--sl-em-soft)',
            border: '1px solid var(--sl-border-em, rgba(15,118,110,0.32))',
            color: 'var(--sl-em)',
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: 22,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--sl-em)',
              animation: 'lp3-pulse 2s infinite',
              display: 'inline-block',
            }}
          />
          <Sparkles size={11} strokeWidth={2.2} />
          <span>Novo · Coach IA disponível em todos os planos</span>
        </span>

        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: 'var(--sl-t1)',
            margin: 0,
            maxWidth: 540,
          }}
          className="lp3-h1"
        >
          Sua vida inteira,
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #1F8A8A 0%, #3D6BD9 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            em sincronia.
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: 'var(--sl-t2)',
            lineHeight: 1.55,
            margin: '20px 0 0',
            maxWidth: 500,
          }}
        >
          Finanças, saúde, rotina, carreira e mente. Todas as áreas da sua vida em um só lugar.{' '}
          <strong style={{ color: 'var(--sl-t1)', fontWeight: 600 }}>
            Sem planilhas. Sem 8 apps abertos. Sem ansiedade.
          </strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 30, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/cadastro"
            style={{
              padding: '14px 26px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--sl-em)',
              color: '#0B0F14',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: FONT_BODY,
              boxShadow: '0 0 40px -8px var(--sl-em-soft)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
            }}
          >
            Começar grátis <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
          <a
            href="#produto"
            style={{
              padding: '14px 22px',
              borderRadius: 999,
              background: 'transparent',
              border: '1px solid var(--sl-border)',
              color: 'var(--sl-t1)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: FONT_BODY,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Ver demonstração
          </a>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 28,
            fontSize: 12,
            color: 'var(--sl-t3)',
            flexWrap: 'wrap',
          }}
        >
          {['14 dias PRO grátis', 'Sem cartão de crédito', 'LGPD-ready'].map((p) => (
            <span
              key={p}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Check size={12} strokeWidth={2.4} color="var(--sl-em)" /> {p}
            </span>
          ))}
        </div>
      </div>

      <HeroMockup />
    </section>
  )
}

function HeroMockup() {
  const minis: { Icon: typeof Wallet; color: string; val: string; label: string }[] = [
    { Icon: Wallet, color: MODULE_COLORS.fin, val: 'R$ 12k', label: 'Em caixa' },
    { Icon: Heart, color: MODULE_COLORS.crp, val: '3 / 7', label: 'Treinos' },
    { Icon: Clock, color: MODULE_COLORS.mnt, val: '42 min', label: 'Foco hoje' },
    { Icon: Target, color: MODULE_COLORS.fut, val: '3 metas', label: 'No prazo' },
  ]
  return (
    <div style={{ position: 'relative' }} className="lp3-mockup">
      {/* glow */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          background: 'radial-gradient(circle, var(--sl-em-soft) 0%, transparent 60%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          background: 'var(--sl-s1)',
          border: '1px solid var(--sl-border)',
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
          transform: 'perspective(1200px) rotateY(-3deg) rotateX(2deg)',
        }}
      >
        {/* fake toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.10)',
                display: 'inline-block',
              }}
            />
          ))}
          <span
            style={{
              flex: 1,
              height: 18,
              background: 'var(--sl-s2)',
              borderRadius: 6,
              marginLeft: 8,
            }}
          />
        </div>

        {/* Score row */}
        <div
          style={{
            background: 'var(--sl-s-hero, var(--sl-s2))',
            borderRadius: 12,
            padding: 18,
            backgroundImage:
              'radial-gradient(circle at 0% 0%, var(--sl-em-soft) 0%, transparent 55%)',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: 'var(--sl-t3)',
              textTransform: 'uppercase',
            }}
          >
            LIFE SYNC SCORE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span
              className="sl-num-strong"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 64,
                fontWeight: 700,
                color: 'var(--sl-t1)',
                letterSpacing: '-0.035em',
                lineHeight: 1,
              }}
            >
              74
            </span>
            <span style={{ fontSize: 12, color: 'var(--sl-em)', fontWeight: 600 }}>
              +3 hoje
            </span>
          </div>

          {/* sparkline */}
          <svg
            width="100%"
            height={42}
            viewBox="0 0 240 42"
            preserveAspectRatio="none"
            style={{ display: 'block', marginTop: 10 }}
          >
            <defs>
              <linearGradient id="lp3-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F766E" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M0,30 C20,24 40,28 60,20 C80,12 100,18 120,14 C140,10 160,18 180,12 C200,6 220,10 240,4 L240,42 L0,42 Z"
              fill="url(#lp3-spark)"
            />
            <path
              d="M0,30 C20,24 40,28 60,20 C80,12 100,18 120,14 C140,10 160,18 180,12 C200,6 220,10 240,4"
              fill="none"
              stroke="#0F766E"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* mini grid 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {minis.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'var(--sl-s2)',
                border: '1px solid var(--sl-border)',
                borderRadius: 10,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: `color-mix(in srgb, ${m.color} 18%, transparent)`,
                    color: m.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <m.Icon size={12} strokeWidth={2.2} />
                </span>
                <span style={{ fontSize: 11, color: 'var(--sl-t3)', fontWeight: 500 }}>
                  {m.label}
                </span>
              </div>
              <div
                className="sl-num-strong"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--sl-t1)',
                }}
              >
                {m.val}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   SOCIAL PROOF
──────────────────────────────────────────────────────────────── */
function SocialProof() {
  return (
    <section
      style={{
        padding: '60px 40px 20px',
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: 'var(--sl-t3)',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        Mais de 24.000 brasileiros já organizam a vida com SyncLife
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          opacity: 0.45,
          filter: 'grayscale(1)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {['Folha de SP', 'Exame', 'Pequenas Empresas', 'Forbes BR', 'O Globo'].map((p) => (
          <span
            key={p}
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--sl-t2)',
              letterSpacing: '-0.01em',
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────
   DOMAINS — 8 áreas
──────────────────────────────────────────────────────────────── */
function DomainsSection() {
  const domains: {
    Icon: typeof Wallet
    color: string
    name: string
    desc: string
  }[] = [
    {
      Icon: Wallet,
      color: MODULE_COLORS.fin,
      name: 'Finanças',
      desc: 'Receitas, despesas, orçamentos, recorrentes, fluxo de caixa e consultor IA dedicado.',
    },
    {
      Icon: Target,
      color: MODULE_COLORS.fut,
      name: 'Futuro',
      desc: 'Metas de curto e longo prazo com aportes, anéis de progresso e milestones.',
    },
    {
      Icon: Clock,
      color: MODULE_COLORS.tmp,
      name: 'Tempo',
      desc: 'Agenda, blocos de foco, Pomodoro e revisão semanal automática.',
    },
    {
      Icon: Heart,
      color: MODULE_COLORS.crp,
      name: 'Corpo',
      desc: 'Atividades, peso, cardápio gerado por IA e coach de saúde.',
    },
    {
      Icon: Brain,
      color: MODULE_COLORS.mnt,
      name: 'Mente',
      desc: 'Trilhas de aprendizado, sessões de leitura e biblioteca pessoal.',
    },
    {
      Icon: TrendingUp,
      color: MODULE_COLORS.ptr,
      name: 'Patrimônio',
      desc: 'Carteira de investimentos, proventos, evolução e simulador de IF.',
    },
    {
      Icon: Briefcase,
      color: MODULE_COLORS.car,
      name: 'Carreira',
      desc: 'Perfil profissional, habilidades, roadmap e histórico documentado.',
    },
    {
      Icon: Plane,
      color: MODULE_COLORS.exp,
      name: 'Experiências',
      desc: 'Viagens, bucket list, passaporte digital e assistente de planejamento IA.',
    },
  ]

  return (
    <section
      id="produto"
      style={{ padding: '40px 40px 80px', maxWidth: 1280, margin: '0 auto' }}
    >
      <header style={{ textAlign: 'center', marginBottom: 50 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: 'var(--sl-em)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          OITO ÁREAS · UMA ÚNICA INTERFACE
        </div>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--sl-t1)',
            margin: 0,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.1,
          }}
          className="lp3-h2"
        >
          Tudo o que você gerencia na sua vida, em um lugar só.
        </h2>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}
        className="lp3-grid-4"
      >
        {domains.map((d) => (
          <article
            key={d.name}
            style={{
              background: 'var(--sl-s1)',
              border: '1px solid var(--sl-border)',
              borderRadius: 16,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              transition: 'border-color .2s, transform .2s',
              cursor: 'default',
            }}
            className="lp3-domain"
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: `color-mix(in srgb, ${d.color} 16%, transparent)`,
                color: d.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <d.Icon size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--sl-t1)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {d.name}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--sl-t3)',
                  margin: '6px 0 0',
                  lineHeight: 1.55,
                }}
              >
                {d.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────
   IA SECTION
──────────────────────────────────────────────────────────────── */
function IASection() {
  return (
    <section id="manifesto" style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div
        style={{
          background: 'var(--sl-s-hero, var(--sl-s1))',
          backgroundImage:
            'radial-gradient(circle at 80% 0%, var(--sl-em-soft) 0%, transparent 50%)',
          border: '1px solid var(--sl-border)',
          borderRadius: 28,
          padding: '60px 56px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
        className="lp3-ia-card"
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: 'var(--sl-em)',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            CONSULTOR IA · INTEGRADO
          </div>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--sl-t1)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Uma IA que{' '}
            <em
              style={{ fontStyle: 'italic', color: 'var(--sl-em)', fontWeight: 600 }}
            >
              conhece sua vida
            </em>
            . E fala como um amigo.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'var(--sl-t2)',
              lineHeight: 1.6,
              margin: '20px 0 28px',
            }}
          >
            Não é mais um chatbot genérico. O consultor do SyncLife enxerga seus orçamentos,
            suas metas, seu treino e seus eventos, e gera insights personalizados em tempo real.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                Icon: Sparkles,
                h: 'Insights diários',
                s: 'Alertas, ações recomendadas e conquistas direto na sua tela inicial.',
              },
              {
                Icon: FileText,
                h: 'Relatórios completos',
                s: 'Gere um PDF do seu mês inteiro em finanças, saúde e produtividade em 1 clique.',
              },
              {
                Icon: Send,
                h: 'Pergunte qualquer coisa',
                s: '"Quanto gastei em lazer? Quanto preciso poupar pra viajar em julho?" em linguagem natural.',
              },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    flexShrink: 0,
                    background: 'var(--sl-em-soft)',
                    color: 'var(--sl-em)',
                    border: '1px solid var(--sl-border-em, rgba(15,118,110,0.32))',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <it.Icon size={14} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sl-t1)' }}>
                    {it.h}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--sl-t3)',
                      marginTop: 2,
                      lineHeight: 1.5,
                    }}
                  >
                    {it.s}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat mockup */}
        <div
          style={{
            background: 'var(--sl-s1)',
            border: '1px solid var(--sl-border)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <ChatBubble role="user">Quanto gastei em lazer esse mês?</ChatBubble>
          <ChatBubble role="ai">
            Você gastou{' '}
            <strong style={{ color: 'var(--sl-t1)' }}>R$ 410,00</strong> em Lazer, 82% do
            orçamento (R$ 500,00). Com 8 dias restantes, considere reduzir saídas até o fim do
            mês.
          </ChatBubble>
          <ChatBubble role="user">E na Viagem Itália, quanto falta?</ChatBubble>
          <ChatBubble role="ai">
            Faltam{' '}
            <strong style={{ color: 'var(--sl-t1)' }}>R$ 4.100,00</strong> (32%) para completar
            a meta. Mantendo seu ritmo atual de R$ 580/mês, você atinge em{' '}
            <strong style={{ color: 'var(--sl-em)' }}>7 meses</strong>, uma semana antes do
            prazo.
          </ChatBubble>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: 'var(--sl-s2)',
              border: '1px solid var(--sl-border)',
              borderRadius: 12,
              marginTop: 4,
            }}
          >
            <Search size={13} color="var(--sl-t3)" />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--sl-t3)' }}>
              Pergunte algo…
            </span>
            <Send size={13} color="var(--sl-em)" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ChatBubble({ role, children }: { role: 'user' | 'ai'; children: ReactNode }) {
  const isUser = role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? 'var(--sl-em-soft)' : 'var(--sl-s2)',
          border: isUser
            ? '1px solid var(--sl-border-em, rgba(15,118,110,0.32))'
            : '1px solid var(--sl-border)',
          color: isUser ? 'var(--sl-em)' : 'var(--sl-t2)',
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   PRICING
──────────────────────────────────────────────────────────────── */
function Pricing() {
  const plans: {
    name: string
    price: string
    sub: string
    pro: boolean
    features: string[]
    cta: string
    href: string
  }[] = [
    {
      name: 'Free',
      price: 'R$ 0',
      sub: 'para sempre',
      pro: false,
      features: [
        'Todos os 11 módulos',
        'Até 50 transações/mês',
        'Score básico',
        '1 dispositivo',
      ],
      cta: 'Começar grátis',
      href: '/cadastro',
    },
    {
      name: 'PRO',
      price: 'R$ 24,90',
      sub: 'por mês',
      pro: true,
      features: [
        'Tudo do Free, sem limites',
        'Consultor IA + Coach IA',
        'Cardápio gerado por IA',
        'Relatórios PDF cross-module',
        'Google Calendar bidirecional',
        'Dispositivos ilimitados',
      ],
      cta: 'Testar 14 dias grátis',
      href: '/cadastro',
    },
  ]

  return (
    <section id="precos" style={{ padding: '80px 40px', maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 50 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: 'var(--sl-em)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          PREÇOS · SEM PEGADINHAS
        </div>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--sl-t1)',
            margin: 0,
            lineHeight: 1.1,
          }}
          className="lp3-h2"
        >
          Comece grátis. Evolua quando quiser.
        </h2>
      </header>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}
        className="lp3-grid-2"
      >
        {plans.map((p) => (
          <article
            key={p.name}
            style={{
              background: p.pro ? 'var(--sl-s-hero, var(--sl-s1))' : 'var(--sl-s1)',
              backgroundImage: p.pro
                ? 'radial-gradient(circle at 0% 0%, var(--sl-em-soft) 0%, transparent 60%)'
                : 'none',
              border:
                '1px solid ' +
                (p.pro
                  ? 'var(--sl-border-em, rgba(15,118,110,0.32))'
                  : 'var(--sl-border)'),
              borderRadius: 22,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'relative',
            }}
          >
            {p.pro && (
              <span
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--sl-em-soft)',
                  border: '1px solid var(--sl-border-em, rgba(15,118,110,0.32))',
                  color: 'var(--sl-em)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                RECOMENDADO
              </span>
            )}
            <div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--sl-t1)',
                  letterSpacing: '-0.02em',
                }}
              >
                {p.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
                <span
                  className="sl-num-strong"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 48,
                    fontWeight: 700,
                    color: 'var(--sl-t1)',
                    letterSpacing: '-0.035em',
                    lineHeight: 1,
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 13, color: 'var(--sl-t3)' }}>{p.sub}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {p.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      flexShrink: 0,
                      background: p.pro ? 'var(--sl-em-soft)' : 'var(--sl-s2)',
                      color: p.pro ? 'var(--sl-em)' : 'var(--sl-t2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} strokeWidth={2.4} />
                  </span>
                  <span style={{ fontSize: 13.5, color: 'var(--sl-t2)' }}>{f}</span>
                </div>
              ))}
            </div>

            <Link
              href={p.href}
              style={{
                padding: '13px 20px',
                borderRadius: 999,
                background: p.pro ? 'var(--sl-em)' : 'transparent',
                color: p.pro ? '#0B0F14' : 'var(--sl-t1)',
                border: p.pro ? 'none' : '1px solid var(--sl-border)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: FONT_BODY,
                boxShadow: p.pro ? '0 0 32px -8px var(--sl-em-soft)' : 'none',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'inline-block',
              }}
            >
              {p.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────
   FAQ
──────────────────────────────────────────────────────────────── */
function FAQ() {
  const items = [
    {
      q: 'Meus dados financeiros ficam seguros?',
      a: 'Sim. SyncLife é LGPD-compliant, dados criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Você pode exportar ou excluir tudo a qualquer momento.',
    },
    {
      q: 'Posso usar grátis pra sempre?',
      a: 'Sim. O plano Free dura indefinidamente. PRO desbloqueia limites e features de IA, mas o essencial funciona pra sempre sem custo.',
    },
    {
      q: 'Funciona offline?',
      a: 'O app mobile sincroniza automaticamente quando você volta online. Você pode registrar transações, eventos e atividades sem conexão.',
    },
    {
      q: 'Tem versão Web e Mobile?',
      a: 'Sim, interfaces nativas para iOS, Android e Web. Tudo sincroniza em tempo real.',
    },
  ]
  const [open, setOpen] = useState<number>(0)
  return (
    <section id="faq" style={{ padding: '80px 40px', maxWidth: 760, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--sl-t1)',
            margin: 0,
          }}
        >
          Perguntas comuns
        </h2>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, i) => {
          const isOpen = open === i
          return (
            <article
              key={i}
              style={{
                background: 'var(--sl-s1)',
                border: '1px solid var(--sl-border)',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '18px 22px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: FONT_BODY,
                  textAlign: 'left',
                  color: 'var(--sl-t1)',
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <span>{it.q}</span>
                <span
                  style={{
                    color: 'var(--sl-t3)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s ease',
                    display: 'inline-flex',
                  }}
                >
                  <ChevronDown size={16} />
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: '0 22px 18px',
                    fontSize: 13.5,
                    color: 'var(--sl-t2)',
                    lineHeight: 1.6,
                  }}
                >
                  {it.a}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────
   FINAL CTA
──────────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section
      style={{
        padding: '80px 40px',
        textAlign: 'center',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--sl-t1)',
          margin: 0,
          lineHeight: 1.1,
        }}
        className="lp3-h2"
      >
        A vida em sincronia <span style={{ color: 'var(--sl-em)' }}>começa hoje.</span>
      </h2>
      <p
        style={{
          fontSize: 16,
          color: 'var(--sl-t2)',
          margin: '20px 0 32px',
          lineHeight: 1.55,
        }}
      >
        14 dias grátis no PRO. Sem cartão de crédito. Cancele a qualquer momento.
      </p>
      <Link
        href="/cadastro"
        style={{
          padding: '16px 30px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--sl-em)',
          color: '#0B0F14',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: FONT_BODY,
          boxShadow: '0 0 48px -8px var(--sl-em-soft)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        Começar agora <ArrowRight size={15} strokeWidth={2.4} />
      </Link>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────
   FOOTER
──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        padding: '60px 40px 40px',
        borderTop: '1px solid var(--sl-border)',
        background: 'var(--sl-bg)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr repeat(4, 1fr)',
          gap: 40,
        }}
        className="lp3-footer-grid"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <SyncLifeIcon size={32} animated={false} />
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '-0.02em',
              }}
            >
              <span style={{ color: 'var(--sl-t1)' }}>Sync</span>
              <span style={{ color: 'var(--sl-em)' }}>Life</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: 'var(--sl-t3)',
              lineHeight: 1.55,
              maxWidth: 280,
              margin: 0,
            }}
          >
            Sua vida inteira, organizada em um só lugar.
            <br />
            Feito no Brasil, com cuidado.
          </p>
        </div>
        {[
          { h: 'Produto', l: ['Recursos', 'Preços', 'Roadmap', 'Mudanças'] },
          { h: 'Empresa', l: ['Sobre', 'Manifesto', 'Carreiras', 'Blog'] },
          { h: 'Suporte', l: ['Central de ajuda', 'Contato', 'Status', 'API'] },
          { h: 'Legal', l: ['Privacidade', 'Termos', 'Cookies', 'LGPD'] },
        ].map((col) => (
          <div key={col.h}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--sl-t2)',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              {col.h}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.l.map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: 13,
                    color: 'var(--sl-t3)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: '40px auto 0',
          paddingTop: 24,
          borderTop: '1px solid var(--sl-border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--sl-t4, var(--sl-t3))',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span>© 2026 SyncLife. Todos os direitos reservados.</span>
        <span>v0.9.4 · São Paulo, Brasil</span>
      </div>
      <LandingResponsiveStyles />
    </footer>
  )
}

/* ────────────────────────────────────────────────────────────────
   Responsive helpers + small animations (scoped via classnames)
──────────────────────────────────────────────────────────────── */
function LandingResponsiveStyles() {
  // injetar regras de hover/responsive sem CSS-in-JS lib
  const css = `
    @keyframes lp3-pulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--sl-em-soft); opacity: 1; }
      50% { box-shadow: 0 0 0 6px transparent; opacity: 0.85; }
    }
    .lp3-domain:hover {
      border-color: color-mix(in srgb, var(--sl-em) 35%, var(--sl-border)) !important;
      transform: translateY(-2px);
    }
    @media (max-width: 1024px) {
      .lp3-hero { grid-template-columns: 1fr !important; gap: 40px !important; padding: 60px 24px 30px !important; text-align: left; }
      .lp3-h1 { font-size: 44px !important; }
      .lp3-h2 { font-size: 34px !important; }
      .lp3-mockup { transform: none; max-width: 480px; margin: 0 auto; }
      .lp3-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
      .lp3-ia-card { grid-template-columns: 1fr !important; padding: 40px 28px !important; gap: 36px !important; }
      .lp3-footer-grid { grid-template-columns: 1fr 1fr !important; }
    }
    @media (max-width: 640px) {
      .lp3-nav-links { display: none !important; }
      .lp3-h1 { font-size: 36px !important; }
      .lp3-h2 { font-size: 28px !important; }
      .lp3-grid-4 { grid-template-columns: 1fr !important; }
      .lp3-grid-2 { grid-template-columns: 1fr !important; }
      .lp3-footer-grid { grid-template-columns: 1fr !important; }
    }
    @media (prefers-reduced-motion: reduce) {
      .lp3-mockup > div > div:nth-child(1) { animation: none !important; }
    }
  `
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

// Suppress unused warning for the typed style helper.
export type _CSS = CSSProperties
