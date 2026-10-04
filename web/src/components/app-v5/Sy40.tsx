'use client'

// Sy em 40px (ou 34px): o Enxame quieto que identifica a camada de Sy nas telas
// da Fase 1. O canvas só é tocado no effect, então o SSR entrega o <span> + <canvas>
// vazios e o WebGL liga no cliente. three entra por import() aqui dentro, pra não
// ir junto em páginas que não têm Sy. Com prefers-reduced-motion desenha 3 quadros
// e para (E-02: sem movimento, Sy continua visível).
import { useEffect, useRef } from 'react'
import { prefersReduce } from '@/lib/v5/viva'
import type { EstadoSy40, Sy40 as PecaSy40 } from '@/lib/v5/sy40'

export interface Sy40Props {
  estado?: EstadoSy40
  tamanho?: 40 | 34
  semente?: number
}

export function Sy40({ estado = 'repouso', tamanho = 40, semente = 4.6 }: Sy40Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const estadoRef = useRef<EstadoSy40>(estado)
  estadoRef.current = estado

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    let vivo = true
    let raf = 0
    let peca: PecaSy40 | null = null

    import('@/lib/v5/sy40').then(({ montarSy40 }) => {
      if (!vivo) return
      try {
        peca = montarSy40(cv, semente)
      } catch {
        // sem WebGL a peça fica como chapa escura (CSS); nada quebra
        return
      }
      if (prefersReduce()) {
        for (let i = 0; i < 3; i++) peca.quadro(1 / 60, 'repouso')
        return
      }
      let ultimo = performance.now()
      const laco = (agora: number) => {
        if (!vivo || !peca) return
        const dt = Math.min((agora - ultimo) / 1000, .05); ultimo = agora
        peca.quadro(dt, estadoRef.current)
        raf = requestAnimationFrame(laco)
      }
      raf = requestAnimationFrame(laco)
    })

    return () => {
      vivo = false
      cancelAnimationFrame(raf)
      peca?.destruir()
      peca = null
    }
  }, [semente])

  return (
    <span className={tamanho === 34 ? 'sy40 s34' : 'sy40'} aria-hidden="true">
      <canvas ref={canvasRef} />
    </span>
  )
}

export default Sy40
