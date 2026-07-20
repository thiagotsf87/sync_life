// ============================================================
// SyncLife Dashboard v3 — proposta de redesign
// Mantém: estrutura geral, tipografia (Syne/DM Sans/DM Mono),
// módulos identificáveis por cor, anel de meta gradient.
// Muda: paleta dessaturada, sem gradient em CTAs, hero massivo,
// emojis → Lucide stroke, background respirável, hierarquia clara.
// ============================================================

// ── DADOS MOCK (refletindo dashboard real) ───────────────
const modules = [
  { id: 'financas',     label: 'Finanças',     color: 'var(--sl-mod-fin)', icon: SLIcons.financas,     value: 'R$ 0,00',   sub: 'Saldo' },
  { id: 'experiencias', label: 'Experiências', color: 'var(--sl-mod-exp)', icon: SLIcons.experiencias, value: '20',        sub: '0 viagens' },
  { id: 'mente',        label: 'Mente',        color: 'var(--sl-mod-mnt)', icon: SLIcons.mente,        value: '5',         sub: 'Meditação & estudos' },
  { id: 'corpo',        label: 'Corpo',        color: 'var(--sl-mod-crp)', icon: SLIcons.corpo,        value: '5',         sub: '0 atividades' },
  { id: 'patrimonio',   label: 'Patrimônio',   color: 'var(--sl-mod-ptr)', icon: SLIcons.patrimonio,   value: '10',        sub: 'R$ 0,00 · +0%' },
  { id: 'tempo',        label: 'Tempo',        color: 'var(--sl-mod-tmp)', icon: SLIcons.tempo,        value: '0',         sub: '0 eventos · 0/7' },
  { id: 'carreira',     label: 'Carreira',     color: 'var(--sl-mod-car)', icon: SLIcons.carreira,     value: '20',        sub: 'Progresso' },
  { id: 'futuro',       label: 'Futuro',       color: 'var(--sl-mod-fut)', icon: SLIcons.futuro,       value: '0',         sub: '0 metas · 0% média' },
];

// ── EYEBROW ──────────────────────────────────────────────
const Eyebrow = ({ children, color = 'var(--sl-t3)' }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color, fontFamily: 'var(--sl-font-body)',
  }}>{children}</div>
);

// ── CARD ─────────────────────────────────────────────────
const Card = ({ children, style, className = '', noPadding = false, hero = false }) => (
  <div className={className} style={{
    background: hero ? 'var(--sl-s-hero)' : 'var(--sl-s1)',
    border: '1px solid var(--sl-border)',
    borderRadius: hero ? 24 : 18,
    padding: noPadding ? 0 : 22,
    transition: `border-color var(--dur-fast) var(--ease-soft)`,
    ...style,
  }}>{children}</div>
);

