// SyncLife DS v5 — Sy em 40px, quieto (porte de prototypes/v5/shared/sy40.js).
// Monta UM Enxame num canvas com o perfil fixo das telas aprovadas (Meu dia D,
// Finanças A). Só dois estados nesse tamanho: `repouso` e `ouvindo`. O laço de
// animação e o prefers-reduced-motion ficam com o componente (<Sy40/>), que é
// quem sabe quando a peça está na tela. Este módulo puxa three estaticamente,
// então só deve ser importado de dentro de componente client (de preferência
// via import() no effect, pra three não entrar em páginas sem Sy).
import { criarEnxame } from './enxame/enxame'

export type EstadoSy40 = 'repouso' | 'ouvindo'

export interface Sy40 {
  quadro(dt: number, estado: EstadoSy40): void
  destruir(): void
}

export const PERFIL_SY40 = { n: 190, tam: .7, compacto: .78, dpr: 3 } as const

export function montarSy40(canvas: HTMLCanvasElement, semente: number): Sy40 {
  const peca = criarEnxame(canvas, { ...PERFIL_SY40, semente }) as {
    quadro(dt: number, estado: string): void
    destruir(): void
  }
  return {
    quadro(dt, estado) { peca.quadro(dt, estado) },
    destruir() { peca.destruir() },
  }
}
