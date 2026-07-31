// Conteúdo canônico da landing viva (r15/m1) compartilhado entre as árvores
// desktop e mobile. Números canônicos: score 74 (+3) · Lazer 508/500 (102%) ·
// Viagem Itália 68%→73% com aporte R$ 580 na sexta 31 jul. Textos que divergem
// entre os protótipos entram por prop `m` (mobile).
import type { CSSProperties } from 'react'

const cssVars = (v: Record<string, string>) => v as CSSProperties

export function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  )
}

export function ArrowR({ size, sw = 2.4 }: { size: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
  )
}

export function Chevron({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
  )
}

// marca: slot que o mountBussola3D preenche no init
export function BsMark({ sz }: { sz: number }) {
  return <span className="bs d3" data-bs3d style={cssVars({ '--sz': sz + 'px' })} aria-hidden="true" />
}

const TICKER_ITEMS = ['24.000 BRASILEIROS EM SINCRONIA', '14 DIAS PRO GRÁTIS', 'SEM CARTÃO DE CRÉDITO']

export function TickerText({ repeats }: { repeats: number }) {
  const seq: string[] = []
  for (let r = 0; r < repeats; r++) TICKER_ITEMS.forEach((t) => seq.push(t))
  return (
    <div className="tk">
      {seq.flatMap((t, i) => [<span key={'t' + i}>{t}</span>, <span key={'d' + i}>·</span>])}
    </div>
  )
}

export function HeroH1() {
  return (
    <h1>
      <span className="boot b2" style={{ display: 'block' }}>Sua vida inteira,</span>
      <span className="l2 boot b3"><em>em sincronia.</em>
        <span className="badge78" role="img" aria-label="Life Sync Score 74, mais 3 hoje">
          <span className="b-n num">74</span>
          <span className="b-l">SCORE</span>
        </span>
      </span>
    </h1>
  )
}

export function HeroProof({ m }: { m?: boolean }) {
  const sz = m ? 12 : 13
  return (
    <div className="hero-proof boot b5">
      <span><Check size={sz} />14 dias PRO grátis</span>
      <span><Check size={sz} />{m ? 'Sem cartão' : 'Sem cartão de crédito'}</span>
      <span><Check size={sz} />LGPD-ready</span>
    </div>
  )
}

// ── os 8 cards do arco (numeração canônica §5.2) ──
interface StripCardDef { nm: string; ix: string; ui: (m: boolean) => React.ReactNode }

function Ubar({ w, d, k, v, hot, cols }: { w: string; d: string; k?: string; v: string; hot?: boolean; cols?: string }) {
  return (
    <div className={'ubar' + (hot ? ' hot' : '')} style={cssVars({ '--w': w, '--d': d, ...(cols ? { gridTemplateColumns: cols } : {}) })}>
      {k ? <span className="k">{k}</span> : null}
      <span className="t"><span className="f" style={k ? undefined : { background: 'var(--roxo)' }} /></span>
      <span className="v num">{v}</span>
    </div>
  )
}

