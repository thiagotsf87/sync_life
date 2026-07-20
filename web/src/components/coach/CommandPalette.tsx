'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CornerDownLeft, Search, Sparkles } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { KbdChip } from '@/components/ui/kbd-chip'
import { MODULES, MODULE_LIST } from '@/lib/modules'
import { MODULE_ACTIONS } from '@/components/shell/QuickActionSheet'
import { useCoachStore } from '@/stores/coach-store'
import type { ModuleId } from '@/types/shell'

interface Item { id: string; label: string; group: string; run: () => void }

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  activeModule: ModuleId
}

export function CommandPalette({ open, onClose, activeModule }: CommandPaletteProps) {
  const router = useRouter()
  const openDrawerWithPrompt = useCoachStore((s) => s.openDrawerWithPrompt)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const items = useMemo<Item[]>(() => {
    const go: Item[] = MODULE_LIST.map((m) => ({
      id: `go-${m.id}`, label: m.label, group: 'Ir para',
      run: () => { router.push(m.basePath); onClose() },
    }))
    const nav: Item[] = (MODULES[activeModule]?.navItems ?? []).map((n) => ({
      id: `nav-${n.id}`, label: `${MODULES[activeModule].label}: ${n.label}`, group: 'Ir para',
      run: () => { router.push(n.href); onClose() },
    }))
    const cap: Item[] = (MODULE_ACTIONS[activeModule] ?? MODULE_ACTIONS.panorama).map((a, i) => ({
      id: `cap-${i}`, label: a.label, group: 'Capturar',
      run: () => { if (!a.href.startsWith('__')) router.push(a.href); onClose() },
    }))
    return [...go, ...nav, ...cap]
  }, [activeModule, router, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items
    const ask: Item = {
      id: 'ask', label: q ? `Perguntar ao Coach: “${query.trim()}”` : 'Perguntar ao Coach…',
      group: 'Perguntar', run: () => { if (q) { openDrawerWithPrompt(query.trim()); onClose() } },
    }
    return [...base, ask]
  }, [items, query, openDrawerWithPrompt, onClose])

  const groups = useMemo(() => {
    const map = new Map<string, Item[]>()
    filtered.forEach((it) => { const g = map.get(it.group) ?? []; g.push(it); map.set(it.group, g) })
    return [...map.entries()]
  }, [filtered])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[cursor]?.run() }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent showCloseButton={false} data-sl-overlay
        aria-label="Paleta de comandos"
        className="top-[18%] max-w-[560px] translate-y-0 gap-0 border-[var(--sl-border)] bg-[var(--sl-s-hero)] p-0"
        style={{ zIndex: 'var(--sl-z-palette)' }}>
        <div className="flex items-center gap-2 border-b border-[var(--sl-border)] px-4 py-3">
          <Search size={16} className="text-[var(--sl-t3)]" />
          <input autoFocus value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0) }} onKeyDown={onKeyDown}
            role="combobox" aria-expanded aria-controls="cmdk-list" aria-activedescendant={filtered[cursor]?.id}
            placeholder="Buscar ou perguntar…"
            className="flex-1 bg-transparent text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]" />
          <KbdChip>esc</KbdChip>
        </div>
        <div id="cmdk-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {groups.map(([group, its]) => (
            <div key={group} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--sl-t4)]">{group}</p>
              {its.map((it) => {
                const idx = filtered.indexOf(it)
                const active = idx === cursor
                return (
                  <button key={it.id} id={it.id} role="option" aria-selected={active}
                    onMouseEnter={() => setCursor(idx)} onClick={it.run}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] text-[var(--sl-t1)]"
                    style={{ background: active ? 'var(--sl-s2)' : 'transparent' }}>
                    {it.group === 'Perguntar' ? <Sparkles size={14} className="text-[var(--sl-em)]" /> : <ArrowRight size={14} className="text-[var(--sl-t3)]" />}
                    <span className="flex-1">{it.label}</span>
                    {active && <CornerDownLeft size={13} className="text-[var(--sl-t4)]" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
