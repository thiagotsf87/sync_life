import { createClient } from '@/lib/supabase/client'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  pinned_modules: string[]
  integration_settings: Record<string, boolean>
  notification_settings: Record<string, unknown>
}

// ─── IN-MEMORY CACHE ───────────────────────────────────────────────────────────
// Populated by AppShell on mount, read by cross-module and notifications

let _integrationCache: Record<string, boolean> | null = null
let _notifCache: Record<string, unknown> | null = null

export function getCachedIntegrationSettings(): Record<string, boolean> | null {
  return _integrationCache
}

export function getCachedNotifSettings(): Record<string, unknown> | null {
  return _notifCache
}

export function setCachedIntegrationSettings(settings: Record<string, boolean>) {
  _integrationCache = settings
}

export function setCachedNotifSettings(settings: Record<string, unknown>) {
  _notifCache = settings
}

// ─── FETCH ─────────────────────────────────────────────────────────────────────

export async function fetchUserPreferences(userId: string): Promise<UserPreferences | null> {
  const sb = createClient() as any
  const { data, error } = await sb
    .from('profiles')
    .select('pinned_modules, integration_settings, notification_settings')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    pinned_modules: data.pinned_modules ?? ['financas', 'tempo'],
    integration_settings: data.integration_settings ?? {},
    notification_settings: data.notification_settings ?? {},
  }
}

// ─── SAVE ──────────────────────────────────────────────────────────────────────

export async function saveUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>,
): Promise<void> {
  const sb = createClient() as any
  const update: Record<string, unknown> = {}

  if (prefs.pinned_modules !== undefined) update.pinned_modules = prefs.pinned_modules
  if (prefs.integration_settings !== undefined) update.integration_settings = prefs.integration_settings
  if (prefs.notification_settings !== undefined) update.notification_settings = prefs.notification_settings

  if (Object.keys(update).length === 0) return

  await sb.from('profiles').update(update).eq('id', userId)
}

// ─── HYDRATE ───────────────────────────────────────────────────────────────────
// Called once by AppShell on mount to sync Supabase → localStorage + memory cache

export async function hydratePreferences(userId: string): Promise<void> {
  const prefs = await fetchUserPreferences(userId)
  if (!prefs) return

  // Populate memory caches
  setCachedIntegrationSettings(prefs.integration_settings)
  setCachedNotifSettings(prefs.notification_settings)

  // Mirror to localStorage for anti-FOUC and backwards compat
  if (typeof window !== 'undefined') {
    try {
      if (Object.keys(prefs.integration_settings).length > 0) {
        localStorage.setItem('sl_integrations_settings', JSON.stringify(prefs.integration_settings))
      }
      if (Object.keys(prefs.notification_settings).length > 0) {
        localStorage.setItem('sl_notif_settings', JSON.stringify(prefs.notification_settings))
      }
      if (prefs.pinned_modules.length > 0) {
        localStorage.setItem('sl_pinned_modules', JSON.stringify(prefs.pinned_modules))
      }
    } catch {
      // localStorage full or blocked — non-critical
    }
  }
}
