/**
 * Módulos fixados na barra inferior mobile.
 * Compartilhado entre MobileBottomBar e MobileMoreSheet.
 */

export const PINNED_STORAGE_KEY = 'sl_pinned_modules'
export const DEFAULT_PINNED = ['financas', 'tempo']
const MAX_PINNED = 3

export function getPinnedModules(): string[] {
  if (typeof window === 'undefined') return DEFAULT_PINNED
  try {
    const stored = localStorage.getItem(PINNED_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return DEFAULT_PINNED
}

export function setPinnedModules(modules: string[]): string[] {
  const next = modules.slice(0, MAX_PINNED)
  try {
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(next))
  } catch { /* ignore */ }
  return next
}
