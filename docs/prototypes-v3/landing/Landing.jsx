// SyncLife — Landing composition
const Landing = () => {
  const [t, setTweak] = window.useTweaks(LAND_TWEAKS);
  useTokens(t);
  return (
    <div style={{ background: 'var(--sl-bg)', minHeight: '100vh' }}>
      <TopNav/>
      <Hero/>
      <SocialProof/>
      <DomainsSection/>
      <IASection/>
      <Pricing/>
      <FAQ/>
      <FinalCTA/>
      <Footer/>
      <LandingTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

const LandingTweaks = ({ tweaks, setTweak }) => {
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

Object.assign(window, { Landing });
