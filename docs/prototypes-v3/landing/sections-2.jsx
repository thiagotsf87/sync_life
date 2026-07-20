// SyncLife — Landing sections 2: Domínios, IA, Como funciona, Preços, FAQ, Footer

// ───── SOCIAL PROOF strip ─────
const SocialProof = () => (
  <section style={{
    padding: '60px 40px 20px', maxWidth: 1280, margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  }}>
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: 'var(--sl-t3)', textTransform: 'uppercase' }}>
      Mais de 24.000 brasileiros já organizam a vida com SyncLife
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 36, opacity: 0.4, filter: 'grayscale(1)' }}>
      {['Folha de SP', 'Exame', 'Pequenas Empresas', 'Forbes BR', 'O Globo'].map(p => (
        <span key={p} style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 700, color: 'var(--sl-t2)' }}>{p}</span>
      ))}
    </div>
  </section>
);

// ───── DOMÍNIOS ─────
const DomainsSection = () => {
  const domains = [
    { icon: SLIcons.financas,     color: '#1F8A8A', name: 'Finanças',      desc: 'Receitas, despesas, orçamentos, recorrentes, fluxo de caixa e consultor IA dedicado.' },
    { icon: SLIcons.futuro,       color: '#8B7BD4', name: 'Futuro',        desc: 'Metas de curto e longo prazo com aportes, anéis de progresso e milestones.' },
    { icon: SLIcons.tempo,        color: '#3CA0B5', name: 'Tempo',         desc: 'Agenda, blocos de foco, Pomodoro e revisão semanal automática.' },
    { icon: SLIcons.corpo,        color: '#D97534', name: 'Corpo',         desc: 'Atividades, peso, cardápio gerado por IA e coach de saúde.' },
    { icon: SLIcons.mente,        color: '#D9962E', name: 'Mente',         desc: 'Trilhas de aprendizado, sessões de leitura e biblioteca pessoal.' },
    { icon: SLIcons.patrimonio,   color: '#4F88D4', name: 'Patrimônio',    desc: 'Carteira de investimentos, proventos, evolução e simulador de IF.' },
    { icon: SLIcons.carreira,     color: '#DB6478', name: 'Carreira',      desc: 'Perfil profissional, habilidades, roadmap e histórico documentado.' },
    { icon: SLIcons.experiencias, color: '#C76795', name: 'Experiências',  desc: 'Viagens, bucket list, passaporte digital e assistente de planejamento IA.' },
  ];
  return (
    <section style={{ padding: '40px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 50 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sl-em)', textTransform: 'uppercase', marginBottom: 12 }}>
          OITO ÁREAS · UMA ÚNICA INTERFACE
        </div>
        <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--sl-t1)', margin: 0, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.1 }}>
          Tudo o que você gerencia na sua vida, em um lugar só.
        </h2>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {domains.map(d => (
          <article key={d.name} style={{
            background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
            borderRadius: 16, padding: 22,
            display: 'flex', flexDirection: 'column', gap: 14,
            transition: 'all var(--dur-fast) var(--ease-soft)',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: `color-mix(in srgb, ${d.color} 16%, transparent)`, color: d.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <d.icon size={18}/>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 17, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.01em' }}>{d.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--sl-t3)', margin: '6px 0 0', lineHeight: 1.55 }}>{d.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// ───── IA SECTION ─────
const IASection = () => (
  <section style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
    <div style={{
      background: 'var(--sl-s-hero)',
      backgroundImage: 'radial-gradient(circle at 80% 0%, var(--sl-em-soft) 0%, transparent 50%), var(--sl-noise)',
      border: '1px solid var(--sl-border)',
      borderRadius: 28, padding: '60px 56px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sl-em)', textTransform: 'uppercase', marginBottom: 14 }}>
          CONSULTOR IA · INTEGRADO
        </div>
        <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--sl-t1)', margin: 0, lineHeight: 1.1 }}>
          Uma IA que <em style={{ fontStyle: 'italic', color: 'var(--sl-em)', fontWeight: 600 }}>conhece sua vida</em>. E fala como um amigo.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--sl-t2)', lineHeight: 1.6, margin: '20px 0 28px' }}>
          Não é mais um chatbot genérico. O consultor do SyncLife enxerga seus orçamentos,
          suas metas, seu treino e seus eventos, e gera insights personalizados em tempo real.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { ic: SLIcons.sparkles, h: 'Insights diários', s: 'Alertas, ações recomendadas e conquistas — direto na sua tela inicial.' },
            { ic: SLIcons.fileText, h: 'Relatórios completos', s: 'Gere um PDF do seu mês inteiro em finanças, saúde e produtividade em 1 clique.' },
            { ic: SLIcons.send,     h: 'Pergunte qualquer coisa', s: '“Quanto gastei em lazer? Quanto preciso poupar pra viajar em julho?” — em linguagem natural.' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: 'var(--sl-em-soft)', color: 'var(--sl-em)',
                border: '1px solid var(--sl-border-em)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <it.ic size={14}/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sl-t1)' }}>{it.h}</div>
                <div style={{ fontSize: 12.5, color: 'var(--sl-t3)', marginTop: 2, lineHeight: 1.5 }}>{it.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat mockup */}
      <div style={{
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
        borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <ChatBubble role="user">Quanto gastei em lazer esse mês?</ChatBubble>
        <ChatBubble role="ai">
          Você gastou <strong style={{ color: 'var(--sl-t1)' }}>R$ 410,00</strong> em Lazer, 82% do orçamento (R$ 500,00). Com 8 dias restantes, considere reduzir saídas até o fim do mês.
        </ChatBubble>
        <ChatBubble role="user">E na Viagem Itália — quanto falta?</ChatBubble>
        <ChatBubble role="ai">
          Faltam <strong style={{ color: 'var(--sl-t1)' }}>R$ 4.100,00</strong> (32%) para completar a meta. Mantendo seu ritmo atual de R$ 580/mês, você atinge em <strong style={{ color: 'var(--sl-em)' }}>7 meses</strong>, uma semana antes do prazo.
        </ChatBubble>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', borderRadius: 12, marginTop: 4 }}>
          <SLIcons.search size={13}/>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--sl-t3)' }}>Pergunte algo…</span>
          <SLIcons.send size={13}/>
        </div>
      </div>
    </div>
  </section>
);

const ChatBubble = ({ role, children }) => {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '85%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'var(--sl-em-soft)' : 'var(--sl-s2)',
        border: isUser ? '1px solid var(--sl-border-em)' : '1px solid var(--sl-border)',
        color: isUser ? 'var(--sl-em)' : 'var(--sl-t2)',
        fontSize: 13, lineHeight: 1.55,
      }}>
        {children}
      </div>
    </div>
  );
};

