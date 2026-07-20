// Widgets do dashboard SyncLife v3

// ── Helper: formata moeda BRL com 2 casas ──────────────
const fmtBRL = (n, opts = {}) => {
  const { compact = false } = opts;
  if (compact && Math.abs(n) >= 1000) {
    return 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
  }
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Sparkline minimalista (line + área gradient) ────────
const Sparkline = ({ data, color = 'var(--sl-em)', width = 200, height = 44 }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 6) - 3]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spk-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1FA67A" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#1FA67A" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spk-grad)"/>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>
    </svg>
  );
};

// ── HERO: Life Sync Score (o ÚNICO elemento "big" da tela) ──
const HeroScore = () => {
  const score = 74;
  const evolution = [68, 70, 69, 71, 73, 74];
  const showNoise = (window.__tweaks?.noise) !== false;

  return (
    <Card hero style={{
      position: 'relative',
      backgroundImage: showNoise
        ? 'radial-gradient(circle at 0% 0%, rgba(31,166,122,0.08) 0%, transparent 50%), var(--sl-noise)'
        : 'radial-gradient(circle at 0% 0%, rgba(31,166,122,0.06) 0%, transparent 50%)',
      backgroundColor: 'var(--sl-s-hero)',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center', gap: 36, padding: '18px 22px',
      }}>
        {/* Score gigante */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Eyebrow color="var(--sl-t3)">Life Sync Score</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{
              fontFamily: 'var(--sl-font-display)', fontWeight: 700,
              fontSize: 96, lineHeight: 0.95, color: 'var(--sl-t1)',
              letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums',
            }}>{score}</div>
            <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 14, color: 'var(--sl-t3)' }}>pontos</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--sl-font-mono)', fontSize: 12,
              color: 'var(--sl-em)', fontWeight: 500,
            }}>
              <SLIcons.arrowUpRight size={12}/>
              +3 vs semana passada
            </span>
            <span style={{ color: 'var(--sl-t4)', fontSize: 11 }}>·</span>
            <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: 11, color: 'var(--sl-t3)' }}>top 18% Brasil</span>
          </div>
        </div>

        {/* Sparkline + descrição */}
        <div style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <Eyebrow color="var(--sl-t3)">Evolução · 6 semanas</Eyebrow>
            <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: 10, color: 'var(--sl-t4)' }}>04/abr → hoje</span>
          </div>
          <Sparkline data={evolution} width={420} height={56}/>
        </div>

        {/* Pill direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--sl-em-soft)',
            border: '1px solid var(--sl-border-em)',
            color: 'var(--sl-em)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.04em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--sl-em)', boxShadow: '0 0 8px rgba(31,166,122,0.6)' }}/>
            Acompanhando
          </span>
          <button style={{
            padding: '6px 12px', borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--sl-border)',
            color: 'var(--sl-t2)', fontSize: 12,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span>Como melhorar</span>
            <SLIcons.arrowRight size={11}/>
          </button>
        </div>
      </div>
    </Card>
  );
};

// ── MODULE MOSAIC — 8 cards calmos, sem chrome forte ──
const ModuleMosaic = () => {
  const useModuleColor = (window.__tweaks?.moduleAccent) !== false;
  return (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
    {modules.map((m, i) => (
      <article key={m.id} style={{
        background: 'var(--sl-s1)',
        border: '1px solid var(--sl-border)',
        borderRadius: 14, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
        cursor: 'pointer',
        transition: 'border-color var(--dur-fast) var(--ease-soft), background var(--dur-fast) var(--ease-soft)',
      }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: useModuleColor
              ? `color-mix(in srgb, ${m.color} 14%, transparent)`
              : 'var(--sl-s2)',
            color: useModuleColor ? m.color : 'var(--sl-t2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <m.icon size={15}/>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--sl-t4)', display: 'inline-flex' }}>
            <SLIcons.more size={14}/>
          </button>
        </header>
        <div>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontWeight: 500, fontSize: 13, color: 'var(--sl-t2)', marginBottom: 2 }}>
            {m.label}
          </div>
          <div style={{
            fontFamily: 'var(--sl-font-display)', fontWeight: 600,
            fontSize: 24, color: 'var(--sl-t1)',
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>{m.value}</div>
        </div>
        <div style={{ fontFamily: 'var(--sl-font-mono)', fontSize: 10.5, color: 'var(--sl-t3)' }}>
          {m.sub}
        </div>
      </article>
    ))}
  </div>
  );
};

// ── KPI STRIP financeiro: 4 colunas, divisores verticais ──
const FinancialStrip = () => {
  const items = [
    { label: 'Saldo do mês', value: fmtBRL(1840),     delta: '+12% vs anterior', color: 'var(--sl-em)', deltaColor: 'var(--sl-em)' },
    { label: 'Receitas',     value: fmtBRL(5000),     delta: '+8%',              color: 'var(--sl-t1)', deltaColor: 'var(--sl-em)' },
    { label: 'Despesas',     value: fmtBRL(3160),     delta: '63% da receita',   color: 'var(--sl-danger)', deltaColor: 'var(--sl-t3)' },
    { label: 'Poupança',     value: '37%',             delta: 'Meta: 30%',        color: 'var(--sl-t1)', deltaColor: 'var(--sl-em)' },
  ];
  return (
    <Card noPadding style={{ display: 'flex' }}>
      {items.map((it, i) => (
        <div key={it.label} style={{
          flex: 1, padding: '18px 22px',
          borderRight: i < items.length - 1 ? '1px solid var(--sl-border)' : 'none',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <Eyebrow color="var(--sl-t3)">{it.label}</Eyebrow>
          <div className="sl-num-strong" style={{
            fontSize: 22, color: it.color, lineHeight: 1,
          }}>{it.value}</div>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: it.deltaColor }}>
            {it.delta}
          </div>
        </div>
      ))}
    </Card>
  );
};

// ── ORÇAMENTOS ─────────────────────────────────────────
const BudgetsCard = () => {
  const budgets = [
    { name: 'Alimentação', spent: 720, limit: 900, color: 'var(--sl-em)' },
    { name: 'Transporte',  spent: 380, limit: 500, color: 'var(--sl-em)' },
    { name: 'Lazer',       spent: 410, limit: 500, color: 'var(--sl-warning)' },
    { name: 'Moradia',     spent: 1850, limit: 2000, color: 'var(--sl-warning)' },
    { name: 'Saúde',       spent: 180, limit: 400, color: 'var(--sl-em)' },
  ];
  return (
    <Card>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 17, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.01em' }}>
          Orçamentos
        </h3>
        <a style={{ fontSize: 12, color: 'var(--sl-em)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          5 categorias <SLIcons.arrowRight size={11}/>
        </a>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {budgets.map(b => {
          const pct = Math.min((b.spent / b.limit) * 100, 100);
          return (
            <div key={b.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sl-t1)', fontWeight: 500 }}>{b.name}</span>
                <span className="sl-num" style={{ fontSize: 12, color: 'var(--sl-t2)', fontWeight: 500 }}>
                  {fmtBRL(b.spent)} <span style={{ color: 'var(--sl-t4)' }}>/ {fmtBRL(b.limit)}</span>
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--sl-s3)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: b.color, borderRadius: 999,
                  transition: 'width 1s var(--ease-soft)',
                }}/>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ── INSIGHT IA (sem violeta, calmo) ─────────────────────
const InsightCard = () => (
  <Card style={{ position: 'relative', overflow: 'hidden' }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--sl-em-soft)',
        border: '1px solid var(--sl-border-em)',
        color: 'var(--sl-em)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <SLIcons.sparkles size={14}/>
      </div>
      <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.01em' }}>
        Consultor IA
      </h3>
      <span style={{
        marginLeft: 'auto', fontSize: 10, fontWeight: 600,
        color: 'var(--sl-t3)', letterSpacing: '0.08em',
      }}>4 INSIGHTS</span>
    </header>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      <InsightTile color="var(--sl-warning)" label="ALERTA" text={<>Lazer atingiu <strong>82%</strong> do orçamento. Faltam 8 dias.</>}/>
      <InsightTile color="var(--sl-em)" label="AÇÃO" text={<>Reserva de emergência <strong>abaixo do ritmo</strong>. Considere um aporte.</>}/>
      <InsightTile color="var(--sl-mod-mnt)" label="CONQUISTA" text={<>Poupança em <strong>37%</strong> — meta 30% batida.</>}/>
      <InsightTile color="var(--sl-info)" label="PREVISÃO" text={<>Saldo projetado: <strong>R$ 2.140</strong> ao final do mês.</>}/>
    </div>

    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 12,
      background: 'var(--sl-s2)',
      border: '1px solid var(--sl-border)',
    }}>
      <input placeholder="Pergunte algo sobre sua vida…"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 13,
        }}
      />
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: 'var(--sl-em)', color: '#0B0F14',
        border: 'none', fontSize: 12, fontWeight: 600,
      }}>
        Perguntar
        <SLIcons.send size={11}/>
      </button>
    </div>
  </Card>
);

const InsightTile = ({ color, label, text }) => (
  <div style={{
    padding: 14, borderRadius: 12,
    background: 'var(--sl-s2)',
    borderLeft: `2px solid ${color}`,
  }}>
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 12, color: 'var(--sl-t2)', lineHeight: 1.5 }}>{text}</div>
  </div>
);

// ── METAS ATIVAS ───────────────────────────────────────
const MetasCard = () => {
  const metas = [
    { name: 'Viagem Itália',   pct: 68, due: 'jul/26', current: 8400,  target: 12500 },
    { name: 'Reserva emerg.',  pct: 42, due: 'dez/26', current: 12600, target: 30000 },
    { name: 'MBA',             pct: 18, due: 'mar/27', current: 5400,  target: 30000 },
  ];
  return (
    <Card>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
          Metas ativas
        </h3>
        <span style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11, color: 'var(--sl-t3)' }}>3 objetivos</span>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {metas.map(m => (
          <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <RingProgress pct={m.pct}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--sl-t1)', marginBottom: 3 }}>{m.name}</div>
              <div className="sl-num" style={{ fontSize: 11.5, color: 'var(--sl-t2)', fontWeight: 500 }}>
                {fmtBRL(m.current)} <span style={{ color: 'var(--sl-t4)' }}>de {fmtBRL(m.target)}</span>
              </div>
              <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 10.5, color: 'var(--sl-t4)', marginTop: 2 }}>vence {m.due}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const RingProgress = ({ pct, size = 44 }) => {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={`rg-${pct}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1FA67A"/>
            <stop offset="100%" stopColor="#3D6BD9"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--sl-s3)" strokeWidth="3"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#rg-${pct})`} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease-soft)' }}/>
      </svg>
      <div className="sl-num" style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 600,
        color: 'var(--sl-t1)',
      }}>
        {pct}%
      </div>
    </div>
  );
};

// ── AGENDA SEMANA ───────────────────────────────────────
const AgendaCard = () => {
  const days = [
    { d: 'Seg', n: 18, events: 0 },
    { d: 'Ter', n: 19, events: 2 },
    { d: 'Qua', n: 20, events: 1 },
    { d: 'Qui', n: 21, events: 0 },
    { d: 'Sex', n: 22, events: 3 },
    { d: 'Sáb', n: 23, events: 1, today: true },
    { d: 'Dom', n: 24, events: 0 },
  ];
  return (
    <Card>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
          Esta semana
        </h3>
        <span style={{ fontFamily: 'var(--sl-font-mono)', fontSize: 11, color: 'var(--sl-t3)' }}>Mai 18 — 24</span>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map(d => (
          <div key={d.d} style={{
            padding: '10px 0', textAlign: 'center',
            borderRadius: 10,
            background: d.today ? 'var(--sl-em-soft)' : 'transparent',
            border: d.today ? '1px solid var(--sl-border-em)' : '1px solid transparent',
          }}>
            <div style={{
              fontSize: 10, fontFamily: 'var(--sl-font-mono)',
              color: d.today ? 'var(--sl-em)' : 'var(--sl-t3)',
              fontWeight: 600, letterSpacing: '0.05em',
            }}>{d.d.toUpperCase()}</div>
            <div style={{
              fontFamily: 'var(--sl-font-display)', fontSize: 18, fontWeight: 600,
              color: d.today ? 'var(--sl-em)' : 'var(--sl-t1)',
              marginTop: 4, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{d.n}</div>
            <div style={{
              marginTop: 6, display: 'flex', gap: 2, justifyContent: 'center',
              minHeight: 4,
            }}>
              {Array.from({ length: d.events }).map((_, i) => (
                <span key={i} style={{
                  width: 4, height: 4, borderRadius: 999,
                  background: d.today ? 'var(--sl-em)' : 'var(--sl-t2)',
                  opacity: d.today ? 1 : 0.5,
                }}/>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--sl-border)', fontSize: 12, color: 'var(--sl-t3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--sl-em)' }}/>
          <span style={{ color: 'var(--sl-t1)', fontWeight: 500 }}>Yoga</span>
          <span style={{ fontFamily: 'var(--sl-font-mono)', marginLeft: 'auto', fontSize: 11 }}>18:30</span>
        </div>
      </div>
    </Card>
  );
};

// ── DESTAQUES (highlight rows) ─────────────────────────
const DestaquesCard = () => {
  const items = [
    { mod: 'Corpo',      sub: '3 atividades · 142 min',     color: 'var(--sl-mod-crp)', icon: SLIcons.corpo,      delta: '+1',     up: true },
    { mod: 'Patrimônio', sub: `${fmtBRL(24580)} investidos`, color: 'var(--sl-mod-ptr)', icon: SLIcons.patrimonio, delta: '+8,2%',  up: true },
    { mod: 'Próx. viagem',sub: 'Roma · em 47 dias',         color: 'var(--sl-mod-exp)', icon: SLIcons.experiencias, delta: '47d',  up: null },
    { mod: 'Conquistas', sub: '3 novas esta semana',        color: 'var(--sl-mod-cqs)', icon: SLIcons.conquistas, delta: '+3',    up: true },
  ];
  return (
    <Card>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
          Destaques
        </h3>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(it => (
          <div key={it.mod} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: `color-mix(in srgb, ${it.color} 14%, transparent)`,
              color: it.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <it.icon size={14}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--sl-t1)' }}>{it.mod}</div>
              <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11.5, color: 'var(--sl-t3)' }}>{it.sub}</div>
            </div>
            <div className="sl-num" style={{
              fontSize: 12, fontWeight: 500,
              color: it.up ? 'var(--sl-em)' : 'var(--sl-t2)',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              {it.up === true && <SLIcons.arrowUpRight size={11}/>}
              {it.delta}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

Object.assign(window, { HeroScore, ModuleMosaic, FinancialStrip, BudgetsCard, InsightCard, MetasCard, AgendaCard, DestaquesCard, Sparkline });
