'use client'

// Mobile dedicado do app v5: o mesmo corte do AppV5Boot (.mob até 1023px).
// As telas T3 têm markup próprio no mobile (subbar, .sec, .r2), então o
// componente precisa saber em qual variante está. SSR e sem JS: desktop.
import { useSyncExternalStore } from 'react'

const QUERY = '(max-width:1023px)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useMobV5(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}
