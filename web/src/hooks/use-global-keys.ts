import { useEffect } from 'react'
import { useCoachStore } from '@/stores/coach-store'

type KeyInfo = { key: string; metaKey: boolean; ctrlKey: boolean }
export type ShortcutResult = 'palette' | 'coachDrawer' | 'cheat' | 'close' | null

/** Decisão pura de atalho (testável sem DOM). `typing` = foco em campo de texto. */
export function resolveShortcut(e: KeyInfo, typing: boolean): ShortcutResult {
  if (e.key === 'Escape') return 'close'
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'k') return 'palette'
  if (mod && e.key.toLowerCase() === 'j') return 'coachDrawer'
  if (!mod && e.key === '?' && !typing) return 'cheat'
  return null
}

function isTyping(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null
  if (!t) return false
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable
}

/** Liga os atalhos globais. Chamar uma vez, no shell. */
export function useGlobalKeys() {
  const toggleOverlay = useCoachStore((s) => s.toggleOverlay)
  const closeAll = useCoachStore((s) => s.closeAll)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const r = resolveShortcut(e, isTyping(e.target))
      if (!r) return
      e.preventDefault()
      if (r === 'close') closeAll()
      else toggleOverlay(r)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleOverlay, closeAll])
}
