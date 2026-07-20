// SyncLife — Conquistas
const Conquistas = () => {
  const [t, setTweak] = window.useTweaks(CONQ_TWEAKS);
  useTokens(t);

  const pad = { compact: 28, comfortable: 40, spacious: 56 }[t.density] || 40;
  const gap = { compact: 14, comfortable: 22, spacious: 30 }[t.density] || 22;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sl-bg)' }}>
      <ConqModuleRail/>
      <ConqSubNav/>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '32px 40px 16px' }}>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            PANORAMA · CONQUISTAS
          </div>
          <h1 style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em', margin: 0, color: 'var(--sl-t1)' }}>
            Onde você chegou.
          </h1>
        </header>

        <div style={{
          padding: `8px ${pad}px ${pad}px`,
          display: 'flex', flexDirection: 'column', gap,
          maxWidth: 1400, width: '100%', boxSizing: 'border-box',
        }}>
          <HeroLevel/>
          <ConqKpiStrip/>
          <RecentBadges/>

          {/* Progresso + Ranking lado a lado primeiro (conteúdo mais leve) */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
            <ProgressByCategory/>
            <RankingPreview/>
          </section>

          {/* Coleção completa em largura total — vira o ponto focal de baixo */}
          <BadgeCollection/>

          <footer style={{
            marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--sl-border)',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t4)',
          }}>
            <span>SyncLife · Conquistas · v3 preview</span>
            <span>Proposta de redesign — não é produção</span>
          </footer>
        </div>
      </main>

      <ConquistasTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

const ConquistasTweaks = ({ tweaks, setTweak }) => {
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
      <TweakSection label="Densidade"/>
      <TweakRadio label="Espaço" value={tweaks.density}
        options={[
          { value: 'compact',     label: 'Compacto' },
          { value: 'comfortable', label: 'Padrão' },
          { value: 'spacious',    label: 'Espaçado' },
        ]}
        onChange={(v) => setTweak('density', v)}
      />
    </TweaksPanel>
  );
};

Object.assign(window, { Conquistas });