// ───── PRICING ─────
const Pricing = () => {
  const plans = [
    {
      name: 'Free', price: 'R$ 0', sub: 'para sempre', pro: false,
      features: ['Todos os 11 módulos', 'Até 50 transações/mês', 'Score básico', '1 dispositivo'],
      cta: 'Começar grátis',
    },
    {
      name: 'PRO', price: 'R$ 24,90', sub: 'por mês', pro: true,
      features: ['Tudo do Free, sem limites', 'Consultor IA + Coach IA', 'Cardápio gerado por IA', 'Relatórios PDF cross-module', 'Google Calendar bidirecional', 'Dispositivos ilimitados'],
      cta: 'Testar 14 dias grátis',
    },
  ];
  return (
    <section style={{ padding: '80px 40px', maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 50 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sl-em)', textTransform: 'uppercase', marginBottom: 12 }}>
          PREÇOS · SEM PEGADINHAS
        </div>
        <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--sl-t1)', margin: 0, lineHeight: 1.1 }}>
          Comece grátis. Evolua quando quiser.
        </h2>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {plans.map(p => (
          <article key={p.name} style={{
            background: p.pro ? 'var(--sl-s-hero)' : 'var(--sl-s1)',
            backgroundImage: p.pro ? 'radial-gradient(circle at 0% 0%, var(--sl-em-soft) 0%, transparent 60%), var(--sl-noise)' : 'none',
            border: '1px solid ' + (p.pro ? 'var(--sl-border-em)' : 'var(--sl-border)'),
            borderRadius: 22, padding: 32,
            display: 'flex', flexDirection: 'column', gap: 20,
            position: 'relative',
          }}>
            {p.pro && (
              <span style={{
                position: 'absolute', top: 24, right: 24,
                padding: '4px 10px', borderRadius: 999,
                background: 'var(--sl-em-soft)', border: '1px solid var(--sl-border-em)',
                color: 'var(--sl-em)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              }}>RECOMENDADO</span>
            )}
            <div>
              <div style={{ fontFamily: 'var(--sl-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--sl-t1)', letterSpacing: '-0.02em' }}>
                {p.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
                <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 48, fontWeight: 700, color: 'var(--sl-t1)', letterSpacing: '-0.035em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
                <span style={{ fontSize: 13, color: 'var(--sl-t3)' }}>{p.sub}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 999, flexShrink: 0,
                    background: p.pro ? 'var(--sl-em-soft)' : 'var(--sl-s2)',
                    color: p.pro ? 'var(--sl-em)' : 'var(--sl-t2)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SLIcons.check size={11}/>
                  </span>
                  <span style={{ fontSize: 13.5, color: 'var(--sl-t2)' }}>{f}</span>
                </div>
              ))}
            </div>

            <button style={{
              padding: '13px 20px', borderRadius: 999,
              background: p.pro ? 'var(--sl-em)' : 'transparent',
              color: p.pro ? '#0B0F14' : 'var(--sl-t1)',
              border: p.pro ? 'none' : '1px solid var(--sl-border)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--sl-font-body)',
              boxShadow: p.pro ? '0 0 32px -8px var(--sl-em-soft)' : 'none',
            }}>{p.cta}</button>
          </article>
        ))}
      </div>
    </section>
  );
};

