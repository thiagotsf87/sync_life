// SyncLife — Mobile Dashboard v3

const MOB_TWEAKS = /*EDITMODE-BEGIN*/{
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

// ──────────────────────────────────────────────────────
// PHONE BEZEL
// ──────────────────────────────────────────────────────
const Phone = ({ children }) => (
  <div style={{
    width: 390, height: 844,
    background: '#000', borderRadius: 54,
    padding: 11, position: 'relative',
    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 0 4px #1f1f1f',
    flexShrink: 0,
  }}>
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--sl-bg)', borderRadius: 44,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, background: '#000', borderRadius: 999, zIndex: 50,
      }}/>
      {/* status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 32px 0', fontSize: 14, fontWeight: 600, color: 'var(--sl-t1)',
        fontFamily: 'var(--sl-font-display)', fontVariantNumeric: 'tabular-nums',
      }}>
        <span>9:41</span>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          {/* signal */}
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4" y="5" width="3" height="6" rx="0.5"/><rect x="8" y="3" width="3" height="8" rx="0.5"/><rect x="12" y="0" width="3" height="11" rx="0.5"/></svg>
          {/* wifi */}
          <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 0C4.5 0 1.8 1.2 0 3l1.5 1.5c1.5-1.5 3.7-2.5 6-2.5s4.5 1 6 2.5L15 3C13.2 1.2 10.5 0 7.5 0z"/><path d="M7.5 4c-1.8 0-3.4.7-4.5 2L4.5 7.5C5.4 6.6 6.4 6 7.5 6s2.1.6 3 1.5L12 6c-1.1-1.3-2.7-2-4.5-2z"/><circle cx="7.5" cy="9.5" r="1.5"/></svg>
          {/* battery */}
          <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="21" height="10" rx="3" stroke="currentColor" strokeOpacity="0.5"/><rect x="2" y="2" width="14" height="7" rx="1.5" fill="currentColor"/><path d="M23 4v3c0.5-0.2 1-0.7 1-1.5s-0.5-1.3-1-1.5z" fill="currentColor" fillOpacity="0.6"/></svg>
        </span>
      </div>
      {children}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────
