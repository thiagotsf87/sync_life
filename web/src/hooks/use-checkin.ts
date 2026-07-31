'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type Mood = 1 | 2 | 3 | 4 | 5

export const MOOD_LABELS: Record<Mood, string> = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Neutro',
  4: 'Bem',
  5: 'Ótimo',
}

export interface CheckinToday {
  mood: number
  note: string | null
  created_at: string
}

// Supabase client typing — cast no boundary de escrita, padrão dos hooks vizinhos
// (schema manual resolve writes para `never`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SbClient = any

interface UseCheckinReturn {
  checkin: CheckinToday | null
  loading: boolean
  unavailable: boolean
  save: (mood: number, note?: string) => Promise<boolean>
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SP_TZ = 'America/Sao_Paulo'

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo, independente do fuso da máquina. */
function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Check-in de humor do dia (tabela daily_checkins).
 * Degradação graciosa: qualquer erro de leitura (tabela ausente incluso)
 * vira `unavailable: true` e a UI esconde a banda sem quebrar.
 */
export function useCheckin(): UseCheckinReturn {
  const [checkin, setCheckin] = useState<CheckinToday | null>(null)
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('daily_checkins')
          .select('mood, note, created_at')
          .eq('user_id', user.id)
          .eq('checkin_date', todayLocal())
          .maybeSingle()

        if (cancelled) return

        if (error) {
          setUnavailable(true)
          setLoading(false)
          return
        }

        setCheckin(data ?? null)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setUnavailable(true)
          setLoading(false)
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  const save = useCallback(async (mood: number, note?: string): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const trimmed = note?.trim()
      const sb = supabase as SbClient
      const { data, error }: { data: CheckinToday | null; error: unknown } = await sb
        .from('daily_checkins')
        .upsert(
          {
            user_id: user.id,
            checkin_date: todayLocal(),
            mood,
            note: trimmed ? trimmed : null,
          },
          { onConflict: 'user_id,checkin_date' },
        )
        .select('mood, note, created_at')
        .single()

      if (error || !data) return false

      setCheckin(data)
      return true
    } catch {
      return false
    }
  }, [])

  return { checkin, loading, unavailable, save }
}
