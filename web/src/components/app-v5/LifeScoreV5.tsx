'use client'

// Life Score v2 (Fase 1, Task 13): porte 1:1 de prototypes/v5/app/life-score-v2.html
// (desktop) e life-score-v2.mobile.html (mobile dedicado, markup próprio: subbar,
// .sec, .rt/.mt, .r2). Template T3: voltar → objeto → número principal + Sy em 1
// linha → curva de 30 dias → as 8 áreas → por dentro de cada área → como melhorar
// → rodapé. Dados: motor oficial (useScoreEngine) + life_sync_scores, via
// useLifeScoreV5. Áreas inativas nunca ganham score: vão na linha "Outras".

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChromeV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import { Sy40 } from '@/components/app-v5/Sy40'
import type { AreaScores } from '@/components/app-v5/SheetAreas'
import { useLifeScoreV5 } from '@/hooks/use-life-score-v5'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { prefersReduce, setupReveal } from '@/lib/v5/viva'
import { curvaPath, GEO_DESKTOP, GEO_MOBILE } from '@/lib/life-score/curva'
import {
  fmt01, fmt1, indiceMaisFraco, pct0, semanaIso, sinal, AREA_POR_KEY,
  type AreaComposta,
} from '@/lib/life-score/composicao'
import './life-score-v5.css'

const SUGESTOES = [
  'O que mais derruba o meu número?',
  'Por que Finanças pesa mais que Corpo?',
  'E se eu ligar as áreas desligadas?',
]

const pts = (n: number) => (Math.abs(n) === 1 ? 'ponto' : 'pontos')
const tone = (n: number) => (n > 0 ? 'ele' : n < 0 ? 'neg' : 'neutro')

function Tendencia({ delta }: { delta: number | null }) {
  const d = delta === null ? 0 : Math.round(delta)
  if (d === 0) return <span className="tr num neutro">–</span>
  return <span className={`tr num ${tone(d)}`}>{d > 0 ? '▲' : '▼'}{Math.abs(d)}</span>
}