// ───── FAQ ─────
const FAQ = () => {
  const items = [
    { q: 'Meus dados financeiros ficam seguros?', a: 'Sim. SyncLife é LGPD-compliant, dados criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Você pode exportar ou excluir tudo a qualquer momento.' },
    { q: 'Posso usar grátis pra sempre?', a: 'Sim. O plano Free dura indefinidamente. PRO desbloqueia limites e features de IA, mas o essencial funciona pra sempre sem custo.' },
    { q: 'Funciona offline?', a: 'O app mobile sincroniza automaticamente quando você volta online. Você pode registrar transações, eventos e atividades sem conexão.' },
    { q: 'Tem versão Web e Mobile?', a: 'Sim — interfaces nativas para iOS, Android e Web. Tudo sincroniza em tempo real.' },
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section style={{ padding: '80px 40px', maxWidth: 760, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--sl-t1)', margin: 0 }}>
          Perguntas comuns
        </h2>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, i) => (
          <article key={i} style={{
            background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
            borderRadius: 14, overflow: 'hidden',
          }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--sl-font-body)', textAlign: 'left',
              color: 'var(--sl-t1)', fontSize: 15, fontWeight: 500,
            }}>
              <span>{it.q}</span>
              <span style={{ color: 'var(--sl-t3)', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}>
                <SLIcons.chevronDown size={16}/>
              </span>
            </button>
            {open === i && (
              <div style={{ padding: '0 22px 18px', fontSize: 13.5, color: 'var(--sl-t2)', lineHeight: 1.6 }}>
                {it.a}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

// ───── FINAL CTA ─────
const FinalCTA = () => (
  <section style={{ padding: '80px 40px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
    <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--sl-t1)', margin: 0, lineHeight: 1.1 }}>
      A vida em sincronia <span style={{ color: 'var(--sl-em)' }}>começa hoje.</span>
    </h2>
    <p style={{ fontSize: 16, color: 'var(--sl-t2)', margin: '20px 0 32px', lineHeight: 1.55 }}>
      14 dias grátis no PRO. Sem cartão de crédito. Cancele a qualquer momento.
    </p>
    <button style={{
      padding: '16px 30px', borderRadius: 999, border: 'none',
      background: 'var(--sl-em)', color: '#0B0F14',
      fontSize: 15, fontWeight: 700, cursor: 'pointer',
      fontFamily: 'var(--sl-font-body)',
      boxShadow: '0 0 48px -8px var(--sl-em-soft)',
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      Começar agora <SLIcons.arrowRight size={15}/>
    </button>
  </section>
);

// ───── FOOTER ─────
const Footer = () => (
  <footer style={{
    padding: '60px 40px 40px',
    borderTop: '1px solid var(--sl-border)',
    background: 'var(--sl-bg)',
  }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: 40 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <SLIcons.logoLockup height={42} withTagline/>
        </div>
        <p style={{ fontSize: 13, color: 'var(--sl-t3)', lineHeight: 1.55, maxWidth: 280 }}>
          Sua vida inteira, organizada em um só lugar.<br/>Feito no Brasil, com cuidado.
        </p>
      </div>
      {[
        { h: 'Produto',  l: ['Recursos', 'Preços', 'Roadmap', 'Mudanças'] },
        { h: 'Empresa',  l: ['Sobre', 'Manifesto', 'Carreiras', 'Blog'] },
        { h: 'Suporte',  l: ['Central de ajuda', 'Contato', 'Status', 'API'] },
        { h: 'Legal',    l: ['Privacidade', 'Termos', 'Cookies', 'LGPD'] },
      ].map(col => (
        <div key={col.h}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-t2)', textTransform: 'uppercase', marginBottom: 14 }}>{col.h}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {col.l.map(item => <a key={item} style={{ fontSize: 13, color: 'var(--sl-t3)', cursor: 'pointer' }}>{item}</a>)}
          </div>
        </div>
      ))}
    </div>
    <div style={{
      maxWidth: 1280, margin: '40px auto 0', paddingTop: 24,
      borderTop: '1px solid var(--sl-border)',
      display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sl-t4)',
    }}>
      <span>© 2026 SyncLife. Todos os direitos reservados.</span>
      <span>v0.9.4 · São Paulo, Brasil</span>
    </div>
  </footer>
);

Object.assign(window, { SocialProof, DomainsSection, IASection, ChatBubble, Pricing, FAQ, FinalCTA, Footer });