// MOBILE — Today screen content
// ──────────────────────────────────────────────────────
const MobileTodayContent = () => (
  <div className="phone-scroll" style={{
    height: '100%', overflow: 'auto',
    padding: '64px 18px 100px',
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    {/* Header */}
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Sábado · 23 Mai
        </div>
        <h1 style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em', margin: '2px 0 0', color: 'var(--sl-t1)' }}>
          Boa noite, Thiago.
        </h1>
      </div>
      <button style={{
        width: 40, height: 40, borderRadius: 999, border: 'none',
        background: 'linear-gradient(135deg, #1F8A8A 0%, #3D6BD9 100%)',
        color: '#0B0F14', fontFamily: 'var(--sl-font-display)', fontWeight: 700, fontSize: 16,
        cursor: 'pointer',
      }}>T</button>
    </header>

    {/* Score Hero (mobile) */}
    <article style={{
      background: 'var(--sl-s-hero)',
      backgroundImage: 'radial-gradient(circle at 0% 0%, var(--sl-em-soft) 0%, transparent 60%), var(--sl-noise)',
      border: '1px solid var(--sl-border)', borderRadius: 18, padding: 18,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-t3)' }}>LIFE SYNC SCORE</div>
        <span style={{
          fontSize: 9.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
          background: 'var(--sl-em-soft)', color: 'var(--sl-em)', border: '1px solid var(--sl-border-em)',
        }}>+3 sem</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.035em', color: 'var(--sl-t1)', lineHeight: 0.95, fontVariantNumeric: 'tabular-nums' }}>74</div>
        <div style={{ fontSize: 12, color: 'var(--sl-t3)' }}>pontos · Equilibrista</div>
      </div>
      <div style={{ height: 4, background: 'var(--sl-s3)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: '74%', height: '100%', background: 'linear-gradient(90deg, var(--sl-em), #3D6BD9)', borderRadius: 999 }}/>
      </div>
      <div style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--sl-t3)' }}>
        <span style={{ color: 'var(--sl-em)' }}>720 XP</span> até o nível 13
      </div>
    </article>

    {/* Quick stats - 2 cols */}
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <MiniCard color="var(--sl-em)" icon={SLIcons.financas} label="Saldo do mês" value="R$ 1.840,00" delta="+12%"/>
      <MiniCard color="var(--sl-mod-crp)" icon={SLIcons.corpo} label="Atividades" value="3 / 7" delta="esta sem"/>
    </section>

    {/* Hoje */}
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, padding: '0 4px' }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--sl-t1)' }}>Hoje</h3>
        <span style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--sl-t3)' }}>2 / 5</span>
      </div>
      <div style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 14, overflow: 'hidden' }}>
        <TodayRow done text="Caminhar 30 min" tag="Corpo" color="var(--sl-mod-crp)"/>
        <TodayRow done text="Conferir extrato" tag="Finanças" color="var(--sl-em)"/>
        <TodayRow text="Ler 20 páginas — Sapiens" tag="Mente" color="var(--sl-mod-mnt)"/>
        <TodayRow text="Reunião 1:1 — Helena" tag="Carreira" color="var(--sl-mod-car)" time="18:30"/>
        <TodayRow text="Pagar boleto luz" tag="Finanças" color="var(--sl-em)" time="hoje"/>
      </div>
    </section>

    {/* Domain mosaic - 2 cols */}
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, padding: '0 4px' }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--sl-t1)' }}>Suas dimensões</h3>
        <a style={{ fontSize: 11, color: 'var(--sl-em)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>Ver todas <SLIcons.arrowRight size={10}/></a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <DomainTile color="var(--sl-em)"     icon={SLIcons.financas}     label="Finanças"    value="R$ 1.840"     sub="Saldo do mês"/>
        <DomainTile color="var(--sl-mod-fut)" icon={SLIcons.futuro}      label="Futuro"      value="3"            sub="metas ativas"/>
        <DomainTile color="var(--sl-mod-mnt)" icon={SLIcons.mente}       label="Mente"       value="42 min"       sub="leitura sem"/>
        <DomainTile color="var(--sl-mod-ptr)" icon={SLIcons.patrimonio}  label="Patrimônio"  value="R$ 24,5k"      sub="+8,2%"/>
      </div>
    </section>
  </div>
);

const MiniCard = ({ color, icon: Icon, label, value, delta }) => (
  <article style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{
      width: 24, height: 24, borderRadius: 7,
      background: `color-mix(in srgb, ${color} 14%, transparent)`, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={12}/>
    </div>
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sl-t3)' }}>{label}</div>
    <div style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 17, color: 'var(--sl-t1)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 10.5, color: 'var(--sl-em)' }}>{delta}</div>
  </article>
);

const DomainTile = ({ color, icon: Icon, label, value, sub }) => (
  <article style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 14, padding: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8,
        background: `color-mix(in srgb, ${color} 14%, transparent)`, color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon size={13}/></div>
      <SLIcons.chevronRight size={12}/>
    </div>
    <div style={{ fontSize: 11.5, color: 'var(--sl-t2)', marginTop: 8 }}>{label}</div>
    <div style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 18, color: 'var(--sl-t1)', letterSpacing: '-0.02em', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 10.5, color: 'var(--sl-t3)', marginTop: 2 }}>{sub}</div>
  </article>
);

