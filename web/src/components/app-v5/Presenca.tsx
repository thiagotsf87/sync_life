'use client'

// Fase 1 · "Seu acordo com Sy" (Meu dia D), porte 1:1 da seção .presenca de
// prototypes/v5/app/meu-dia-d.html; o select troca o hint (shared/lab.js,
// SL_MOCK.lab.acordo). A preferência vive em localStorage['sy.acordo'] até a
// Fase 7 (Configurações · Sy).

import type { ReactNode } from 'react'
import { Sy40 } from '@/components/app-v5/Sy40'
import type { AcordoId } from '@/hooks/use-meu-dia'

interface PresencaProps {
  acordo: AcordoId
  onChange: (a: AcordoId) => void
  className?: string
}

// SL_MOCK.lab.acordo
const HINT: Record<AcordoId, ReactNode> = {
  pedir: <><b>Sy fica disponível.</b> Seu dia abre direto, sem apresentação, e nada chega sem você pedir.</>,
  mudar: <><b>Exemplo de gatilho:</b> um compromisso novo elimina a sua janela livre, ou o lazer passa do teto. Mudanças pequenas aguardam.</>,
  resumo: <><b>Um resumo por dia,</b> no horário que você escolher nas configurações. Sempre com a opção de pular.</>,
}

function isAcordo(v: string): v is AcordoId {
  return v === 'pedir' || v === 'mudar' || v === 'resumo'
}

export function Presenca({ acordo, onChange, className }: PresencaProps) {
  return (
    <section className={'presenca' + (className ? ` ${className}` : '')} aria-label="Presença de Sy">
      <p className="eyebrow">Seu acordo com Sy</p>
      <div className="sh">
        <Sy40 />
        <h2>Presença, do seu jeito.</h2>
      </div>
      <p>Sy liga os pontos entre as suas áreas e mostra o efeito das suas escolhas. Você define quando essa ajuda entra. Fora disso, Sy espera.</p>
      <label htmlFor="syModo">Quando Sy pode trazer sugestões?</label>
      <div className="sel">
        <select
          id="syModo"
          value={acordo}
          onChange={e => { if (isAcordo(e.target.value)) onChange(e.target.value) }}
        >
          <option value="pedir">Quando eu pedir</option>
          <option value="mudar">Quando algo importante mudar</option>
          <option value="resumo">Em um resumo por dia</option>
        </select>
      </div>
      <p className="hint" id="syHint">{HINT[acordo]}</p>
    </section>
  )
}
