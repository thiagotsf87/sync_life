// SyncLife DS v5 — Sy em 40px, quieto (Fase 0 do modelo sem metáfora).
// Liga o Enxame em todo `.sy40 canvas` da página com o perfil fixo das telas aprovadas
// (Meu dia D, Finanças A). Único estado além de repouso: `ouvindo`, enquanto o elemento
// de `seletorFoco` (o input da camada de Sy) tem foco. Com prefers-reduced-motion,
// desenha 3 quadros e para (E-02: sem movimento, Sy continua visível).
// Uso: <script type="module">import { ligarSy40 } from '../shared/sy40.js'; ligarSy40()</script>
// (o importmap do three continua em cada página.)
import { REDUZ } from '../personagem/vida.js'
import { criarEnxame } from '../personagem/enxame.js'

export function ligarSy40 ({ seletorFoco = '.camada .cask' } = {}) {
  const pecas = [...document.querySelectorAll('.sy40 canvas')].map((cv, i) =>
    criarEnxame(cv, { n: 190, tam: .7, compacto: .78, dpr: 3, semente: 4.6 + i }))
  let estado = 'repouso'
  const foco = seletorFoco ? document.querySelector(seletorFoco) : null
  if (foco) {
    foco.addEventListener('focusin', () => { estado = 'ouvindo' })
    foco.addEventListener('focusout', () => { estado = 'repouso' })
  }
  let ultimo = performance.now()
  function laco (agora) {
    const dt = Math.min((agora - ultimo) / 1000, .05); ultimo = agora
    for (const p of pecas) p.quadro(dt, estado)
    requestAnimationFrame(laco)
  }
  if (REDUZ) { for (let i = 0; i < 3; i++) for (const p of pecas) p.quadro(1 / 60, 'repouso') } else requestAnimationFrame(laco)
  return pecas
}
