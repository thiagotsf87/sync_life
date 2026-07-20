// SyncLife — Finanças (Visão Geral)
const Financas = () => {
  const [t, setTweak] = window.useTweaks(FIN_TWEAKS);
  useTokens(t);

  const pad = { compact: 28, comfortable: 40, spacious: 56 }[t.density] || 40;
  const gap = { compact: 12, comfortable: 18, spacious: 26 }[t.density] || 18;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--sl-bg)' }}>
      <FinModuleRail/>
      <FinSubNav/>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <FinHeader/>

        <div style={{
          padding: `0 ${pad}px ${pad}px`,
          display: 'flex', flexDirection: 'column', gap: gap,
          maxWidth: 1400, width: '100%', boxSizing: 'border-box',
        }}>
          {/* KPI strip */}
          <FinKpiStrip/>

          {/* Saúde financeira alerta */}
          <SaudeAlerta/>

          {/* Consultor IA — bloco principal */}
          <ConsultorIA/>

          {/* Two charts side by side */}
          <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: gap }}>
            <HistoricoChart/>
            <GastosCategoria/>
          </section>

          {/* Fluxo de caixa */}
          <FluxoCaixa/>

          <footer style={{
            marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--sl-border)',
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t4)',
          }}>
            <span>SyncLife · Finanças · v3 preview</span>
            <span>Proposta de redesign — não é produção</span>
          </footer>
        </div>
      </main>

      <FinancasTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

const FinancasTweaks = ({ tweaks, setTweak }) => {
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

Object.assign(window, { Financas });
