'use client'

// Fase 1 · "Como está seu ritmo hoje?" (Meu dia D), porte 1:1 da seção .checkin
// de prototypes/v5/app/meu-dia-d.html + o wiring de shared/app.js (pílula marca
// .on, Registrar mostra .ck-done) e de shared/lab.js (a pílula muda só a nota,
// nunca os dados). Grava em daily_checkins.mood (2/3/4). Responder é opcional:
// nada aqui cobra o que ficou em branco.

import { useState, type ReactNode } from 'react'
import { RITMO_LABEL, type RitmoId } from '@/hooks/use-meu-dia'
import type { CheckinToday } from '@/hooks/use-checkin'

interface RitmoProps {
  atual: RitmoId | null
  registro: CheckinToday | null
  unavailable: boolean
  salvar: (r: RitmoId, nota: string) => Promise<boolean>
  className?: string
}

const ORDEM: readonly RitmoId[] = ['lento', 'normal', 'energia']

// SL_MOCK.lab.ritmo
const NOTA: Record<RitmoId, ReactNode> = {
  lento: <><b>Seu ritmo foi ouvido.</b> Nenhuma atividade extra entra nas sugestões de hoje. Você pode comparar as opções sem assumir mais um compromisso.</>,
  normal: <><b>O dia pode seguir assim.</b> Explore uma mudança só se ela fizer sentido para você.</>,
  energia: <><b>Energia não precisa virar obrigação.</b> A janela livre continua disponível para o que você escolher.</>,
}
const NOTA_PADRAO: ReactNode = <>Você pode seguir sem responder. <b>Seu dia continua aqui.</b></>

function horaSP(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
}

export function Ritmo({ atual, registro, unavailable, salvar, className }: RitmoProps) {
  const [escolhido, setEscolhido] = useState<RitmoId | null>(null)
  const [nota, setNota] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(false)

  const marcado = escolhido ?? atual
  const feito = registro !== null

  async function registrar() {
    if (!escolhido || salvando) return
    setSalvando(true)
    setErro(false)
    const ok = await salvar(escolhido, nota)
    if (!ok) setErro(true)
    setSalvando(false)
  }

  const rotuloFeito = registro
    ? (atual ? RITMO_LABEL[atual] : '') + (registro.note ? ` · "${registro.note}"` : '')
    : ''

  return (
    <section className={'checkin' + (className ? ` ${className}` : '')} id="checkin" aria-label="Seu ritmo hoje">
      <p className="eyebrow">O que a agenda não sabe</p>
      <h2>Como está seu ritmo hoje?</h2>
      <p>Ter tempo disponível não diz quanto você quer fazer. Responder é opcional e não muda o que a tela mostra.</p>
      <div className="moods" role="group" aria-label="Seu ritmo hoje">
        {ORDEM.map(r => (
          <button
            key={r}
            className={'mood' + (marcado === r ? ' on' : '')}
            type="button"
            data-r={r}
            aria-pressed={marcado === r}
            disabled={feito}
            onClick={() => setEscolhido(r)}
          >
            {RITMO_LABEL[r]}
          </button>
        ))}
      </div>
      {!feito && !unavailable && (
        <div className="ck-form">
          <input
            className="ck-note"
            type="text"
            placeholder="Uma linha sobre hoje (opcional)"
            aria-label="Uma linha sobre hoje (opcional)"
            value={nota}
            onChange={e => setNota(e.target.value)}
          />
          <button
            className="btn-sm roxo ck-save"
            type="button"
            disabled={!escolhido || salvando}
            onClick={() => void registrar()}
          >
            Registrar
          </button>
        </div>
      )}
      {feito && registro && (
        <div className="ck-done" suppressHydrationWarning>
          Registrado às {horaSP(registro.created_at)} · <b>{rotuloFeito}</b>
        </div>
      )}
      {erro && <div className="ck-done" role="status">Não deu para registrar agora. Tente de novo.</div>}
      <p className="ck-nota" id="ritmoNota">{marcado ? NOTA[marcado] : NOTA_PADRAO}</p>
      <small>Autodeclaração, só sua. Não é avaliação de saúde e Sy nunca cobra o que ficou em branco.</small>
    </section>
  )
}
