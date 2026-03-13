'use client'

import { useState, useEffect, useRef } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { useUserPlan } from '@/hooks/use-user-plan'
import { createClient } from '@/lib/supabase/client'
import type { ThemeId, ResolvedThemeId } from '@/types/shell'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { Check, Lock, Monitor } from 'lucide-react'
import { ToggleSwitch } from '@/components/settings/toggle-switch'
import { cn } from '@/lib/utils'

interface ThemeMeta {
  id: ResolvedThemeId
  name: string
  bg: string
  s1: string
  accent: string
  accentSm: string
  type: 'dark' | 'light'
  plan: 'free' | 'pro'
}

const THEME_META: ThemeMeta[] = [
  { id: 'navy-dark',    name: 'Navy Dark',    bg: '#07112b', s1: '#0c1a3a', accent: '#10b981', accentSm: '#6e90b8', type: 'dark',  plan: 'free' },
  { id: 'clean-light',  name: 'Clean Light',  bg: '#f0f4f8', s1: '#ffffff', accent: '#10b981', accentSm: '#64748b', type: 'light', plan: 'free' },
  { id: 'mint-garden',  name: 'Mint Garden',  bg: '#e8f5f0', s1: '#ffffff', accent: '#10b981', accentSm: '#0ea5e9', type: 'light', plan: 'free' },
  { id: 'obsidian',     name: 'Obsidian',     bg: '#1a1a2e', s1: '#12121a', accent: '#e2a03f', accentSm: '#4a4a6a', type: 'dark',  plan: 'pro' },
  { id: 'rosewood',     name: 'Rosewood',     bg: '#2d1f2f', s1: '#1a1216', accent: '#e88a8a', accentSm: '#8a6a6a', type: 'dark',  plan: 'pro' },
  { id: 'carbon',       name: 'Carbon',       bg: '#050505', s1: '#0e0e0e', accent: '#14b8a6', accentSm: '#2dd4bf', type: 'dark',  plan: 'pro' },
  { id: 'arctic',       name: 'Arctic',       bg: '#e8f0f8', s1: '#ffffff', accent: '#3b82f6', accentSm: '#94a3b8', type: 'light', plan: 'pro' },
  { id: 'graphite',     name: 'Graphite',     bg: '#1f1f1f', s1: '#0e0e0e', accent: '#94a3b8', accentSm: '#525252', type: 'dark',  plan: 'pro' },
  { id: 'twilight',     name: 'Twilight',     bg: '#0f1a2e', s1: '#14111f', accent: '#818cf8', accentSm: '#475569', type: 'dark',  plan: 'pro' },
  { id: 'sahara',       name: 'Sahara',       bg: '#f5f0e8', s1: '#fffcf6', accent: '#d4a574', accentSm: '#a08060', type: 'light', plan: 'pro' },
  { id: 'blossom',      name: 'Blossom',      bg: '#faf0f3', s1: '#ffffff', accent: '#e0638b', accentSm: '#f08aaa', type: 'light', plan: 'pro' },
  { id: 'serenity',     name: 'Serenity',     bg: '#edf2ff', s1: '#ffffff', accent: '#4f6df5', accentSm: '#7b93f8', type: 'light', plan: 'pro' },
]

const FREE_META = THEME_META.filter((t) => t.plan === 'free')
const PRO_META  = THEME_META.filter((t) => t.plan === 'pro')

interface InterfaceSettings {
  sidebarExpanded: boolean
  reducedMotion: boolean
  compactNumbers: boolean
}

export default function AparenciaPage() {
  const theme      = useShellStore((s) => s.theme)
  const setTheme   = useShellStore((s) => s.setTheme)
  const { isFree } = useUserPlan()

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(theme)
  const [autoMode, setAutoMode]           = useState(theme === 'system')
  const [toastMsg, setToastMsg]           = useState('')
  const [showToast, setShowToast]         = useState(false)
  const [upgradeModal, setUpgradeModal]   = useState<{ open: boolean; themeName?: string }>({ open: false })
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
    const label = id === 'system' ? 'Automático' : (THEME_META.find((t) => t.id === id)?.name ?? id)
    showNotification(`Tema "${label}" aplicado`)
  }

  function handleAutoToggle(on: boolean) {
    if (on) { handleThemeSelect('system') }
    else {
      // Revert to navy-dark as default when turning off auto
      handleThemeSelect('navy-dark')
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
    const isLocked   = isFree && meta.plan === 'pro'

    return (
      <button
        onClick={() => handleThemeSelect(meta.id)}
        className={cn(
          'relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
          isLocked ? 'opacity-70' : '',
          isSelected
            ? 'border-[#10b981]'
            : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
        )}
      >
        {/* Mini preview */}
        <div className="h-[60px] flex flex-col gap-1 p-2" style={{ background: meta.bg }}>
          <div className="h-[6px] rounded-full w-[60%]" style={{ background: meta.accent }} />
          <div className="h-[4px] rounded-full w-[40%] opacity-50" style={{ background: meta.accentSm }} />
        </div>

        {/* Name */}
        <div className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s1)' }}>
          {meta.name}
          {meta.plan === 'pro' && (
            <span className="text-[8px] font-bold px-1 py-0.5 rounded text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)' }}>
              PRO
            </span>
          )}
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Lock size={16} className="text-white/70" />
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center">
            <Check size={10} className="text-white" />
          </div>
        )}
      </button>
    )
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Aparência</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-5">Personalize o visual do SyncLife do seu jeito.</p>

      {/* ── Automático ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-3 flex items-center gap-3 transition-colors hover:border-[var(--sl-border-h)]">
        <div className="text-[24px]">🖥️</div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[var(--sl-t1)]">Automático</p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Segue o tema do sistema operacional</p>
        </div>
        <ToggleSwitch checked={autoMode} onChange={handleAutoToggle} />
      </div>

      {/* ── Temas Gratuitos ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-3">Gratuitos</p>
        <div className="grid grid-cols-2 gap-2.5">
          {FREE_META.map((meta) => <ThemeCard key={meta.id} meta={meta} />)}
        </div>
      </div>

      {/* ── Temas PRO ── */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-3">PRO ✨</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {PRO_META.map((meta) => <ThemeCard key={meta.id} meta={meta} />)}
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

      {/* ── UpgradeModal ── */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false })}
        feature="theme"
        themeName={upgradeModal.themeName}
      />

      {/* ── Toast ── */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--sl-s1)] border border-[var(--sl-border)] shadow-lg text-[13px] font-medium text-[var(--sl-t1)] transition-all duration-300"
        style={{
          opacity: showToast ? 1 : 0,
          transform: showToast ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(10px)',
          pointerEvents: showToast ? 'auto' : 'none',
        }}
      >
        <Check size={14} className="text-[#10b981] shrink-0" />
        {toastMsg}
      </div>
    </div>
  )
}
