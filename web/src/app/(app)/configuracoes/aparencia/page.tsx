'use client'

import { useState, useEffect, useRef } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { createClient } from '@/lib/supabase/client'
import type { ThemeId } from '@/types/shell'
import { Check, Monitor } from 'lucide-react'
import { ToggleSwitch } from '@/components/settings/toggle-switch'
import { cn } from '@/lib/utils'

interface ThemeMeta {
  id: ThemeId
  label: string
  bg: string
  surface: string
  accent: string
  type: 'dark' | 'light'
}

const THEME_META: ThemeMeta[] = [
  {
    id: 'navy-deep' as ThemeId,
    label: 'Navy Deep',
    type: 'dark',
    bg: '#0B0F14',
    surface: '#131922',
    accent: '#0F766E',
  },
  {
    id: 'midnight' as ThemeId,
    label: 'Midnight',
    type: 'dark',
    bg: '#0F0B1F',
    surface: '#161232',
    accent: '#0F766E',
  },
  {
    id: 'charcoal' as ThemeId,
    label: 'Charcoal',
    type: 'dark',
    bg: '#181818',
    surface: '#222222',
    accent: '#0F766E',
  },
  {
    id: 'cream' as ThemeId,
    label: 'Cream',
    type: 'light',
    bg: '#F5F2EC',
    surface: '#FFFFFF',
    accent: '#0F766E',
  },
]

interface InterfaceSettings {
  sidebarExpanded: boolean
  reducedMotion: boolean
  compactNumbers: boolean
}

