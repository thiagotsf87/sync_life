'use client'

// Fase 2 · Finanças > Relatórios v5. Container: dados (useRelatoriosV5), CSV e a moldura
// SubtelaV5 (chrome, faixa de subtelas, voltar/subbar e a camada de Sy). A apresentação mora em
// RelatoriosView (porte 1:1 dos protótipos aprovados). Trocar o período recarrega na hora, no
// desktop e no mobile; PDF e Excel não existem aqui.

import { useState } from 'react'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { useRelatoriosV5 } from '@/hooks/use-relatorios-v5'
import { gerarCsv, type Relatorio } from '@/lib/financas/relatorios'
import { RelatoriosView } from './RelatoriosView'

const SUGESTOES = [
  'O que mudou nas minhas despesas neste período?',
  'Em quais meses fiquei abaixo da meta de poupança?',
  'Qual categoria mais pesou?',
]

/** Salva o CSV pelo navegador (blob local, nada sai do aparelho). */
function baixar(nome: string, txt: string) {
  const url = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function RelatoriosV5() {
  const d = useRelatoriosV5()
  // a mensagem de "Salvo" vale só para o relatório que gerou o arquivo
  const [salvo, setSalvo] = useState<{ rel: Relatorio; msg: string } | null>(null)

  const exportar = () => {
    if (!d.rel) return
    const csv = gerarCsv(d.rel)
    baixar(csv.nome, csv.txt)
    setSalvo({ rel: d.rel, msg: `Salvo: ${csv.nome} · ${csv.linhas} ${csv.linhas === 1 ? 'linha' : 'linhas'}.` })
  }

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="relatorios"
      voltarHref="/financas"
      voltarRotulo="Finanças"
      voltarNumero="01"
      tituloCurto="Relatórios"
      classe="relatorios"
      coach={{
        leitura: 'os seus relatórios',
        saudacao: 'Já li os seus relatórios. O que você quer saber?',
        sugestoes: SUGESTOES,
      }}
      chaveReveal={`${d.loading}-${d.rel?.vazio ?? ''}-${d.erro}`}
    >
      {({ abrirCoach, mob }) => (
        <RelatoriosView
          rel={d.rel}
          loading={d.loading}
          recarregando={d.recarregando}
          erro={d.erro}
          mob={mob}
          periodoKey={d.key}
          de={d.de}
          ate={d.ate}
          opcoes={d.opcoes}
          atualizadoAs={d.atualizadoAs}
          csvMsg={salvo && salvo.rel === d.rel ? salvo.msg : ''}
          onKey={d.setKey}
          onDe={d.setDe}
          onAte={d.setAte}
          onTentar={d.tentarDeNovo}
          onCsv={exportar}
          onFalar={abrirCoach}
        />
      )}
    </SubtelaV5>
  )
}

export default RelatoriosV5
