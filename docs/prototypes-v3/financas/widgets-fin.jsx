// SyncLife — Finanças widgets

// ──────────────────────────────────────────────────────
// Tooltip flutuante (reutilizado por todos os gráficos)
// ──────────────────────────────────────────────────────
const ChartTooltip = ({ visible, x, y, children }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', left: x, top: y - 14,
      transform: 'translate(-50%, -100%)',
      background: 'var(--sl-s-hero)',
      border: '1px solid var(--sl-border-h)',
      borderRadius: 10, padding: '9px 13px',
      fontSize: 11.5, color: 'var(--sl-t1)',
      pointerEvents: 'none', zIndex: 9999, whiteSpace: 'nowrap',
      boxShadow: '0 12px 32px -12px rgba(0,0,0,0.6)',
      fontFamily: 'var(--sl-font-body)',
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
};

// ──────────────────────────────────────────────────────
// KPI STRIP — 4 cards de Receitas/Despesas/Saldo/Poupança
// ──────────────────────────────────────────────────────
const FinKpiStrip = () => {
  const items = [
    { label:'Receitas',         icon: SLIcons.arrowUpRight,   value: fmtBRL(5000),  sub:'Maio atual', color:'var(--sl-em)',     iconColor:'var(--sl-em)' },
    { label:'Despesas',         icon: SLIcons.arrowDownRight, value: fmtBRL(3160),  sub:'Maio atual', color:'var(--sl-danger)', iconColor:'var(--sl-danger)' },
    { label:'Saldo do mês',     icon: SLIcons.trending,       value: fmtBRL(1840),  sub:'Receitas − Despesas · Não alocado: ' + fmtBRL(420),  color:'var(--sl-t1)', iconColor:'var(--sl-em)' },
    { label:'Taxa de poupança', icon: SLIcons.pieChart,       value: '37%',          sub:'Meta: 30% · acima do alvo',  color:'var(--sl-t1)', iconColor:'var(--sl-em)', okPill: true },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {items.map(it => (
        <article key={it.label} style={{
          background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
          borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--sl-em-soft)', color: it.iconColor,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <it.icon size={14}/>
            </div>
            {it.okPill && (
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                padding: '3px 8px', borderRadius: 999,
                background: 'var(--sl-em-soft)', color: 'var(--sl-em)',
                border: '1px solid var(--sl-border-em)',
              }}>NO RITMO</span>
            )}
          </header>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sl-t3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              {it.label}
            </div>
            <div className="sl-num-strong" style={{ fontSize: 26, color: it.color, lineHeight: 1 }}>{it.value}</div>
          </div>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11.5, color: 'var(--sl-t3)', lineHeight: 1.4 }}>
            {it.sub}
          </div>
        </article>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────
// SAÚDE FINANCEIRA — alert horizontal
// ──────────────────────────────────────────────────────
const SaudeAlerta = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 18,
    padding: '14px 20px',
    background: 'var(--sl-s1)',
    border: '1px solid var(--sl-border)',
    borderLeft: '2px solid var(--sl-warning)',
    borderRadius: 14,
  }}>
    <div style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--sl-warning)',
      textTransform: 'uppercase', flexShrink: 0,
    }}>SAÚDE FIN.</div>
    <div style={{ width: 1, height: 32, background: 'var(--sl-border)' }}/>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sl-t1)' }}>Lazer em atenção</div>
      <div style={{ fontSize: 12, color: 'var(--sl-t3)' }}>
        Você usou <span style={{ color: 'var(--sl-warning)', fontWeight: 600 }}>82%</span> do orçamento de Lazer (R$ 410,00 de R$ 500,00). Faltam 8 dias no mês.
      </div>
    </div>
    <button style={{
      padding: '7px 14px', background: 'transparent', border: '1px solid var(--sl-border)',
      borderRadius: 999, color: 'var(--sl-t1)', fontSize: 12, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    }}>
      Ver análise <SLIcons.arrowRight size={11}/>
    </button>
  </div>
);

