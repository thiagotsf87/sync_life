// SyncLife — Login / Cadastro v3 (mesma tela, toggle entre modos)

const AUTH_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "petrol",
  "background": "navy-deep",
  "mode": "login"
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

// ── Field component
const AuthField = ({ label, type = 'text', placeholder, hint, autoFocus }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--sl-t2)' }}>{label}</label>
    <input type={type} placeholder={placeholder} autoFocus={autoFocus} style={{
      background: 'var(--sl-s2)', border: '1px solid var(--sl-border)',
      borderRadius: 10, padding: '11px 14px',
      color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 14,
      outline: 'none',
    }}/>
    {hint && <div style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{hint}</div>}
  </div>
);

// ── Social button
const SocialBtn = ({ icon, label }) => (
  <button style={{
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '11px 14px', background: 'var(--sl-s2)',
    border: '1px solid var(--sl-border)', borderRadius: 10,
    color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 13, fontWeight: 500,
    cursor: 'pointer',
  }}>
    {icon}
    <span>{label}</span>
  </button>
);

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 18 18">
    <path fill="#4285f4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
    <path fill="#34a853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
    <path fill="#fbbc05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
    <path fill="#ea4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.18 0a3.5 3.5 0 0 1-.85 2.55 2.95 2.95 0 0 1-2.37 1.1 3.32 3.32 0 0 1 .85-2.47A3.55 3.55 0 0 1 11.18 0zm3.45 12.05a7.78 7.78 0 0 1-.78 1.4c-.51.74-1 1.48-1.77 1.5-.76.01-1-.45-1.86-.45-.86 0-1.13.43-1.85.46-.74.03-1.31-.8-1.82-1.54-1.05-1.51-1.85-4.27-.77-6.13a2.86 2.86 0 0 1 2.43-1.48c.73-.01 1.42.5 1.86.5.45 0 1.28-.61 2.16-.52a2.94 2.94 0 0 1 2.3 1.25 2.86 2.86 0 0 0-1.37 2.4 2.78 2.78 0 0 0 1.69 2.55c-.04.13-.1.27-.15.4z"/>
  </svg>
);

// ── LOGO + Brand strip esquerda (centralizado)
const BrandSide = () => (
  <aside style={{
    flex: 1, position: 'relative', overflow: 'hidden',
    background: 'var(--sl-s-hero)',
    backgroundImage: 'radial-gradient(circle at 20% 30%, var(--sl-em-soft) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(61,107,217,0.10) 0%, transparent 50%), var(--sl-noise)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    padding: 44,
    borderRight: '1px solid var(--sl-border)',
  }}>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      maxWidth: 480, textAlign: 'center', gap: 22,
    }}>
      {/* logo */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SLIcons.logoLockup height={120} withTagline/>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sl-em)', textTransform: 'uppercase' }}>
        SUA VIDA, EM SINCRONIA
      </div>
      <h2 style={{
        fontFamily: 'var(--sl-font-display)', fontSize: 42, fontWeight: 700,
        letterSpacing: '-0.03em', color: 'var(--sl-t1)', margin: 0, lineHeight: 1.08,
      }}>
        Finanças, saúde, rotina, mente.
        <br/>
        <span style={{ color: 'var(--sl-em)' }}>Tudo no mesmo lugar.</span>
      </h2>
      <p style={{ fontSize: 15, color: 'var(--sl-t2)', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
        Mais de 24.000 brasileiros já organizam a vida com SyncLife.
        Sem planilhas, sem 8 apps abertos, sem ansiedade.
      </p>

      {/* mini stats */}
      <div style={{ display: 'flex', gap: 36, marginTop: 18, justifyContent: 'center' }}>
        {[
          { v: '24k', l: 'pessoas usando' },
          { v: '4,8★', l: 'avaliação App Store' },
          { v: 'LGPD', l: 'compliant' },
        ].map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div className="sl-num-strong" style={{ fontSize: 22, color: 'var(--sl-t1)' }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* copyright fica colado no rodapé */}
    <div style={{ position: 'absolute', bottom: 32, fontSize: 11, color: 'var(--sl-t4)' }}>
      © 2026 SyncLife · São Paulo
    </div>
  </aside>
);

// ── LOGIN form
const LoginForm = ({ onToggle }) => (
  <>
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--sl-t1)', margin: 0 }}>
        Que bom te ver de volta.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--sl-t3)', marginTop: 8 }}>
        Entre na sua conta para continuar onde parou.
      </p>
    </div>

    <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
      <SocialBtn icon={<GoogleIcon/>} label="Google"/>
      <SocialBtn icon={<AppleIcon/>} label="Apple"/>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0 22px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--sl-border)' }}/>
      <span style={{ fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.06em' }}>OU COM E-MAIL</span>
      <div style={{ flex: 1, height: 1, background: 'var(--sl-border)' }}/>
    </div>

    <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AuthField label="E-mail" type="email" placeholder="seu@email.com" autoFocus/>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--sl-t2)' }}>Senha</label>
          <a style={{ fontSize: 11.5, color: 'var(--sl-em)', cursor: 'pointer' }}>Esqueci a senha</a>
        </div>
        <input type="password" placeholder="••••••••" style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--sl-s2)', border: '1px solid var(--sl-border)',
          borderRadius: 10, padding: '11px 14px',
          color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 14,
          outline: 'none',
        }}/>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--sl-em)' }}/>
        <span style={{ fontSize: 13, color: 'var(--sl-t2)' }}>Manter conectado por 30 dias</span>
      </label>

      <button style={{
        padding: '13px 20px', borderRadius: 10, border: 'none',
        background: 'var(--sl-em)', color: '#0B0F14',
        fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sl-font-body)',
        boxShadow: '0 0 32px -8px var(--sl-em-soft)',
        marginTop: 6,
      }}>Entrar</button>
    </form>

    <div style={{ marginTop: 24, fontSize: 13, color: 'var(--sl-t3)', textAlign: 'center' }}>
      Ainda não tem uma conta?{' '}
      <a onClick={onToggle} style={{ color: 'var(--sl-em)', cursor: 'pointer', fontWeight: 600 }}>Criar conta grátis</a>
    </div>
  </>
);

