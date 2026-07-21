'use client'

import { useCallback, useEffect, useState } from 'react'
import { COACH_OS_ENABLED } from '@/lib/flags'

export function coachCacheKey(resource: string, moduleId: string, period: string) {
  return `sl_coach_${resource}_${moduleId}_${period}`
}

function readCache<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null } catch { return null }
}
function writeCache<T>(key: string, val: T) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

interface CoachResource<T> { data: T | null; loading: boolean; error: string | null; regenerate: () => void }

/** POST genérico com cache localStorage por módulo+período. `enabled: false` desliga fetch e regenerate. */
function useCoachResource<T>(resource: string, endpoint: string, moduleId: string, period: string, body: Record<string, unknown>, enabled = true): CoachResource<T> {
  const key = coachCacheKey(resource, moduleId, period)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIt = useCallback(async (force: boolean) => {
    if (!enabled) return
    if (!force) { const cached = readCache<T>(key); if (cached) { setData(cached); return } }
    setLoading(true); setError(null)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(String(res.status))
      const json = (await res.json()) as T
      setData(json); writeCache(key, json)
    } catch { setError('Não consegui gerar agora.') } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, endpoint, enabled])

  useEffect(() => { void fetchIt(false) }, [fetchIt])
  return { data, loading, error, regenerate: () => void fetchIt(true) }
}

// Kill-switch (NEXT_PUBLIC_COACH_OS=off): com a flag desligada, nenhum hook coach chama a API de IA.
export function useCoachBrief(moduleId: string, period: string) {
  return useCoachResource('brief', '/api/ai/coach-brief', moduleId, period, { moduleId, period }, COACH_OS_ENABLED)
}
export function useCoachWhisper(moduleId: string, period: string) {
  return useCoachResource('whisper', '/api/ai/coach-whisper', moduleId, period, { moduleId }, COACH_OS_ENABLED)
}
export function useCoachCross(moduleId: string, period: string) {
  return useCoachResource('cross', '/api/ai/coach-cross', moduleId, period, { moduleId }, COACH_OS_ENABLED)
}