export default function AparenciaPage() {
  const theme      = useShellStore((s) => s.theme)
  const setTheme   = useShellStore((s) => s.setTheme)

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(theme)
  const [autoMode, setAutoMode]           = useState(theme === 'system')
  const [toastMsg, setToastMsg]           = useState('')
  const [showToast, setShowToast]         = useState(false)
  const [iface, setIface]                 = useState<InterfaceSettings>({
    sidebarExpanded: true,
    reducedMotion:   false,
    compactNumbers:  false,
  })
  const [userId, setUserId]               = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Load profile ─────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = (await (supabase as any)
        .from('profiles')
        .select('sidebar_expanded, reduced_motion, compact_numbers')
        .eq('id', user.id)
        .single()) as { data: { sidebar_expanded: boolean | null; reduced_motion: boolean | null; compact_numbers: boolean | null } | null }

      if (data) {
        setIface({
          sidebarExpanded: data.sidebar_expanded ?? true,
          reducedMotion:   data.reduced_motion   ?? false,
          compactNumbers:  data.compact_numbers  ?? false,
        })
      }

      // Detect system preference as default for auto mode
      if (typeof window !== 'undefined' && theme === 'system') setAutoMode(true)
    }
    load()
  }, [theme])

  useEffect(() => { setSelectedTheme(theme) }, [theme])

  /* ── Helpers ──────────────────────────────────────────────────── */
  function showNotification(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setShowToast(true)
    toastTimer.current = setTimeout(() => setShowToast(false), 3000)
  }

  async function persistTheme(themeId: ThemeId) {
    if (!userId) return
    try {
      const supabase = createClient()
      await (supabase as any).from('profiles').update({ theme: themeId }).eq('id', userId)
    } catch (err) { console.warn('[Settings] Falha ao persistir tema:', err) }
  }

  async function persistIface(updates: Partial<InterfaceSettings>) {
    if (!userId) return
    const map: Record<string, string> = {
      sidebarExpanded: 'sidebar_expanded',
      reducedMotion:   'reduced_motion',
      compactNumbers:  'compact_numbers',
    }
    const dbUpdates: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(updates)) {
      dbUpdates[map[k]] = v as boolean
    }
    try {
      const supabase = createClient()
      await (supabase as any).from('profiles').update(dbUpdates).eq('id', userId)
    } catch (err) { console.warn('[Settings] Falha ao persistir interface:', err) }
  }

  function handleThemeSelect(id: ThemeId) {
    if (id === selectedTheme) return
    setAutoMode(id === 'system')
    setSelectedTheme(id)
    setTheme(id)
    persistTheme(id)
    const label = id === 'system' ? 'Automático' : (THEME_META.find((t) => t.id === id)?.label ?? id)
    showNotification(`Tema "${label}" aplicado`)
  }

  function handleAutoToggle(on: boolean) {
    if (on) { handleThemeSelect('system') }
    else {
      // Revert to default theme when turning off auto
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      handleThemeSelect(prefersDark ? 'navy-deep' : 'cream')
    }
  }

  function handleIfaceToggle(key: keyof InterfaceSettings, value: boolean) {
    const next = { ...iface, [key]: value }
    setIface(next)
    persistIface({ [key]: value })
    if (key === 'reducedMotion') {
      document.body.classList.toggle('reduced-motion', value)
    }
  }

  /* ── Theme Card ───────────────────────────────────────────────── */
  function ThemeCard({ meta }: { meta: ThemeMeta }) {
    const isSelected = selectedTheme === meta.id

    return (
      <button
        onClick={() => handleThemeSelect(meta.id)}
        className={cn(
          'relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
          isSelected
            ? 'border-[var(--sl-em)]'
            : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
        )}
      >
        {/* Mini preview */}
        <div className="h-[60px] flex flex-col gap-1 p-2" style={{ background: meta.bg }}>
          <div className="h-[6px] rounded-full w-[60%]" style={{ background: meta.accent }} />
          <div className="h-[4px] rounded-full w-[40%] opacity-40" style={{ background: meta.surface }} />
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s1)' }}>
          {meta.label}
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--sl-em)] flex items-center justify-center">
            <Check size={10} className="text-white" />
          </div>
        )}
      </button>
    )
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Space_Grotesk] font-bold text-xl text-[var(--sl-t1)] mb-1">Aparência</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-5">Personalize o visual do SyncLife do seu jeito.</p>

      {/* ── Automático ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-3 flex items-center gap-3 transition-colors hover:border-[var(--sl-border-h)]">
        <Monitor size={22} className="text-[var(--sl-t3)] shrink-0" />
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[var(--sl-t1)]">Automático</p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Segue o tema do sistema operacional</p>
        </div>
        <ToggleSwitch checked={autoMode} onChange={handleAutoToggle} />
      </div>

      {/* ── Temas ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-3">Temas</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {THEME_META.map((meta) => <ThemeCard key={meta.id} meta={meta} />)}
        </div>
      </div>

      {/* ── Interface ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-1">Interface</p>

        {[
          {
            key:   'sidebarExpanded' as const,
            label: 'Sidebar expandida por padrão',
            desc:  'Mostra rótulos dos itens ao abrir o app',
          },
          {
            key:   'reducedMotion' as const,
            label: 'Animações reduzidas',
            desc:  'Minimiza animações para maior conforto visual',
          },
          {
            key:   'compactNumbers' as const,
            label: 'Números compactos',
            desc:  'Exibe R$ 1,2K em vez de R$ 1.234,56',
          },
        ].map(({ key, label, desc }, idx, arr) => (
          <div
            key={key}
            className={cn(
              'flex items-center justify-between gap-4 py-3',
              idx < arr.length - 1 && 'border-b border-[var(--sl-border)]',
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{label}</p>
              <p className="text-[11px] text-[var(--sl-t3)] mt-0.5 leading-snug">{desc}</p>
            </div>
            <ToggleSwitch
              checked={iface[key]}
              onChange={(v) => handleIfaceToggle(key, v)}
            />
          </div>
        ))}
      </div>

      {/* ── Toast ── */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--sl-s1)] border border-[var(--sl-border)] shadow-lg text-[13px] font-medium text-[var(--sl-t1)] transition-all duration-300"
        style={{
          opacity: showToast ? 1 : 0,
          transform: showToast ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(10px)',
          pointerEvents: showToast ? 'auto' : 'none',
        }}
      >
        <Check size={14} className="text-[var(--sl-em)] shrink-0" />
        {toastMsg}
      </div>
    </div>
  )
}