// ── SIDEBAR (módulos verticais) ──────────────────────────
const ModuleRail = () => {
  const items = [
    { id: 'panorama', icon: SLIcons.panorama, label: 'Panorama',     active: true,  color: 'var(--sl-mod-pan)' },
    { id: 'fin',      icon: SLIcons.financas, label: 'Finanças',     color: 'var(--sl-mod-fin)' },
    { id: 'tmp',      icon: SLIcons.tempo,    label: 'Tempo',        color: 'var(--sl-mod-tmp)' },
    { id: 'crp',      icon: SLIcons.corpo,    label: 'Corpo',        color: 'var(--sl-mod-crp)' },
    { id: 'fut',      icon: SLIcons.futuro,   label: 'Futuro',       color: 'var(--sl-mod-fut)' },
    { id: 'ptr',      icon: SLIcons.patrimonio, label: 'Patrimônio', color: 'var(--sl-mod-ptr)' },
    { id: 'mnt',      icon: SLIcons.mente,    label: 'Mente',        color: 'var(--sl-mod-mnt)' },
    { id: 'car',      icon: SLIcons.carreira, label: 'Carreira',     color: 'var(--sl-mod-car)' },
    { id: 'exp',      icon: SLIcons.experiencias, label: 'Experiências', color: 'var(--sl-mod-exp)' },
    { id: 'cfg',      icon: SLIcons.config,   label: 'Config',       color: 'var(--sl-t2)', bottom: true },
  ];
  const main = items.filter(i => !i.bottom);
  const bottom = items.filter(i => i.bottom);

  return (
    <aside style={{
      width: 60,
      background: '#0a0e15',
      borderRight: '1px solid var(--sl-border)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '14px 0',
      gap: 4,
    }}>
      <div style={{
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        <SLIcons.logo size={32}/>
      </div>
      {main.map(it => (
        <button key={it.id} title={it.label} style={{
          width: 44, height: 40,
          background: it.active ? 'rgba(255,255,255,0.04)' : 'transparent',
          color: it.active ? it.color : 'var(--sl-t3)',
          border: 'none',
          borderLeft: it.active ? `2px solid ${it.color}` : '2px solid transparent',
          borderRadius: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          <it.icon size={18}/>
          <span style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '0.02em' }}>{it.label}</span>
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      {bottom.map(it => (
        <button key={it.id} title={it.label} style={{
          width: 44, height: 40, background: 'transparent',
          color: 'var(--sl-t3)', border: 'none',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <it.icon size={18}/>
          <span style={{ fontSize: 8.5, marginTop: 2 }}>{it.label}</span>
        </button>
      ))}
    </aside>
  );
};

// ── SUB-NAV (sidebar interna do módulo Panorama) ────────
const SubNav = () => {
  const items = [
    { id: 'dash',  label: 'Dashboard', active: true },
    { id: 'coach', label: 'Coach IA' },
    { id: 'conq',  label: 'Conquistas' },
    { id: 'rank',  label: 'Ranking' },
  ];
  return (
    <aside style={{
      width: 240, padding: '20px 14px',
      background: 'var(--sl-bg)',
      borderRight: '1px solid var(--sl-border)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header da sub-sidebar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
        <span style={{ color: 'var(--sl-mod-pan)', display: 'inline-flex' }}><SLIcons.panorama size={16}/></span>
        <span style={{ fontFamily: 'var(--sl-font-display)', fontSize: 15, fontWeight: 600, color: 'var(--sl-t1)' }}>Panorama</span>
      </div>

      {/* Mini Score Card */}
      <div style={{
        background: 'var(--sl-s1)',
        border: '1px solid var(--sl-border)',
        borderRadius: 14,
        padding: 14,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <Eyebrow color="var(--sl-t3)">Life Sync Score</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 700, fontSize: 38, lineHeight: 1, color: 'var(--sl-t1)', letterSpacing: '-0.02em' }}>74</div>
          <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: 11, color: 'var(--sl-em)' }}>+3 sem</div>
        </div>
        <div style={{
          height: 4, background: 'var(--sl-s3)',
          borderRadius: 999, overflow: 'hidden', marginTop: 4,
        }}>
          <div style={{ width: '74%', height: '100%', background: 'var(--sl-grad)', borderRadius: 999 }}/>
        </div>
      </div>

      {/* Sub-nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <button key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            border: 'none', background: it.active ? 'var(--sl-s2)' : 'transparent',
            color: it.active ? 'var(--sl-t1)' : 'var(--sl-t2)',
            fontSize: 13, fontWeight: it.active ? 600 : 500,
            fontFamily: 'var(--sl-font-body)', textAlign: 'left',
          }}>
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

// ── HEADER (saudação + ações) ───────────────────────────
const Header = ({ tweaks }) => (
  <header style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', padding: '32px 40px 24px',
    gap: 24,
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        fontFamily: 'var(--sl-font-mono)', fontSize: 11,
        color: 'var(--sl-t3)', letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Sábado, 23 de maio · 21:14
      </div>
      <h1 style={{
        fontFamily: 'var(--sl-font-display)', fontWeight: 600,
        fontSize: 32, letterSpacing: '-0.02em', margin: 0,
        color: 'var(--sl-t1)', lineHeight: 1.1,
      }}>
        Boa noite, Thiago.
      </h1>
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button style={btnGhost}><SLIcons.fileText size={14}/><span>Review semanal</span></button>
      <button style={btnGhost}><SLIcons.sparkles size={14}/><span>Gerar relatório</span></button>
      <button style={btnPrimary}>
        <SLIcons.trending size={14}/>
        <span>Ver Life Score</span>
      </button>
      <button style={iconBtn} aria-label="notificações"><SLIcons.bell size={16}/><span style={{
        position: 'absolute', top: 8, right: 8, width: 6, height: 6,
        background: 'var(--sl-em)', borderRadius: 999,
      }}/></button>
    </div>
  </header>
);

const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 14px', borderRadius: 10,
  background: 'transparent',
  border: '1px solid var(--sl-border)',
  color: 'var(--sl-t2)', fontSize: 13, fontWeight: 500,
  fontFamily: 'var(--sl-font-body)',
  transition: 'all var(--dur-fast) var(--ease-soft)',
};

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 16px', borderRadius: 10,
  background: 'var(--sl-em)', color: '#0B0F14',
  border: 'none', fontSize: 13, fontWeight: 600,
  fontFamily: 'var(--sl-font-body)',
  boxShadow: '0 0 0 1px rgba(31,166,122,0.3), 0 0 24px -6px rgba(31,166,122,0.4)',
};

const iconBtn = {
  position: 'relative',
  width: 38, height: 38, borderRadius: 10,
  background: 'transparent',
  border: '1px solid var(--sl-border)',
  color: 'var(--sl-t2)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

Object.assign(window, { Eyebrow, Card, ModuleRail, SubNav, Header, modules });
