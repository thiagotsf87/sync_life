'use client'

import { useCallback, useEffect, useState } from 'react'

export function coachCacheKey(resource: string, moduleId: string, period: string) {
  return `sl_coach_${resource}_${moduleId}_${period}`
}

function readCache<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null } catch { return null }
}
function writeCache<T>(key: string, val: T) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

interface CoachResource<T> { data: T | null; loading: boolean; error: string | null; regenerate: () => void }

/** POST genérico com cache localStorage por módulo+período. */
function useCoachResource<T>(resource: string, endpoint: string, moduleId: string, period: string, body: Record<string, unknown>): CoachResource<T> {
  const key = coachCacheKey(resource, moduleId, period)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIt = useCallback(async (force: boolean) => {
    if (!force) { const cached = readCache<T>(key); if (cached) { setData(cached); return } }
    setLoading(true); setError(null)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(String(res.status))
      const json = (await res.json()) as T
      setData(json); writeCache(key, json)
    } catch { setError('Não consegui gerar agora.') } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, endpoint])

  useEffect(() => { void fetchIt(false) }, [fetchIt])
  return { data, loading, error, regenerate: () => void fetchIt(true) }
}

export function useCoachBrief(moduleId: string, period: string) {
  return useCoachResource('brief', '/api/ai/coach-brief', moduleId, period, { moduleId, period })
}
export function useCoachWhisper(moduleId: string, period: string) {
  return useCoachResource('whisper', '/api/ai/coach-whisper', moduleId, period, { moduleId })
}
export function useCoachCross(moduleId: string, period: string) {
  return useCoachResource('cross', '/api/ai/coach-cross', moduleId, period, { moduleId })
}
