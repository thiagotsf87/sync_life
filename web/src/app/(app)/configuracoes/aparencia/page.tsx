'use client'

import { useState, useEffect, useRef } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { createClient } from '@/lib/supabase/client'
import type { ThemeId } from '@/types/shell'
import { Check, Monitor } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { ToggleRow } from '@/components/ui/toggle-row'
import { ToggleSwitch } from '@/components/settings/toggle-switch'
import { cn } from '@/lib/utils'

interface ThemeMeta {
  id: ThemeId
  label: string
  type: 'dark' | 'light'
  bg: string
  surface: string
  accent: string
}

const THEME_META: ThemeMeta[] = [
  { id: 'navy-deep' as ThemeId, label: 'Navy Deep', type: 'dark',  bg: '#0B0F14', surface: '#131922', accent: '#0F766E' },
  { id: 'midnight'  as ThemeId, label: 'Midnight',  type: 'dark',  bg: '#0F0B1F', surface: '#161232', accent: '#0F766E' },
  { id: 'charcoal'  as ThemeId, label: 'Charcoal',  type: 'dark',  bg: '#181818', surface: '#222222', accent: '#0F766E' },
  { id: 'cream'     as ThemeId, label: 'Cream',     type: 'light', bg: '#F5F2EC', surface: '#FFFFFF', accent: '#0F766E' },
]

interface InterfaceSettings {
  sidebarExpanded: boolean
  reducedMotion: boolean
  compactNumbers: boolean
}

/* ─── FormCard ─────────────────────────────────────────────────────────── */
function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex flex-col gap-4">
      {children}
    </article>
  )
}

export default function AparenciaPage() {
  const theme = useShellStore((s) => s.theme)
  const setTheme = useShellStore((s) => s.setTheme)

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(theme)
  const [autoMode, setAutoMode] = useState(theme === 'system')
  const [toastMsg, setToastMsg] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [iface, setIface] = useState<InterfaceSettings>({
    sidebarExpanded: true,
    reducedMotion: false,
    compactNumbers: false,
  })
  const [userId, setUserId] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Load profile ─────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = (await (supabase as any)
        .from('profiles')
        .select('sidebar_expanded, reduced_motion, compact_numbers')
        .eq('id', user.id)
        .single()) as {
        data: {
          sidebar_expanded: boolean | null
          reduced_motion: boolean | null
          compact_numbers: boolean | null
        } | null
      }

      if (data) {
        setIface({
          sidebarExpanded: data.sidebar_expanded ?? true,
          reducedMotion: data.reduced_motion ?? false,
          compactNumbers: data.compact_numbers ?? false,
        })
      }

      if (typeof window !== 'undefined' && theme === 'system') setAutoMode(true)
    }
    load()
  }, [theme])

  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

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
    } catch (err) {
      console.warn('[Settings] Falha ao persistir tema:', err)
    }
  }

  async function persistIface(updates: Partial<InterfaceSettings>) {
    if (!userId) return
    const map: Record<string, string> = {
      sidebarExpanded: 'sidebar_expanded',
      reducedMotion: 'reduced_motion',
      compactNumbers: 'compact_numbers',
    }
    const dbUpdates: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(updates)) {
      dbUpdates[map[k]] = v as boolean
    }
    try {
      const supabase = createClient()
      await (supabase as any).from('profiles').update(dbUpdates).eq('id', userId)
    } catch (err) {
      console.warn('[Settings] Falha ao persistir interface:', err)
    }
  }

  function handleThemeSelect(id: ThemeId) {
    if (id === selectedTheme) return
    setAutoMode(id === 'system')
    setSelectedTheme(id)
    setTheme(id)
    persistTheme(id)
    const label = id === 'system' ? 'Automático' : THEME_META.find((t) => t.id === id)?.label ?? id
    showNotification(`Tema "${label}" aplicado.`)
  }

  function handleAutoToggle(on: boolean) {
    if (on) {
      handleThemeSelect('system')
    } else {
      const prefersDark =
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
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
          'relative rounded-[14px] overflow-hidden border-2 transition-all cursor-pointer text-left',
          isSelected
            ? 'border-[var(--sl-em)]'
            : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
        )}
      >
        {/* Preview */}
        <div className="h-[88px] flex flex-col gap-1.5 p-3" style={{ background: meta.bg }}>
          <div className="h-[6px] rounded-full w-[60%]" style={{ background: meta.accent }} />
          <div
            className="h-[5px] rounded-full w-[40%] opacity-50"
            style={{ background: meta.surface }}
          />
          <div
            className="h-[5px] rounded-full w-[28%] opacity-30"
            style={{ background: meta.surface }}
          />
        </div>

        {/* Label row */}
        <div
          className="flex items-center justify-between px-3 py-2 text-[12px] font-medium text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s1)' }}
        >
          <span>{meta.label}</span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--sl-t3)]">
            {meta.type === 'dark' ? 'Dark' : 'Light'}
          </span>
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--sl-em)] flex items-center justify-center">
            <Check size={11} className="text-white" />
          </div>
        )}
      </button>
    )
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="max-w-[980px] py-2 flex flex-col gap-5">
      {/* TopBar */}
      <header>
        <p className="font-[DM_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
          CONFIGURAÇÕES · APARÊNCIA
        </p>
        <h1 className="font-[Space_Grotesk] font-bold text-[32px] tracking-[-0.02em] text-[var(--sl-t1)]">
          Como você quer ver o SyncLife
        </h1>
      </header>

      {/* ─── 01 · MODO AUTOMÁTICO ────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="01 · MODO AUTOMÁTICO"
          title="Acompanhe o sistema"
          sub="Alterna entre claro e escuro conforme o seu sistema operacional."
        />
        <div className="flex items-center gap-3">
          <Monitor size={22} className="text-[var(--sl-t3)] shrink-0" />
          <div className="flex-1">
            <p className="text-[13.5px] font-medium text-[var(--sl-t1)]">Automático</p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">
              Segue o tema do sistema operacional.
            </p>
          </div>
          <ToggleSwitch checked={autoMode} onChange={handleAutoToggle} />
        </div>
      </FormCard>

      {/* ─── 02 · TEMA ────────────────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="02 · TEMA"
          title="Escolha sua paleta"
          sub="Quatro presets cuidadosamente calibrados."
        />
        <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
          {THEME_META.map((meta) => (
            <ThemeCard key={meta.id} meta={meta} />
          ))}
        </div>
      </FormCard>

      {/* ─── 03 · INTERFACE ───────────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="03 · INTERFACE"
          title="Densidade e comportamento"
          sub="Ajustes finos para o seu fluxo de trabalho."
        />
        <div>
          <ToggleRow
            label="Sidebar expandida por padrão"
            sub="Mostra rótulos dos itens ao abrir o app."
            checked={iface.sidebarExpanded}
            onChange={(v) => handleIfaceToggle('sidebarExpanded', v)}
          />
          <ToggleRow
            label="Animações reduzidas"
            sub="Minimiza animações para maior conforto visual."
            checked={iface.reducedMotion}
            onChange={(v) => handleIfaceToggle('reducedMotion', v)}
          />
          <ToggleRow
            label="Números compactos"
            sub="Exibe R$ 1,2k em vez de R$ 1.234,56."
            checked={iface.compactNumbers}
            onChange={(v) => handleIfaceToggle('compactNumbers', v)}
          />
        </div>
      </FormCard>

      {/* ─── Toast ────────────────────────────────────────────── */}
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
