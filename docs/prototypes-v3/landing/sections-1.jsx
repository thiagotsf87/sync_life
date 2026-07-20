// SyncLife — Landing page v3

const LAND_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "petrol",
  "background": "navy-deep"
}/*EDITMODE-END*/;

const useTokens = (t) => {
  React.useEffect(() => {
    const root = document.documentElement;
    const accents = {
      'esmeralda':{ em:'#1FA67A', emSoft:'rgba(31,166,122,0.10)', emStrong:'#28C18B', borderEm:'rgba(31,166,122,0.28)' },
      'petrol':   { em: '#0F766E', emSoft: 'rgba(15,118,110,0.12)', emStrong: '#138A80', borderEm: 'rgba(15,118,110,0.32)' },
      'coral':    { em:'#E07A5F', emSoft:'rgba(224,122,95,0.10)', emStrong:'#E68B73', borderEm:'rgba(224,122,95,0.28)' },
      'amber':    { em:'#D97534', emSoft:'rgba(217,117,52,0.10)', emStrong:'#E08847', borderEm:'rgba(217,117,52,0.28)' },
      'plum':     { em:'#A06585', emSoft:'rgba(160,101,133,0.10)', emStrong:'#B17698', borderEm:'rgba(160,101,133,0.28)' },
    };
    const a = accents[t.accent] || accents.petrol;
    root.style.setProperty('--sl-em', a.em);
    root.style.setProperty('--sl-em-soft', a.emSoft);
    root.style.setProperty('--sl-em-strong', a.emStrong);
    root.style.setProperty('--sl-border-em', a.borderEm);

    const bgs = {
      'navy-deep': { bg:'#0B0F14', s1:'#131922', s2:'#1A2230', s3:'#232C3B', sHero:'#161D28', t1:'#E7ECF1', t2:'#A7B0BC', t3:'#6F7986', t4:'#4A535F', border:'rgba(255,255,255,0.06)' },
      'midnight':  { bg:'#0F0B1F', s1:'#161232', s2:'#1F1B40', s3:'#2A2552', sHero:'#1A1638', t1:'#E7ECF1', t2:'#A7B0BC', t3:'#6F7986', t4:'#4A535F', border:'rgba(255,255,255,0.06)' },
      'charcoal':  { bg:'#181818', s1:'#222222', s2:'#2B2B2B', s3:'#363636', sHero:'#252525', t1:'#E7ECF1', t2:'#A7B0BC', t3:'#6F7986', t4:'#4A535F', border:'rgba(255,255,255,0.06)' },
      'cream':     { bg:'#F5F2EC', s1:'#FFFFFF', s2:'#EFEBE2', s3:'#E5DFD2', sHero:'#FAF7F1', t1:'#1A2230', t2:'#4F5663', t3:'#818A95', t4:'#B4BAC2', border:'rgba(0,0,0,0.08)' },
    };
    const b = bgs[t.background] || bgs['navy-deep'];
    Object.entries(b).forEach(([k, v]) => {
      const map = { bg:'--sl-bg', s1:'--sl-s1', s2:'--sl-s2', s3:'--sl-s3', sHero:'--sl-s-hero', t1:'--sl-t1', t2:'--sl-t2', t3:'--sl-t3', t4:'--sl-t4', border:'--sl-border' };
      if (map[k]) root.style.setProperty(map[k], v);
    });
  }, [t.accent, t.background]);
};