export function StripCards({ m }: { m?: boolean }) {
  const ANG = ['-26.25deg', '-18.75deg', '-11.25deg', '-3.75deg', '3.75deg', '11.25deg', '18.75deg', '26.25deg']
  const cards: StripCardDef[] = [
    { nm: 'Finanças', ix: '01', ui: () => (<>
      <span className="ubtn">+ Nova</span>
      <span className="ucur" aria-hidden="true" />
      <div><div className="lbl">Saldo do mês</div><div className="big num">R$&nbsp;1.840</div></div>
      <Ubar w="80%" d=".2s" k="Alimentação" v="80%" />
      <Ubar w="100%" d=".5s" k="Lazer" v="102%" hot />
      <Ubar w="70%" d=".8s" k="Transporte" v="70%" />
    </>) },
    { nm: 'Futuro', ix: '02', ui: () => (<>
      <div><div className="lbl">Viagem Itália</div><div className="big num">68%</div></div>
      <Ubar w="68%" d=".3s" v={'R$ 8.600'} cols="1fr 60px" />
      <div className="sub">Aporte de R$&nbsp;580 agendado pra sexta. No ritmo, você chega uma semana antes do prazo.</div>
    </>) },
    { nm: 'Tempo', ix: '03', ui: () => (<>
      <div><div className="lbl">Hoje</div><div className="big num">42 min <span className="sub">de foco</span></div></div>
      <div className="urow"><time className="num">07:30</time>Fisioterapia</div>
      <div className="urow"><time className="num">09:00</time><span className="ublock">Bloco de foco · projeto</span></div>
      <div className="urow"><span className="ucheck"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6.5 L4.6 9 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="ustrike">Revisão semanal</span></div>
    </>) },
    { nm: 'Corpo', ix: '04', ui: (mm) => (<>
      <div className="lbl">Treinos da semana</div>
      <div className="uringw">
        <svg className="uring" width={mm ? 62 : 72} height={mm ? 62 : 72} viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r="26" stroke="#2e2a2a" strokeWidth="7" fill="none" />
          <circle className="fg" cx="36" cy="36" r="26" strokeWidth="7" transform="rotate(-90 36 36)" />
        </svg>
        <div><div className="big num">3/7</div><div className="sub">2 corridas · 1 força</div></div>
      </div>
      <div className="sub">Cardápio de amanhã gerado pelo coach.</div>
    </>) },
    { nm: 'Mente', ix: '05', ui: () => (<>
      <div><div className="lbl">Esta semana</div><div className="big num">2 <span className="sub">sessões de leitura</span></div></div>
      <Ubar w="40%" d=".2s" k="Livro atual" v="40%" />
      <Ubar w="65%" d=".55s" k="Curso de UX" v="65%" />
      <div className="sub">Trilha sugerida: 20 min por dia.</div>
    </>) },
    { nm: 'Patrimônio', ix: '06', ui: (mm) => (<>
      <div><div className="lbl">Carteira</div><div className="big num">R$&nbsp;48,2k <span className="sub" style={{ color: 'var(--ele)' }}>+7%</span></div></div>
      <svg className="uspark" width="100%" height={mm ? 48 : 54} viewBox="0 0 240 54" preserveAspectRatio="none" aria-hidden="true">
        <path className="ln" d="M0,44 C24,40 40,30 62,32 C84,34 100,22 124,20 C148,18 166,24 190,14 C210,6 226,8 240,4" fill="none" stroke="#a1ff62" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="sub">Proventos de julho reinvestidos.</div>
    </>) },
    { nm: 'Carreira', ix: '07', ui: () => (<>
      <div><div className="lbl">Próximo nível</div><div className="big num">3/5 <span className="sub">skills no alvo</span></div></div>
      <Ubar w="70%" d=".25s" k="Inglês" v="70%" />
      <Ubar w="40%" d=".6s" k="Liderança" v="40%" />
      <div className="urow"><time className="num">ter</time>1:1 com a gestora às 14:00</div>
    </>) },
    { nm: 'Experiências', ix: '08', ui: (mm) => (<>
      <div className="lbl">Próxima viagem</div>
      <div className="big num upulse" style={{ fontSize: mm ? 34 : 40 }}>92 <span className="sub">dias pra Itália</span></div>
      <div className="urow"><span className="sub">Roma · Florença · Positano</span></div>
      <Ubar w="68%" d=".4s" v="planejado" cols="1fr 70px" />
    </>) },
  ]
  return (
    <>
      {cards.map((c, i) => (
        <div key={c.ix} className="scard" style={cssVars({ '--a': ANG[i] })} data-area={i}>
          <div className="scin">
            <div className="tb"><i /><i /><i /><span className="nm">{c.nm}</span><span className="ix num">{c.ix}</span></div>
            <div className="ui">{c.ui(!!m)}</div>
          </div>
        </div>
      ))}
    </>
  )
}

// ── lista das 8 áreas (scores/deltas canônicos; descrições encurtam no mobile) ──
const AREAS8 = [
  { nm: 'Finanças', d: 'Contas, orçamentos, transações e o saldo do mês.', dm: 'Contas, orçamentos e o saldo do mês.', score: 82, delta: '▲2', dir: 'up' },
  { nm: 'Futuro', d: 'Metas, reserva de emergência e projeção.', dm: 'Metas, reserva e projeção.', score: 71, delta: '▲3', dir: 'up' },
  { nm: 'Tempo', d: 'Agenda, blocos de foco e rotina.', dm: 'Agenda, blocos de foco e rotina.', score: 64, delta: '▼1', dir: 'down' },
  { nm: 'Corpo', d: 'Treino, sono, alimentação e exames.', dm: 'Treino, sono, alimentação e exames.', score: 58, delta: '▲1', dir: 'up' },
  { nm: 'Mente', d: 'Leitura, cursos, terapia e humor.', dm: 'Leitura, cursos, terapia e humor.', score: 76, delta: '▲2', dir: 'up' },
  { nm: 'Patrimônio', d: 'Investimentos, bens e evolução do capital.', dm: 'Investimentos e evolução do capital.', score: 80, delta: '▲4', dir: 'up' },
  { nm: 'Carreira', d: 'Metas profissionais, skills e renda.', dm: 'Metas profissionais, skills e renda.', score: 69, delta: '–', dir: 'flat' },
  { nm: 'Experiências', d: 'Viagens, lazer e o que fica de memória.', dm: 'Viagens, lazer e o que fica de memória.', score: 74, delta: '▲1', dir: 'up' },
]