export function LifeScoreV5() {
  const d = useLifeScoreV5()
  const mob = useMobV5()
  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')
  const mainRef = useRef<HTMLElement>(null)

  const pronto = d.total !== null
  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    return setupReveal(root, { reduce: prefersReduce(), threshold: 0.12, rootMargin: '0px 0px -30px 0px' })
  }, [pronto, mob])

  function abrirCoach(seed = '') {
    setCoachSeed(seed)
    setCoachOpen(true)
  }

  const total = d.total === null ? null : Math.round(d.total)
  const comp = d.composicao
  const ativas = comp?.ativas ?? []
  const inativas = comp?.inativas ?? []
  const scores: AreaScores = Object.fromEntries(ativas.map((a) => [a.n, Math.round(a.score)]))

  // delta da semana em inteiros (o que a tela mostra é o número arredondado)
  const semanaPassada = d.scoreSemanaPassada === null ? null : Math.round(d.scoreSemanaPassada)
  const deltaInt = total !== null && semanaPassada !== null ? total - semanaPassada : null
  const emQueda = deltaInt !== null && deltaInt < 0

  const curvaOk = d.registros >= 7
  const curva = curvaOk ? curvaPath(d.serie, mob ? GEO_MOBILE : GEO_DESKTOP) : null
  const geo = mob ? GEO_MOBILE : GEO_DESKTOP
  const rc = d.curva

  const hora = d.calculadoAs ?? '–'
  const nAtivas = ativas.length

  const voltar = <Link className={mob ? 'voltar' : 'voltar boot b1'} id="voltar" href="/dashboard">← Meu dia</Link>

  const objeto = (
    <header className="objeto boot b1">
      {mob ? (
        <>
          <p className="eyebrow">Life Sync Score</p>
          <div className="nome">
            <h1>A anatomia do número</h1>
            {pronto && <span className={emQueda ? 'pill-q' : 'pill-q ok'}>{emQueda ? 'Em queda' : d.label}</span>}
          </div>
        </>
      ) : (
        <div>
          <p className="eyebrow">Life Sync Score</p>
          <div className="nome">
            <h1>A anatomia do número</h1>
            {pronto && <span className={emQueda ? 'pill-q' : 'pill-q ok'}>{emQueda ? 'Em queda' : d.label}</span>}
          </div>
        </div>
      )}
    </header>
  )

  // ── Sy em 1 linha: o que mais pesou (área ativa de maior |delta| em 7 registros)
  const mp = d.maisPesou
  const maiorContrib = ativas.reduce<AreaComposta | null>((b, a) => (!b || a.contrib > b.contrib ? a : b), null)
  const fala = mp ? (
    <>O que mais pesou esta semana foi {mp.nome}, <b className={`num ${mp.delta && mp.delta < 0 ? 'w' : 'ele'}`}>{sinal(Math.round(mp.delta ?? 0) || (mp.delta ?? 0))}</b>: a área está em <b className="num">{Math.round(mp.score)}</b> e conta <span className="num">{pct0(mp.peso)}</span> do total.</>
  ) : maiorContrib ? (
    <>Ainda não há uma semana de histórico. Hoje, o que mais pesa é {maiorContrib.nome}: <b className="num">{fmt1(maiorContrib.contrib)}</b> dos <span className="num">{total}</span> pontos.</>
  ) : (
    <>Nenhuma área ativa entra na conta ainda.</>
  )
  const nComp = d.componentes
  const fontes = `Calculado às ${hora} · fontes: ${nAtivas} ${nAtivas === 1 ? 'área ativa' : 'áreas ativas'}, ${nComp} ${nComp === 1 ? 'componente' : 'componentes'}, ${d.registros} ${d.registros === 1 ? 'dia' : 'dias'} de histórico`

  const sy = (
    <div className="sy">
      <Sy40 />
      <div>
        <p className="fala">{fala}</p>
        <p className="fontes">{fontes}</p>
        <button className="falar" type="button" onClick={() => abrirCoach('Sobre o meu score: ')}>Falar com Sy sobre o score →</button>
      </div>
    </div>
  )

  const numero = (
    <>
      <p className="eyebrow">Hoje</p>
      <div className="pct num">{total ?? '–'}</div>
      {pronto && (
        <p className="de">
          {deltaInt === null ? (
            <>primeira semana</>
          ) : (
            <><b className={`num ${deltaInt > 0 ? 'ele' : deltaInt < 0 ? 'w' : ''}`}>{sinal(deltaInt)}</b> na semana · de <span className="num">{semanaPassada}</span> para <span className="num">{total}</span></>
          )}
        </p>
      )}
      <p className="falta">
        {pronto
          ? <>calculado hoje às <span className="num">{hora}</span> · média ponderada das <span className="num">{nAtivas}</span> {nAtivas === 1 ? 'área ativa' : 'áreas ativas'}</>
          : d.loading ? 'calculando o score de hoje' : 'não foi possível calcular o score agora'}
      </p>
    </>
  )

  const principal = (
    <section className="principal boot b2" aria-label="Life Sync Score de hoje">
      {mob ? (<>{numero}{pronto && sy}</>) : (<><div>{numero}</div>{pronto && sy}</>)}
    </section>
  )

  const varCls = rc ? tone(rc.variacao) : 'neutro'
  const secCurva = (
    <section className={mob ? 'sec curva boot b3' : 'curva boot b3'} aria-label={`Últimos ${curvaOk ? d.registros : 30} dias`}>
      <div className="cvhead">
        <p className="eyebrow">Últimos {curvaOk ? d.registros : 30} dias</p>
        {curvaOk && rc && <span className={`var num ${varCls}`}>{sinal(rc.variacao)} no período</span>}
      </div>
      {curvaOk && curva && rc ? (
        <>
          <svg className="cv" viewBox={`0 0 ${geo.w} ${geo.h}`} preserveAspectRatio="none" role="img"
            aria-label={`Curva do Life Sync Score nos últimos ${rc.dias} dias, de ${rc.de} para ${rc.para}`}>
            <defs><linearGradient id="cvfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a1ff62" stopOpacity=".22" /><stop offset="1" stopColor="#a1ff62" stopOpacity="0" /></linearGradient></defs>
            <line x1="0" y1={geo.top} x2={geo.w} y2={geo.top} stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1={curva.meio} x2={geo.w} y2={curva.meio} stroke="rgba(255,255,255,.08)" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1={geo.bottom} x2={geo.w} y2={geo.bottom} stroke="rgba(255,255,255,.12)" vectorEffect="non-scaling-stroke" />
            <path fill="url(#cvfill)" stroke="none" d={curva.area} />
            <path fill="none" stroke="#a1ff62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" d={curva.linha} />
            <circle cx={curva.fim.x} cy={curva.fim.y} r="4" fill="#a1ff62" />
          </svg>
          <div className="cvfoot"><span>Há {rc.dias} dias · <span className="num">{rc.de}</span></span><span>Hoje · <span className="num">{rc.para}</span></span></div>
          <p className="prosa">
            De <b>{rc.de}</b> para <b>{rc.para}</b> em <b>{rc.dias}</b> dias,{' '}
            {rc.maiorRecuo === 0
              ? <>sem nenhum recuo.</>
              : <>{mob ? 'sem recuo' : 'sem nenhum recuo'} maior que <b>{rc.maiorRecuo}</b> {pts(rc.maiorRecuo)}.</>}
            {rc.maiorSalto > 0 && <> O maior salto em um dia foi de <b>{rc.maiorSalto}</b> {pts(rc.maiorSalto)}.</>}
          </p>
        </>
      ) : (
        <p className="vazio">A curva aparece a partir do 7º dia. Até lá, o número de hoje é o que existe.</p>
      )}
    </section>
  )

  const outras = inativas.length > 0 && comp ? (
    <p className="outras">
      Outras: {inativas.map((a) => `${a.n} ${a.nome}`).join(' · ')} · sem peso: desligadas no onboarding. As parcelas somam <span className="num">{fmt1(comp.somaParcelas)}</span>; o número que você vê é o arredondamento.
    </p>
  ) : null

  const secAreas = (
    <section className={mob ? 'sec areas rv' : 'secao areas rv'} id="areas" aria-label="As 8 áreas">
      {mob ? (
        <div className="sec-head"><p className="eyebrow">As 8 áreas</p><Link href="/dashboard#areas">Em Meu dia →</Link></div>
      ) : (
        <div className="secao-head"><p className="eyebrow">As 8 áreas</p><Link href="/dashboard#areas">Suas áreas em Meu dia →</Link></div>
      )}
      <p className="hint">
        {mob
          ? <>Cada área ativa entra com o seu peso; o das desligadas é redistribuído. A contribuição é o que cada uma soma aos <span className="num">{total}</span>.</>
          : <>Cada área ativa entra com o seu peso; os pesos das desligadas são redistribuídos entre as ativas. A contribuição é o que cada uma soma aos <span className="num">{total}</span>.</>}
      </p>
      {mob ? (
        <>
          {ativas.map((a) => (
            <Link key={a.key} className="dimrow" href={a.href}>
              <span className="di num">{a.n}</span><div className="nm">{a.nome}</div>
              <span className="rt"><span className="sc num">{Math.round(a.score)}</span><Tendencia delta={a.delta} /></span>
              <div className="mt">peso <b className="num">{pct0(a.peso)}</b> · contribui <b className="ct num">{fmt1(a.contrib)}</b> pts</div>
            </Link>
          ))}
          {outras}
        </>
      ) : (
        <>
          <div className="dims">
            {ativas.map((a) => (
              <Link key={a.key} className="dimrow" href={a.href}>
                <span className="di num">{a.n}</span><div className="nm">{a.nome}</div><span className="sc num">{Math.round(a.score)}</span>
                <span className="ps">peso <b className="num">{pct0(a.peso)}</b></span><span className="ct">contribui <b className="num">{fmt1(a.contrib)}</b> pts</span><Tendencia delta={a.delta} />
              </Link>
            ))}
          </div>
          {outras}
        </>
      )}
    </section>
  )

  const blocos = d.modules.map((m) => {
    const a = AREA_POR_KEY[m.module]
    const peso = ativas.find((x) => x.key === m.module)?.peso ?? 0
    const fraco = indiceMaisFraco(m)
    return (
      <article className="area" key={m.module}>
        <div className="ah"><span className="di num">{a.n}</span><h3>{a.nome}</h3><span className="sc num">{Math.round(m.score)}<small>peso {pct0(peso)}</small></span></div>
        <div className="metas">
          {(m.detalhes ?? []).map((c, i) => {
            const v = Math.round(c.valor)
            return (
              <div className={i === fraco ? 'mrow fraco' : 'mrow'} key={c.chave}>
                <div className="r1"><span className="nm">{c.nome}</span><span className="pct num">{v}</span></div>
                <div className="track"><i style={{ width: `${v}%` }} /></div>
                <div className="sub">{Math.round(c.peso * 100)}% da área</div>
              </div>
            )
          })}
        </div>
      </article>
    )
  })

  const secDentro = (
    <section className={mob ? 'sec dentro rv' : 'secao dentro rv'} id="dentro" aria-label="Por dentro de cada área">
      {mob
        ? <div className="sec-head"><p className="eyebrow">Por dentro de cada área</p></div>
        : <div className="secao-head"><p className="eyebrow">Por dentro de cada área</p></div>}
      <p className="hint">Cada componente entra no score da área pelo seu peso interno. O mais fraco de cada uma está em coral: é ali que o número perde.</p>
      {mob ? blocos : <div className="dentro-grid">{blocos}</div>}
    </section>
  )

  const secMelhorar = (
    <section className={mob ? 'sec melhorar last rv' : 'secao melhorar last rv'} id="melhorar" aria-label="Como melhorar">
      {mob
        ? <div className="sec-head"><p className="eyebrow">Como melhorar</p></div>
        : <div className="secao-head"><p className="eyebrow">Como melhorar</p></div>}
      {d.melhorias.map((mel) => {
        const val = <span className="val num">até +{fmt01(mel.ganho)} pts</span>
        const act = <Link className="btn-sm ghost act" href={mel.area.href} title={`${mel.area.n} ${mel.area.nome}`}>Abrir área</Link>
        return (
          <div className="row" key={`${mel.area.key}-${mel.chave}`}>
            <span className="ix num">{mel.area.n}</span>
            <div>
              <div className="tx"><strong>{mel.titulo}</strong></div>
              <div className="sub">{mel.sub}</div>
            </div>
            {mob ? <div className="r2">{val}{act}</div> : <>{val}{act}</>}
          </div>
        )
      })}
      <p className="nota">
        {d.melhorias.length > 0
          ? <>Ganho estimado se o componente chegar a <span className="num">100</span>, com os pesos de hoje. Nada é lançado daqui: cada ação acontece na própria área.</>
          : <>Todos os componentes das áreas ativas estão em <span className="num">100</span>.</>}
      </p>
    </section>
  )

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ativo="meu-dia" onCoachOpen={() => abrirCoach()} scores={scores} />

      <main className="wrap ls-v5" ref={mainRef}>
        {mob ? (
          <div className="subbar">
            {voltar}
            <span className="curto">Life Sync Score</span>
          </div>
        ) : voltar}
        {objeto}
        {principal}
        {pronto && (
          <>
            {secCurva}
            {secAreas}
            {secDentro}
            {secMelhorar}
          </>
        )}
      </main>

      <footer className="colofao">
        <span>{mob
          ? 'Média ponderada das áreas ativas, com os pesos redistribuídos.'
          : 'Média ponderada das áreas ativas, com os pesos redistribuídos. Recalculado a cada registro novo.'}</span>
        <div className="r">
          <span>Semana <b className="num" suppressHydrationWarning>{semanaIso(d.hojeSP)}</b> · fecha domingo</span>
          <span>Último cálculo hoje às <b className="num">{hora}</b></span>
        </div>
      </footer>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={SUGESTOES}
        onClose={() => setCoachOpen(false)}
        moduleId="panorama"
        leitura={mob ? 'o seu score' : 'a composição do seu score'}
        saudacao="Já li o seu score. O que você quer saber?"
      />
    </>
  )
}

export default LifeScoreV5
