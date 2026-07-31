'use client'

import { useEffect, useRef, useState } from 'react'
import { COACH_OS_ENABLED } from '@/lib/flags'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface DiarioBriefRec {
  title: string
  detail: string
}

export interface DiarioBrief {
  headline: string
  p1: string
  p2: string
  hand: string
  recs: DiarioBriefRec[]
  basedOn: string
  generatedAt: string
  cached?: boolean
  fallback?: boolean
}

interface UseDiarioBriefReturn {
  brief: DiarioBrief | null
  loading: boolean
  error: string | null
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SP_TZ = 'America/Sao_Paulo'
const NBSP = ' '

/** Normaliza "R$ valor" para NBSP pós-R$ (cobre IA e fallback de uma vez). */
const nbspBRL = (s: string): string => s.replace(/R\$ /g, `R$${NBSP}`)

function normalizeBrief(raw: DiarioBrief): DiarioBrief {
  return {
    ...raw,
    headline: nbspBRL(raw.headline),
    p1: nbspBRL(raw.p1),
    p2: nbspBRL(raw.p2),
    hand: nbspBRL(raw.hand),
    recs: (raw.recs ?? []).map(r => ({ title: nbspBRL(r.title), detail: nbspBRL(r.detail) })),
    basedOn: nbspBRL(raw.basedOn),
  }
}

/** Período atual em pt-BR no fuso de São Paulo, ex. "julho 2026". */
function currentPeriod(): string {
  const now = new Date()
  const mes = now.toLocaleDateString('pt-BR', { timeZone: SP_TZ, month: 'long' })
  const ano = now.toLocaleDateString('en-CA', { timeZone: SP_TZ }).slice(0, 4)
  return `${mes} ${ano}`
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Briefing diário do coach (folha do Diário). POST único no mount, sem retry
 * automático e sem cache local: o cache correto (1 geração/dia) é server-side.
 * Com COACH_OS desligado, pede o fallback determinístico direto (forceFallback).
 */
export function useDiarioBrief(): UseDiarioBriefReturn {
  const [brief, setBrief] = useState<DiarioBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    // Garante 1 POST por montagem lógica (StrictMode roda o effect 2x em dev).
    if (started.current) return
    started.current = true

    async function load() {
      try {
        const res = await fetch('/api/ai/diario-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period: currentPeriod(),
            ...(COACH_OS_ENABLED ? {} : { forceFallback: true }),
          }),
        })

        if (res.status === 429) {
          setError('Muitas requisições. Tente de novo em instantes.')
          setLoading(false)
          return
        }
        if (!res.ok) {
          setError('Não consegui gerar o briefing agora.')
          setLoading(false)
          return
        }

        const json = (await res.json()) as DiarioBrief
        setBrief(normalizeBrief(json))
        setLoading(false)
      } catch {
        setError('Não consegui gerar o briefing agora.')
        setLoading(false)
      }
    }

    void load()
  }, [])

  return { brief, loading, error }
}
