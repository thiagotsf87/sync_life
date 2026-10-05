'use client'

// Fase 2 · /financas/planejamento (T3, o mês como objeto). Container: dados reais (usePlanejamentoV5),
// estado do painel de evento e a moldura comum SubtelaV5. O corpo é PlanejamentoView (puro, testável).
// Registrar do bar e da bottom bar abre a captura de evento planejado desta tela.

import { useState } from 'react'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { EventoPlanejadoPainel } from '@/components/app-v5/financas/EventoPlanejadoPainel'
import { PlanejamentoView } from '@/components/app-v5/financas/PlanejamentoView'
import { usePlanejamentoV5 } from '@/hooks/use-planejamento-v5'
import type { PlanningEvent } from '@/hooks/use-planejamento'
import { nomeMes, nomeMesDe, reais } from '@/lib/financas/planejamento'
import './planejamento-v5.css'

export function PlanejamentoV5() {
  const d = usePlanejamentoV5()
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<PlanningEvent | null>(null)

  const novo = () => { setEditando(null); setAberto(true) }
  const editar = (ev: PlanningEvent) => { setEditando(ev); setAberto(true) }

  const critico = d.analise?.critico
  const nomeCritico = critico ? nomeMes(d.hoje, critico.i) : null
  const sugestoes = [
    d.lab ? `Dá para antecipar ${d.lab.evento.nome}?` : 'O que muda se eu planejar um gasto?',
    nomeCritico ? `Por que ${nomeCritico} é crítico?` : 'Em que mês o saldo fica mais baixo?',
    'E se eu gastar R$ 500 a mais por mês?',
  ]

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="planejamento"
      voltarHref="/financas"
      voltarRotulo={`Finanças · ${nomeMesDe(d.hoje)}`}
      tituloCurto="Planejamento"
      classe="pl-v5"
      coach={{
        leitura: 'o seu planejamento',
        saudacao: 'Já li os próximos 12 meses. O que você quer saber?',
        sugestoes,
      }}
      onRegistrar={novo}
      chaveReveal={d.carregando ? 0 : d.lab ? 2 : 1}
      rodape={
        <footer className="colofao">
          {!d.carregando && <span>Saldo hoje <b className="num">{reais(d.saldoHoje)}</b></span>}
          <div className="r">
            {d.analise && (
              <span>
                {`Projeção ${d.cenario}${d.previa ? ' (prévia)' : ''} para ${nomeMes(d.hoje, 12, true)}: `}
                <b className="num">{reais(d.analise.s12)}</b>
              </span>
            )}
            {d.ultimaSinc && <span>Última sincronização às <b className="num">{d.ultimaSinc}</b></span>}
          </div>
        </footer>
      }
      extra={
        <EventoPlanejadoPainel
          open={aberto}
          onClose={() => setAberto(false)}
          inicial={editando}
          onSalvo={d.aposSalvar}
        />
      }
    >
      {({ abrirCoach, mob }) => (
        <PlanejamentoView d={d} mob={mob} abrirCoach={abrirCoach} onNovo={novo} onEditar={editar} />
      )}
    </SubtelaV5>
  )
}
