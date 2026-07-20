// SyncLife — Conquistas (gamificação) v3

const CONQ_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "petrol",
  "background": "navy-deep",
  "density": "comfortable"
}/*EDITMODE-END*/;

// ── ModuleRail (Conquistas ativa, mas é sub-rota de Panorama) ──
const ConqModuleRail = () => {
  const items = [
    { id: 'pan', icon: SLIcons.panorama, label: 'Panorama',     color: 'var(--sl-mod-pan)', active: true },
    { id: 'fin', icon: SLIcons.financas, label: 'Finanças',     color: 'var(--sl-mod-fin)' },
    { id: 'tmp', icon: SLIcons.tempo,    label: 'Tempo',        color: 'var(--sl-mod-tmp)' },
    { id: 'crp', icon: SLIcons.corpo,    label: 'Corpo',        color: 'var(--sl-mod-crp)' },
    { id: 'fut', icon: SLIcons.futuro,   label: 'Futuro',       color: 'var(--sl-mod-fut)' },
    { id: 'ptr', icon: SLIcons.patrimonio, label: 'Patrimônio', color: 'var(--sl-mod-ptr)' },
    { id: 'mnt', icon: SLIcons.mente,    label: 'Mente',        color: 'var(--sl-mod-mnt)' },
    { id: 'car', icon: SLIcons.carreira, label: 'Carreira',     color: 'var(--sl-mod-car)' },
    { id: 'exp', icon: SLIcons.experiencias, label: 'Experiências', color: 'var(--sl-mod-exp)' },
  ];
  return (
    <aside style={{
      width: 60, background: '#0a0e15', borderRight: '1px solid var(--sl-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 4,
    }}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <SLIcons.logo size={32}/>
      </div>
      {items.map(it => (
        <button key={it.id} title={it.label} style={{
          width: 44, height: 40,
          background: it.active ? 'rgba(255,255,255,0.04)' : 'transparent',
          color: it.active ? it.color : 'var(--sl-t3)',
          border: 'none', cursor: 'pointer',
          borderLeft: it.active ? `2px solid ${it.color}` : '2px solid transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <it.icon size={18}/>
          <span style={{ fontSize: 8.5, fontWeight: 500 }}>{it.label}</span>
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      <button style={{ width: 44, height: 40, background: 'transparent', color: 'var(--sl-t3)', border: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <SLIcons.config size={18}/><span style={{ fontSize: 8.5, marginTop: 2 }}>Config</span>
      </button>
    </aside>
  );
};

const ConqSubNav = () => {
  const items = [
    { id: 'dash',  label: 'Dashboard',  icon: SLIcons.pieChart },
    { id: 'coach', label: 'Coach IA',   icon: SLIcons.sparkles },
    { id: 'conq',  label: 'Conquistas', icon: SLIcons.trophy, active: true },
    { id: 'rank',  label: 'Ranking',    icon: SLIcons.trending },
  ];
  return (
    <aside style={{
      width: 240, padding: '20px 14px', background: 'var(--sl-bg)',
      borderRight: '1px solid var(--sl-border)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
        <span style={{ color: 'var(--sl-mod-pan)', display: 'inline-flex' }}><SLIcons.panorama size={16}/></span>
        <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 15, fontWeight: 600, color: 'var(--sl-t1)' }}>Panorama</span>
      </div>

      <div style={{
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
        borderRadius: 14, padding: 14,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sl-t3)', marginBottom: 6 }}>
          Nível atual
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div className="sl-num-strong" style={{ fontSize: 32, color: 'var(--sl-t1)', lineHeight: 1 }}>12</div>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)' }}>Equilibrista</div>
        </div>
        <div style={{ height: 4, background: 'var(--sl-s3)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ width: '64%', height: '100%', background: 'var(--sl-em)', borderRadius: 999 }}/>
        </div>
        <div className="sl-num" style={{ fontSize: 11, color: 'var(--sl-t3)', marginTop: 6 }}>
          1.280 / 2.000 XP
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <button key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            border: 'none', background: it.active ? 'var(--sl-s2)' : 'transparent',
            color: it.active ? 'var(--sl-t1)' : 'var(--sl-t2)',
            fontSize: 13, fontWeight: it.active ? 600 : 500,
            fontFamily: 'var(--sl-font-body)', textAlign: 'left', cursor: 'pointer',
          }}>
            <span style={{ color: it.active ? 'var(--sl-em)' : 'var(--sl-t3)', display: 'inline-flex' }}>
              <it.icon size={14}/>
            </span>
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

Object.assign(window, { CONQ_TWEAKS, ConqModuleRail, ConqSubNav });