// ──────────────────────────────────────────────────────
// CONSULTOR IA — card grande com 4 insight tiles + ask
// ──────────────────────────────────────────────────────
const ConsultorIA = () => {
  return (
    <article style={{
      position: 'relative',
      background: 'var(--sl-s-hero)',
      backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(31,138,138,0.10) 0%, transparent 60%), var(--sl-noise)',
      border: '1px solid var(--sl-border)',
      borderRadius: 22,
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--sl-em-soft)', border: '1px solid var(--sl-border-em)',
          color: 'var(--sl-em)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SLIcons.sparkles size={18}/>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 18, fontWeight: 600, color: 'var(--sl-t1)', margin: 0, letterSpacing: '-0.015em' }}>
            Consultor financeiro IA
          </h3>
          <div style={{ fontFamily: 'var(--sl-font-body)', fontSize: 11.5, color: 'var(--sl-t3)', marginTop: 2 }}>
            Análise personalizada · Maio 2026 · atualizado agora
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: 'var(--sl-em)',
          padding: '5px 11px', borderRadius: 999,
          background: 'var(--sl-em-soft)', border: '1px solid var(--sl-border-em)',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--sl-em)' }}/>
          4 insights hoje
        </span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Tile color="var(--sl-warning)" label="ALERTA">
          <strong style={{ color: 'var(--sl-t1)' }}>Lazer atingiu 82%</strong> do orçamento. Com 8 dias restantes, risco de estouro.
        </Tile>
        <Tile color="var(--sl-em)" label="AÇÃO RECOMENDADA">
          Meta <strong style={{ color: 'var(--sl-t1)' }}>Reserva de emergência</strong> está abaixo do ritmo. Considere um aporte extra este mês.
        </Tile>
        <Tile color="var(--sl-mod-mnt)" label="CONQUISTA">
          Taxa de poupança em <strong style={{ color: 'var(--sl-t1)' }}>37%</strong> — meta de 30% batida pela 2ª semana consecutiva.
        </Tile>
        <Tile color="var(--sl-info)" label="PREVISÃO">
          Faltam 8 dias. Saldo projetado: <strong style={{ color: 'var(--sl-t1)' }}>R$ 2.140,00</strong>.
        </Tile>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 12,
        background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
      }}>
        <SLIcons.search size={14}/>
        <input placeholder='Pergunte algo… ex: "Quanto gastei em lazer este mês?"'
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--sl-t1)', fontFamily: 'var(--sl-font-body)', fontSize: 13 }}/>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8,
          background: 'var(--sl-em)', color: '#0B0F14', border: 'none',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          Perguntar <SLIcons.send size={11}/>
        </button>
      </div>
    </article>
  );
};

const Tile = ({ color, label, children }) => (
  <div style={{
    padding: 14, borderRadius: 12,
    background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
    borderLeft: `2px solid ${color}`,
  }}>
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', color, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 12, color: 'var(--sl-t2)', lineHeight: 1.55 }}>{children}</div>
  </div>
);

// ──────────────────────────────────────────────────────
// HISTÓRICO — Receitas vs Despesas (barras agrupadas)
// ──────────────────────────────────────────────────────
const HistoricoChart = () => {
  const data = [
    { m: 'Dez', r: 6200, d: 4300 },
    { m: 'Jan', r: 5800, d: 3900 },
    { m: 'Fev', r: 6500, d: 4100 },
    { m: 'Mar', r: 5400, d: 3700 },
    { m: 'Abr', r: 5700, d: 3800 },
    { m: 'Mai', r: 5000, d: 3160 },
  ];
  const max = Math.max(...data.flatMap(d => [d.r, d.d]));
  const [hover, setHover] = React.useState({ visible: false, x: 0, y: 0, item: null });

  return (
    <article style={{
      background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
      borderRadius: 18, padding: 22, position: 'relative',
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
          Histórico — Receitas vs Despesas
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Legend color="var(--sl-em)" label="Receitas"/>
          <Legend color="var(--sl-danger)" label="Despesas"/>
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 22, height: 180, padding: '6px 4px' }}>
        {data.map((d, i) => {
          const onEnter = (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover({ visible: true, x: r.left + r.width / 2, y: r.top, item: d });
          };
          return (
            <div key={i}
              onMouseEnter={onEnter}
              onMouseLeave={() => setHover(h => ({ ...h, visible: false }))}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
                <div style={{
                  width: '36%', background: 'var(--sl-em)', borderRadius: '4px 4px 0 0',
                  height: `${(d.r / max) * 100}%`, minHeight: 4,
                  opacity: i === data.length - 1 ? 1 : 0.85,
                  transition: 'opacity var(--dur-fast)',
                }}/>
                <div style={{
                  width: '36%', background: 'var(--sl-danger)', borderRadius: '4px 4px 0 0',
                  height: `${(d.d / max) * 100}%`, minHeight: 4,
                  opacity: i === data.length - 1 ? 1 : 0.85,
                  transition: 'opacity var(--dur-fast)',
                }}/>
              </div>
              <div style={{ fontSize: 11, color: i === data.length - 1 ? 'var(--sl-t1)' : 'var(--sl-t3)', fontWeight: i === data.length - 1 ? 600 : 500 }}>
                {d.m}
              </div>
            </div>
          );
        })}
      </div>

      <ChartTooltip visible={hover.visible} x={hover.x} y={hover.y}>
        {hover.item && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{hover.item.m} · 2026</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: 'var(--sl-em)' }}>Receitas</span>
              <span className="sl-num">{fmtBRL(hover.item.r)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: 'var(--sl-danger)' }}>Despesas</span>
              <span className="sl-num">{fmtBRL(hover.item.d)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--sl-border)' }}>
              <span style={{ color: 'var(--sl-t3)' }}>Saldo</span>
              <span className="sl-num" style={{ color: 'var(--sl-em)', fontWeight: 600 }}>{fmtBRL(hover.item.r - hover.item.d)}</span>
            </div>
          </>
        )}
      </ChartTooltip>
    </article>
  );
};

