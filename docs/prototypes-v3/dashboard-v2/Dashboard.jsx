// Composição principal — Dashboard v3

const DASH_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "petrol",
  "background": "navy-deep",
  "density": "comfortable",
  "noise": true,
  "moduleAccent": true
}/*EDITMODE-END*/;

const Dashboard = () => {
  const [t, setTweak] = window.useTweaks(DASH_TWEAKS);
  // Expose tweaks globally so subcomponents can read (re-render on change via key)
  window.__tweaks = t;

  // Aplicar tweaks via CSS custom props no root
  React.useEffect(() => {
    const root = document.documentElement;
    // Accent
    const accents = {
      'esmeralda': { em: '#1FA67A', emSoft: 'rgba(31,166,122,0.10)', emStrong: '#28C18B', borderEm: 'rgba(31,166,122,0.28)' },
      'ciano':     { em: '#3CA0B5', emSoft: 'rgba(60,160,181,0.10)', emStrong: '#4FB8CC', borderEm: 'rgba(60,160,181,0.30)' },
      'azul':      { em: '#4F88D4', emSoft: 'rgba(79,136,212,0.10)', emStrong: '#608DD6', borderEm: 'rgba(79,136,212,0.28)' },
      'petrol':   { em: '#0F766E', emSoft: 'rgba(15,118,110,0.12)', emStrong: '#138A80', borderEm: 'rgba(15,118,110,0.32)' },
      'coral':     { em: '#E07A5F', emSoft: 'rgba(224,122,95,0.10)', emStrong: '#E68B73', borderEm: 'rgba(224,122,95,0.28)' },
      'amber':     { em: '#D97534', emSoft: 'rgba(217,117,52,0.10)', emStrong: '#E08847', borderEm: 'rgba(217,117,52,0.28)' },
      'plum':      { em: '#A06585', emSoft: 'rgba(160,101,133,0.10)', emStrong: '#B17698', borderEm: 'rgba(160,101,133,0.28)' },
    };
    const a = accents[t.accent] || accents.esmeralda;
    root.style.setProperty('--sl-em', a.em);
    root.style.setProperty('--sl-em-soft', a.emSoft);
    root.style.setProperty('--sl-em-strong', a.emStrong);
    root.style.setProperty('--sl-border-em', a.borderEm);

    // Background
    const bgs = {
      'navy-deep':  { bg: '#0B0F14', s1: '#131922', s2: '#1A2230', s3: '#232C3B', sHero: '#161D28', t1: '#E7ECF1', t2: '#A7B0BC', t3: '#6F7986', t4: '#4A535F', border: 'rgba(255,255,255,0.06)', borderH: 'rgba(255,255,255,0.12)' },
      'midnight':   { bg: '#0F0B1F', s1: '#161232', s2: '#1F1B40', s3: '#2A2552', sHero: '#1A1638', t1: '#E7ECF1', t2: '#A7B0BC', t3: '#6F7986', t4: '#4A535F', border: 'rgba(255,255,255,0.06)', borderH: 'rgba(255,255,255,0.12)' },
      'charcoal':   { bg: '#181818', s1: '#222222', s2: '#2B2B2B', s3: '#363636', sHero: '#252525', t1: '#E7ECF1', t2: '#A7B0BC', t3: '#6F7986', t4: '#4A535F', border: 'rgba(255,255,255,0.06)', borderH: 'rgba(255,255,255,0.12)' },
      'cream':      { bg: '#F5F2EC', s1: '#FFFFFF', s2: '#EFEBE2', s3: '#E5DFD2', sHero: '#FAF7F1', t1: '#1A2230', t2: '#4F5663', t3: '#818A95', t4: '#B4BAC2', border: 'rgba(0,0,0,0.08)', borderH: 'rgba(0,0,0,0.16)' },
    };
    const b = bgs[t.background] || bgs['navy-deep'];
    root.style.setProperty('--sl-bg', b.bg);
    root.style.setProperty('--sl-s1', b.s1);
    root.style.setProperty('--sl-s2', b.s2);
    root.style.setProperty('--sl-s3', b.s3);
    root.style.setProperty('--sl-s-hero', b.sHero);
    root.style.setProperty('--sl-t1', b.t1);
    root.style.setProperty('--sl-t2', b.t2);
    root.style.setProperty('--sl-t3', b.t3);
    root.style.setProperty('--sl-t4', b.t4);
    root.style.setProperty('--sl-border', b.border);
    root.style.setProperty('--sl-border-h', b.borderH);
  }, [t.accent, t.background]);

  const pad = { compact: 28, comfortable: 40, spacious: 56 }[t.density] || 40;
  const gap = { compact: 12, comfortable: 18, spacious: 26 }[t.density] || 18;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sl-bg)' }}>
      <ModuleRail/>
      <SubNav/>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
            key={`${t.noise}-${t.moduleAccent}`}>
        <Header tweaks={t}/>

        <div style={{
          padding: `0 ${pad}px ${pad}px`,
          display: 'flex', flexDirection: 'column', gap: gap,
          maxWidth: 1400, width: '100%', boxSizing: 'border-box',
        }}>
          {/* HERO */}
          <div className="sl-fade-up"><HeroScore/></div>

          {/* MOSAIC */}
          <section className="sl-fade-up sl-d1" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingLeft: 4 }}>
              <Eyebrow color="var(--sl-t3)">Suas 8 dimensões</Eyebrow>
              <a style={{ fontSize: 12, color: 'var(--sl-t3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Ver detalhes <SLIcons.arrowRight size={11}/>
              </a>
            </div>
            <ModuleMosaic/>
          </section>

          {/* KPI strip financeiro */}
          <div className="sl-fade-up sl-d2"><FinancialStrip/></div>

          {/* Grid principal: orçamentos + insight | metas + agenda + destaques */}
          <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: gap }} className="sl-fade-up sl-d3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: gap }}>
              <BudgetsCard/>
              <InsightCard/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: gap }}>
              <MetasCard/>
              <AgendaCard/>
              <DestaquesCard/>
            </div>
          </section>

          {/* Footer leve */}
          <footer style={{
            marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--sl-border)',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--sl-font-mono)', fontSize: 11, color: 'var(--sl-t4)',
          }}>
            <span>SyncLife · v3 preview</span>
            <span>Proposta de redesign — não é produção</span>
          </footer>
        </div>
      </main>

      {/* Tweaks panel */}
      <DashboardTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

