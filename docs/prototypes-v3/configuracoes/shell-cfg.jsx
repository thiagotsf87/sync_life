// SyncLife — Configurações v3

const CFG_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "petrol",
  "background": "navy-deep",
  "density": "comfortable"
}/*EDITMODE-END*/;

// ── ModuleRail (Configurações ativa) ──
const CfgModuleRail = () => {
  const items = [
    { id: 'pan', icon: SLIcons.panorama, label: 'Panorama',     color: 'var(--sl-mod-pan)' },
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
          width: 44, height: 40, background: 'transparent',
          color: 'var(--sl-t3)', border: 'none', cursor: 'pointer',
          borderLeft: '2px solid transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <it.icon size={18}/>
          <span style={{ fontSize: 8.5, fontWeight: 500 }}>{it.label}</span>
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      <button style={{ width: 44, height: 40, background: 'rgba(255,255,255,0.04)', color: 'var(--sl-t1)', border: 'none',
        borderLeft: '2px solid var(--sl-em)', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <SLIcons.config size={18}/><span style={{ fontSize: 8.5, marginTop: 2 }}>Config</span>
      </button>
    </aside>
  );
};

// ── Sub-nav: as 6 sub-páginas ──
const CfgSubNav = ({ active, onSelect }) => {
  const items = [
    { id: 'perfil',       label: 'Perfil',        icon: SLIcons.search },
    { id: 'aparencia',    label: 'Aparência',     icon: SLIcons.sparkles },
    { id: 'categorias',   label: 'Categorias',    icon: SLIcons.pieChart },
    { id: 'notificacoes', label: 'Notificações',  icon: SLIcons.bell },
    { id: 'integracoes',  label: 'Integrações',   icon: SLIcons.arrowUpRight },
    { id: 'plano',        label: 'Plano',         icon: SLIcons.trophy },
  ];
  return (
    <aside style={{
      width: 240, padding: '20px 14px', background: 'var(--sl-bg)',
      borderRight: '1px solid var(--sl-border)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
        <span style={{ color: 'var(--sl-t2)', display: 'inline-flex' }}><SLIcons.config size={16}/></span>
        <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 15, fontWeight: 600, color: 'var(--sl-t1)' }}>Configurações</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => onSelect(it.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            border: 'none', background: active === it.id ? 'var(--sl-s2)' : 'transparent',
            color: active === it.id ? 'var(--sl-t1)' : 'var(--sl-t2)',
            fontSize: 13, fontWeight: active === it.id ? 600 : 500,
            fontFamily: 'var(--sl-font-body)', textAlign: 'left', cursor: 'pointer',
          }}>
            <span style={{ color: active === it.id ? 'var(--sl-em)' : 'var(--sl-t3)', display: 'inline-flex' }}>
              <it.icon size={14}/>
            </span>
            <span>{it.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '12px 6px', fontSize: 11, color: 'var(--sl-t4)', borderTop: '1px solid var(--sl-border)' }}>
        SyncLife · v0.9.4
      </div>
    </aside>
  );
};

Object.assign(window, { CFG_TWEAKS, CfgModuleRail, CfgSubNav });
