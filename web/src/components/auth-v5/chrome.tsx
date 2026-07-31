'use client'

// Onda 1 · peças compartilhadas das telas públicas/auth v5:
// boot da árvore (gate .anim E-02 + aurora + bússolas + reveals), ícones SVG dos
// protótipos e o slot do ícone de rumo das 8 áreas (§5.5, responsivo por breakpoint).

import { useEffect, useRef, type RefObject } from 'react'
import { mountBussola3D, areaIcon } from '@/lib/v5/bussola-3d'
import { prefersReduce, setupReveal, initAurora, type Cleanup } from '@/lib/v5/viva'

// boot padrão de uma tela pública: chamado no root da árvore (.av/.onb/.pv-*)
export function useAuthBoot(
  rootRef: RefObject<HTMLElement | null>,
  opts: { aurora?: boolean; dark?: boolean } = {}
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    document.documentElement.classList.add('v5-scroll')
    if (opts.dark) document.documentElement.classList.add('v5-dark')
    const reduce = prefersReduce()
    if (!reduce) root.classList.add('anim')
    root.querySelectorAll<HTMLElement>('[data-bs3d]').forEach((el) => mountBussola3D(el))
    const cleanups: Cleanup[] = [setupReveal(root, { reduce, threshold: 0.15, rootMargin: '0px 0px -40px 0px' })]
    if (opts.aurora !== false) {
      const cv = root.querySelector<HTMLCanvasElement>('.aurora-fix canvas')
      if (cv) cleanups.push(initAurora(cv, { reduce }))
    }
    return () => {
      cleanups.forEach((fn) => fn())
      document.documentElement.classList.remove('v5-scroll')
      if (opts.dark) document.documentElement.classList.remove('v5-dark')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// dispara o reveal de um bloco recém-montado (estado 2 do fluxo de senha)
export function useRevealNow(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')))
    return () => cancelAnimationFrame(raf)
  }, [ref])
}

// marca no chrome: a bússola é montada pelo boot ([data-bs3d]); o tamanho vem do CSS (--sz)
export function BsMark() {
  return <span className="bs d3" data-bs3d aria-hidden="true" />
}

// ícone de rumo da área (§5.5): tamanho do protótipo certo por breakpoint
export function AreaIconSlot({ i, size, sizeM }: { i: number; size: number; sizeM?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mq = matchMedia('(min-width:1024px)')
    const render = () => { el.innerHTML = ''; el.appendChild(areaIcon(i, mq.matches ? size : (sizeM ?? size))) }
    render()
    mq.addEventListener('change', render)
    return () => { mq.removeEventListener('change', render); el.innerHTML = '' }
  }, [i, size, sizeM])
  return <span className="aic-slot" ref={ref} />
}

export const AREAS_V5 = [
  { nome: 'Finanças', ds: 'Contas, orçamentos, transações e o saldo do mês.', dsM: 'Contas, orçamentos e o saldo do mês.' },
  { nome: 'Futuro', ds: 'Metas, reserva de emergência e projeção.', dsM: 'Metas, reserva e projeção.' },
  { nome: 'Tempo', ds: 'Agenda, blocos de foco e rotina.', dsM: 'Agenda, foco e rotina.' },
  { nome: 'Corpo', ds: 'Treino, sono, alimentação e exames.', dsM: 'Treino, sono e alimentação.' },
  { nome: 'Mente', ds: 'Leitura, cursos, terapia e humor.', dsM: 'Leitura, cursos e humor.' },
  { nome: 'Patrimônio', ds: 'Investimentos, bens e evolução do capital.', dsM: 'Investimentos e evolução.' },
  { nome: 'Carreira', ds: 'Metas profissionais, skills e renda.', dsM: 'Skills, metas e renda.' },
  { nome: 'Experiências', ds: 'Viagens, lazer e o que fica de memória.', dsM: 'Viagens, lazer e memória.' },
] as const

// força da senha (mesma régua do app v3 e dos protótipos)
export function calcForca(senha: string): { score: number; label: string } {
  if (!senha) return { score: 0, label: '' }
  let s = 0
  if (senha.length >= 8) s++
  if (senha.length >= 12) s++
  if (/[A-Z]/.test(senha) && /[0-9]/.test(senha)) s++
  if (/[^A-Za-z0-9]/.test(senha)) s++
  return { score: s, label: ['', 'Fraca', 'Média', 'Forte', 'Muito forte'][s] ?? '' }
}

export function Forca({ senha }: { senha: string }) {
  const { score, label } = calcForca(senha)
  return (
    <div className={'forca' + (senha && score ? ' f' + score : '')} aria-live="polite">
      <i /><i /><i /><i />
      <span className="flbl">{label}</span>
    </div>
  )
}

/* ── ícones dos protótipos (SVG 1:1) ── */
export function GoogleIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function AppleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.18 0a3.5 3.5 0 0 1-.85 2.55 2.95 2.95 0 0 1-2.37 1.1 3.32 3.32 0 0 1 .85-2.47A3.55 3.55 0 0 1 11.18 0zm3.45 12.05a7.78 7.78 0 0 1-.78 1.4c-.51.74-1 1.48-1.77 1.5-.76.01-1-.45-1.86-.45-.86 0-1.13.43-1.85.46-.74.03-1.31-.8-1.82-1.54-1.05-1.51-1.85-4.27-.77-6.13a2.86 2.86 0 0 1 2.43-1.48c.73-.01 1.42.5 1.86.5.45 0 1.28-.61 2.16-.52a2.94 2.94 0 0 1 2.3 1.25 2.86 2.86 0 0 0-1.37 2.4 2.78 2.78 0 0 0 1.69 2.55c-.04.13-.1.27-.15.4z" />
    </svg>
  )
}

export function IconEye({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconCheck({ size = 13, sw = 2.6 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function IconCheckWhite({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function IconArrowR({ size = 14, sw = 2.4 }: { size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function IconChevL({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function IconClock({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconMail({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  )
}

export function HandArrow({ flip = true, w = 38 }: { flip?: boolean; w?: number }) {
  return (
    <svg className="hand-arrow" width={w} height={Math.round(w * 24 / 42)} viewBox="0 0 42 24" aria-hidden="true">
      {flip
        ? <path d="M40 20 C28 4, 15 2, 3 9 M9 3 L3 9 L10 13" />
        : <path d="M2 20 C14 4, 27 2, 39 9 M33 3 L39 9 L32 13" />}
    </svg>
  )
}
