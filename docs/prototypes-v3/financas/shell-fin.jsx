// SyncLife — Finanças (Visão Geral) v3 — proposta de redesign

const FIN_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "petrol",
  "background": "navy-deep",
  "density": "comfortable"
}/*EDITMODE-END*/;

// ──────────────────────────────────────────────────────
// Aplicar tweaks de tema (mesma lógica do Dashboard)
// ──────────────────────────────────────────────────────
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
      'navy-deep': { bg:'#0B0F14', s1:'#131922', s2:'#1A2230', s3:'#232C3B', sHero:'#161D28', t1:'#E7ECF1', t2:'#A7B0BC', t3:'#6F7986', t4:'#4A535F', border:'rgba(255,255,255,0.06)', borderH:'rgba(255,255,255,0.12)' },
      'midnight':  { bg:'#0F0B1F', s1:'#161232', s2:'#1F1B40', s3:'#2A2552', sHero:'#1A1638', t1:'#E7ECF1', t2:'#A7B0BC', t3:'#6F7986', t4:'#4A535F', border:'rgba(255,255,255,0.06)', borderH:'rgba(255,255,255,0.12)' },
      'charcoal':  { bg:'#181818', s1:'#222222', s2:'#2B2B2B', s3:'#363636', sHero:'#252525', t1:'#E7ECF1', t2:'#A7B0BC', t3:'#6F7986', t4:'#4A535F', border:'rgba(255,255,255,0.06)', borderH:'rgba(255,255,255,0.12)' },
      'cream':     { bg:'#F5F2EC', s1:'#FFFFFF', s2:'#EFEBE2', s3:'#E5DFD2', sHero:'#FAF7F1', t1:'#1A2230', t2:'#4F5663', t3:'#818A95', t4:'#B4BAC2', border:'rgba(0,0,0,0.08)', borderH:'rgba(0,0,0,0.16)' },
    };
    const b = bgs[t.background] || bgs['navy-deep'];
    Object.entries(b).forEach(([k, v]) => {
      const map = { bg:'--sl-bg', s1:'--sl-s1', s2:'--sl-s2', s3:'--sl-s3', sHero:'--sl-s-hero',
        t1:'--sl-t1', t2:'--sl-t2', t3:'--sl-t3', t4:'--sl-t4', border:'--sl-border', borderH:'--sl-border-h' };
      if (map[k]) root.style.setProperty(map[k], v);
    });
  }, [t.accent, t.background]);
};

// ──────────────────────────────────────────────────────
// SIDEBAR — ModuleRail (Finanças ativo) + SubNav
// ──────────────────────────────────────────────────────
const FinModuleRail = () => {
  const items = [
    { id: 'pan', icon: SLIcons.panorama, label: 'Panorama',     color: 'var(--sl-mod-pan)' },
    { id: 'fin', icon: SLIcons.financas, label: 'Finanças',     color: 'var(--sl-em)', active: true },
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
          border: 'none',
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

const FinSubNav = () => {
  const items = [
    { id: 'dash',  label: 'Visão geral',  icon: SLIcons.pieChart, active: true },
    { id: 'tx',    label: 'Transações',   icon: SLIcons.arrowUpRight },
    { id: 'rec',   label: 'Recorrentes',  icon: SLIcons.repeat || SLIcons.calendar },
    { id: 'orc',   label: 'Orçamentos',   icon: SLIcons.pieChart },
    { id: 'cal',   label: 'Calendário',   icon: SLIcons.calendar },
    { id: 'plan',  label: 'Planejamento', icon: SLIcons.trending },
    { id: 'rel',   label: 'Relatórios',   icon: SLIcons.fileText },
    { id: 'imp',   label: 'Importar',     icon: SLIcons.arrowDownRight },
  ];
  return (
    <aside style={{
      width: 240, padding: '20px 14px',
      background: 'var(--sl-bg)',
      borderRight: '1px solid var(--sl-border)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
        <span style={{ color: 'var(--sl-em)', display: 'inline-flex' }}><SLIcons.financas size={16}/></span>
        <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 15, fontWeight: 600, color: 'var(--sl-t1)' }}>Finanças</span>
      </div>

      <div style={{
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
        borderRadius: 14, padding: 14,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sl-t3)', marginBottom: 6 }}>
          Saldo do mês
        </div>
        <div className="sl-num-strong" style={{ fontSize: 28, color: 'var(--sl-em)', lineHeight: 1 }}>
          R$ 1.840,00
        </div>
        <div className="sl-num" style={{ fontSize: 11, color: 'var(--sl-t3)', marginTop: 6 }}>
          +R$ 198,00 vs mai
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
            fontFamily: 'var(--sl-font-body)', textAlign: 'left',
            cursor: 'pointer',
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

// ──────────────────────────────────────────────────────
// HEADER
// ──────────────────────────────────────────────────────
const FinHeader = () => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '32px 40px 24px', gap: 24 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        FINANÇAS · MAIO 2026
      </div>
      <h1 style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em', margin: 0, color: 'var(--sl-t1)' }}>
        Visão geral
      </h1>
      <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 13, color: 'var(--sl-t3)' }}>
        Semana 4 de 5 · 8 dias restantes neste mês
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {/* Month navigator */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
        borderRadius: 10, padding: '4px',
      }}>
        <button style={navBtn} aria-label="Mês anterior"><SLIcons.chevronLeft size={14}/></button>
        <button style={{
          padding: '4px 12px', background: 'transparent', border: 'none',
          color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 13, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}><SLIcons.calendar size={12}/><span>Maio 2026</span></button>
        <button style={navBtn} aria-label="Próximo mês"><SLIcons.chevronRight size={14}/></button>
      </div>
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 16px', borderRadius: 10,
        background: 'var(--sl-em)', color: '#0B0F14',
        border: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'var(--sl-font-body)',
        cursor: 'pointer',
        boxShadow: '0 0 24px -6px var(--sl-em-soft)',
      }}>
        <SLIcons.plus size={14}/><span>Nova transação</span>
      </button>
    </div>
  </header>
);

const navBtn = {
  width: 28, height: 28, padding: 0, background: 'transparent',
  border: 'none', color: 'var(--sl-t2)', borderRadius: 6,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

Object.assign(window, { FIN_TWEAKS, useTokens, FinModuleRail, FinSubNav, FinHeader });
