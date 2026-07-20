// SyncLife — Configurações widgets + composição

// ── Form primitives ──
const TextField = ({ label, value, placeholder, hint, type = 'text', readOnly, prefix, suffix }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--sl-t2)' }}>{label}</label>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--sl-s2)', border: '1px solid var(--sl-border)',
      borderRadius: 10, padding: '9px 12px',
      transition: 'border-color var(--dur-fast) var(--ease-soft)',
    }}>
      {prefix && <span style={{ color: 'var(--sl-t3)', fontSize: 13, display: 'inline-flex' }}>{prefix}</span>}
      <input type={type} defaultValue={value} placeholder={placeholder} readOnly={readOnly} style={{
        flex: 1, background: 'transparent', border: 'none', outline: 'none',
        color: readOnly ? 'var(--sl-t3)' : 'var(--sl-t1)',
        fontFamily: 'var(--sl-font-body)', fontSize: 13.5,
      }}/>
      {suffix && <span style={{ color: 'var(--sl-t3)', fontSize: 11, display: 'inline-flex' }}>{suffix}</span>}
    </div>
    {hint && <div style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{hint}</div>}
  </div>
);

const SelectField = ({ label, value, options }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--sl-t2)' }}>{label}</label>
    <button style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--sl-s2)', border: '1px solid var(--sl-border)',
      borderRadius: 10, padding: '9px 12px',
      color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 13.5,
      cursor: 'pointer', textAlign: 'left',
    }}>
      <span>{value}</span>
      <SLIcons.chevronDown size={14}/>
    </button>
  </div>
);

const ToggleRow = ({ label, sub, defaultOn = false }) => {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--sl-t1)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={() => setOn(!on)} style={{
        width: 38, height: 22, borderRadius: 999, position: 'relative',
        background: on ? 'var(--sl-em)' : 'var(--sl-s3)',
        border: '1px solid ' + (on ? 'var(--sl-border-em)' : 'var(--sl-border)'),
        cursor: 'pointer', flexShrink: 0,
        transition: 'background var(--dur-fast)',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 18 : 2,
          width: 16, height: 16, borderRadius: 999,
          background: on ? '#0B0F14' : 'var(--sl-t2)',
          transition: 'left var(--dur-fast) var(--ease-soft)',
        }}/>
      </button>
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, sub }) => (
  <header style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
    {eyebrow && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-em)', textTransform: 'uppercase' }}>{eyebrow}</div>}
    <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 19, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.015em' }}>
      {title}
    </h2>
    {sub && <div style={{ fontSize: 12.5, color: 'var(--sl-t3)', lineHeight: 1.5 }}>{sub}</div>}
  </header>
);

const FormCard = ({ children }) => (
  <article style={{
    background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
    borderRadius: 18, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>{children}</article>
);

// ── HERO de Perfil — avatar + identidade ──
const ProfileHero = () => (
  <article style={{
    background: 'var(--sl-s-hero)',
    backgroundImage: 'radial-gradient(circle at 20% 0%, var(--sl-em-soft) 0%, transparent 55%), var(--sl-noise)',
    border: '1px solid var(--sl-border)',
    borderRadius: 22, padding: '26px 30px',
    display: 'flex', alignItems: 'center', gap: 22,
  }}>
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: 88, height: 88, borderRadius: 999,
        background: 'linear-gradient(135deg, #1F8A8A 0%, #3D6BD9 100%)',
        color: '#0B0F14',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--sl-font-display)', fontWeight: 700, fontSize: 38,
        letterSpacing: '-0.02em',
        border: '3px solid var(--sl-s-hero)',
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)',
      }}>T</div>
      <button style={{
        position: 'absolute', bottom: -2, right: -2,
        width: 28, height: 28, borderRadius: 999,
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border-h)',
        color: 'var(--sl-t1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <SLIcons.plus size={13}/>
      </button>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-em)', textTransform: 'uppercase', marginBottom: 4 }}>
        PRO · Desde mar/2026
      </div>
      <h1 style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 28, letterSpacing: '-0.02em', margin: 0, color: 'var(--sl-t1)' }}>
        Thiago Souza Ferreira
      </h1>
      <div style={{ fontSize: 13.5, color: 'var(--sl-t3)', marginTop: 4 }}>
        thiago@synclife.app · São Paulo · membro desde 12/mar/2026
      </div>
    </div>
    <button style={{
      padding: '9px 18px', background: 'transparent',
      border: '1px solid var(--sl-border)', borderRadius: 999,
      color: 'var(--sl-t1)', fontSize: 13, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    }}>
      Ver perfil público <SLIcons.arrowRight size={11}/>
    </button>
  </article>
);

// ── Sticky bottom save bar ──
const SaveBar = ({ changes = 3 }) => (
  <div style={{
    position: 'sticky', bottom: 12, marginTop: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '12px 18px',
    background: 'var(--sl-s-hero)',
    border: '1px solid var(--sl-border-h)',
    borderRadius: 999,
    boxShadow: '0 12px 40px -12px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(12px)',
  }}>
    <span style={{ fontSize: 12.5, color: 'var(--sl-t2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--sl-em)', boxShadow: '0 0 8px var(--sl-em-soft)' }}/>
      Você tem <strong style={{ color: 'var(--sl-t1)' }}>{changes} alterações</strong> não salvas
    </span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button style={{
        padding: '8px 16px', background: 'transparent',
        border: '1px solid var(--sl-border)', borderRadius: 999,
        color: 'var(--sl-t2)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
      }}>Descartar</button>
      <button style={{
        padding: '8px 18px', background: 'var(--sl-em)',
        border: 'none', borderRadius: 999,
        color: '#0B0F14', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        boxShadow: '0 0 24px -6px var(--sl-em-soft)',
      }}>
        <SLIcons.check size={12}/> Salvar alterações
      </button>
    </div>
  </div>
);

// ── DANGER ZONE ──
const DangerZone = () => (
  <article style={{
    background: 'var(--sl-s1)',
    border: '1px solid rgba(219,100,120,0.30)',
    borderRadius: 18, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 14,
  }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-danger)', textTransform: 'uppercase' }}>
      ZONA DE ATENÇÃO
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '8px 0', borderBottom: '1px solid var(--sl-border)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--sl-t1)' }}>Exportar todos os meus dados</div>
        <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 2 }}>Receba um arquivo .zip com tudo (LGPD).</div>
      </div>
      <button style={{
        padding: '7px 14px', background: 'transparent', border: '1px solid var(--sl-border)',
        borderRadius: 999, color: 'var(--sl-t1)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
      }}>Solicitar</button>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '8px 0' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--sl-danger)' }}>Excluir conta permanentemente</div>
        <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 2 }}>Esta ação é irreversível. Todos os seus dados serão apagados em até 30 dias.</div>
      </div>
      <button style={{
        padding: '7px 14px',
        background: 'rgba(219,100,120,0.10)',
        border: '1px solid rgba(219,100,120,0.30)',
        borderRadius: 999, color: 'var(--sl-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>Excluir conta</button>
    </div>
  </article>
);

Object.assign(window, { TextField, SelectField, ToggleRow, SectionHeader, FormCard, ProfileHero, SaveBar, DangerZone });