// ── Tweaks panel ─────────────────────────────────────
const DashboardTweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio, TweakToggle } = window;

  return (
    <TweaksPanel>
      <TweakSection label="Cor de acento"/>
      <TweakRadio
        label="Accent"
        value={tweaks.accent}
        options={[
          { value: 'esmeralda', label: 'Esmeralda' },
          { value: 'petrol',    label: 'Petróleo' },
          { value: 'coral',     label: 'Coral' },
          { value: 'amber',     label: 'Âmbar' },
          { value: 'plum',      label: 'Plum' },
          { value: 'ciano',     label: 'Ciano' },
          { value: 'azul',      label: 'Azul' },
        ]}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Background do tema"/>
      <TweakRadio
        label="Tom"
        value={tweaks.background}
        options={[
          { value: 'navy-deep', label: 'Navy' },
          { value: 'midnight',  label: 'Midnight' },
          { value: 'charcoal',  label: 'Carbon' },
          { value: 'cream',     label: 'Cream (light)' },
        ]}
        onChange={(v) => setTweak('background', v)}
      />

      <TweakSection label="Densidade"/>
      <TweakRadio
        label="Espaço"
        value={tweaks.density}
        options={[
          { value: 'compact',     label: 'Compacto' },
          { value: 'comfortable', label: 'Padrão' },
          { value: 'spacious',    label: 'Espaçado' },
        ]}
        onChange={(v) => setTweak('density', v)}
      />

      <TweakSection label="Detalhes"/>
      <TweakToggle
        label="Textura no hero"
        value={tweaks.noise}
        onChange={(v) => setTweak('noise', v)}
      />
      <TweakToggle
        label="Ícones com cor de módulo"
        value={tweaks.moduleAccent}
        onChange={(v) => setTweak('moduleAccent', v)}
      />
    </TweaksPanel>
  );
};

Object.assign(window, { Dashboard, DashboardTweaks });