const Legend = ({ color, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--sl-t2)' }}>
    <span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
    <span>{label}</span>
  </span>
);

// ──────────────────────────────────────────────────────
// GASTOS POR CATEGORIA — donut + lista
// ──────────────────────────────────────────────────────
const GastosCategoria = () => {
  const cats = [
    { name: 'Moradia',      pct: 38, amount: 1200, color: 'var(--sl-mod-ptr)' },
    { name: 'Alimentação',  pct: 22, amount: 720,  color: 'var(--sl-em)' },
    { name: 'Lazer',        pct: 13, amount: 410,  color: 'var(--sl-warning)' },
    { name: 'Transporte',   pct: 12, amount: 380,  color: 'var(--sl-mod-tmp)' },
    { name: 'Saúde',        pct: 6,  amount: 180,  color: 'var(--sl-mod-crp)' },
    { name: 'Outros',       pct: 9,  amount: 270,  color: 'var(--sl-t3)' },
  ];
  const total = cats.reduce((s, c) => s + c.amount, 0);
  const [hover, setHover] = React.useState({ visible: false, x: 0, y: 0, item: null });

  // Donut paths
  const cx = 70, cy = 70, r = 50, stroke = 14;
  let acc = 0;
  const arcs = cats.map((c) => {
    const start = (acc / 100) * 2 * Math.PI - Math.PI / 2;
    acc += c.pct;
    const end = (acc / 100) * 2 * Math.PI - Math.PI / 2;
    const sx = cx + r * Math.cos(start), sy = cy + r * Math.sin(start);
    const ex = cx + r * Math.cos(end),   ey = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return { d: `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`, color: c.color, cat: c };
  });

  const showOn = (cat) => (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ visible: true, x: r.left + r.width / 2, y: r.top, item: cat });
  };
  const hide = () => setHover(h => ({ ...h, visible: false }));

  return (
    <article style={{
      background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
      borderRadius: 18, padding: 22, position: 'relative',
    }}>
      <header style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
          Gastos por categoria
        </h3>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={140} height={140}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--sl-s3)" strokeWidth={stroke}/>
            {arcs.map((a, i) => (
              <path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={stroke} strokeLinecap="round"
                style={{ cursor: 'pointer', transition: 'opacity var(--dur-fast)' }}
                onMouseEnter={showOn(a.cat)} onMouseLeave={hide}
              />
            ))}
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2, pointerEvents: 'none',
          }}>
            <div className="sl-num-strong" style={{ fontSize: 18, color: 'var(--sl-t1)' }}>
              {fmtBRL(total, { compact: true })}
            </div>
            <div style={{ fontSize: 10, color: 'var(--sl-t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>gasto</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
          {cats.map(c => (
            <div key={c.name}
              onMouseEnter={showOn(c)} onMouseLeave={hide}
              style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, padding: '2px 4px', margin: '-2px -4px', borderRadius: 4, cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }}/>
              <span style={{
                flex: 1, fontSize: 12, color: 'var(--sl-t2)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
              }}>{c.name}</span>
              <span className="sl-num" style={{
                fontSize: 11.5, color: 'var(--sl-t1)', fontWeight: 500,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{fmtBRL(c.amount)}</span>
              <span style={{
                fontSize: 11, color: 'var(--sl-t3)', minWidth: 28, textAlign: 'right',
                flexShrink: 0,
              }}>{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <ChartTooltip visible={hover.visible} x={hover.x} y={hover.y}>
        {hover.item && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: hover.item.color }}/>
              <span style={{ fontWeight: 600 }}>{hover.item.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: 'var(--sl-t3)' }}>Gasto</span>
              <span className="sl-num">{fmtBRL(hover.item.amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: 'var(--sl-t3)' }}>% do total</span>
              <span className="sl-num">{hover.item.pct}%</span>
            </div>
          </>
        )}
      </ChartTooltip>
    </article>
  );
};

