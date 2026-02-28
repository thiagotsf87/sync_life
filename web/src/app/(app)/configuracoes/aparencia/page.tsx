'use client'

import { useState, useEffect, useRef } from 'react'
import { useShellStore } from '@/stores/shell-store'
import { useUserPlan } from '@/hooks/use-user-plan'
import { createClient } from '@/lib/supabase/client'
import type { ThemeId, ResolvedThemeId } from '@/types/shell'
import { PRO_THEMES } from '@/types/shell'
import { UpgradeModal } from '@/components/modals/UpgradeModal'
import { Check, Lock, Crosshair, Sparkles, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Theme metadata for preview cards ──────────────────────────── */

interface ThemeMeta {
  id: ResolvedThemeId
  name: string
  bg: string
  s1: string
  accent: string
  type: 'dark' | 'light'
  plan: 'free' | 'pro'
}

const THEME_META: ThemeMeta[] = [
  { id: 'navy-dark', name: 'Navy Dark', bg: '#03071a', s1: '#07112b', accent: '#10b981', type: 'dark', plan: 'free' },
  { id: 'clean-light', name: 'Clean Light', bg: '#e6eef5', s1: '#ffffff', accent: '#10b981', type: 'light', plan: 'free' },
  { id: 'mint-garden', name: 'Mint Garden', bg: '#c8f0e4', s1: '#ffffff', accent: '#10b981', type: 'light', plan: 'free' },
  { id: 'obsidian', name: 'Obsidian', bg: '#0a0a0f', s1: '#12121a', accent: '#d4a853', type: 'dark', plan: 'pro' },
  { id: 'rosewood', name: 'Rosewood', bg: '#0f0a0d', s1: '#1a1216', accent: '#c17d6a', type: 'dark', plan: 'pro' },
  { id: 'arctic', name: 'Arctic', bg: '#f0f4f8', s1: '#ffffff', accent: '#0891b2', type: 'light', plan: 'pro' },
  { id: 'graphite', name: 'Graphite', bg: '#111114', s1: '#1a1a1e', accent: '#a0a0b8', type: 'dark', plan: 'pro' },
  { id: 'twilight', name: 'Twilight', bg: '#0c0a14', s1: '#14111f', accent: '#8b5cf6', type: 'dark', plan: 'pro' },
  { id: 'sahara', name: 'Sahara', bg: '#f5f0e8', s1: '#fffcf6', accent: '#c2703e', type: 'light', plan: 'pro' },
]

const FREE_META = THEME_META.filter((t) => t.plan === 'free')
const PRO_META = THEME_META.filter((t) => t.plan === 'pro')

/* ── Component ─────────────────────────────────────────────────── */

export default function AparenciaPage() {
  const theme = useShellStore((s) => s.theme)
  const setTheme = useShellStore((s) => s.setTheme)
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)
  const { isFree } = useUserPlan()

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(theme)
  const [selectedMode, setSelectedMode] = useState(mode)
  const [toastMsg, setToastMsg] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: 'jornada' | 'theme'; themeName?: string }>({ open: false, feature: 'theme' })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

  useEffect(() => {
    setSelectedMode(mode)
  }, [mode])

  /* ── Helpers ──────────────────────────────────────────────────── */

  function showNotification(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    setShowToast(true)
    toastTimer.current = setTimeout(() => setShowToast(false), 3500)
  }

  async function persistTheme(themeId: ThemeId) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ theme: themeId })
          .eq('id', user.id)
      }
    } catch {
      // Silent fail — local state already updated
    }
  }

  async function persistMode(m: 'foco' | 'jornada') {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ mode: m })
          .eq('id', user.id)
      }
    } catch {
      // Silent fail
    }
  }

  function handleThemeSelect(id: ThemeId) {
    if (id === selectedTheme) return

    // Check PRO gate
    if (id !== 'system' && isFree && PRO_THEMES.includes(id as ResolvedThemeId)) {
      const meta = THEME_META.find((t) => t.id === id)
      setUpgradeModal({ open: true, feature: 'theme', themeName: meta?.name })
      return
    }

    setSelectedTheme(id)
    setTheme(id)
    persistTheme(id)

    const label = id === 'system' ? 'Automatico' : THEME_META.find((t) => t.id === id)?.name ?? id
    showNotification(`Tema "${label}" aplicado`)
  }

  function handleModeSelect(m: 'foco' | 'jornada') {
    if (m === selectedMode) return

    // PRO gate for Jornada
    if (m === 'jornada' && isFree) {
      setUpgradeModal({ open: true, feature: 'jornada' })
      return
    }

    setSelectedMode(m)
    setMode(m)
    persistMode(m)

    showNotification(
      m === 'foco'
        ? 'Modo Foco ativado'
        : 'Modo Jornada ativado',
    )
  }

  /* ── Theme preview card ──────────────────────────────────────── */

  function ThemeCard({ meta }: { meta: ThemeMeta }) {
    const isSelected = selectedTheme === meta.id
    const isLocked = isFree && meta.plan === 'pro'

    return (
      <button
        onClick={() => handleThemeSelect(meta.id)}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-xl p-2.5 transition-all cursor-pointer',
          'border-2',
          isSelected
            ? 'border-[var(--sl-accent,#10b981)] bg-[var(--sl-s2)]'
            : 'border-[var(--sl-border)] bg-[var(--sl-s1)] hover:border-[var(--sl-border-h)]',
        )}
      >
        {/* Mini preview rectangle */}
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{ height: 72, background: meta.bg }}
        >
          {/* Simulated card inside */}
          <div
            className="absolute bottom-2 left-2 right-2 rounded-md"
            style={{ height: 28, background: meta.s1, border: `1px solid ${meta.type === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
          />
          {/* Accent bar */}
          <div
            className="absolute top-2 left-2 rounded-full"
            style={{ width: 24, height: 4, background: meta.accent }}
          />
          {/* Accent dot */}
          <div
            className="absolute top-2 right-2 rounded-full"
            style={{ width: 6, height: 6, background: meta.accent }}
          />

          {/* Lock overlay for PRO */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <Lock size={16} className="text-white/70" />
            </div>
          )}

          {/* Selected check */}
          {isSelected && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--sl-accent,#10b981)] flex items-center justify-center">
              <Check size={10} className="text-white" />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[var(--sl-t1)]">
            {meta.name}
          </span>
          {meta.plan === 'pro' && (
            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[rgba(168,85,247,0.15)] text-[#a855f7]">
              PRO
            </span>
          )}
        </div>
      </button>
    )
  }

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="max-w-[680px]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">
        Aparencia
      </h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Personalize o visual e o modo de uso do SyncLife.
      </p>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — Tema
         ══════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Tema
        </p>

        {/* System / Auto option */}
        <button
          onClick={() => handleThemeSelect('system')}
          className={cn(
            'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer mb-5',
            selectedTheme === 'system'
              ? 'border-[var(--sl-accent,#10b981)] bg-[rgba(16,185,129,0.05)]'
              : 'border-[var(--sl-border)] bg-[var(--sl-s1)] hover:border-[var(--sl-border-h)]',
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--sl-s3)] flex items-center justify-center shrink-0">
            <Monitor size={18} className="text-[var(--sl-t2)]" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Automatico</p>
            <p className="text-[11px] text-[var(--sl-t3)] leading-snug">
              Segue o tema do sistema operacional
            </p>
          </div>
          {selectedTheme === 'system' && (
            <div className="w-5 h-5 rounded-full bg-[var(--sl-accent,#10b981)] flex items-center justify-center shrink-0">
              <Check size={10} className="text-white" />
            </div>
          )}
        </button>

        {/* Free themes */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-2.5">
          Gratuitos
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-5 max-sm:grid-cols-2">
          {FREE_META.map((meta) => (
            <ThemeCard key={meta.id} meta={meta} />
          ))}
        </div>

        {/* PRO themes */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-2.5">
          Pro
        </p>
        <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-2">
          {PRO_META.map((meta) => (
            <ThemeCard key={meta.id} meta={meta} />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — Modo
         ══════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Modo de Uso
        </p>

        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {/* ── Foco card ────────────────────────────────────────── */}
          <button
            onClick={() => handleModeSelect('foco')}
            className={cn(
              'relative text-left border-2 rounded-2xl p-5 transition-all cursor-pointer overflow-hidden',
              selectedMode === 'foco'
                ? 'border-[#10b981] bg-[rgba(16,185,129,0.05)]'
                : 'border-[var(--sl-border)] bg-[var(--sl-s3)] hover:border-[var(--sl-border-h)]',
            )}
          >
            {/* Check badge */}
            <div
              className={cn(
                'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                selectedMode === 'foco'
                  ? 'border-[#10b981] bg-[#10b981]'
                  : 'border-[var(--sl-border-h)]',
              )}
            >
              {selectedMode === 'foco' && <Check size={10} className="text-white" />}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center">
                <Crosshair size={20} className="text-[#10b981]" />
              </div>
            </div>

            <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] mb-1.5">
              Modo Foco
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] leading-snug mb-3">
              Interface limpa e objetiva.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {['Dados diretos', 'Sem distracoes'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.10)] text-[#10b981]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* ── Jornada card ─────────────────────────────────────── */}
          <button
            onClick={() => handleModeSelect('jornada')}
            className={cn(
              'relative text-left border-2 rounded-2xl p-5 transition-all cursor-pointer overflow-hidden',
              selectedMode === 'jornada'
                ? 'border-[#0055ff] bg-[rgba(0,85,255,0.05)]'
                : 'border-[var(--sl-border)] bg-[var(--sl-s3)] hover:border-[var(--sl-border-h)]',
            )}
          >
            {/* Check badge */}
            <div
              className={cn(
                'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                selectedMode === 'jornada'
                  ? 'border-[#0055ff] bg-[#0055ff]'
                  : 'border-[var(--sl-border-h)]',
              )}
            >
              {selectedMode === 'jornada' && <Check size={10} className="text-white" />}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,85,255,0.12)] flex items-center justify-center">
                <Sparkles size={20} className="text-[#6e9fff]" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[rgba(168,85,247,0.15)] text-[#a855f7]">
                PRO
              </span>
            </div>

            <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] mb-1.5">
              Modo Jornada
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] leading-snug mb-3">
              Interface motivacional com IA.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {['Insights IA', 'Gamificacao', 'Reviews', 'Celebracoes'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(0,85,255,0.10)] text-[#6e9fff]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          Upgrade Modal
         ══════════════════════════════════════════════════════════ */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal((s) => ({ ...s, open: false }))}
        feature={upgradeModal.feature}
        themeName={upgradeModal.themeName}
      />

      {/* ══════════════════════════════════════════════════════════
          Toast notification
         ══════════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--sl-s1)] border border-[var(--sl-border)] shadow-lg text-[13px] font-medium text-[var(--sl-t1)] transition-all duration-300"
        style={{
          opacity: showToast ? 1 : 0,
          transform: showToast
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(12px)',
          pointerEvents: showToast ? 'auto' : 'none',
        }}
      >
        <Check size={14} className="text-[#10b981] shrink-0" />
        {toastMsg}
      </div>
    </div>
  )
}