// ── CADASTRO form
const RegisterForm = ({ onToggle }) => (
  <>
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--sl-t1)', margin: 0 }}>
        Comece a sincronizar.
      </h1>
      <p style={{ fontSize: 14, color: 'var(--sl-t3)', marginTop: 8 }}>
        14 dias PRO grátis. Sem cartão de crédito.
      </p>
    </div>

    <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
      <SocialBtn icon={<GoogleIcon/>} label="Continuar com Google"/>
      <SocialBtn icon={<AppleIcon/>} label="Apple"/>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0 22px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--sl-border)' }}/>
      <span style={{ fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.06em' }}>OU COM E-MAIL</span>
      <div style={{ flex: 1, height: 1, background: 'var(--sl-border)' }}/>
    </div>

    <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AuthField label="Como você prefere ser chamado" placeholder="Thiago" autoFocus/>
      <AuthField label="E-mail" type="email" placeholder="seu@email.com"/>
      <AuthField label="Senha" type="password" placeholder="Mínimo 8 caracteres" hint="Use letras, números e um símbolo."/>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none', marginTop: 4 }}>
        <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--sl-em)', marginTop: 2 }}/>
        <span style={{ fontSize: 12.5, color: 'var(--sl-t3)', lineHeight: 1.5 }}>
          Li e concordo com os <a style={{ color: 'var(--sl-em)', cursor: 'pointer' }}>Termos de uso</a> e a <a style={{ color: 'var(--sl-em)', cursor: 'pointer' }}>Política de privacidade</a>.
        </span>
      </label>

      <button style={{
        padding: '13px 20px', borderRadius: 10, border: 'none',
        background: 'var(--sl-em)', color: '#0B0F14',
        fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sl-font-body)',
        boxShadow: '0 0 32px -8px var(--sl-em-soft)',
        marginTop: 6,
      }}>Criar minha conta</button>
    </form>

    <div style={{ marginTop: 24, fontSize: 13, color: 'var(--sl-t3)', textAlign: 'center' }}>
      Já tem uma conta?{' '}
      <a onClick={onToggle} style={{ color: 'var(--sl-em)', cursor: 'pointer', fontWeight: 600 }}>Entrar</a>
    </div>
  </>
);

// ── Composition
const Auth = () => {
  const [t, setTweak] = window.useTweaks(AUTH_TWEAKS);
  useTokens(t);
  const isLogin = t.mode === 'login';
  const toggle = () => setTweak('mode', isLogin ? 'register' : 'login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--sl-bg)' }}>
      <BrandSide/>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {isLogin ? <LoginForm onToggle={toggle}/> : <RegisterForm onToggle={toggle}/>}
        </div>
      </main>

      <AuthTweaks tweaks={t} setTweak={setTweak}/>
    </div>
  );
};

const AuthTweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio } = window;
  return (
    <TweaksPanel>
      <TweakSection label="Modo"/>
      <TweakRadio label="Mode" value={tweaks.mode}
        options={[
          { value: 'login', label: 'Login' },
          { value: 'register', label: 'Cadastro' },
        ]}
        onChange={(v) => setTweak('mode', v)}
      />
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

Object.assign(window, { Auth });