// ──────────────────────────────────────────────────────
// FLUXO DE CAIXA — dia a dia
// ──────────────────────────────────────────────────────
const FluxoCaixa = () => {
  const today = 23;
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const isPast = day <= today;
    const r = Math.round((Math.sin(i * 0.7) + 1) * 120 + (day % 5 === 0 ? 800 : 0));
    const d = Math.round((Math.cos(i * 0.5) + 1) * 80 + (day % 3 === 0 ? 200 : 0));
    return { day, r, d, isPast };
  });
  const max = Math.max(...days.flatMap(d => [d.r, d.d]));
  const [hover, setHover] = React.useState({ visible: false, x: 0, y: 0, item: null });

  return (
    <article style={{
      background: 'var(--sl-s1)', border: '1px solid var(--sl-border)',
      borderRadius: 18, padding: 22, position: 'relative',
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--sl-font-display)', fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--sl-t1)', letterSpacing: '-0.01em' }}>
            Fluxo de caixa — dia a dia
          </h3>
          <div style={{ fontSize: 11.5, color: 'var(--sl-t3)', marginTop: 4 }}>
            Cada coluna = 1 dia. <span style={{ color: 'var(--sl-em)', fontWeight: 600 }}>Verde</span> = entrou, <span style={{ color: 'var(--sl-danger)', fontWeight: 600 }}>vermelho</span> = saiu. Colunas claras após dia {today} são previsões.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Legend color="var(--sl-em)" label="Receitas"/>
          <Legend color="var(--sl-danger)" label="Despesas"/>
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'stretch', height: 140, gap: 3, padding: '4px 2px' }}>
        {days.map((d, i) => {
          const onEnter = (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover({ visible: true, x: r.left + r.width / 2, y: r.top, item: d });
          };
          return (
            <div key={i}
              onMouseEnter={onEnter}
              onMouseLeave={() => setHover(h => ({ ...h, visible: false }))}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1 }}>
                <div style={{
                  width: '46%', background: 'var(--sl-em)', borderRadius: '2px 2px 0 0',
                  height: `${(d.r / max) * 100}%`, minHeight: 1.5,
                  opacity: d.isPast ? 1 : 0.32,
                }}/>
                <div style={{
                  width: '46%', background: 'var(--sl-danger)', borderRadius: '2px 2px 0 0',
                  height: `${(d.d / max) * 100}%`, minHeight: 1.5,
                  opacity: d.isPast ? 1 : 0.32,
                }}/>
              </div>
              <div style={{
                fontSize: 9, fontFamily: 'var(--sl-font-body)',
                color: d.day === today ? 'var(--sl-em)' : 'var(--sl-t4)',
                fontWeight: d.day === today ? 700 : 400,
              }}>
                {d.day}
              </div>
            </div>
          );
        })}
      </div>

      <ChartTooltip visible={hover.visible} x={hover.x} y={hover.y}>
        {hover.item && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Dia {hover.item.day} · Mai 2026
              {!hover.item.isPast && (
                <span style={{ color: 'var(--sl-t3)', fontWeight: 400, marginLeft: 6 }}>(previsão)</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: 'var(--sl-em)' }}>Receitas</span>
              <span className="sl-num">{fmtBRL(hover.item.r)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: 'var(--sl-danger)' }}>Despesas</span>
              <span className="sl-num">{fmtBRL(hover.item.d)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--sl-border)' }}>
              <span style={{ color: 'var(--sl-t3)' }}>Saldo do dia</span>
              <span className="sl-num" style={{ color: hover.item.r >= hover.item.d ? 'var(--sl-em)' : 'var(--sl-danger)', fontWeight: 600 }}>
                {fmtBRL(hover.item.r - hover.item.d)}
              </span>
            </div>
          </>
        )}
      </ChartTooltip>
    </article>
  );
};

Object.assign(window, { FinKpiStrip, SaudeAlerta, ConsultorIA, HistoricoChart, GastosCategoria, FluxoCaixa });
