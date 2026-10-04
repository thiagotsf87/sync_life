'use client'

// Sua semana (Fase 1, Task 14): porte 1:1 de prototypes/v5/app/sua-semana.html
// (desktop) e sua-semana.mobile.html (mobile dedicado: subbar, .sec, .r2 e barra
// de ações fixa que some depois de fechar). Template T3: voltar → objeto → score
// da semana (de → para) + Sy → números da semana → o que mudou → o que ficou →
// fechamento (persiste em weekly_reviews, sem modal; status com role=status) → rodapé.
// Antes de quinta (menos de 4 dias de dados) não há leitura: sem número, sem Sy.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChromeV5 } from '@/components/app-v5/ChromeV5'
import { CamadaCoach } from '@/components/app-v5/CamadaCoach'
import { Sy40 } from '@/components/app-v5/Sy40'
import { useSuaSemana } from '@/hooks/use-sua-semana'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { prefersReduce, setupReveal } from '@/lib/v5/viva'
import { brl0, diaCurto, horasMin, pontos, semanaIsoNum, tituloSemana, type Mudanca } from '@/lib/semana/semana'
import './sua-semana-v5.css'

const SUGESTOES = [
  'O que mais pesou na minha semana?',
  'Quanto sobrou nesta semana?',
  'O que muda se eu fechar a semana?',
]

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DePara({ de, para, delta }: { de: number; para: number; delta: number }) {
  const dn = delta < 0
  return (
    <span className="sc num">
      <span className="from">{de}</span><span className="ar" aria-hidden="true">→</span>
      <span className={dn ? 'to dn' : 'to'}>{para}</span>
      {delta !== 0 && <span className={dn ? 'tr dn' : 'tr'}>{dn ? '▼' : '▲'}{Math.abs(delta)}</span>}
    </span>
  )
}