const TodayRow = ({ done, text, tag, color, time }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 11,
    padding: '12px 14px', borderBottom: '1px solid var(--sl-border)',
  }}>
    <button style={{
      width: 20, height: 20, borderRadius: 999, flexShrink: 0,
      border: `1.5px solid ${done ? 'var(--sl-em)' : 'var(--sl-t4)'}`,
      background: done ? 'var(--sl-em)' : 'transparent',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      {done && <SLIcons.check size={11}/>}
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, color: done ? 'var(--sl-t3)' : 'var(--sl-t1)', textDecoration: done ? 'line-through' : 'none' }}>{text}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color }}/>
        <span style={{ fontSize: 10.5, color: 'var(--sl-t3)' }}>{tag}</span>
        {time && <>
          <span style={{ fontSize: 10.5, color: 'var(--sl-t4)' }}>·</span>
          <span style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 10.5, color: 'var(--sl-t3)' }}>{time}</span>
        </>}
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────
// BOTTOM TAB BAR
// ──────────────────────────────────────────────────────
const MobileTabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home',  icon: SLIcons.panorama, label: 'Home' },
    { id: 'fin',   icon: SLIcons.financas, label: 'Finanças' },
    { id: 'add',   primary: true },
    { id: 'tempo', icon: SLIcons.tempo,    label: 'Tempo' },
    { id: 'mais',  icon: SLIcons.more,     label: 'Mais' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '8px 16px 28px',
      background: 'linear-gradient(180deg, transparent 0%, var(--sl-bg) 60%)',
    }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
        borderRadius: 999, padding: '6px',
        backdropFilter: 'blur(20px)',
      }}>
        {tabs.map(t => {
          if (t.primary) return (
            <button key={t.id} style={{
              width: 44, height: 44, borderRadius: 999, border: 'none',
              background: 'var(--sl-em)', color: '#0B0F14',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 0 4px var(--sl-bg), 0 0 24px -4px var(--sl-em-soft)',
              transform: 'translateY(-12px)',
            }}>
              <SLIcons.plus size={20}/>
            </button>
          );
          const isActive = active === t.id;
          return (
            <button key={t.id} style={{
              flex: 1, padding: '8px 4px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? 'var(--sl-em)' : 'var(--sl-t3)',
            }}>
              <t.icon size={18}/>
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 600 : 500, fontFamily: 'var(--sl-font-body)' }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────────────
const Mobile = () => {
  const [t, setTweak] = window.useTweaks(MOB_TWEAKS);
  useTokens(t);

  return (
    <div style={{
      minHeight: '100vh', padding: 40,
      background: 'radial-gradient(circle at 50% 30%, #14191F 0%, #07090C 80%)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 40,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Phone>
          <MobileTodayContent/>
          <MobileTabBar active="home"/>
        </Phone>
        <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          1. Home
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Phone>
          <MobileMaisContent/>
          <MobileTabBar active="mais"/>
        </Phone>
        <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          2. Mais (menu completo)
        </div>
      </div>

      <MobileTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

const MobileTweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio } = window;
  return (
    <TweaksPanel>
      <TweakSection label="Cor de acento"/>
      <TweakRadio label="Accent" value={tweaks.accent}
        options={[
          { value: 'esmeralda', label: 'Esmeralda' },
          { value: 'petrol',    label: 'Petróleo' },
          { value: 'coral',     label: 'Coral' },
          { value: 'amber',     label: 'Âmbar' },
          { value: 'plum',      label: 'Plum' },
        ]}
        onChange={(v) => setTweak('accent', v)}
      />
      <TweakSection label="Background"/>
      <TweakRadio label="Tom" value={tweaks.background}
        options={[
          { value: 'navy-deep', label: 'Navy' },
          { value: 'midnight',  label: 'Midnight' },
          { value: 'charcoal',  label: 'Carbon' },
          { value: 'cream',     label: 'Cream' },
        ]}
        onChange={(v) => setTweak('background', v)}
      />
    </TweaksPanel>
  );
};

// ──────────────────────────────────────────────────────
// MOBILE — "Mais" screen (acesso a todas as áreas)
// ──────────────────────────────────────────────────────
const MobileMaisContent = () => {
  const areas = [
    { id: 'fin', icon: SLIcons.financas,     name: 'Finanças',     color: 'var(--sl-em)',         sub: 'Saldo R$ 1.840,00',  badge: null },
    { id: 'fut', icon: SLIcons.futuro,       name: 'Futuro',       color: 'var(--sl-mod-fut)',    sub: '3 metas · 56% média', badge: null },
    { id: 'tmp', icon: SLIcons.tempo,        name: 'Tempo',        color: 'var(--sl-mod-tmp)',    sub: '4 eventos hoje',       badge: '2' },
    { id: 'crp', icon: SLIcons.corpo,        name: 'Corpo',        color: 'var(--sl-mod-crp)',    sub: '3 atividades · 142 min', badge: null },
    { id: 'mnt', icon: SLIcons.mente,        name: 'Mente',        color: 'var(--sl-mod-mnt)',    sub: '42 min de leitura',    badge: null },
    { id: 'ptr', icon: SLIcons.patrimonio,   name: 'Patrimônio',   color: 'var(--sl-mod-ptr)',    sub: 'R$ 24,5k · +8,2%',     badge: null },
    { id: 'car', icon: SLIcons.carreira,     name: 'Carreira',     color: 'var(--sl-mod-car)',    sub: '5 habilidades ativas',  badge: null },
    { id: 'exp', icon: SLIcons.experiencias, name: 'Experiências', color: 'var(--sl-mod-exp)',    sub: 'Próx viagem: Roma 47d', badge: null },
  ];
  const atalhos = [
    { icon: SLIcons.trophy,   name: 'Conquistas',     sub: '24 / 50 badges',     color: 'var(--sl-mod-mnt)' },
    { icon: SLIcons.sparkles, name: 'Coach IA',       sub: '4 insights hoje',    color: 'var(--sl-em)' },
    { icon: SLIcons.fileText, name: 'Review semanal', sub: 'Disponível domingo', color: 'var(--sl-mod-pan)' },
  ];

  return (
    <div className="phone-scroll" style={{
      height: '100%', overflow: 'auto',
      padding: '64px 18px 100px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Profile mini-card */}
      <article style={{
        background: 'var(--sl-s-hero)',
        backgroundImage: 'radial-gradient(circle at 0% 0%, var(--sl-em-soft) 0%, transparent 60%), var(--sl-noise)',
        border: '1px solid var(--sl-border)', borderRadius: 18, padding: 16,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 999,
          background: 'linear-gradient(135deg, #1F8A8A 0%, #3D6BD9 100%)',
          color: '#0B0F14', fontFamily: 'var(--sl-font-display)', fontWeight: 700, fontSize: 22,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>T</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 16, color: 'var(--sl-t1)' }}>Thiago Souza</div>
          <div style={{ fontSize: 11.5, color: 'var(--sl-t3)' }}>Nível 12 · Equilibrista · PRO</div>
        </div>
        <SLIcons.chevronRight size={16}/>
      </article>

      {/* Todas as áreas */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px 8px' }}>
          <h3 style={{ fontFamily: 'var(--sl-font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-t3)', textTransform: 'uppercase', margin: 0 }}>
            Todas as áreas
          </h3>
          <span style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--sl-t3)' }}>8</span>
        </div>
        <div style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 14, overflow: 'hidden' }}>
          {areas.map(a => <MaisRow key={a.id} {...a}/>)}
        </div>
      </section>

      {/* Atalhos */}
      <section>
        <div style={{ padding: '0 4px 8px' }}>
          <h3 style={{ fontFamily: 'var(--sl-font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-t3)', textTransform: 'uppercase', margin: 0 }}>
            Atalhos
          </h3>
        </div>
        <div style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 14, overflow: 'hidden' }}>
          {atalhos.map(a => <MaisRow key={a.name} icon={a.icon} name={a.name} color={a.color} sub={a.sub}/>)}
        </div>
      </section>

      {/* Conta */}
      <section>
        <div style={{ padding: '0 4px 8px' }}>
          <h3 style={{ fontFamily: 'var(--sl-font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-t3)', textTransform: 'uppercase', margin: 0 }}>
            Conta
          </h3>
        </div>
        <div style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 14, overflow: 'hidden' }}>
          <MaisRow icon={SLIcons.config}   name="Configurações"  color="var(--sl-t2)" sub="Perfil, segurança, integrações"/>
          <MaisRow icon={SLIcons.trophy}   name="Plano PRO"      color="var(--sl-em)" sub="Renovação em 22 dias" pill="PRO"/>
          <MaisRow icon={SLIcons.arrowUpRight} name="Indicar SyncLife" color="var(--sl-mod-mnt)" sub="Ganhe 1 mês PRO por amigo"/>
        </div>
      </section>

      {/* Logout */}
      <button style={{
        marginTop: 4, padding: '14px',
        background: 'transparent', border: '1px solid var(--sl-border)',
        borderRadius: 14, color: 'var(--sl-t2)',
        fontFamily: 'var(--sl-font-body)', fontSize: 13, fontWeight: 500,
        cursor: 'pointer', textAlign: 'center',
      }}>Sair</button>

      <div style={{ fontSize: 10.5, color: 'var(--sl-t4)', textAlign: 'center', padding: '8px 0 4px' }}>
        SyncLife v0.9.4 · iPhone 14 Pro
      </div>
    </div>
  );
};

const MaisRow = ({ icon: Icon, name, sub, color, badge, pill }) => (
  <button style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 14px',
    background: 'transparent', border: 'none',
    borderBottom: '1px solid var(--sl-border)',
    cursor: 'pointer', textAlign: 'left',
    color: 'var(--sl-t3)',
    fontFamily: 'var(--sl-font-body)',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: `color-mix(in srgb, ${color} 14%, transparent)`, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={15}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--sl-t1)' }}>{name}</div>
      {sub && <div style={{ fontFamily: 'var(--sl-font-body)', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--sl-t3)', marginTop: 2 }}>{sub}</div>}
    </div>
    {badge && (
      <span style={{
        minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
        background: 'var(--sl-em)', color: '#0B0F14', fontSize: 10, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{badge}</span>
    )}
    {pill && (
      <span style={{
        padding: '3px 8px', borderRadius: 999,
        background: 'var(--sl-em-soft)', color: 'var(--sl-em)',
        border: '1px solid var(--sl-border-em)',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      }}>{pill}</span>
    )}
    <SLIcons.chevronRight size={14}/>
  </button>
);

Object.assign(window, { MobileMaisContent, MaisRow });
