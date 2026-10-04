'use client'

// Fase 1 · laboratório "uma escolha, mais de um efeito" (Meu dia D), porte 1:1
// do .sec-head + .lab de prototypes/v5/app/meu-dia-d.html, com o comportamento
// de shared/lab.js em estado React: escolher cenário → ver 3 efeitos →
// "Experimentar no meu dia" (prévia local, o pai atualiza anel, linha do dia,
// lazer, meta e agenda) → Desfazer. Nada vai ao banco.

import { useRef, useState } from 'react'
import { Sy40 } from '@/components/app-v5/Sy40'
import { brl0, type Cenario, type CenarioId, type Laboratorio as Lab } from '@/lib/meu-dia/laboratorio'
import type { LazerHoje, MetaViagem } from '@/hooks/use-meu-dia'

interface LaboratorioProps {
  lab: Lab
  lazer: LazerHoje
  janelaMin: number
  mediaN: number
  metaViagem: MetaViagem | null
  /** cenário aplicado na prévia (null = nada aplicado) */
  previa: Cenario | null
  onAplicar: (c: Cenario) => void
  onDesfazer: () => void
  mob: boolean
}

/** minutos → "2h30" (SLLab.hm) */
export function hm(min: number): string {
  const m = Math.max(0, Math.round(min))
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}

/** sinal do protótipo: en-dash + espaço quando negativo */
function brlSinal(n: number): string {
  return (n < 0 ? '– ' : '') + brl0(n)
}

export function Laboratorio({
  lab, lazer, janelaMin, mediaN, metaViagem, previa, onAplicar, onDesfazer, mob,
}: LaboratorioProps) {
  const [sel, setSel] = useState<CenarioId>('fora')
  const aplicarRef = useRef<HTMLButtonElement>(null)

  const c = lab.cenarios.find(x => x.id === sel) ?? lab.cenarios[0]
  const fora = lab.cenarios[0]
  const lz = c.efeitos.lazer
  const ap = c.efeitos.aporte

  function desfazer() {
    onDesfazer()
    setSel('fora')
    aplicarRef.current?.focus()
  }

  const destinoMeta = metaViagem ? `para a ${metaViagem.nome}` : 'no mês'
  const head = (
    <>
      <p className="eyebrow">Uma escolha, mais de um efeito</p>
      <h2>{lab.titulo}</h2>
    </>
  )

  return (
    <>
      <div className={'sec-head boot ' + (mob ? 'b4' : 'b3')}>
        {mob ? head : <div>{head}</div>}
        <p>Experimente antes de decidir. Nada é lançado.</p>
      </div>
      <section className={'lab boot ' + (mob ? 'b4' : 'b3')} aria-label="Laboratório de possibilidades">
        <div className="perg">
          <p className="eyebrow"><b>03 · 01 · 08</b> · Tempo, Finanças, Experiências</p>
          <h3>{lab.pergunta}</h3>
          <p>Compare tempo, dinheiro e o que sobra {destinoMeta}. Nenhuma opção é a certa: a prioridade é sua.</p>
          <div className="opcoes" role="group" aria-label="Cenários para o jantar">
            {lab.cenarios.map(x => (
              <button
                key={x.id}
                className="opc"
                type="button"
                data-cen={x.id}
                aria-pressed={x.id === sel}
                onClick={() => setSel(x.id)}
              >
                <span>{x.nome}</span><span className="n num">{brl0(x.custo)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="efei">
          <div className="et"><b id="cenTitulo">{c.nome}</b><span className="eyebrow">Simulação</span></div>
          <div className="imp" aria-live="polite">
            <div>
              <label>Lazer no mês</label>
              <strong className={'num ' + (lz < 0 ? 'w' : 'ok')}>{brlSinal(lz)}</strong>
              <small>{lz < 0 ? `passa ${brl0(lz)} do teto de ${brl0(lazer.teto)}` : `dentro do teto de ${brl0(lazer.teto)}`}</small>
            </div>
            <div>
              <label>Tempo livre que sobra</label>
              <strong className="num">{hm(janelaMin - c.prep)}</strong>
              <small>{c.prep ? `${c.prep} min de preparo na janela` : 'nenhum preparo na janela'}</small>
            </div>
            <div>
              <label>{metaViagem ? `Possível aporte ${metaViagem.nome}` : 'Possível aporte'}</label>
              <strong className={'num' + (ap > 0 ? ' ok' : '')}>{brl0(ap)}</strong>
              <small>diferença frente a jantar fora</small>
            </div>
          </div>
          <div className="expl">
            <Sy40 />
            {/* copy de lib/meu-dia/laboratorio: só <b>, nome da meta já escapado no hook */}
            <p id="cenCopy" dangerouslySetInnerHTML={{ __html: c.copy }} />
          </div>
          <details className="evid">
            <summary>De onde vêm esses efeitos?</summary>
            <p>
              Orçamento de lazer: <span className="num">{brl0(lazer.gasto)} de {brl0(lazer.teto)}</span> usados,
              {lazer.restante < 0
                ? <> passou <span className="num">{brl0(lazer.restante)}</span> do teto.</>
                : <> restam <span className="num">{brl0(lazer.restante)}</span> no mês.</>}
              {' '}Jantar fora estimado em <span className="num">{brl0(fora.custo)}</span>
              {mediaN > 0
                ? ` (média dos seus últimos ${mediaN === 1 ? 'gasto' : `${mediaN} gastos`} da categoria Lazer)`
                : ' (valor de referência: ainda não há gastos de Lazer neste mês)'}
              ; em casa <span className="num">{brl0(lab.cenarios[1].custo)}</span> e {lab.cenarios[1].prep} min de preparo;
              simples <span className="num">{brl0(lab.cenarios[2].custo)}</span> e {lab.cenarios[2].prep} min.
              Aporte possível = <span className="num">{brl0(fora.custo)}</span> menos o custo escolhido
              {metaViagem
                ? <>; a meta {metaViagem.nome} está em <span className="num">{brl0(metaViagem.atual)} de {brl0(metaViagem.alvo)}</span>.</>
                : '.'}
            </p>
            <p>
              O aporte é uma possibilidade, não uma transferência. Deslocamento e preferências não foram modelados.
              Fontes: orçamento {lazer.nome}, gastos de {lazer.nome} do mês{metaViagem ? `, meta ${metaViagem.nome}` : ''}, agenda de hoje.
            </p>
          </details>
          <div className="aplicar">
            <button className="btn-sm roxo" type="button" id="aplicar" ref={aplicarRef} onClick={() => onAplicar(c)}>
              Experimentar no meu dia →
            </button>
            <span>Prévia local, com desfazer. Nenhuma conta ou agenda muda.</span>
          </div>
          <div className="recibo" id="recibo" role="status" hidden={!previa}>
            {previa && (
              <span><b>{previa.nome}</b> entrou na prévia do seu dia. Nenhuma conta ou agenda foi alterada.</span>
            )}
            <button type="button" id="desfazer" onClick={desfazer}>Desfazer</button>
          </div>
        </div>
      </section>
    </>
  )
}