export function SuaSemanaV5() {
  const s = useSuaSemana()
  const mob = useMobV5()
  const [coachOpen, setCoachOpen] = useState(false)
  const [coachSeed, setCoachSeed] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const confRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    return setupReveal(root, { reduce: prefersReduce(), threshold: 0.12, rootMargin: '0px 0px -30px 0px' })
  }, [s.loading, mob])

  function abrirCoach(seed = '') {
    setCoachSeed(seed)
    setCoachOpen(true)
  }

  async function fechar() {
    const ok = await s.fechar()
    if (ok && mob) requestAnimationFrame(() => confRef.current?.scrollIntoView({ block: 'nearest' }))
  }

  const semana = s.semana
  const semDados = semana.semDados
  const temScore = !semDados && s.scoreFim !== null
  const delta = semDados ? null : s.delta
  const titulo = tituloSemana(semDados, delta)

  // pílula do cabeçalho: Em curso (sem leitura) · Fechada · Fecha domingo
  const pill = s.fechada
    ? <span className="pill-q ok" id="estado">Fechada</span>
    : semDados
      ? <span className="pill-q off" id="estado">Em curso</span>
      : <span className="pill-q" id="estado">Fecha domingo</span>

  const objeto = (
    <header className="objeto boot b1">
      {mob ? (
        <>
          <p className="eyebrow">Sua semana · <span className="num">{s.rotulo}</span></p>
          <div className="nome"><h1>{titulo}</h1>{pill}</div>
        </>
      ) : (
        <div>
          <p className="eyebrow">Sua semana · <span className="num">{s.rotulo}</span></p>
          <div className="nome"><h1>{titulo}</h1>{pill}</div>
        </div>
      )}
    </header>
  )

  // ── número principal: score da semana (de → para)
  const ariaScore = temScore && s.scoreInicio !== null && delta !== null
    ? `Life Sync Score de ${s.scoreInicio} para ${s.scoreFim}, ${delta >= 0 ? 'mais' : 'menos'} ${Math.abs(delta)} na semana`
    : temScore ? `Life Sync Score de ${s.scoreFim}` : 'Score da semana ainda sem leitura'
  const scoreNum = (
    <div className="sc num" role="img" aria-label={ariaScore}>
      {temScore && s.scoreInicio !== null && delta !== null ? (
        <>
          <span className="from">{s.scoreInicio}</span><span className="ar" aria-hidden="true">→</span>
          <span className={delta < 0 ? 'to dn' : 'to'}>{s.scoreFim}</span>
          {delta !== 0 && <span className={delta < 0 ? 'tr dn' : 'tr'}>{delta < 0 ? '▼' : '▲'}{Math.abs(delta)}</span>}
        </>
      ) : temScore ? (
        <span className="to">{s.scoreFim}</span>
      ) : (
        <span className="to vz">–</span>
      )}
      {s.fechada && <span className="pill-q ok" id="pillNum">Fechada</span>}
    </div>
  )
  const resumo = semDados ? (
    <p className="resumo"><b className="num">{s.feitos} de {s.total}</b> compromissos até agora</p>
  ) : (
    <p className="resumo"><b className="num">{s.feitos} de {s.total}</b> compromissos · <b className="num">{horasMin(s.focoMin)}</b> de foco</p>
  )

  // ── Sy em até 3 frases, só com o que veio dos dados
  const maiorQueda = s.mudou.reduce<Mudanca | null>((b, m) => (m.delta < 0 && (!b || m.delta < b.delta) ? m : b), null)
  const maiorAlta = s.mudou.reduce<Mudanca | null>((b, m) => (m.delta > 0 && (!b || m.delta > b.delta) ? m : b), null)
  const fala = (
    <>
      A semana tem <b className="num">{brl0(s.entradas)}</b> de entradas contra <b className="num">{brl0(s.saidas)}</b> de saídas
      {s.entradas - s.saidas !== 0 && <>, {s.entradas >= s.saidas ? 'sobraram' : 'faltaram'} <span className="num">{brl0(Math.abs(s.entradas - s.saidas))}</span></>}.
      {' '}Na agenda, <b className="num">{s.feitos} dos {s.total}</b> {s.feitos === 1 ? 'compromisso saiu' : 'compromissos saíram'} e você protegeu <b className="num">{horasMin(s.focoMin)}</b> de foco.
      {maiorQueda ? (
        <> {maiorQueda.nome} foi a área que mais recuou, <b className="num w">{plural(Math.abs(maiorQueda.delta), 'ponto', 'pontos')}</b>.</>
      ) : maiorAlta ? (
        <> {maiorAlta.nome} foi a área que mais subiu, <b className="num">{plural(maiorAlta.delta, 'ponto', 'pontos')}</b>.</>
      ) : null}
    </>
  )
  const fontes = `Atualizado hoje às ${s.atualizadoAs} · fontes: ${plural(s.nTransacoes, 'transação', 'transações')}, ${plural(s.total, 'compromisso', 'compromissos')} e ${plural(s.focoSessoes, 'sessão de foco', 'sessões de foco')}`
  const seedSemana = `Sobre a semana de ${s.rotulo}: `
  const sy = !semDados && (
    <div className="sy">
      <Sy40 />
      <div>
        <p className="fala">{fala}</p>
        <p className="fontes" suppressHydrationWarning>{fontes}</p>
        <button className="falar" type="button" onClick={() => abrirCoach(seedSemana)}>Falar com Sy sobre a semana →</button>
      </div>
    </div>
  )

  const principal = (
    <section className="principal boot b2" aria-label="Score da semana">
      {mob ? (
        <><p className="eyebrow">Score da semana</p>{scoreNum}{resumo}{sy}</>
      ) : (
        <><div><p className="eyebrow">Score da semana</p>{scoreNum}{resumo}</div>{sy}</>
      )}
    </section>
  )

  const vazio = semDados && (
    <p className="vazio">
      Faltam <span className="num">{plural(semana.faltam, 'dia', 'dias')}</span> para a semana ter leitura. O score da semana e o que mudou aparecem a partir de quinta, com pelo menos <span className="num">4</span> dias de registros.
    </p>
  )

  // ── números da semana
  const pctSaida = s.entradas > 0 ? Math.round((s.saidas / s.entradas) * 100) : null
  const pctFeitos = s.total > 0 ? Math.round((s.feitos / s.total) * 100) : null
  const nums = (
    <section className="nums boot b3" aria-label="Números da semana">
      <div><p className="eyebrow">Entradas</p><div className="v num">{brl0(s.entradas)}</div><div className="d num">{semDados ? 'até agora' : 'na semana'}</div></div>
      <div><p className="eyebrow">Saídas</p><div className="v num">{brl0(s.saidas)}</div><div className="d num">{pctSaida !== null ? `${pctSaida}% do que entrou` : 'na semana'}</div></div>
      <div><p className="eyebrow">Compromissos</p><div className="v num">{s.feitos}/{s.total}</div><div className="d num">{pctFeitos !== null ? `${pctFeitos}% feitos` : 'nenhum na semana'}</div></div>
      <div><p className="eyebrow">Foco</p><div className="v num">{horasMin(s.focoMin)}</div><div className="d num">{plural(s.focoSessoes, 'sessão', 'sessões')}</div></div>
    </section>
  )

  // ── o que mudou (áreas ativas, de → para)
  const porque = (m: Mudanca): ReactNode => {
    if (m.key === 'financas') {
      const sobra = s.entradas - s.saidas
      return <>{sobra >= 0 ? 'Sobraram' : 'Faltaram'} <span className="num">{brl0(Math.abs(sobra))}</span> na semana.</>
    }
    if (m.key === 'tempo') return <><span className="num">{s.feitos} de {s.total}</span> compromissos saíram.</>
    if (m.key === 'mente') return <><span className="num">{horasMin(s.focoMin)}</span> de foco na semana.</>
    if (m.delta > 0) return <>Subiu <span className="num">{m.delta}</span> {pontos(m.delta)} na semana.</>
    if (m.delta < 0) return <>Recuou <span className="num">{Math.abs(m.delta)}</span> {pontos(m.delta)} na semana.</>
    return <>Ficou no mesmo lugar.</>
  }
  const outrasMudou = s.inativas.length > 0 && (
    <p className="outras">Áreas desligadas ({s.inativas.map((a) => `${a.n} ${a.nome}`).join(' · ')}) não entram na conta da semana.</p>
  )
  const secMudou = !semDados && (
    <section className={mob ? 'sec rv' : 'secao rv'} id="mudou" aria-label="O que mudou na semana">
      {mob
        ? <div className="sec-head"><p className="eyebrow">O que mudou</p><Link href="/dashboard/score" title="Life Score">Entender →</Link></div>
        : <div className="secao-head"><p className="eyebrow">O que mudou</p><Link href="/dashboard/score" title="Life Score">Entender o número →</Link></div>}
      {s.mudou.map((m) => mob ? (
        <div className="mud" key={m.key}>
          <span className="di num">{m.n}</span>
          <div className="nm">{m.nome}</div>
          <DePara de={m.de} para={m.para} delta={m.delta} />
          <div className="pq">{porque(m)}</div>
        </div>
      ) : (
        <div className="mud" key={m.key}>
          <span className="di num">{m.n}</span>
          <div><div className="nm">{m.nome}</div><div className="pq">{porque(m)}</div></div>
          <DePara de={m.de} para={m.para} delta={m.delta} />
        </div>
      ))}
      {s.mudou.length === 0 && <p className="outras">O que mudou aparece com <span className="num">7</span> dias de histórico do score.</p>}
      {outrasMudou}
    </section>
  )

  // ── o que ficou para a próxima (compromissos pendentes da semana, máx. 3)
  const hoje = semana.hoje
  const secFicou = (
    <section className={mob ? 'sec rv' : 'secao rv'} id="ficou" aria-label="O que ficou para a próxima semana">
      {mob
        ? <div className="sec-head"><p className="eyebrow">O que ficou para a próxima</p></div>
        : <div className="secao-head"><p className="eyebrow">O que ficou para a próxima</p></div>}
      {s.pendentes.map((e) => {
        const atrasado = e.date < hoje
        const quando = `${diaCurto(e.date)} ${Number(e.date.slice(8, 10))}/${e.date.slice(5, 7)}${e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ''}`
        const val = <span className="val num">{atrasado ? 'ficou para trás' : e.date === hoje ? 'hoje' : diaCurto(e.date)}</span>
        const act = <Link className="btn-sm ghost act" href="/tempo" title="03 Tempo">Abrir área</Link>
        return (
          <div className={atrasado ? 'row warn' : 'row'} key={e.id}>
            <span className="ix num">03</span>
            <div>
              <div className="tx"><strong>{e.title}</strong></div>
              <div className="sub">Tempo · {quando}</div>
            </div>
            {mob ? <div className="r2">{val}{act}</div> : <>{val}{act}</>}
          </div>
        )
      })}
      {s.pendentes.length === 0 && <p className="outras">Nada ficou pendente na agenda desta semana.</p>}
    </section>
  )

  // ── fechamento: a única ação da tela
  const streakTx = s.streakDias > 0
    ? <>Conta para o streak de <b className="num">{plural(s.streakDias, 'dia', 'dias')}</b> e você pode reler esta semana quando quiser.</>
    : <>Conta para o seu streak e você pode reler esta semana quando quiser.</>
  const txFechar = semDados
    ? <>Você pode fechar quando a semana tiver leitura, a partir de quinta.</>
    : <>Fechar registra o que você viu; nada é alterado nas áreas. {streakTx}</>
  const confTexto = (
    <>Semana fechada às <span className="num">{s.fechadaAs ?? s.atualizadoAs}</span>{s.streakDias > 0 && <> · conta para o streak de <span className="num">{plural(s.streakDias, 'dia', 'dias')}</span></>}</>
  )
  const erro = s.erroFechar && <p className="erro" role="alert">Não deu para fechar a semana agora. Tente de novo.</p>
  const botao = (
    <button className="btn-sm roxo" type="button" id="fechar" onClick={fechar} disabled={semDados || s.fechando || s.loading}>
      {s.fechando ? 'Fechando…' : 'Fechar a semana'}
    </button>
  )

  const secFechar = mob ? (
    <section className="fechamento rv" id="fechamento" aria-label="Fechar a semana">
      <p className="eyebrow">Fechamento</p>
      <h2>Fechar a semana</h2>
      <p className="tx">{txFechar}</p>
      <p className="conf" id="fechado" role="status" hidden={!s.fechada} ref={confRef}><Check /><span>{s.fechada && confTexto}</span></p>
      {erro}
    </section>
  ) : (
    <section className="fechar rv" id="fechamento" aria-label="Fechar a semana">
      <div>
        <p className="eyebrow">Fechamento</p>
        <h2>Fechar a semana</h2>
        <p className="tx">{txFechar}</p>
        {erro}
      </div>
      <div>
        {!s.fechada && botao}
        <span className="conf" id="fechado" role="status" hidden={!s.fechada}><Check />{s.fechada && confTexto}</span>
      </div>
    </section>
  )

  const fontesBase = `${plural(s.nTransacoes, 'transação', 'transações')} · ${plural(s.total, 'compromisso', 'compromissos')} · ${plural(s.focoSessoes, 'sessão', 'sessões')}`

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <ChromeV5 ativo="meu-dia" onCoachOpen={() => abrirCoach()} />

      <main className={s.fechada ? 'wrap ss-v5 fechada' : 'wrap ss-v5'} ref={mainRef}>
        {mob ? (
          <div className="subbar">
            <Link className="voltar" id="voltar" href="/dashboard">← Meu dia</Link>
            <span className="curto">Sua semana</span>
          </div>
        ) : (
          <Link className="voltar boot b1" id="voltar" href="/dashboard">← Meu dia</Link>
        )}
        {objeto}
        {principal}
        {vazio}
        {nums}
        {secMudou}
        {secFicou}
        {secFechar}

        {mob && !s.fechada && (
          <div className="acoes-fixas" id="acoes" aria-label="Fechar a semana">{botao}</div>
        )}
      </main>

      <footer className="colofao">
        <span>Semana <b className="num" suppressHydrationWarning>{semanaIsoNum(semana.inicio)} · {s.rotulo}</b></span>
        <div className="r">
          <span>Base do cálculo <b className="num">{fontesBase}</b></span>
          <span>Última sincronização às <b className="num" suppressHydrationWarning>{s.atualizadoAs}</b></span>
          {!mob && <Link href="/dashboard">Voltar para Meu dia →</Link>}
        </div>
      </footer>

      <CamadaCoach
        open={coachOpen}
        seed={coachSeed}
        suggestions={SUGESTOES}
        onClose={() => setCoachOpen(false)}
        moduleId="panorama"
        leitura="a sua semana"
        saudacao="Já li a sua semana. O que você quer saber?"
      />
    </>
  )
}

export default SuaSemanaV5