export function Areas8Rows({ m }: { m?: boolean }) {
  return (
    <>
      {AREAS8.map((a, i) => (
        <button key={a.nm} className={'a8-row' + (i === 0 ? ' on' : '')} type="button" data-area={i}>
          <span className="aic-slot" /><span className="tx"><span className="nm">{a.nm}</span><span className="ds">{m ? a.dm : a.d}</span></span>
          <span className="score num">{a.score}</span><span className={'delta ' + a.dir + ' num'}>{a.delta}</span>
        </button>
      ))}
    </>
  )
}

export function Areas8Meta() {
  return (
    <div className="a8-meta" aria-live="polite">
      <p className="a8-ix num">01 · 08</p>
      <h3 className="a8-nome">Finanças</h3>
      <p className="a8-frase">O lazer estourou R$ 8. Segurando essa semana, o mês fecha com 39% poupado.</p>
    </div>
  )
}

// ── palco do produto: as 5 peças do painel ──
export function ProdHead() {
  return (
    <div className="prod-head rv">
      <p className="eyebrow">O produto</p>
      <h2>Chega de oito apps abertos. <em>Aqui, tudo se encaixa.</em></h2>
      <p className="lead">Finanças, agenda, treinos e metas no mesmo painel. Você registra em segundos; o SyncLife conecta tudo e mostra o que precisa da sua atenção hoje.</p>
      <p className="hand prod-hand" style={{ transform: 'rotate(-2deg)' }}>é assim que a sua vida aparece no app</p>
    </div>
  )
}

export function ProdStage() {
  return (
    <div className="prod-stage">
      <div className="pc pc-score rv">
        <span className="pc-tag">Score</span>
        <div className="sp-score">
          <span className="n num">74</span>
          <div className="meta">
            <span className="up num">+3 hoje</span>
            <span className="lbl">As 8 áreas da sua vida num número só.</span>
          </div>
        </div>
      </div>
      <div className="pc pc-brief rv">
        <span className="pc-tag">Coach</span>
        <p className="pc-quote">&quot;Seu score subiu 3 pontos. Só o lazer passou do limite: R$&nbsp;8. Um ajuste hoje resolve.&quot;</p>
        <span className="pc-sub num">Briefing de hoje · 07:12</span>
      </div>
      <div className="pc pc-orc rv">
        <span className="pc-tag">Finanças</span>
        <div className="sp-orc">
          <div className="row"><span className="nm">Alimentação</span><div className="track"><i style={{ width: '80%' }} /></div><span className="val">640 / 800</span></div>
          <div className="row hot"><span className="nm">Lazer</span><div className="track"><i style={{ width: '103%' }} /></div><span className="val">508 / 500</span></div>
          <div className="row"><span className="nm">Transporte</span><div className="track"><i style={{ width: '70%' }} /></div><span className="val">280 / 400</span></div>
        </div>
      </div>
      <div className="pc pc-agenda rv">
        <span className="pc-tag">Agenda</span>
        <div className="pc-row"><time className="num">07:30</time>Fisioterapia</div>
        <div className="pc-row"><time className="num">09:00</time>Bloco de foco · projeto</div>
        <div className="pc-row"><time className="num">14:00</time>1:1 com a gestora</div>
      </div>
      <div className="pc pc-meta rv">
        <span className="pc-tag">Metas</span>
        <div className="mrow">
          <span className="mnm">Viagem Itália</span>
          <div className="mtrack"><i /></div>
          <span className="mval">68%</span>
        </div>
        <p className="msub">R$&nbsp;8.600 de R$&nbsp;12.600 · aporte de R$&nbsp;580 agendado pra sexta</p>
      </div>
    </div>
  )
}

// ── ticker do índice da vida: os mesmos scores/deltas da lista das 8 áreas ──
export function MqTrack({ repeats }: { repeats: number }) {
  const seq: typeof AREAS8 = []
  for (let r = 0; r < repeats; r++) seq.push(...AREAS8)
  return (
    <div className="mq-track">
      {seq.map((a, i) => (
        <span key={i}>{a.nm} <b className="num">{a.score}</b><em className={'d ' + a.dir}>{a.delta}</em><i>✦</i></span>
      ))}
    </div>
  )
}