// ───── NAV ─────
const TopNav = () => (
  <nav style={{
    position: 'sticky', top: 0, zIndex: 50,
    padding: '14px 40px',
    backgroundColor: 'color-mix(in srgb, var(--sl-bg) 80%, transparent)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--sl-border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <SLIcons.logo size={40}/>
      <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}><span style={{ color: 'var(--sl-t1)' }}>Sync</span><span style={{ color: 'var(--sl-em)' }}>Life</span></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      {['Produto', 'Preços', 'Manifesto', 'FAQ'].map(item => (
        <a key={item} style={{ fontSize: 13.5, color: 'var(--sl-t2)', cursor: 'pointer', fontFamily: 'var(--sl-font-body)' }}>{item}</a>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <a style={{ fontSize: 13.5, color: 'var(--sl-t2)', cursor: 'pointer' }}>Entrar</a>
      <button style={{
        padding: '9px 18px', borderRadius: 999, border: 'none',
        background: 'var(--sl-em)', color: '#0B0F14',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'var(--sl-font-body)',
        boxShadow: '0 0 24px -6px var(--sl-em-soft)',
      }}>Começar grátis</button>
    </div>
  </nav>
);

// ───── HERO ─────
const Hero = () => (
  <section style={{
    position: 'relative',
    padding: '88px 40px 40px',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
    alignItems: 'center',
    maxWidth: 1280, margin: '0 auto',
  }}>
    <div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 999,
        background: 'var(--sl-em-soft)', border: '1px solid var(--sl-border-em)',
        color: 'var(--sl-em)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
        marginBottom: 22,
      }}>
        <SLIcons.sparkles size={11}/>
        <span>Novo · Coach IA disponível em todos os planos</span>
      </span>
      <h1 style={{
        fontFamily: 'var(--sl-font-display)', fontWeight: 700,
        fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.035em',
        color: 'var(--sl-t1)', margin: 0,
        maxWidth: 520,
      }}>
        Sua vida inteira,<br/>
        <span style={{
          background: 'linear-gradient(90deg, #1F8A8A 0%, #3D6BD9 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>em sincronia.</span>
      </h1>
      <p style={{
        fontSize: 18, color: 'var(--sl-t2)', lineHeight: 1.55,
        margin: '20px 0 0', maxWidth: 480,
      }}>
        Finanças, saúde, rotina, carreira e mente. Todas as áreas da sua vida em um só lugar.
        Sem planilhas. Sem 8 apps abertos. Sem ansiedade.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 30, alignItems: 'center' }}>
        <button style={{
          padding: '14px 26px', borderRadius: 999, border: 'none',
          background: 'var(--sl-em)', color: '#0B0F14',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--sl-font-body)',
          boxShadow: '0 0 40px -8px var(--sl-em-soft)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          Começar grátis <SLIcons.arrowRight size={14}/>
        </button>
        <button style={{
          padding: '14px 22px', borderRadius: 999,
          background: 'transparent', border: '1px solid var(--sl-border)',
          color: 'var(--sl-t1)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>Ver demonstração</button>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginTop: 28,
        fontSize: 12, color: 'var(--sl-t3)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SLIcons.check size={12}/> 14 dias PRO grátis
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SLIcons.check size={12}/> Sem cartão de crédito
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SLIcons.check size={12}/> LGPD-ready
        </span>
      </div>
    </div>

    {/* Mockup do app */}
    <HeroMockup/>
  </section>
);

const HeroMockup = () => (
  <div style={{ position: 'relative' }}>
    {/* glow atrás */}
    <div style={{
      position: 'absolute', inset: -40,
      background: 'radial-gradient(circle, var(--sl-em-soft) 0%, transparent 60%)',
      filter: 'blur(30px)', pointerEvents: 'none',
    }}/>
    <div style={{
      position: 'relative',
      background: 'var(--sl-s1)',
      border: '1px solid var(--sl-border)',
      borderRadius: 16,
      padding: 18,
      boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
      transform: 'perspective(1200px) rotateY(-3deg) rotateX(2deg)',
    }}>
      {/* fake toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }}/>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }}/>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)' }}/>
        <span style={{ flex: 1, height: 18, background: 'var(--sl-s2)', borderRadius: 6, marginLeft: 8 }}/>
      </div>

      {/* Score row */}
      <div style={{
        background: 'var(--sl-s-hero)', borderRadius: 12, padding: 16,
        backgroundImage: 'radial-gradient(circle at 0% 0%, var(--sl-em-soft) 0%, transparent 55%)',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sl-t3)' }}>LIFE SYNC SCORE</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 44, fontWeight: 700, color: 'var(--sl-t1)', letterSpacing: '-0.03em', lineHeight: 1 }}>74</span>
          <span style={{ fontSize: 11, color: 'var(--sl-em)' }}>+3 sem</span>
        </div>
        <div style={{ height: 3, background: 'var(--sl-s3)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ width: '74%', height: '100%', background: 'linear-gradient(90deg, var(--sl-em), #3D6BD9)' }}/>
        </div>
      </div>

      {/* Domain mini-grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { icon: SLIcons.financas, color: '#1F8A8A', val: 'R$ 1,8k' },
          { icon: SLIcons.corpo,    color: '#D97534', val: '3 / 7' },
          { icon: SLIcons.mente,    color: '#D9962E', val: '42 min' },
          { icon: SLIcons.futuro,   color: '#8B7BD4', val: '3 metas' },
        ].map((m, i) => (
          <div key={i} style={{
            background: 'var(--sl-s2)', border: '1px solid var(--sl-border)',
            borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: `color-mix(in srgb, ${m.color} 18%, transparent)`, color: m.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <m.icon size={11}/>
            </div>
            <div style={{ fontFamily: 'var(--sl-font-display)', fontSize: 14, fontWeight: 600, color: 'var(--sl-t1)' }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

Object.assign(window, { LAND_TWEAKS, useTokens, TopNav, Hero, HeroMockup });
