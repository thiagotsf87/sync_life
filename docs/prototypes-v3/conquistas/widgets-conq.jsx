// SyncLife — Conquistas widgets

// Tooltip (mesma G-01 spec)
const ConqTooltip = ({ visible, x, y, children }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', left: x, top: y - 14,
      transform: 'translate(-50%, -100%)',
      background: 'var(--sl-s-hero)', border: '1px solid var(--sl-border-h)',
      borderRadius: 10, padding: '9px 13px',
      fontSize: 11.5, color: 'var(--sl-t1)', pointerEvents: 'none', zIndex: 9999,
      whiteSpace: 'nowrap', boxShadow: '0 12px 32px -12px rgba(0,0,0,0.6)',
      fontFamily: 'var(--sl-font-body)', lineHeight: 1.5,
    }}>{children}</div>
  );
};

// ──────────────────────────────────────────────────────
// HERO — Nível + XP + próxima recompensa
// ──────────────────────────────────────────────────────
const HeroLevel = () => {
  const xp = 1280, target = 2000, pct = (xp / target) * 100;
  const c = 2 * Math.PI * 64;
  const offset = c * (1 - pct / 100);

  return (
    <article style={{
      position: 'relative',
      background: 'var(--sl-s-hero)',
      backgroundImage: 'radial-gradient(circle at 30% 0%, var(--sl-em-soft) 0%, transparent 55%), var(--sl-noise)',
      border: '1px solid var(--sl-border)',
      borderRadius: 24, padding: '32px 36px',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 36,
    }}>
      {/* Ring + nível */}
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <svg width={150} height={150} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="lvl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F8A8A"/>
              <stop offset="100%" stopColor="#3D6BD9"/>
            </linearGradient>
          </defs>
          <circle cx={75} cy={75} r={64} fill="none" stroke="var(--sl-s3)" strokeWidth="6"/>
          <circle cx={75} cy={75} r={64} fill="none" stroke="url(#lvl-grad)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s var(--ease-soft)' }}/>
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--sl-t3)' }}>NÍVEL</div>
          <div className="sl-num-strong" style={{ fontSize: 64, color: 'var(--sl-t1)', lineHeight: 0.95, marginTop: 2 }}>12</div>
        </div>
      </div>

      {/* Texto principal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-em)', textTransform: 'uppercase' }}>
          Equilibrista
        </div>
        <h1 style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 32, letterSpacing: '-0.02em', margin: 0, color: 'var(--sl-t1)' }}>
          Você está em ritmo.
        </h1>
        <div style={{ fontSize: 14, color: 'var(--sl-t2)', lineHeight: 1.5 }}>
          <span className="sl-num">1.280</span> de <span className="sl-num">2.000</span> XP até o próximo nível.
          <span style={{ color: 'var(--sl-t3)', marginLeft: 8 }}>720 XP restantes.</span>
        </div>

        {/* Próxima conquista */}
        <div style={{
          marginTop: 8, padding: '10px 14px', borderRadius: 12,
          background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
          display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--sl-em-soft)', color: 'var(--sl-em)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '1px solid var(--sl-border-em)',
          }}>
            <SLIcons.flame size={16}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--sl-t3)' }}>Próximo desbloqueio</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sl-t1)' }}>Maratonista Financeiro</div>
          </div>
          <div className="sl-num" style={{ fontSize: 11.5, color: 'var(--sl-em)' }}>38 XP</div>
        </div>
      </div>

      {/* Stats laterais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 140 }}>
        <SideStat label="POSIÇÃO" value="Top 8%" sub="Brasil"/>
        <SideStat label="STREAK" value="12d" sub="dias consecutivos" iconColor="var(--sl-mod-crp)" icon={SLIcons.flame}/>
        <SideStat label="ESTA SEMANA" value="+320" sub="XP" iconColor="var(--sl-em)"/>
      </div>
    </article>
  );
};

const SideStat = ({ label, value, sub, icon: Icon, iconColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {Icon && (
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
        color: iconColor || 'var(--sl-t2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={13}/>
      </div>
    )}
    <div>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--sl-t3)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="sl-num-strong" style={{ fontSize: 17, color: 'var(--sl-t1)' }}>{value}</span>
        <span style={{ fontSize: 10, color: 'var(--sl-t3)' }}>{sub}</span>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────
// STATS STRIP — 4 KPIs gamificação
// ──────────────────────────────────────────────────────
const ConqKpiStrip = () => {
  const items = [
    { label: 'Badges',     value: '24 / 50', sub: '+3 esta semana',   icon: SLIcons.trophy,    color: 'var(--sl-em)' },
    { label: 'Streak',     value: '12d',     sub: 'maior: 28 dias',    icon: SLIcons.flame,     color: 'var(--sl-mod-crp)' },
    { label: 'Ranking BR', value: '#1.842',  sub: 'subiu 124 posições', icon: SLIcons.trending, color: 'var(--sl-mod-pan)' },
    { label: 'XP total',   value: '4.280',    sub: 'rumo a 5K',         icon: SLIcons.sparkles,  color: 'var(--sl-mod-mnt)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {items.map(it => (
        <article key={it.label} style={{
          background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
          borderRadius: 16, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: `color-mix(in srgb, ${it.color} 14%, transparent)`, color: it.color,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <it.icon size={15}/>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sl-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              {it.label}
            </div>
            <div className="sl-num-strong" style={{ fontSize: 26, color: 'var(--sl-t1)', lineHeight: 1 }}>{it.value}</div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--sl-t3)' }}>{it.sub}</div>
        </article>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────
// RECÉM-DESBLOQUEADAS (3 cards horizontais)
// ──────────────────────────────────────────────────────
const RecentBadges = () => {
  const badges = [
    { name: 'Poupador Consistente',  desc: '3 meses guardando ≥30% da renda',  when: 'Há 2 horas',  icon: SLIcons.financas, rarity: 'rara',     color: '#3D6BD9' },
    { name: 'Mente Inquieta',         desc: '10 livros lidos no ano',           when: 'Ontem',       icon: SLIcons.mente,    rarity: 'épica',    color: '#A06585' },
    { name: 'Ciclista Urbano',        desc: '500 km pedalados em 2026',         when: 'Há 3 dias',   icon: SLIcons.corpo,    rarity: 'comum',    color: '#1FA67A' },
  ];
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 18, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.015em' }}>
          Recém-conquistadas
        </h2>
        <a style={{ fontSize: 12, color: 'var(--sl-em)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Ver linha do tempo <SLIcons.arrowRight size={11}/>
        </a>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {badges.map(b => (
          <article key={b.name} style={{
            background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
            borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* radial glow sutil */}
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 140, height: 140,
              background: `radial-gradient(circle, ${b.color}22 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}/>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `color-mix(in srgb, ${b.color} 16%, var(--sl-s2))`,
                border: `1px solid ${b.color}55`,
                color: b.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <b.icon size={22}/>
              </div>
              <RarityPill rarity={b.rarity}/>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'var(--sl-font-display)', fontWeight: 600, fontSize: 15, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
                {b.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sl-t3)', marginTop: 4, lineHeight: 1.5 }}>{b.desc}</div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--sl-border)' }}>
              <span style={{ fontSize: 11, color: 'var(--sl-t3)' }}>{b.when}</span>
              <span style={{ fontSize: 11, color: 'var(--sl-em)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <SLIcons.sparkles size={10}/>
                +50 XP
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const rarities = {
  comum:     { label: 'COMUM',     color: 'var(--sl-t3)',    bg: 'rgba(255,255,255,0.04)' },
  rara:      { label: 'RARA',      color: '#3D6BD9',          bg: 'rgba(61,107,217,0.10)' },
  épica:     { label: 'ÉPICA',     color: '#A06585',          bg: 'rgba(160,101,133,0.10)' },
  lendária:  { label: 'LENDÁRIA',  color: '#D9962E',          bg: 'rgba(217,150,46,0.12)' },
};
const RarityPill = ({ rarity }) => {
  const r = rarities[rarity] || rarities.comum;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
      padding: '3px 8px', borderRadius: 999,
      background: r.bg, color: r.color, border: `1px solid ${r.color}40`,
    }}>{r.label}</span>
  );
};

// ──────────────────────────────────────────────────────
// COLEÇÃO COMPLETA — grid de badges
// ──────────────────────────────────────────────────────
const BadgeCollection = () => {
  const badges = [
    // Linha 1 — Finanças
    { id:'b1', n:'Primeira Trans.', mod:'fin', icon:SLIcons.financas,   rar:'comum',    locked:false },
    { id:'b2', n:'Poupador',        mod:'fin', icon:SLIcons.financas,   rar:'rara',     locked:false },
    { id:'b3', n:'Investidor',      mod:'ptr', icon:SLIcons.patrimonio, rar:'rara',     locked:false },
    { id:'b4', n:'Maratonista F.',  mod:'fin', icon:SLIcons.trending,   rar:'épica',    locked:true },
    { id:'b5', n:'Bolsa de Aço',    mod:'ptr', icon:SLIcons.flame,      rar:'lendária', locked:true },
    { id:'b6', n:'Reserva Total',   mod:'fin', icon:SLIcons.trophy,     rar:'épica',    locked:true },
    // Linha 2 — Corpo
    { id:'b7', n:'Primeiro Treino', mod:'crp', icon:SLIcons.corpo,      rar:'comum',    locked:false },
    { id:'b8', n:'Ciclista',        mod:'crp', icon:SLIcons.corpo,      rar:'comum',    locked:false },
    { id:'b9', n:'Atleta da Semana',mod:'crp', icon:SLIcons.flame,      rar:'rara',     locked:false },
    { id:'b10', n:'Corpo Vivo',     mod:'crp', icon:SLIcons.trophy,     rar:'épica',    locked:true },
    { id:'b11', n:'Maratonista',    mod:'crp', icon:SLIcons.trending,   rar:'lendária', locked:true },
    { id:'b12', n:'Equilibrista',   mod:'crp', icon:SLIcons.sparkles,   rar:'épica',    locked:false },
    // Linha 3 — Mente/Futuro
    { id:'b13', n:'Mente Inquieta', mod:'mnt', icon:SLIcons.mente,      rar:'épica',    locked:false },
    { id:'b14', n:'Estudante',      mod:'mnt', icon:SLIcons.fileText,   rar:'comum',    locked:false },
    { id:'b15', n:'Sonhador',       mod:'fut', icon:SLIcons.futuro,     rar:'comum',    locked:false },
    { id:'b16', n:'Realizador',     mod:'fut', icon:SLIcons.trophy,     rar:'rara',     locked:false },
    { id:'b17', n:'Visionário',     mod:'fut', icon:SLIcons.sparkles,   rar:'lendária', locked:true },
    { id:'b18', n:'Mentor',         mod:'mnt', icon:SLIcons.mente,      rar:'épica',    locked:true },
  ];

  const modColor = {
    fin: 'var(--sl-em)', crp: 'var(--sl-mod-crp)', mnt: 'var(--sl-mod-mnt)',
    fut: 'var(--sl-mod-fut)', ptr: 'var(--sl-mod-ptr)',
  };

  const [filter, setFilter] = React.useState('all');
  const [hover, setHover] = React.useState({ visible: false, x: 0, y: 0, item: null });

  const filtered = filter === 'all' ? badges
    : filter === 'unlocked' ? badges.filter(b => !b.locked)
    : badges.filter(b => b.locked);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 18, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.015em' }}>
          Coleção completa
        </h2>
        <div style={{
          display: 'inline-flex', background: 'var(--sl-s1)',
          border: '1px solid var(--sl-border)', borderRadius: 999, padding: 3,
        }}>
          {[
            { id: 'all',      label: 'Todas (24/50)' },
            { id: 'unlocked', label: 'Desbloqueadas' },
            { id: 'locked',   label: 'Bloqueadas' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setFilter(opt.id)} style={{
              padding: '6px 14px', borderRadius: 999, border: 'none',
              background: filter === opt.id ? 'var(--sl-s2)' : 'transparent',
              color: filter === opt.id ? 'var(--sl-t1)' : 'var(--sl-t3)',
              fontSize: 12, fontWeight: filter === opt.id ? 600 : 500,
              fontFamily: 'var(--sl-font-body)', cursor: 'pointer',
            }}>{opt.label}</button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {filtered.map(b => {
          const c = modColor[b.mod] || 'var(--sl-t2)';
          const rar = rarities[b.rar] || rarities.comum;
          const onEnter = (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover({ visible: true, x: r.left + r.width / 2, y: r.top, item: { ...b, ringColor: c, rarLabel: rar.label } });
          };
          return (
            <button key={b.id}
              onMouseEnter={onEnter}
              onMouseLeave={() => setHover(h => ({ ...h, visible: false }))}
              style={{
                background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
                borderRadius: 14, padding: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer', opacity: b.locked ? 0.4 : 1,
                filter: b.locked ? 'grayscale(0.7)' : 'none',
                position: 'relative',
                transition: 'all var(--dur-fast) var(--ease-soft)',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: b.locked ? 'var(--sl-s2)' : `color-mix(in srgb, ${c} 16%, var(--sl-s2))`,
                border: b.locked ? '1px solid var(--sl-border)' : `1px solid ${c}55`,
                color: c,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <b.icon size={20}/>
                {b.locked && (
                  <span style={{
                    position: 'absolute', bottom: -4, right: -4, width: 16, height: 16,
                    borderRadius: 999, background: 'var(--sl-s3)',
                    border: '1.5px solid var(--sl-s1)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: 'var(--sl-t3)',
                  }}>✕</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--sl-t1)', textAlign: 'center', lineHeight: 1.3 }}>
                {b.n}
              </div>
              <div style={{
                fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em',
                color: rar.color, textTransform: 'uppercase',
              }}>
                {rar.label}
              </div>
            </button>
          );
        })}
      </div>

      <ConqTooltip visible={hover.visible} x={hover.x} y={hover.y}>
        {hover.item && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{hover.item.n}</div>
            <div style={{ fontSize: 10.5, color: 'var(--sl-t3)', marginBottom: 6 }}>
              {hover.item.rarLabel} · {hover.item.locked ? 'Bloqueada' : 'Desbloqueada'}
            </div>
            {hover.item.locked && (
              <div style={{ fontSize: 11, color: 'var(--sl-t2)', maxWidth: 240, whiteSpace: 'normal' }}>
                Continue na sua rotina para desbloquear esta conquista.
              </div>
            )}
          </>
        )}
      </ConqTooltip>
    </section>
  );
};

// ──────────────────────────────────────────────────────
// ESTATÍSTICAS POR CATEGORIA
// ──────────────────────────────────────────────────────
const ProgressByCategory = () => {
  const cats = [
    { name: 'Finanças',     unlocked: 6, total: 10, color: 'var(--sl-mod-fin)' },
    { name: 'Corpo',        unlocked: 4, total: 8,  color: 'var(--sl-mod-crp)' },
    { name: 'Mente',        unlocked: 3, total: 7,  color: 'var(--sl-mod-mnt)' },
    { name: 'Futuro',       unlocked: 4, total: 6,  color: 'var(--sl-mod-fut)' },
    { name: 'Patrimônio',   unlocked: 3, total: 6,  color: 'var(--sl-mod-ptr)' },
    { name: 'Experiências', unlocked: 2, total: 5,  color: 'var(--sl-mod-exp)' },
    { name: 'Carreira',     unlocked: 1, total: 4,  color: 'var(--sl-mod-car)' },
    { name: 'Tempo',        unlocked: 1, total: 4,  color: 'var(--sl-mod-tmp)' },
  ];
  return (
    <article style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 18, padding: 22 }}>
      <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
        Progresso por categoria
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cats.map(c => {
          const pct = (c.unlocked / c.total) * 100;
          return (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, color: 'var(--sl-t1)', fontWeight: 500 }}>{c.name}</span>
                <span className="sl-num" style={{ fontSize: 11.5, color: 'var(--sl-t3)' }}>
                  {c.unlocked} <span style={{ color: 'var(--sl-t4)' }}>/ {c.total}</span>
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--sl-s3)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: c.color, borderRadius: 999, transition: 'width 1s var(--ease-soft)' }}/>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

// ──────────────────────────────────────────────────────
// RANKING preview — top 3
// ──────────────────────────────────────────────────────
const RankingPreview = () => {
  const top = [
    { pos: 1, name: 'Mariana C.', xp: 6280, you: false, level: 18 },
    { pos: 2, name: 'Paulo R.',   xp: 5920, you: false, level: 17 },
    { pos: 3, name: 'Helena S.',  xp: 5340, you: false, level: 15 },
    { pos: 4, name: 'Você',       xp: 4280, you: true,  level: 12 },
    { pos: 5, name: 'Rafael T.',  xp: 3920, you: false, level: 11 },
  ];
  return (
    <article style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', borderRadius: 18, padding: 22 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
          Amigos · top 5
        </h3>
        <a style={{ fontSize: 12, color: 'var(--sl-em)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Ranking completo <SLIcons.arrowRight size={11}/>
        </a>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top.map(p => (
          <div key={p.pos} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 12,
            background: p.you ? 'var(--sl-em-soft)' : 'transparent',
            border: p.you ? '1px solid var(--sl-border-em)' : '1px solid transparent',
          }}>
            <div className="sl-num-strong" style={{
              width: 24, fontSize: 13, color: p.pos === 1 ? '#D9962E' : 'var(--sl-t3)',
              textAlign: 'center', flexShrink: 0,
            }}>#{p.pos}</div>
            <div style={{
              width: 32, height: 32, borderRadius: 999, flexShrink: 0,
              background: p.you ? 'var(--sl-em)' : 'var(--sl-s3)',
              color: p.you ? '#0B0F14' : 'var(--sl-t1)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--sl-font-display)', fontWeight: 700, fontSize: 13,
            }}>{p.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: p.you ? 600 : 500, color: 'var(--sl-t1)' }}>{p.name}</div>
              <div className="sl-num" style={{ fontSize: 10.5, color: 'var(--sl-t3)' }}>Nível {p.level}</div>
            </div>
            <div className="sl-num-strong" style={{ fontSize: 14, color: p.you ? 'var(--sl-em)' : 'var(--sl-t1)' }}>
              {p.xp.toLocaleString('pt-BR')} <span style={{ color: 'var(--sl-t4)', fontSize: 10, fontWeight: 400 }}>XP</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

Object.assign(window, { HeroLevel, ConqKpiStrip, RecentBadges, BadgeCollection, ProgressByCategory, RankingPreview });