// ── IA: cabeçalho, feats e a conversa que executa ──
export function IaHead() {
  return (
    <div className="head rv">
      <p className="eyebrow"><b>Consultor IA</b> · incluso no PRO</p>
      <h2>Uma IA que conhece sua vida. <em>E resolve por você.</em></h2>
      <p className="lead">Pergunte qualquer coisa: a resposta vem com os seus números, não com conselho genérico. E o que você decidir, o consultor executa na hora.</p>
    </div>
  )
}

export function IaFeats() {
  return (
    <div className="ia-feats rv">
      <div className="ia-feat"><span className="fn num">01</span><div><h4>Contexto completo</h4><p>Orçamentos, metas, treino e agenda na mesma resposta, sempre com o porquê.</p></div></div>
      <div className="ia-feat"><span className="fn num">02</span><div><h4>Ação de verdade</h4><p>Agendar o aporte, remarcar o treino, proteger o foco: você confirma, ele executa.</p></div></div>
      <div className="ia-feat"><span className="fn num">03</span><div><h4>Relatórios em um clique</h4><p>O mês inteiro em PDF: finanças, saúde e produtividade.</p></div></div>
    </div>
  )
}

export function IaChat() {
  return (
    <div className="chat rv" data-iachat>
      <div className="bub u">Se eu antecipar a parcela da viagem, aperta o mês?</div>
      <div className="bub a">Não. Antecipando <strong className="num">R$&nbsp;580</strong>, seu saldo projetado de julho fecha em <strong className="num">R$&nbsp;1.540</strong> e a poupança segue <span className="g">acima da meta</span>. Vale fazer.</div>
      <div className="bub u">Então agenda pra sexta.</div>
      <div className="bub a">Agendado. Transferência de <strong className="num">R$&nbsp;580</strong> pra Viagem Itália na sexta, 31 de julho. A meta chega a <strong className="num">73%</strong>.</div>
      <div className="acao"><svg width="15" height="15" viewBox="0 0 16 14" aria-hidden="true"><path className="ck" d="M2 7.5 L6 11.5 L14 2.5" /></svg>Ação executada · aporte agendado pra sexta, 31 jul</div>
      <div className="chat-input">
        <span>Pergunte algo…</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
      </div>
    </div>
  )
}

// ── pricing: os 2 cartões da r15 ──
export function PricingCards() {
  return (
    <div className="pcards">
      <div className="pcard">
        <div className="pn">Free</div>
        <div className="pp num">R$&nbsp;0<small>pra sempre</small></div>
        <ul>
          <li><Check size={15} />Todas as 8 áreas da vida</li>
          <li><Check size={15} />Coach IA com briefing diário</li>
          <li><Check size={15} />Life Sync Score</li>
          <li><Check size={15} />50 transações por mês</li>
          <li><Check size={15} />Web e mobile, 1 dispositivo</li>
        </ul>
        <a className="btn btn-ghost" href="#">Começar grátis</a>
        <p className="pfoot">Grátis pra sempre, de verdade.</p>
      </div>
      <div className="pcard pro">
        <span className="tag">RECOMENDADO</span>
        <div className="pn">PRO</div>
        <div className="pp num">R$&nbsp;24,90<small>por mês</small></div>
        <ul>
          <li><Check size={15} />Tudo do Free, sem limites</li>
          <li><Check size={15} />Consultor IA que executa por você</li>
          <li><Check size={15} />Relatórios completos em PDF</li>
          <li><Check size={15} />Cardápio e planos gerados por IA</li>
          <li><Check size={15} />Google Calendar bidirecional</li>
          <li><Check size={15} />Dispositivos ilimitados</li>
        </ul>
        <a className="btn btn-roxo" href="#">Testar 14 dias grátis</a>
        <p className="pfoot">Sem cartão de crédito no teste.</p>
      </div>
    </div>
  )
}

// ── FAQ ──
const FAQ = [
  ['Meus dados financeiros ficam seguros?', 'Sim. SyncLife é LGPD-compliant, dados criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Você pode exportar ou excluir tudo a qualquer momento.'],
  ['Posso usar grátis pra sempre?', 'Sim. O plano Free dura indefinidamente. PRO desbloqueia limites e features de IA, mas o essencial funciona pra sempre sem custo.'],
  ['Funciona offline?', 'O app mobile sincroniza automaticamente quando você volta online. Você pode registrar transações, eventos e atividades sem conexão.'],
  ['Tem versão Web e Mobile?', 'Sim, interfaces nativas para iOS, Android e Web. Tudo sincroniza em tempo real.'],
]

export function FaqList({ chevron }: { chevron: number }) {
  return (
    <div className="faq rv">
      {FAQ.map(([q, a], i) => (
        <details key={q} open={i === 0}>
          <summary>{q}<Chevron size={chevron} /></summary>
          <p className="ans">{a}</p>
        </details>
      ))}
    </div>
  )
}
